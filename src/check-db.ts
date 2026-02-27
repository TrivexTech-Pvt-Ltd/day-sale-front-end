import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const salesCount = await prisma.sale.count();
    console.log('Total Sales:', salesCount);

    const reportsCount = await prisma.dailyReport.count();
    console.log('Total Reports:', reportsCount);

    if (salesCount > 0) {
        const latestSales = await prisma.sale.findMany({
            take: 5,
            include: { customer: true, representative: true }
        });
        console.log('Latest Sales:', JSON.stringify(latestSales, null, 2));
    }

    if (reportsCount > 0) {
        const latestReports = await prisma.dailyReport.findMany({ take: 5 });
        console.log('Latest Reports:', JSON.stringify(latestReports, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
