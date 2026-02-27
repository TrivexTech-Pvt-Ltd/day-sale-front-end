import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role).default(Role.CASHIER),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can add users' }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;

    try {
        const json = await request.json();
        const { name, email, password, role } = userSchema.parse(json);

        const exists = await prisma.user.findUnique({
            where: { email }
        });

        if (exists) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const passwordHash = await hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                shopId,
            }
        });

        // Don't return the password hash
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        where: {
            shopId: (session.user as any).shopId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return NextResponse.json(users);
}
