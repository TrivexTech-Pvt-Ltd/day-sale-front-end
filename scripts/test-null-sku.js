const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get the actual shopId first
    const shops = await prisma.shop.findMany({ select: { id: true, name: true } });
    console.log('Shops:', shops);

    if (shops.length === 0) return;

    const shopId = shops[0].id;

    // List existing products
    const existing = await prisma.product.findMany({
        where: { shopId },
        select: { name: true, sku: true }
    });
    console.log('\nExisting products:', existing);

    // Test 1: create product with null SKU
    try {
        const p1 = await prisma.product.create({
            data: { name: 'Test Null SKU 1', sku: null, sellPrice: 10.0, shopId }
        });
        console.log('\n✅ Test 1 PASS: Created product with null SKU:', p1.name);

        // Test 2: create ANOTHER product with null SKU (should work - null != null in unique)
        const p2 = await prisma.product.create({
            data: { name: 'Test Null SKU 2', sku: null, sellPrice: 20.0, shopId }
        });
        console.log('✅ Test 2 PASS: Created second product with null SKU:', p2.name);

        // Clean up
        await prisma.product.delete({ where: { id: p1.id } });
        await prisma.product.delete({ where: { id: p2.id } });
        console.log('✅ Cleaned up test products.');
    } catch (e) {
        console.error('\n❌ Test FAIL:', e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
