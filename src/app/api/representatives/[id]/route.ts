import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const repUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().optional(),
    area: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.representative.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Representative not found' }, { status: 404 });
        }

        const json = await request.json();
        const data = repUpdateSchema.parse(json);

        const rep = await prisma.representative.update({
            where: { id },
            data,
        });

        return NextResponse.json(rep);
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
        const existing = await prisma.representative.findFirst({
            where: { id, shopId: (session.user as any).shopId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Representative not found' }, { status: 404 });
        }

        await prisma.representative.delete({ where: { id } });

        return NextResponse.json({ message: 'Representative deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: 'Cannot delete this representative because they have associated sales records'
            }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
