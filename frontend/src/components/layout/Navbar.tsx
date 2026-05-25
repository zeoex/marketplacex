'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, User, Menu, X, Plus, Moon, Sun,
  ChevronDown, Heart, Package, Settings, LogOut,
  ShieldCheck, MapPin, MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery]           = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const userMenuItems = [
    { icon: User,          href: `/profile/${user?.username}`, label: 'Mi Perfil' },
    { icon: Package,       href: '/products/my',               label: 'Mis Publicaciones' },
    { icon: MessageCircle, href: '/messages',                  label: 'Mensajes' },
    { icon: Heart,         href: '/favorites',                 label: 'Favoritos' },
    { icon: Settings,      href: '/settings',                  label: 'Configuración' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-slate-900 transition-shadow duration-200 ${scrolled ? 'shadow-nav' : 'border-b border-slate-100 dark:border-slate-800'}`}>

      {/* ── Top strip ── */}
      <div className="bg-primary-700 dark:bg-primary-900 text-white text-xs">
        <div className="container-app flex items-center justify-center gap-6 py-1.5 text-white/90">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-green-300" />
            Usuarios verificados
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-blue-300" />
            Todo Argentina
          </span>
          <span className="hidden md:block">Publicar es 100% gratis</span>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div className="container-app">
        <div className="flex items-center gap-3 h-[62px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 bg-primary-600 group-hover:bg-primary-700 rounded-xl flex items-center justify-center transition-colors shadow-sm">
              <span className="text-white font-black text-base leading-none">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[17px] text-slate-900 dark:text-white leading-none">
                Market<span className="text-brand">Store</span>
              </span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800
                           border border-slate-200 dark:border-slate-700
                           rounded-xl text-sm text-slate-900 dark:text-slate-100
                           placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-primary-400/30
                           focus:border-primary-400 focus:bg-white
                           transition-all duration-150"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">

            {/* Tema */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Publicar */}
            <Link
              href={user ? '/products/new' : '/auth/register'}
              className="hidden sm:flex btn-brand text-sm px-4 py-2 gap-1.5 ml-1"
            >
              <Plus className="w-4 h-4" />
              Publicar
            </Link>

            {/* Usuario */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 ml-1 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-primary-100 dark:ring-primary-900">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      : user.name[0]?.toUpperCase()
                    }
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 hidden md:block ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>

                      {/* Items */}
                      <div className="py-1">
                        {userMenuItems.map(({ icon: Icon, href, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setIsUserOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            {label}
                          </Link>
                        ))}
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setIsUserOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Settings className="w-4 h-4 text-slate-400" />
                            Panel Admin
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                        <button
                          onClick={() => { logout(); setIsUserOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link href="/auth/login" className="btn-outline text-sm px-4 py-2">
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Menú"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-slate-100 dark:border-slate-800"
            >
              <div className="py-3 space-y-1">
                {/* Search mobile */}
                <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="px-1 mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder="¿Qué estás buscando?"
                      className="input-field pl-10" />
                  </div>
                </form>

                {user ? (
                  <>
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                    {userMenuItems.map(({ icon: Icon, href, label }) => (
                      <Link key={href} href={href} onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Icon className="w-4 h-4 text-slate-400" />
                        {label}
                      </Link>
                    ))}
                    <Link href="/products/new" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full mt-2 btn-brand py-2.5">
                      <Plus className="w-4 h-4" /> Publicar aviso
                    </Link>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link href="/auth/login"    onClick={() => setIsMenuOpen(false)} className="btn-outline w-full justify-center py-2.5">Iniciar sesión</Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="btn-brand  w-full justify-center py-2.5">Registrarse gratis</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
