import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().optional(),
    costPrice: z.number().optional(),
    sellPrice: z.number().min(0, 'Sell price must be positive'),
    reorderLevel: z.number().optional(),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const data = productSchema.parse(json);

        // Destructure sku out to handle it explicitly
        const { sku, ...restData } = data;

        const product = await prisma.product.create({
            data: {
                ...restData,
                sku: sku && sku.trim() !== '' ? sku.trim() : null, // Explicitly null for empty/missing SKU
                shopId: (session.user as any).shopId,
                createdByUserId: (session.user as any).id,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error('[PRODUCTS_POST] Error:', error);
        if (error.code === 'P2002') {
            console.error('[PRODUCTS_POST] Constraint violation meta:', error.meta);
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({
            error: error.code === 'P2002'
                ? 'A product with this SKU already exists in your shop'
                : (error.message || 'Internal Server Error'),
            details: error.code === 'P2002' && error.meta?.target?.includes('sku')
                ? 'Product with this SKU already exists'
                : undefined
        }, { status: 400 });
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

    const products = await prisma.product.findMany({
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

    return NextResponse.json(products);
}
