const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, sku: true, shopId: true }
    });
    for (const p of products) {
        console.log(`${p.name} | SKU: ${p.sku} | Shop: ${p.shopId}`);
    }
    console.log(`\nTotal: ${products.length} products`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
