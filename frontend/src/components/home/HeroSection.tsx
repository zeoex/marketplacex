'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, TrendingUp, Shield, Zap } from 'lucide-react';

const SUGGESTIONS = ['iPhone', 'Laptop', 'Car', 'Apartment', 'Bicycle', 'Camera'];

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (location) params.set('location', location);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-brand/20 rounded-full blur-3xl" />
      </div>

      <div className="container-app relative py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
            <TrendingUp className="w-4 h-4 text-brand" />
            <span>Over 2M+ listings nationwide</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Buy & Sell Anything,{' '}
            <span className="text-brand">Anywhere</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            The modern marketplace connecting millions of buyers and sellers. Find great deals or list your items in minutes.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder-slate-400 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-l border-slate-100 dark:border-slate-700 min-w-[160px]">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder-slate-400 text-sm"
              />
            </div>
            <button type="submit" className="btn-brand px-8 py-3 rounded-xl">
              Search
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-white/60 text-sm">Popular:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => router.push(`/products?search=${s}`)}
                className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
        >
          {[
            { label: 'Active Listings', value: '2M+' },
            { label: 'Happy Users', value: '500K+' },
            { label: 'Daily Deals', value: '10K+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-brand">{stat.value}</p>
              <p className="text-sm text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
