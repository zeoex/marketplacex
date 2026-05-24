'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImage { url: string; altText?: string }
interface ProductVideo { url: string }

interface Props {
  images: ProductImage[];
  videos?: ProductVideo[];
}

export function ProductGallery({ images = [], videos = [] }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const allMedia = [
    ...images.map((img) => ({ type: 'image' as const, url: img.url, alt: img.altText ?? '' })),
    ...videos.map((v) => ({ type: 'video' as const, url: v.url, alt: '' })),
  ];

  if (!allMedia.length) {
    return (
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
        <ZoomIn className="w-16 h-16 text-slate-300" />
      </div>
    );
  }

  const current = allMedia[activeIndex];
  const prev = () => setActiveIndex((i) => (i - 1 + allMedia.length) % allMedia.length);
  const next = () => setActiveIndex((i) => (i + 1) % allMedia.length);

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in"
        onClick={() => setZoomed(!zoomed)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {current.type === 'video' ? (
              <video src={current.url} controls className="w-full h-full object-contain" />
            ) : (
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain transition-transform duration-300 ${zoomed ? 'scale-150' : 'scale-100'}`}
                priority={activeIndex === 0}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {allMedia.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-slate-900/80
                         backdrop-blur-sm rounded-full flex items-center justify-center shadow-md
                         hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-slate-900/80
                         backdrop-blur-sm rounded-full flex items-center justify-center shadow-md
                         hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg p-1.5">
          <ZoomIn className="w-4 h-4 text-slate-600" />
        </div>
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allMedia.map((media, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-primary-500 ring-1 ring-primary-300'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                  ▶
                </div>
              ) : (
                <Image src={media.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
