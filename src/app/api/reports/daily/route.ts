import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    let startDate = new Date();
    if (startDateParam) {
        startDate = new Date(startDateParam);
    } else {
        startDate.setDate(startDate.getDate() - 30);
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const reports = await prisma.dailyReport.findMany({
        where: {
            shopId: (session.user as any).shopId,
            ...(userRole !== 'ADMIN' ? { userId: userId } : {}),
            reportDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            reportDate: 'asc',
        },
    });

    return NextResponse.json(reports);
}
