import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PaymentMethod, StockTransactionType, Prisma } from '@prisma/client';

const saleItemSchema = z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
    unitPrice: z.number().positive(),
});

const saleSchema = z.object({
    customerId: z.string().optional().nullable(),
    repId: z.string().optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    notes: z.string().optional(),
    discount: z.number().min(0).default(0),
    items: z.array(saleItemSchema).min(1),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId || !(session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;
    const userId = (session.user as any).id;

    try {
        const json = await request.json();
        const data = saleSchema.parse(json);

        const subTotal = data.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
        const total = subTotal - data.discount;

        const invoiceNo = `INV-${Date.now()}`;

        const newSale = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const createdSale = await tx.sale.create({
                data: {
                    shopId,
                    invoiceNo,
                    subTotal,
                    discount: data.discount,
                    total,
                    paymentMethod: data.paymentMethod,
                    notes: data.notes,
                    createdByUserId: userId,
                    customerId: data.customerId || null,
                    repId: data.repId || null,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            qty: item.qty,
                            unitPrice: item.unitPrice,
                            lineTotal: item.qty * item.unitPrice
                        }))
                    }
                }
            });

            const stockTrans = data.items.map(item => ({
                productId: item.productId,
                type: StockTransactionType.OUT,
                qty: -item.qty,
                unitCost: item.unitPrice,
                refType: 'SALE',
                refId: createdSale.id,
            }));

            await tx.stockTransaction.createMany({
                data: stockTrans
            });

            return createdSale;
        });

        return NextResponse.json(newSale, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Sale Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const sales = await prisma.sale.findMany({
        where: {
            shopId: (session.user as any).shopId,
            ...(userRole !== 'ADMIN' ? { createdByUserId: userId } : {}),
            ...(search ? { invoiceNo: { contains: search, mode: 'insensitive' } } : {})
        },
        include: {
            customer: true,
            representative: true,
        },
        orderBy: { saleDateTime: 'desc' },
        take: 50,
    });

    return NextResponse.json(sales);
}
