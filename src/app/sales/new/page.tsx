'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Customer, Product, Representative } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Fetch functions
const fetchCustomers = async (): Promise<Customer[]> => (await fetch('/api/customers')).json();
const fetchProducts = async (): Promise<Product[]> => (await fetch('/api/products')).json();
const fetchReps = async (): Promise<Representative[]> => (await fetch('/api/representatives')).json();

type SaleItem = {
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
};

export default function NewSalePage() {
    const [customerId, setCustomerId] = useState<string>('none');
    const [repId, setRepId] = useState<string>('none');
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [discount, setDiscount] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');

    const [items, setItems] = useState<SaleItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [qty, setQty] = useState<number>(1);

    const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
    const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
    const { data: reps } = useQuery({ queryKey: ['reps'], queryFn: fetchReps });

    const createSaleMutation = useMutation({
        mutationFn: async (saleData: any) => {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData),
            });
            if (!res.ok) throw new Error('Failed to create sale');
            return res.json();
        },
        onSuccess: () => {
            setItems([]);
            setCustomerId('none');
            setRepId('none');
            setDiscount(0);
            setNotes('');
            alert('Sale Created Successfully!');
        },
        onError: (err) => alert(err.message),
    });

    const handleAddItem = () => {
        if (!selectedProductId) return;
        const product = products?.find(p => p.id === selectedProductId);
        if (!product) return;

        const newItem: SaleItem = {
            productId: product.id,
            productName: product.name,
            qty: Number(qty),
            unitPrice: product.sellPrice,
        };

        setItems(prev => {
            const existing = prev.find(i => i.productId === newItem.productId);
            if (existing) {
                return prev.map(i => i.productId === newItem.productId ? { ...i, qty: i.qty + newItem.qty } : i);
            }
            return [...prev, newItem];
        });
        setQty(1);
        setSelectedProductId('');
    };

    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const total = subTotal - discount;

    const handleCheckout = () => {
        if (items.length === 0) return alert("Add at least one item.");

        createSaleMutation.mutate({
            customerId: customerId === 'none' ? null : customerId,
            repId: repId === 'none' ? null : repId,
            paymentMethod,
            discount: Number(discount),
            notes,
            items: items.map(i => ({ productId: i.productId, qty: i.qty, unitPrice: i.unitPrice }))
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Add Products</CardTitle></CardHeader>
                    <CardContent className="flex gap-4">
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select Product" /></SelectTrigger>
                            <SelectContent>
                                {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.sellPrice}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} className="w-24" />
                        <Button onClick={handleAddItem}>Add</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Cart Items</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>${(item.qty * item.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => setItems(items.filter((_, i) => i !== idx))}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No items in cart</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Checkout Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger><SelectValue placeholder="Select Customer (Optional)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={repId} onValueChange={setRepId}>
                            <SelectTrigger><SelectValue placeholder="Select Rep (Optional)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {reps?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">CASH</SelectItem>
                                <SelectItem value="CARD">CARD</SelectItem>
                                <SelectItem value="QR">QR</SelectItem>
                                <SelectItem value="CREDIT">CREDIT</SelectItem>
                            </SelectContent>
                        </Select>

                        <div>
                            <label className="text-sm font-medium">Discount</label>
                            <Input type="number" min="0" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Input value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2"><span>Subtotal:</span><span>${subTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between mb-2 text-red-500"><span>Discount:</span><span>-${discount.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${Math.max(0, total).toFixed(2)}</span></div>
                        </div>

                        <Button className="w-full mt-4" size="lg" onClick={handleCheckout} disabled={createSaleMutation.isPending || items.length === 0}>
                            {createSaleMutation.isPending ? 'Processing...' : 'Complete Sale'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
