import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Cargando datos iniciales...');

  // ─── Categorías ─────────────────────────────────────────
  const categories = [
    { name: 'Electrónica', slug: 'electronica', icon: '💻', children: [
      { name: 'Celulares', slug: 'celulares' },
      { name: 'Computadoras', slug: 'computadoras' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Cámaras', slug: 'camaras' },
    ]},
    { name: 'Vehículos', slug: 'vehiculos', icon: '🚗', children: [
      { name: 'Autos', slug: 'autos' },
      { name: 'Motos', slug: 'motos' },
      { name: 'Repuestos', slug: 'repuestos' },
    ]},
    { name: 'Inmuebles', slug: 'inmuebles', icon: '🏠', children: [
      { name: 'Departamentos', slug: 'departamentos' },
      { name: 'Casas', slug: 'casas' },
    ]},
    { name: 'Indumentaria', slug: 'indumentaria', icon: '👗', children: [
      { name: 'Hombre', slug: 'indumentaria-hombre' },
      { name: 'Mujer', slug: 'indumentaria-mujer' },
      { name: 'Niños', slug: 'indumentaria-ninos' },
    ]},
    { name: 'Hogar y Jardín', slug: 'hogar-jardin', icon: '🏡', children: [] },
    { name: 'Deportes', slug: 'deportes', icon: '⚽', children: [] },
    { name: 'Libros y Revistas', slug: 'libros', icon: '📚', children: [] },
    { name: 'Juguetes y Bebés', slug: 'juguetes', icon: '🧸', children: [] },
    { name: 'Servicios', slug: 'servicios', icon: '🔧', children: [] },
    { name: 'Empleos', slug: 'empleos', icon: '💼', children: [] },
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
  console.log('✅ Categorías cargadas');

  // ─── Usuario Admin ─────────────────────────────────────
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@marketplacex.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@marketplacex.com',
      username: 'admin',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // ─── Usuarios Demo ──────────────────────────────────────
  const sellerPw = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@demo.com' },
    update: {},
    create: {
      email: 'vendedor@demo.com',
      username: 'vendedor_demo',
      name: 'Vendedor Demo',
      password: sellerPw,
      role: 'SELLER',
      emailVerified: true,
      isVerified: true,
      bio: 'Cuenta de vendedor de demostración',
      location: 'Buenos Aires, Argentina',
    },
  });

  // ─── Productos Demo ──────────────────────────────────────
  const celularesCategory = await prisma.category.findUnique({ where: { slug: 'celulares' } });
  const computadorasCategory = await prisma.category.findUnique({ where: { slug: 'computadoras' } });
  const autosCategory = await prisma.category.findUnique({ where: { slug: 'autos' } });

  const demoProducts = [
    {
      title: 'iPhone 15 Pro Max 256GB',
      description: 'iPhone 15 Pro Max nuevo en caja, 256GB, Negro Titanio. Con factura y garantía oficial de Apple Argentina. Acepto transferencia o efectivo.',
      price: 1199.99,
      condition: 'NEW' as const,
      categoryId: celularesCategory!.id,
    },
    {
      title: 'MacBook Pro M3 14" 16GB',
      description: 'Apple MacBook Pro 14" con chip M3, 16GB RAM, 512GB SSD. Estado impecable, como nueva. Cargador original incluido. Ideal para profesionales y estudiantes.',
      price: 1799.00,
      condition: 'LIKE_NEW' as const,
      categoryId: computadorasCategory!.id,
    },
    {
      title: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'Samsung Galaxy S24 Ultra, 12GB RAM, 512GB, Gris Titanio. 3 meses de uso, sin rayones. Incluye caja original, cargador y S Pen.',
      price: 899.99,
      condition: 'LIKE_NEW' as const,
      categoryId: celularesCategory!.id,
    },
    {
      title: 'Toyota Corolla XEI 2020',
      description: 'Toyota Corolla XEI automático, color blanco, 45.000km. Único dueño, service al día en concesionaria oficial. Excelente estado general.',
      price: 22000.00,
      condition: 'GOOD' as const,
      categoryId: autosCategory!.id,
    },
  ];

  for (const p of demoProducts) {
    const slug = p.title.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        title: p.title,
        slug,
        description: p.description,
        price: p.price,
        currency: 'USD',
        condition: p.condition,
        delivery: 'PICKUP',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: p.categoryId,
        location: 'Buenos Aires, Argentina',
        isFeatured: true,
      },
    });
  }
  console.log('✅ Productos demo cargados');

  console.log('\n🎉 Base de datos lista!');
  console.log('Admin: admin@marketplacex.com / Admin123!');
  console.log('Vendedor: vendedor@demo.com / Seller123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
