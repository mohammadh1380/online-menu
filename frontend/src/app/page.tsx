'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getBranches, getCategories, getMenu,
  photoUrl, Branch, Category, MenuItem,
} from '@/lib/api';

const BRANCH_KEY = 'selected_branch';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// ── Branch selector ───────────────────────────────────────────────────────────

function BranchSelector({ branches, onSelect }: { branches: Branch[]; onSelect: (b: Branch) => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }} />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full"
          style={{ background: 'linear-gradient(135deg, #92400e, #d97706)' }}>
          <span className="text-5xl">☕</span>
        </div>

        <h1 className="text-5xl font-bold mb-2" style={{ color: '#fbbf24' }}>کافه ما</h1>
        <p className="text-lg mb-12" style={{ color: '#78350f' }}>شعبه مورد نظر را انتخاب کنید</p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className="flex-1 py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #1c1008, #2d1a0a)',
                border: '1px solid #92400e',
                color: '#fbbf24',
                boxShadow: '0 0 30px rgba(146,64,14,0.3), inset 0 1px 0 rgba(251,191,36,0.1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(217,119,6,0.5), inset 0 1px 0 rgba(251,191,36,0.2)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d97706';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(146,64,14,0.3), inset 0 1px 0 rgba(251,191,36,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#92400e';
              }}
            >
              {branch.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({ item }: { item: MenuItem }) {
  const url = photoUrl(item.photo);
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(145deg, #1a0e06, #150b04)',
        border: '1px solid rgba(146,64,14,0.3)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(217,119,6,0.5)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(146,64,14,0.3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(146,64,14,0.3)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
      }}
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden" style={{ background: '#0f0703' }}>
        {url ? (
          <Image
            src={url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-20">☕</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,7,3,0.7) 0%, transparent 50%)' }} />

        {item.category && (
          <span
            className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(146,64,14,0.9)', color: '#fbbf24', backdropFilter: 'blur(8px)' }}
          >
            {item.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg leading-snug mb-1" style={{ color: '#fef3c7' }}>{item.name}</h3>
        {item.description && (
          <p className="text-sm flex-1 leading-relaxed line-clamp-2" style={{ color: '#78350f' }}>
            {item.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: '#f59e0b' }}>
            {formatPrice(item.price)}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            موجود
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [branches, setBranches]             = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch]     = useState<Branch | null>(null);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [items, setItems]                   = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch]                 = useState('');
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    getBranches().then((r) => {
      setBranches(r.data);
      const saved = localStorage.getItem(BRANCH_KEY);
      if (saved) {
        const found = r.data.find((b) => b.slug === saved);
        if (found) setActiveBranch(found);
      }
    });
    getCategories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (!activeBranch) return;
    setLoading(true);
    getMenu(activeBranch.id, activeCategory ?? undefined)
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [activeBranch, activeCategory]);

  function selectBranch(b: Branch) {
    localStorage.setItem(BRANCH_KEY, b.slug);
    setActiveBranch(b);
    setActiveCategory(null);
    setSearch('');
  }

  if (!activeBranch) {
    return <BranchSelector branches={branches} onSelect={selectBranch} />;
  }

  const filtered = search.trim()
    ? items.filter((i) => i.name.includes(search) || (i.description && i.description.includes(search)))
    : items;

  return (
    <div className="min-h-screen" style={{ background: '#0a0603', color: '#fef3c7' }}>

      {/* Header */}
      <header
        className="relative text-center py-14 px-4 overflow-hidden"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(10,6,3,0.95) 100%)' }} />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-20 blur-3xl rounded-full"
          style={{ background: '#92400e' }} />

        <div className="relative z-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'linear-gradient(135deg, #92400e, #d97706)' }}
          >
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#fbbf24' }}>کافه ما</h1>
          <p className="text-sm mt-1 mb-5" style={{ color: '#78350f' }}>لذت یک فنجان خوب، با هر سفارش</p>

          {/* Branch switcher */}
          <div className="flex justify-center gap-2 flex-wrap">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBranch(b)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  activeBranch.id === b.id
                    ? { background: '#d97706', color: '#0a0603', boxShadow: '0 0 20px rgba(217,119,6,0.4)' }
                    : { background: 'rgba(146,64,14,0.2)', color: '#d97706', border: '1px solid rgba(146,64,14,0.4)' }
                }
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="جستجو در منو…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-sm outline-none placeholder-amber-900"
              style={{
                background: '#1a0e06',
                border: '1px solid rgba(146,64,14,0.4)',
                color: '#fef3c7',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#d97706')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(146,64,14,0.4)')}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800">🔍</span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[{ id: null, name: 'همه' }, ...categories.map(c => ({ id: c.id, name: c.name }))].map((cat) => (
            <button
              key={cat.id ?? 'all'}
              onClick={() => setActiveCategory(cat.id)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeCategory === cat.id
                  ? { background: 'linear-gradient(135deg, #92400e, #d97706)', color: '#fef3c7', boxShadow: '0 0 16px rgba(217,119,6,0.35)' }
                  : { background: '#1a0e06', color: '#92400e', border: '1px solid rgba(146,64,14,0.3)' }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 rounded-full border-4 border-amber-900 border-t-amber-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24" style={{ color: '#78350f' }}>
            <span className="text-5xl block mb-4">☕</span>
            <p>آیتمی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => <MenuCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs" style={{ color: '#3b1c08', borderTop: '1px solid #1a0e06' }}>
        © ۱۴۰۳ کافه ما — با عشق تهیه شده
      </footer>
    </div>
  );
}
