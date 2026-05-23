'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Eye, Ban } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/');
  }, [user, router]);

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.admin.dashboard(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: reportsData } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.admin.reports({ status: 'PENDING', limit: 5 }),
    enabled: user?.role === 'ADMIN',
  });

  const s = (stats as any)?.data || {};

  const statCards = [
    { label: 'Total Users', value: formatNumber(s.totalUsers || 0), icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Active Listings', value: formatNumber(s.activeProducts || 0), icon: Package, color: 'bg-green-500', change: '+8%' },
    { label: 'Total Orders', value: formatNumber(s.totalOrders || 0), icon: ShoppingCart, color: 'bg-purple-500', change: '+24%' },
    { label: 'Revenue', value: formatCurrency(s.totalRevenue || 0, 'USD'), icon: DollarSign, color: 'bg-brand', change: '+18%' },
    { label: 'Pending Reports', value: formatNumber(s.pendingReports || 0), icon: AlertTriangle, color: 'bg-red-500', change: '' },
    { label: 'Daily Active', value: formatNumber(s.dailyActive || 0), icon: TrendingUp, color: 'bg-yellow-500', change: '+5%' },
  ];

  return (
    <main className="container-app py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and management</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.change && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent reports */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Pending Reports
            </h2>
            <a href="/admin/reports" className="text-sm text-primary-600 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {((reportsData as any)?.data?.data || []).map((report: any) => (
              <div key={report.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{report.reason}</p>
                  <p className="text-xs text-slate-400">{report.description?.substring(0, 60)}...</p>
                </div>
                <button className="text-xs btn-outline px-3 py-1.5">Review</button>
              </div>
            ))}
            {!(reportsData as any)?.data?.data?.length && (
              <div className="p-6 text-center text-slate-400 text-sm">No pending reports</div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <h2 className="font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/users', label: 'Manage Users', icon: Users },
              { href: '/admin/products', label: 'Manage Listings', icon: Package },
              { href: '/admin/orders', label: 'All Orders', icon: ShoppingCart },
              { href: '/admin/categories', label: 'Categories', icon: TrendingUp },
              { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
              { href: '/admin/analytics', label: 'Analytics', icon: Eye },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700
                           hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                <item.icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
