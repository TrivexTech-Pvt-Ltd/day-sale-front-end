'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Mail,
    Key,
    Plus,
    CheckCircle2,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export default function TeamPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CASHIER');

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const mutation = useMutation({
        mutationFn: async (userData: any) => {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setName('');
            setEmail('');
            setPassword('');
            setRole('CASHIER');
            alert('User Added Successfully!');
        },
        onError: (err: any) => alert(err.message),
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ name, email, password, role });
    };

    if ((session?.user as any)?.role !== 'ADMIN') {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-red-50 text-red-900">
                    <CardContent className="p-12 flex flex-col items-center text-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                            <ShieldAlert className="h-10 w-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight">Access Denied</h2>
                            <p className="font-semibold opacity-70">Team management is reserved for Administrative access only.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Users className="h-10 w-10 text-primary" />
                        Team Portal
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide">Manage access and permissions for your branch.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-4 py-2 bg-blue-50 rounded-xl flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Control</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Add User Form */}
                <div className="xl:col-span-1">
                    <Card className="border-none shadow-2xl rounded-[32px] bg-slate-900 text-white overflow-hidden sticky top-8">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <UserPlus className="h-6 w-6 text-primary" />
                                Onboard Member
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Invite new talent to the shop</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleAddUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Full Identity</label>
                                    <Input
                                        required
                                        placeholder="Enter member name..."
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold focus:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Business Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                                        <Input
                                            required
                                            type="email"
                                            placeholder="email@company.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold pl-12 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Secure Passkey</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                                        <Input
                                            required
                                            type="password"
                                            placeholder="Min. 6 characters"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold pl-12 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">System Role</label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-black tracking-tight focus:ring-primary/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN" className="font-bold">ADMIN (Full Control)</SelectItem>
                                            <SelectItem value="CASHIER" className="font-bold">CASHIER (Sales Focused)</SelectItem>
                                            <SelectItem value="REP" className="font-bold">REP (Inventory Focus)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl mt-8 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group hover:scale-[1.02] active:scale-95 transition-all"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? 'Syncing...' : 'Complete Onboarding'}
                                    <Plus className="ml-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Team List Table */}
                <div className="xl:col-span-2 space-y-8">
                    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">Active Directory</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Verified members of your organization.</CardDescription>
                                </div>
                                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Total: {users?.length || 0}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-50 hover:bg-transparent">
                                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Team Member</TableHead>
                                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Authorization</TableHead>
                                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Joined On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users?.map((user: any) => (
                                            <TableRow key={user.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900">{user.name}</div>
                                                            <div className="text-xs font-bold text-slate-400 lowercase">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                        user.role === 'ADMIN' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                                    )}>
                                                        {user.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        {user.role}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-right font-medium text-slate-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-1">Security Guidance</h4>
                            <p className="text-xs font-bold text-primary/70 leading-relaxed uppercase tracking-tight">
                                New users are automatically restricted to see only the data they record (sales, customers, products).
                                Only ADMIN roles have cross-user visibility within the shop.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
