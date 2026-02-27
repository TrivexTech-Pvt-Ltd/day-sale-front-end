import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sale = await prisma.sale.findUnique({
            where: {
                id: id,
                shopId: (session.user as any).shopId,
            },
            include: {
                customer: true,
                representative: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
        });

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
