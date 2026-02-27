import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  BarChart3,
  History,
  Package,
  Users,
  UserCircle,
  ArrowUpRight,
  TrendingUp,
  Store,
  Calendar
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const quickActions = [
    { title: "Point of Sale", desc: "Create new invoices and manage real-time sales.", href: "/sales/new", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", btn: "New Sale" },
    { title: "Performance Reports", desc: "View deep analytics and annual growth trends.", href: "/reports", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", btn: "View Analysis" },
    { title: "Sales Archive", desc: "Access historical data and export reports.", href: "/archive", icon: History, color: "text-emerald-600", bg: "bg-emerald-50", btn: "Browse History" },
    { title: "Inventory Control", desc: "Track stock levels and product movements.", href: "/products", icon: Package, color: "text-orange-600", bg: "bg-orange-50", btn: "Stock Hub" },
    { title: "Customer Insight", desc: "Manage client relationship and credit limits.", href: "/customers", icon: Users, color: "text-purple-600", bg: "bg-purple-50", btn: "Client List" },
    { title: "Team Management", desc: "Track representative performance and areas.", href: "/representatives", icon: UserCircle, color: "text-pink-600", bg: "bg-pink-50", btn: "Team Portal" },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/40">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
              <Store className="h-4 w-4 text-primary" />
              <span>System Online</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Control your <span className="text-primary italic">Business</span> growth.
            </h1>
            <p className="text-lg text-slate-400 font-medium">
              Welcome back, <span className="text-white font-bold">{session?.user?.name || "Strategist"}</span>.
              Everything is ready for your next big sale.
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <div className="rounded-3xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-xs uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                <span>Current Date</span>
              </div>
              <div className="text-2xl font-black">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[32px] bg-white group hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status Overview</p>
              <h3 className="text-2xl font-black text-slate-900">Operations Live</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>
        <div className="md:col-span-2 flex items-center bg-blue-600 rounded-[32px] px-8 py-4 text-white shadow-xl shadow-blue-500/20">
          <div className="flex-1">
            <p className="text-xs font-black text-blue-100 uppercase tracking-widest mb-1">Ready to start?</p>
            <h3 className="text-xl font-bold">New Sale System is enhanced and optimized</h3>
          </div>
          <Button asChild className="rounded-full bg-white text-blue-600 hover:bg-blue-50 font-black h-12 px-8">
            <Link href="/sales/new">Launch POS <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>

      {/* Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href} className="group">
            <div className="h-full relative p-8 rounded-[40px] bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-300 hover:-translate-y-2 flex flex-col items-start border border-slate-50">
              <div className={cn("mb-6 p-4 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-500", action.bg, action.color)}>
                <action.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{action.title}</h3>
              <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed">
                {action.desc}
              </p>
              <div className="w-full flex items-center justify-between text-slate-400 font-bold text-sm tracking-tight pt-4 border-t border-slate-50">
                <span>{action.btn}</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform text-slate-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
