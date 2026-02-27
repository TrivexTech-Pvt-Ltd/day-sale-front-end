'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sale, Customer, Representative, SaleItem, Product } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Eye, FileText, Calendar, User, UserCheck, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type SaleWithDetails = Sale & {
    customer: Customer | null;
    representative: Representative | null;
    items?: (SaleItem & { product: Product })[];
};

const fetchSales = async (searchParam: string = ''): Promise<SaleWithDetails[]> => {
    const res = await fetch(`/api/sales?search=${encodeURIComponent(searchParam)}`);
    if (!res.ok) throw new Error('Failed to fetch sales');
    return res.json();
};

const fetchSaleDetails = async (id: string): Promise<SaleWithDetails> => {
    const res = await fetch(`/api/sales/${id}`);
    if (!res.ok) throw new Error('Failed to fetch sale details');
    return res.json();
};

export default function ArchivePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

    const { data: sales, isLoading, error, refetch } = useQuery({
        queryKey: ['sales', searchQuery],
        queryFn: () => fetchSales(searchQuery),
    });

    const { data: saleDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['sale-detail', selectedSaleId],
        queryFn: () => fetchSaleDetails(selectedSaleId!),
        enabled: !!selectedSaleId,
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
                        <FileText className="h-10 w-10 text-primary" />
                        Sales Archive
                    </h1>
                    <p className="text-gray-500 mt-2">Browse and manage historical sales and invoices.</p>
                </div>

                <div className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search invoice number..."
                            className="pl-9 w-[260px] border-none focus-visible:ring-0 shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && refetch()}
                        />
                    </div>
                    <Button onClick={() => refetch()} className="rounded-lg px-6 font-semibold shadow-md active:scale-95 transition-all">
                        Search
                    </Button>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-sm">
                    Error loading sales: {(error as Error).message}
                </div>
            )}

            <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                    <TableHead className="py-5 px-6 font-bold text-gray-700">Date & Time</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-700">Invoice No</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-700">Customer</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-700">Representative</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-700">Payment</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-700 text-right">Total Amount</TableHead>
                                    <TableHead className="py-5 px-6 font-bold text-gray-700 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-b border-gray-50">
                                            <TableCell colSpan={7} className="h-16 bg-gray-50/30"></TableCell>
                                        </TableRow>
                                    ))
                                ) : sales?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FileText className="h-12 w-12 mb-2 opacity-20" />
                                                <p>No sales records found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sales?.map((sale) => (
                                        <TableRow key={sale.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 group">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{new Date(sale.saleDateTime).toLocaleDateString()}</span>
                                                    <span className="text-xs text-gray-400">{new Date(sale.saleDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 font-mono font-bold text-blue-600">{sale.invoiceNo}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                        {sale.customer?.name.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-gray-700">{sale.customer?.name || 'Walk-in Customer'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 font-medium text-gray-600">{sale.representative?.name || 'Default'}</TableCell>
                                            <TableCell className="py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' :
                                                    sale.paymentMethod === 'CARD' ? 'bg-blue-100 text-blue-700' :
                                                        sale.paymentMethod === 'QR' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {sale.paymentMethod}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 text-right font-extrabold text-gray-900">
                                                ${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedSaleId(sale.id)}
                                                    className="rounded-full hover:bg-white hover:shadow-md hover:text-primary transition-all group"
                                                >
                                                    <Eye className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSaleId} onOpenChange={(open) => !open && setSelectedSaleId(null)}>
                <DialogContent className="max-w-3xl rounded-2xl overflow-hidden border-none shadow-2xl p-0">
                    <div className="sr-only">
                        <DialogTitle>Sale Details</DialogTitle>
                        <DialogDescription>View detailed information about the selected sale and invoice.</DialogDescription>
                    </div>

                    {isLoadingDetail ? (
                        <div className="h-96 flex items-center justify-center bg-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : saleDetail && (
                        <div className="flex flex-col h-full bg-white">
                            <div className="bg-primary/5 p-8 border-b border-primary/10">
                                <DialogHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {/* Visible title for users */}
                                            <h2 className="text-3xl font-black text-gray-900 mb-1">Invoice Details</h2>
                                            <p className="text-gray-500 font-medium">#{saleDetail.invoiceNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Total Amount</p>
                                            <p className="text-4xl font-black text-primary">${saleDetail.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            <div className="grid grid-cols-3 gap-6 p-8 bg-gray-50/30">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-wider">
                                        <Calendar className="h-3 w-3" /> Date
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">{new Date(saleDetail.saleDateTime).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-wider">
                                        <User className="h-3 w-3" /> Customer
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">{saleDetail.customer?.name || 'Walk-in'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-wider">
                                        <UserCheck className="h-3 w-3" /> Sales Rep
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">{saleDetail.representative?.name || 'Direct Sale'}</p>
                                </div>
                                <div className="space-y-1 col-span-3 pt-4 border-t border-gray-100 flex items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-black uppercase text-gray-400">Payment:</span>
                                        <span className="text-sm font-bold text-gray-700">{saleDetail.paymentMethod}</span>
                                    </div>
                                    {saleDetail.notes && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <span className="text-xs font-black uppercase text-gray-400">Notes:</span>
                                            <span className="text-sm font-semibold text-gray-600">{saleDetail.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 max-h-[400px]">
                                <div className="p-8">
                                    <Table>
                                        <TableHeader className="bg-transparent">
                                            <TableRow className="border-none">
                                                <TableHead className="font-black text-gray-400 text-xs uppercase h-8 p-0">Product</TableHead>
                                                <TableHead className="font-black text-gray-400 text-xs uppercase h-8 p-0 text-center">Qty</TableHead>
                                                <TableHead className="font-black text-gray-400 text-xs uppercase h-8 p-0 text-right">Price</TableHead>
                                                <TableHead className="font-black text-gray-400 text-xs uppercase h-8 p-0 text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {saleDetail.items?.map((item) => (
                                                <TableRow key={item.id} className="border-b border-gray-50 last:border-none">
                                                    <TableCell className="font-bold py-4 px-0">
                                                        <p className="text-gray-800">{item.product.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{item.product.sku || 'NO-SKU'}</p>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-gray-600">{item.qty}</TableCell>
                                                    <TableCell className="text-right font-medium text-gray-500">${item.unitPrice.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right font-black text-gray-800">${item.lineTotal.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-end gap-2">
                                        <div className="flex justify-between w-48 text-sm font-bold text-gray-500">
                                            <span>Subtotal:</span>
                                            <span>${saleDetail.subTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between w-48 text-sm font-bold text-red-500">
                                            <span>Discount:</span>
                                            <span>-${saleDetail.discount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between w-64 mt-2 py-4 px-6 bg-primary/5 rounded-xl text-lg font-black text-primary">
                                            <span>Payable Total:</span>
                                            <span>${saleDetail.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
