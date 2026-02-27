import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
    shopName: z.string().min(1, 'Shop name is required'),
    adminName: z.string().min(1, 'Admin name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { shopName, adminName, email, password } = registerSchema.parse(json);

        const exists = await prisma.user.findUnique({
            where: { email }
        });

        if (exists) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const passwordHash = await hash(password, 12);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Shop (The Tenant)
            const shop = await tx.shop.create({
                data: {
                    name: shopName,
                }
            });

            // 2. Create the Admin User for this Shop
            const user = await tx.user.create({
                data: {
                    name: adminName,
                    email,
                    passwordHash,
                    role: 'ADMIN',
                    shopId: shop.id,
                }
            });

            return { shop, user };
        });

        return NextResponse.json({
            success: true,
            shopId: result.shop.id,
            userId: result.user.id
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Registration error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
