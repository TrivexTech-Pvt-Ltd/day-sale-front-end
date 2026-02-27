'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        shopName: '',
        adminName: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
                <Card className="w-full max-w-md border-none shadow-2xl rounded-[40px] p-8 text-center animate-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Shop Established!</h2>
                    <p className="text-slate-500 font-medium mb-8">Your enterprise environment is ready. Redirecting to login...</p>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-progress"></div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                {/* Left Side: Branding */}
                <div className="relative bg-slate-900 p-12 text-white overflow-hidden hidden lg:flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-5xl font-black leading-tight mb-6">
                            Launch Your <br />
                            <span className="text-primary italic">Enterprise</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                            Join thousands of businesses managing their daily sales with our premium automated suite.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                            <div className="h-1 w-8 bg-primary rounded-full"></div>
                            Multi-Tenant Isolated Data
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                            <div className="h-1 w-8 bg-slate-700 rounded-full"></div>
                            Automated Reporting
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Create Shop</h2>
                        <p className="text-slate-500 font-medium">Set up your new business environment.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Business Name</label>
                            <div className="relative group">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    required
                                    placeholder="e.g. Galaxy Retail"
                                    className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all"
                                    value={formData.shopName}
                                    onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Admin Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        required
                                        placeholder="Full Name"
                                        className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all"
                                        value={formData.adminName}
                                        onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Login Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        required
                                        type="email"
                                        placeholder="admin@shop.com"
                                        className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Master Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group transition-all mt-4"
                        >
                            {loading ? 'Generating Shop...' : 'Initialize Environment'}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <p className="text-center text-slate-400 font-bold text-xs mt-6">
                            Already have a shop? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
