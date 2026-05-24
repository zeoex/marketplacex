import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout/stripe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createStripeCheckout(@Body() dto: CreateCheckoutDto, @Request() req: any) {
    return this.paymentsService.createStripeCheckout(req.user.id, dto);
  }

  @Post('checkout/mercadopago')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createMercadoPagoCheckout(@Body() dto: CreateCheckoutDto, @Request() req: any) {
    return this.paymentsService.createMercadoPagoCheckout(req.user.id, dto);
  }

  @Post('webhook/stripe')
  stripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody!, sig);
  }
}
