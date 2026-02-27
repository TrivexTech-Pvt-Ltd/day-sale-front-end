import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const customerUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.customer.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const json = await request.json();
        const data = customerUpdateSchema.parse(json);

        const customer = await prisma.customer.update({
            where: { id },
            data,
        });

        return NextResponse.json(customer);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
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
        const existing = await prisma.customer.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        await prisma.customer.delete({ where: { id } });

        return NextResponse.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: 'Cannot delete this customer because they have associated sales records'
            }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
