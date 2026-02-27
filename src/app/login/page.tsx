'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
            <Card className="w-full max-w-md border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                <CardHeader className="space-y-2 text-center pt-10 pb-6">
                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Sign In</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Access your enterprise dashboard</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Business Email</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Passkey</label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <div className="text-sm text-red-500 font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-tight">
                        Don't have a shop? <Link href="/register" className="text-primary hover:underline ml-1">Establish one</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
