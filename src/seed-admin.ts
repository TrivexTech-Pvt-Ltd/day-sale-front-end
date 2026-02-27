import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🌱 Seeding database...');

    // 1. Create or Find a default Shop (Required for User)
    const shop = await prisma.shop.upsert({
        where: { id: 'default-shop' },
        update: {},
        create: {
            id: 'default-shop',
            name: 'Main Business Shop',
            currency: 'USD',
            timeZone: 'UTC',
        },
    });

    console.log('✅ Default shop created:', shop.name);

    // 2. Create the Admin User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
        },
        create: {
            email,
            name: 'Administrator',
            passwordHash: hashedPassword,
            role: Role.ADMIN,
            shopId: shop.id,
        },
    });

    console.log('\n✨ Database seeded successfully!\n');
    console.log('-------------------------------');
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('-------------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
