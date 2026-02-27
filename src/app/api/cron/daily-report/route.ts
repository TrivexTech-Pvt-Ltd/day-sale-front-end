import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Secure the endpoint - only Vercel Cron should be able to run this
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const shops = await prisma.shop.findMany();

        for (const shop of shops) {
            const today = new Date();
            // Adjust for shop's timezone if necessary
            const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
            const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

            const sales = await prisma.sale.findMany({
                where: {
                    shopId: shop.id,
                    saleDateTime: { gte: startOfDay, lte: endOfDay },
                },
            });

            if (sales.length === 0) {
                console.log(`No sales for shop ${shop.name}, skipping report.`);
                continue;
            }

            // Group sales by user for this day
            const salesByUser = sales.reduce((acc, sale) => {
                const uid = sale.createdByUserId;
                if (!acc[uid]) acc[uid] = [];
                acc[uid].push(sale);
                return acc;
            }, {} as Record<string, typeof sales>);

            for (const [uid, userSales] of Object.entries(salesByUser)) {
                const userTotalSales = userSales.reduce((sum, sale) => sum + sale.total, 0);
                const userPaymentTotals = userSales.reduce((acc, sale) => {
                    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
                    return acc;
                }, {} as Record<PaymentMethod, number>);

                await prisma.dailyReport.upsert({
                    where: {
                        shopId_userId_reportDate: {
                            shopId: shop.id,
                            userId: uid,
                            reportDate: startOfDay
                        }
                    },
                    update: {
                        totalSales: userTotalSales,
                        totalInvoices: userSales.length,
                        cashTotal: userPaymentTotals.CASH || 0,
                        cardTotal: userPaymentTotals.CARD || 0,
                        qrTotal: userPaymentTotals.QR || 0,
                        creditTotal: userPaymentTotals.CREDIT || 0,
                    },
                    create: {
                        shopId: shop.id,
                        userId: uid,
                        reportDate: startOfDay,
                        totalSales: userTotalSales,
                        totalInvoices: userSales.length,
                        cashTotal: userPaymentTotals.CASH || 0,
                        cardTotal: userPaymentTotals.CARD || 0,
                        qrTotal: userPaymentTotals.QR || 0,
                        creditTotal: userPaymentTotals.CREDIT || 0,
                    },
                });
            }
            console.log(`Generated reports for shop: ${shop.name} (${Object.keys(salesByUser).length} users)`);
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cron job failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
