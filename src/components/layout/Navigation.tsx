import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingCart,
    History,
    Package,
    Users,
    UserCircle,
    BarChart3,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Bell,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Sale', href: '/sales/new', icon: ShoppingCart },
    { name: 'History', href: '/archive', icon: History },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Representatives', href: '/representatives', icon: UserCircle },
    { name: 'Team Portal', href: '/team', icon: ShieldCheck },
];

export function Navigation({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle logout more reliably
    const handleLogout = async () => {
        const data = await signOut({ redirect: false, callbackUrl: '/login' });
        router.push('/login');
        // Force refresh to clear any cached states
        window.location.href = '/login';
    };

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Protect routes on client side if session is missing
    useEffect(() => {
        if (status === 'unauthenticated' && pathname !== '/login') {
            router.push('/login');
        }
    }, [status, pathname, router]);

    if (pathname === '/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r bg-white px-4 py-8 lg:flex z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="mb-10 px-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">DAILY SALES</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Suite</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={cn(
                                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}>
                                    <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="mb-6 px-4 py-4 rounded-2xl bg-slate-50 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {session?.user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{session?.user?.name || 'Admin'}</p>
                            <p className="text-xs font-medium text-slate-500 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 rounded-2xl px-4 py-6 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile/Tablet Header */}
            <header className={cn(
                "fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 lg:hidden z-[60] transition-all duration-300",
                scrolled ? "bg-white/80 backdrop-blur-xl border-b shadow-sm" : "bg-transparent"
            )}>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black tracking-tight text-slate-900">DAILY SALES</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-full bg-white shadow-sm border flex items-center justify-center text-slate-500 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-20 bg-white z-[55] lg:hidden p-6 overflow-y-auto"
                    >
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link key={item.name} href={item.href}>
                                    <div className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl transition-all",
                                        pathname === item.href ? "bg-primary text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <item.icon className="h-6 w-6" />
                                            <span className="text-lg font-bold">{item.name}</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 opacity-50" />
                                    </div>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Logout Session
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="lg:pl-72 pt-20 lg:pt-0 transition-all duration-500">
                <div className="mx-auto max-w-[1600px] min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="p-6 md:p-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
