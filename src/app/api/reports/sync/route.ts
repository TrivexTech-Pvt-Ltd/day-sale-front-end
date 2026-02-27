import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PaymentMethod } from '@prisma/client';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).shopId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;

    try {
        // We generate reports for the last 7 days to ensure data is fresh
        const daysToSync = 7;
        const results = [];

        for (let i = 0; i < daysToSync; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
            const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

            const sales = await prisma.sale.findMany({
                where: {
                    shopId,
                    saleDateTime: { gte: startOfDay, lte: endOfDay },
                },
            });

            // Group sales by user for this day
            const salesByUser = sales.reduce((acc, sale) => {
                const uid = sale.createdByUserId;
                if (!acc[uid]) acc[uid] = [];
                acc[uid].push(sale);
                return acc;
            }, {} as Record<string, typeof sales>);

            // For each user who had sales, upsert their daily report
            for (const [uid, userSales] of Object.entries(salesByUser)) {
                const totalSales = userSales.reduce((sum, sale) => sum + sale.total, 0);
                const paymentTotals = userSales.reduce((acc, sale) => {
                    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
                    return acc;
                }, {} as Record<PaymentMethod, number>);

                const report = await prisma.dailyReport.upsert({
                    where: {
                        shopId_userId_reportDate: {
                            shopId,
                            userId: uid,
                            reportDate: startOfDay
                        }
                    },
                    update: {
                        totalSales,
                        totalInvoices: userSales.length,
                        cashTotal: paymentTotals.CASH || 0,
                        cardTotal: paymentTotals.CARD || 0,
                        qrTotal: paymentTotals.QR || 0,
                        creditTotal: paymentTotals.CREDIT || 0,
                    },
                    create: {
                        shopId,
                        userId: uid,
                        reportDate: startOfDay,
                        totalSales,
                        totalInvoices: userSales.length,
                        cashTotal: paymentTotals.CASH || 0,
                        cardTotal: paymentTotals.CARD || 0,
                        qrTotal: paymentTotals.QR || 0,
                        creditTotal: paymentTotals.CREDIT || 0,
                    },
                });
                results.push(report);
            }
        }

        return NextResponse.json({ success: true, reportsUpdated: results.length });
    } catch (error: any) {
        console.error("Report generation failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
