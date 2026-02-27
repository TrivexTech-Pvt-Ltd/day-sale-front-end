import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const productUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    sku: z.string().optional(),
    costPrice: z.number().optional(),
    sellPrice: z.number().min(0, 'Sell price must be positive').optional(),
    reorderLevel: z.number().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify the product belongs to user's shop
        const existing = await prisma.product.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const json = await request.json();
        const data = productUpdateSchema.parse(json);

        // Handle SKU: empty/blank -> null
        const { sku, ...restData } = data;
        const processedSku = sku && sku.trim() !== '' ? sku.trim() : null;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...restData,
                sku: processedSku,
            },
        });

        return NextResponse.json(product);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'A product with this SKU already exists in your shop',
                details: 'Product with this SKU already exists',
            }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify the product belongs to user's shop
        const existing = await prisma.product.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await prisma.product.delete({ where: { id } });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: 'Cannot delete this product because it is used in sales records'
            }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
