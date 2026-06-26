'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCategories, getMenu, photoUrl, Category, MenuItem } from '@/lib/api';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getMenu(activeCategory ?? undefined)
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.name.includes(search) ||
          (i.description && i.description.includes(search))
      )
    : items;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero */}
      <header className="relative bg-gradient-to-b from-amber-900 to-amber-700 text-white text-center py-16 px-4 overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-600/30 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-800/30 rounded-full" />

        <div className="relative z-10">
          <span className="text-5xl mb-4 block">☕</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">کافه ما</h1>
          <p className="mt-3 text-amber-200 text-lg">
            لذت یک فنجان خوب، با هر سفارش
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="جستجو در منو…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mx-auto block border border-amber-300 rounded-xl px-4 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm placeholder-gray-400"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-amber-700 text-white shadow'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            همه
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-700 text-white shadow'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p>آیتمی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-amber-700/60 text-sm">
        © ۱۴۰۳ کافه ما — با عشق تهیه شده
      </footer>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const url = photoUrl(item.photo);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Photo */}
      <div className="relative h-48 bg-amber-100">
        {url ? (
          <Image
            src={url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl opacity-30">☕</span>
          </div>
        )}
        {/* Category badge */}
        {item.category && (
          <span className="absolute top-3 right-3 bg-amber-700/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {item.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-gray-500 text-sm mt-1 flex-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-amber-700 font-bold text-base">
            {formatPrice(item.price)}
          </span>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            موجود
          </span>
        </div>
      </div>
    </div>
  );
}
