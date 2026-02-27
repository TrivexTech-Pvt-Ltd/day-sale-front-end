const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productsWithEmptySku = await prisma.product.findMany({
        where: {
            OR: [
                { sku: "" },
                { sku: null }
            ]
        },
        select: {
            id: true,
            name: true,
            sku: true
        }
    });
    console.log('Products with empty or null SKU:', JSON.stringify(productsWithEmptySku, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
