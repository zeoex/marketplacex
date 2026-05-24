'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const QUICK_SEARCHES = [
  { label: '📱 Celulares',    q: 'celular' },
  { label: '💻 Notebooks',    q: 'notebook' },
  { label: '🚗 Autos',        q: 'auto' },
  { label: '🏠 Departamentos',q: 'departamento' },
  { label: '👟 Ropa',         q: 'ropa' },
  { label: '🚲 Bicicletas',   q: 'bicicleta' },
];

export function HeroSection() {
  const [query,    setQuery]    = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query.trim())    p.set('search',   query.trim());
    if (location.trim()) p.set('location', location.trim());
    router.push(`/products?${p.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-300/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

      <div className="container-app relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
            <TrendingUp className="w-3.5 h-3.5 text-brand-light" />
            <span>+2 millones de publicaciones en Argentina</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] md:text-[3.4rem] font-black text-white leading-[1.1] mb-4 tracking-tight">
            Comprá y vendé{' '}
            <span className="text-brand-light underline decoration-wavy decoration-brand/40 underline-offset-4">
              de todo
            </span>
            <br className="hidden sm:block" /> en un solo lugar
          </h1>
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Encontrá las mejores ofertas o publicá lo que ya no usás.
            Completamente gratis, sin intermediarios.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch}
            className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-2xl shadow-primary-900/40 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
              <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="w-full text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder-slate-400 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-l border-slate-100 dark:border-slate-700 w-44 shrink-0">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ubicación"
                className="w-full text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder-slate-400 text-sm"
              />
            </div>
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-2.5 rounded-xl transition-colors flex items-center gap-2 justify-center">
              Buscar
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_SEARCHES.map(({ label, q }) => (
              <button
                key={q}
                onClick={() => router.push(`/products?search=${q}`)}
                className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 px-3.5 py-1.5 rounded-full transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-3 mt-14"
        >
          {[
            { value: '2M+',  label: 'publicaciones activas' },
            { value: '500K+',label: 'usuarios registrados' },
            { value: 'Gratis',label: 'publicar siempre' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/55 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
