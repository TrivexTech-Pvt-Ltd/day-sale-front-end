'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyReport } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Receipt, Activity, BarChart3, CloudSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const fetchReports = async (): Promise<DailyReport[]> => {
    const res = await fetch('/api/reports/daily');
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
};

const syncReports = async () => {
    const res = await fetch('/api/reports/sync', { method: 'POST' });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
};

export default function ReportsPage() {
    const queryClient = useQueryClient();
    const [lastSync, setLastSync] = useState<Date>(new Date());

    const { data: reports, isLoading, error } = useQuery({
        queryKey: ['daily-reports'],
        queryFn: fetchReports,
        refetchInterval: 30000, // Refetch data every 30 seconds
    });

    const mutation = useMutation({
        mutationFn: syncReports,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
            setLastSync(new Date());
        },
    });

    // Automatically sync on mount and then every 2 minutes
    useEffect(() => {
        mutation.mutate();

        const syncInterval = setInterval(() => {
            mutation.mutate();
        }, 120000); // Sync DB every 2 minutes

        return () => clearInterval(syncInterval);
    }, []);

    if (isLoading && !reports) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <BarChart3 className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Calculating live metrics...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <Activity className="h-8 w-8" />
                <div>
                    <h3 className="font-bold text-lg">System Error</h3>
                    <p className="opacity-90">{(error as Error).message}</p>
                </div>
            </div>
        </div>
    );

    const formattedData = reports?.map(r => ({
        ...r,
        reportDateStr: new Date(r.reportDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        fullDate: new Date(r.reportDate).toLocaleDateString(),
    })) || [];

    const totalSalesVol = formattedData.reduce((sum, r) => sum + r.totalSales, 0);
    const totalInvoices = formattedData.reduce((sum, r) => sum + r.totalInvoices, 0);
    const avgSale = totalInvoices > 0 ? totalSalesVol / totalInvoices : 0;
    const bestDay = formattedData.length > 0 ? Math.max(...formattedData.map(r => r.totalSales)) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-primary" />
                        Business Insights
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">Performance analytics for your retail operation.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-4 py-2 bg-emerald-50 rounded-xl flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Syncing</span>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100 mx-1"></div>
                    <div className="px-4 py-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Revenue (30d)", value: `$${totalSalesVol.toLocaleString()}`, icon: DollarSign, color: "bg-blue-500", trend: "+12%" },
                    { title: "Invoices", value: totalInvoices, icon: Receipt, color: "bg-purple-500", trend: "+5%" },
                    { title: "Average Sale", value: `$${avgSale.toFixed(2)}`, icon: TrendingUp, color: "bg-green-500", trend: "+3%" },
                    { title: "Best Day", value: `$${bestDay.toLocaleString()}`, icon: Activity, color: "bg-orange-500", trend: "Peak" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-full uppercase tracking-tighter">
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</h3>
                            <div className="text-3xl font-black text-slate-900 mt-1">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-black text-gray-900">Revenue Growth</CardTitle>
                        <CardDescription className="font-medium text-slate-400">Daily sales performance over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="reportDateStr"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                    itemStyle={{ fontWeight: 900, color: '#0f172a' }}
                                    labelStyle={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalSales"
                                    name="Revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-slate-900 text-white">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-black">Payment Split</CardTitle>
                        <CardDescription className="text-slate-400 font-medium tracking-wide lowercase">DISTRIBUTION OF REPUTED CHANNELS</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedData} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="reportDateStr"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}
                                />
                                <Bar dataKey="cashTotal" stackId="a" name="Cash" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="cardTotal" stackId="a" name="Card" fill="#3b82f6" />
                                <Bar dataKey="qrTotal" stackId="a" name="QR" fill="#f59e0b" />
                                <Bar dataKey="creditTotal" stackId="a" name="Credit" fill="#ef4444" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="flex flex-wrap gap-4 mt-6 justify-center">
                            {[
                                { label: 'Cash', color: 'bg-emerald-500' },
                                { label: 'Card', color: 'bg-blue-500' },
                                { label: 'QR', color: 'bg-amber-500' },
                                { label: 'Credit', color: 'bg-red-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {formattedData.length === 0 && !isLoading && (
                <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-[32px] p-24 flex flex-col items-center text-center bg-slate-50/30">
                    <div className="p-8 bg-white rounded-full mb-6 shadow-sm">
                        <Activity className="h-12 w-12 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Awaiting Business Signals</h2>
                    <p className="max-w-md text-slate-400 font-medium mt-3 leading-relaxed">
                        Sales data is aggregated every few minutes. Once the first transaction is recorded,
                        live analytics will populate here automatically.
                    </p>
                </Card>
            )}
        </div>
    );
}
