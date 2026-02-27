import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const data = customerSchema.parse(json);

        const customer = await prisma.customer.create({
            data: {
                ...data,
                shopId: (session.user as any).shopId,
                createdByUserId: (session.user as any).id,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const customers = await prisma.customer.findMany({
        where: {
            shopId: (session.user as any).shopId,
            ...(userRole !== 'ADMIN' ? { createdByUserId: userId } : {}),
            name: {
                contains: searchQuery,
                mode: 'insensitive',
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json(customers);
}
