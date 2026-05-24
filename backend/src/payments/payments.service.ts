import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCheckoutDto } from './dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key, { apiVersion: '2023-10-16' }) : null;
    if (!key) console.warn('STRIPE_SECRET_KEY not set — Stripe payments disabled');
  }

  // ─── Stripe Checkout ──────────────────────────────────────
  async createStripeCheckout(userId: string, dto: CreateCheckoutDto) {
    if (!this.stripe) throw new BadRequestException('Stripe payments not configured');
    const order = await this.createOrder(userId, dto);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: dto.email,
      line_items: await Promise.all(
        dto.items.map(async (item) => {
          // Always fetch price from DB — never trust client
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            include: { images: { take: 1 } },
          });
          if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
          if (product.stock < item.quantity) throw new BadRequestException('Insufficient stock');

          return {
            price_data: {
              currency: product.currency.toLowerCase(),
              product_data: {
                name: product.title,
                images: product.images.map((i) => `${this.config.get('API_URL')}${i.url}`),
                metadata: { productId: product.id },
              },
              unit_amount: Math.round(Number(product.price) * 100),
            },
            quantity: item.quantity,
          };
        }),
      ),
      metadata: { orderId: order.id, userId },
      success_url: `${this.config.get('APP_URL')}/checkout/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('APP_URL')}/checkout/cancel`,
    });

    // Save payment record
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        method: 'STRIPE',
        status: 'PENDING',
        amount: order.totalAmount,
        currency: 'USD',
        externalId: session.id,
      },
    });

    return { sessionId: session.id, url: session.url, orderId: order.id };
  }

  // ─── Stripe Webhook ───────────────────────────────────────
  async handleStripeWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) throw new BadRequestException('Stripe payments not configured');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.fulfillOrder(session.metadata!.orderId, session.id, Number(session.amount_total) / 100);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.failOrder(intent.metadata?.orderId);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.processRefund(charge.payment_intent as string, Number(charge.amount_refunded) / 100);
        break;
      }
    }

    return { received: true };
  }

  // ─── Order Fulfillment ────────────────────────────────────
  private async fulfillOrder(orderId: string, externalId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    const platformFee = (amount * this.config.get<number>('STRIPE_PLATFORM_FEE_PERCENT', 5)) / 100;
    const sellerAmount = amount - platformFee;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', sellerAmount, platformFee },
      }),
      this.prisma.payment.updateMany({
        where: { orderId, method: 'STRIPE' },
        data: { status: 'COMPLETED', externalId },
      }),
      // Decrement stock
      ...order.items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
      // Credit seller wallet
      this.prisma.walletTransaction.create({
        data: {
          userId: order.sellerId,
          type: 'credit',
          amount: sellerAmount,
          description: `Sale: Order #${order.orderNumber}`,
          reference: orderId,
        },
      }),
    ]);
  }

  private async failOrder(orderId?: string) {
    if (!orderId) return;
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    await this.prisma.payment.updateMany({
      where: { orderId },
      data: { status: 'FAILED' },
    });
  }

  private async processRefund(paymentIntentId: string, refundedAmount: number) {
    await this.prisma.payment.updateMany({
      where: { externalData: { path: ['paymentIntentId'], equals: paymentIntentId } },
      data: { status: 'REFUNDED', refundedAmount },
    });
  }

  // ─── Create Order ─────────────────────────────────────────
  private async createOrder(buyerId: string, dto: CreateCheckoutDto) {
    let totalAmount = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      const unitPrice = Number(product.price);
      const total = unitPrice * item.quantity;
      totalAmount += total;
      itemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice, total });
    }

    const feePct = this.config.get<number>('STRIPE_PLATFORM_FEE_PERCENT', 5);
    const platformFee = (totalAmount * feePct) / 100;

    // Get seller from first product
    const firstProduct = await this.prisma.product.findUnique({
      where: { id: dto.items[0].productId },
    });

    return this.prisma.order.create({
      data: {
        buyerId,
        sellerId: firstProduct!.sellerId,
        totalAmount,
        platformFee,
        sellerAmount: totalAmount - platformFee,
        currency: 'USD',
        shippingAddress: dto.shippingAddress,
        items: { create: itemsData },
      },
    });
  }

  // ─── MercadoPago Checkout ────────────────────────────────
  async createMercadoPagoCheckout(userId: string, dto: CreateCheckoutDto) {
    const order = await this.createOrder(userId, dto);
    const mpAccessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) throw new BadRequestException('MercadoPago not configured');

    const items = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        return {
          id: product.id,
          title: product.title,
          quantity: item.quantity,
          unit_price: Number(product.price),
          currency_id: product.currency,
        };
      }),
    );

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${mpAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        external_reference: order.id,
        back_urls: {
          success: `${this.config.get('APP_URL')}/checkout/success`,
          failure: `${this.config.get('APP_URL')}/checkout/cancel`,
          pending: `${this.config.get('APP_URL')}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${this.config.get('API_URL')}/api/v1/payments/webhook/mercadopago`,
      }),
    });

    const preference = await response.json() as any;

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        method: 'MERCADOPAGO',
        status: 'PENDING',
        amount: order.totalAmount,
        currency: 'USD',
        externalId: preference.id,
      },
    });

    return { preferenceId: preference.id, initPoint: preference.init_point, orderId: order.id };
  }

  // ─── Payment History ──────────────────────────────────────
  async getPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { order: { include: { items: { include: { product: { select: { title: true, images: { take: 1 } } } } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        payments: true,
        buyer: { select: { id: true, name: true, username: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
