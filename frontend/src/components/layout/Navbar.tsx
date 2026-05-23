'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Bell, User, Menu, X,
  Plus, Moon, Sun, ChevronDown, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md' : 'bg-white dark:bg-slate-900'
      } border-b border-slate-100 dark:border-slate-800`}
    >
      <div className="container-app">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">M</span>
            </div>
            <span className="hidden sm:block">
              Market<span className="text-brand">PlaceX</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent
                           rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                           focus:bg-white dark:focus:bg-slate-700 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            {user && (
              <Link
                href="/notifications"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative hidden md:flex"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-xs
                             rounded-full flex items-center justify-center font-bold"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Sell button */}
            <Link href="/products/new" className="btn-brand hidden sm:flex text-sm px-4 py-2">
              <Plus className="w-4 h-4" />
              Sell
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0]?.toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 hidden md:block" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl
                                 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                      {[
                        { href: `/profile/${user.username}`, label: 'My Profile' },
                        { href: '/orders', label: 'My Orders' },
                        { href: '/products/my', label: 'My Listings' },
                        { href: '/favorites', label: 'Favorites' },
                        { href: '/messages', label: 'Messages' },
                        { href: '/settings', label: 'Settings' },
                        ...(user.role === 'ADMIN' ? [{ href: '/admin', label: '⚙️ Admin Panel' }] : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-outline text-sm px-4 py-2">Log in</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">Sign up</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 dark:border-slate-800 py-4 space-y-2"
            >
              {user ? (
                <>
                  <Link href={`/profile/${user.username}`} className="block px-2 py-2 text-sm hover:text-primary-600">Profile</Link>
                  <Link href="/orders" className="block px-2 py-2 text-sm hover:text-primary-600">Orders</Link>
                  <Link href="/messages" className="block px-2 py-2 text-sm hover:text-primary-600">Messages</Link>
                  <Link href="/favorites" className="block px-2 py-2 text-sm hover:text-primary-600">Favorites</Link>
                  <Link href="/products/new" className="btn-brand w-full justify-center">
                    <Plus className="w-4 h-4" /> Sell something
                  </Link>
                  <button onClick={logout} className="w-full text-left px-2 py-2 text-sm text-red-500">Log out</button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login" className="btn-outline w-full justify-center">Log in</Link>
                  <Link href="/auth/register" className="btn-primary w-full justify-center">Sign up</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
