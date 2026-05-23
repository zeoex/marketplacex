import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Categories ─────────────────────────────────────────
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻', children: [
      { name: 'Phones', slug: 'phones' },
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Cameras', slug: 'cameras' },
    ]},
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗', children: [
      { name: 'Cars', slug: 'cars' },
      { name: 'Motorcycles', slug: 'motorcycles' },
      { name: 'Parts', slug: 'vehicle-parts' },
    ]},
    { name: 'Real Estate', slug: 'real-estate', icon: '🏠', children: [
      { name: 'Apartments', slug: 'apartments' },
      { name: 'Houses', slug: 'houses' },
    ]},
    { name: 'Fashion', slug: 'fashion', icon: '👗', children: [
      { name: 'Men', slug: 'mens-fashion' },
      { name: 'Women', slug: 'womens-fashion' },
      { name: 'Kids', slug: 'kids-fashion' },
    ]},
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', children: [] },
    { name: 'Sports', slug: 'sports', icon: '⚽', children: [] },
    { name: 'Books', slug: 'books', icon: '📚', children: [] },
    { name: 'Toys', slug: 'toys', icon: '🧸', children: [] },
    { name: 'Services', slug: 'services', icon: '🔧', children: [] },
    { name: 'Jobs', slug: 'jobs', icon: '💼', children: [] },
  ];

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, iconUrl: cat.icon },
    });
    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: { name: child.name, slug: child.slug, parentId: parent.id },
      });
    }
  }
  console.log('✅ Categories seeded');

  // ─── Admin User ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@marketplacex.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@marketplacex.com',
      username: 'admin',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  // ─── Demo Users ──────────────────────────────────────────
  const sellerPw = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: {},
    create: {
      email: 'seller@demo.com',
      username: 'demo_seller',
      name: 'Demo Seller',
      password: sellerPw,
      role: 'SELLER',
      emailVerified: true,
      isVerified: true,
      bio: 'Demo seller account',
      location: 'Buenos Aires, Argentina',
    },
  });

  // ─── Demo Products ───────────────────────────────────────
  const phonesCategory = await prisma.category.findUnique({ where: { slug: 'phones' } });
  const laptopsCategory = await prisma.category.findUnique({ where: { slug: 'laptops' } });

  const demoProducts = [
    {
      title: 'iPhone 15 Pro Max',
      description: 'Brand new iPhone 15 Pro Max, 256GB, Space Black. Sealed box with full warranty.',
      price: 1199.99,
      condition: 'NEW' as const,
      categoryId: phonesCategory!.id,
    },
    {
      title: 'MacBook Pro M3',
      description: 'Apple MacBook Pro 14" with M3 chip, 16GB RAM, 512GB SSD. Excellent condition.',
      price: 1799.00,
      condition: 'LIKE_NEW' as const,
      categoryId: laptopsCategory!.id,
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra, 12GB RAM, 512GB, Titanium Gray. 3 months old.',
      price: 899.99,
      condition: 'LIKE_NEW' as const,
      categoryId: phonesCategory!.id,
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { slug: p.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        title: p.title,
        slug: p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: p.description,
        price: p.price,
        currency: 'USD',
        condition: p.condition,
        delivery: 'BOTH',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: p.categoryId,
        location: 'Buenos Aires, Argentina',
        isFeatured: true,
      },
    });
  }
  console.log('✅ Demo products seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('Admin login: admin@marketplacex.com / Admin123!');
  console.log('Seller login: seller@demo.com / Seller123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
