'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Laptop, Car, Home, Shirt, Dumbbell, BookOpen,
  Baby, Wrench, Palette, Music, Camera, MoreHorizontal,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  imageUrl?: string;
  _count?: { products: number };
}

// Fallback icons by keyword in name
const ICON_MAP: Record<string, React.ElementType> = {
  electronics: Laptop,
  vehicles: Car,
  cars: Car,
  home: Home,
  furniture: Home,
  clothing: Shirt,
  fashion: Shirt,
  sports: Dumbbell,
  books: BookOpen,
  babies: Baby,
  kids: Baby,
  tools: Wrench,
  art: Palette,
  music: Music,
  cameras: Camera,
  photo: Camera,
};

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return MoreHorizontal;
}

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
];

export function CategoriesGrid() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = (data as any)?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 mt-2 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {categories.slice(0, 8).map((cat, i) => {
        const Icon = getCategoryIcon(cat.name);
        const gradient = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2"
          >
            <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${gradient}
                             flex items-center justify-center shadow-sm transition-transform
                             duration-200 group-hover:scale-105 group-hover:shadow-md relative overflow-hidden`}
            >
              {cat.imageUrl ? (
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover opacity-80" sizes="120px" />
              ) : (
                <Icon className="w-8 h-8 text-white" />
              )}
            </div>
            <span className="text-xs font-medium text-center text-slate-700 dark:text-slate-200 line-clamp-1">
              {cat.name}
            </span>
            {cat._count?.products ? (
              <span className="text-xs text-slate-400">{cat._count.products.toLocaleString()}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
