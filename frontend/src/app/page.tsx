'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getBranches, getCategories, getMenu, getSettings,
  photoUrl, Branch, Category, MenuItem, CafeSettings,
} from '@/lib/api';
import ParticleCanvas from '@/components/ParticleCanvas';

// Fixed background: bg.jpg + dark overlay, sits behind particle canvas
function BgLayer() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      {/* photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      {/* dark overlay so text stays legible */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,3,2,0.82)' }} />
    </div>
  );
}


function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// ── Branch selector ───────────────────────────────────────────────────────────

const BRANCH_ICONS = ['◈', '◉'];

function BranchSelector({ branches, onSelect, settings }: { branches: Branch[]; onSelect: (b: Branch) => void; settings: CafeSettings }) {
  return (
    <>
      <BgLayer />
      <ParticleCanvas />

      {/* full-screen container — transparent so bg + particles show through */}
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ position: 'relative', zIndex: 1 }}
      >

        {/* top label */}
        <p className="text-xs tracking-widest uppercase mb-10" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.25em' }}>
          COFFEE MENU
        </p>

        {/* logo + title */}
        <div className="text-center mb-16">
          <div
            className="mx-auto mb-6 flex items-center justify-center"
            style={{
              width: 96, height: 96,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 0 60px rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ fontSize: 44 }}>☕</span>
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em' }}
          >
            {settings.cafe_name}
          </h1>

          {/* thin divider */}
          <div className="mx-auto mt-5 mb-4" style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.15)' }} />

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem' }}>
            شعبه مورد نظر را انتخاب کنید
          </p>

          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span dir="ltr">@{settings.instagram}</span>
            </a>
          )}
        </div>

        {/* branch cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full" style={{ maxWidth: 560 }}>
          {branches.map((branch, idx) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className="group flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl transition-all duration-300 hover:-translate-y-1"
              style={{
                padding: '2.5rem 2rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.1)';
                el.style.border = '1px solid rgba(255,255,255,0.3)';
                el.style.boxShadow = '0 0 60px rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.04)';
                el.style.border = '1px solid rgba(255,255,255,0.1)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* icon */}
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                {BRANCH_ICONS[idx] ?? '◈'}
              </span>

              {/* branch name */}
              <span
                className="font-bold"
                style={{ color: '#ffffff', fontSize: '1.25rem', lineHeight: 1.3 }}
              >
                {branch.name}
              </span>

              {/* arrow */}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: 4 }}>
                مشاهده منو ←
              </span>
            </button>
          ))}
        </div>

        {/* bottom label */}
        <p className="mt-14 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          © ۱۴۰۳ کافه ما
        </p>
      </div>
    </>
  );
}

// ── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({ item }: { item: MenuItem }) {
  const url = photoUrl(item.photo);
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.22)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.08)';
      }}
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden" style={{ background: '#111' }}>
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
            <span className="text-6xl opacity-10">☕</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.7) 0%, transparent 55%)' }} />

        {item.category && (
          <span
            className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            {item.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg leading-snug mb-1" style={{ color: '#ffffff' }}>{item.name}</h3>
        {item.description && (
          <p className="text-sm flex-1 leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {item.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: '#ffffff' }}>
            {formatPrice(item.price)}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}
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
  const [cafeSettings, setCafeSettings]     = useState<CafeSettings>({ cafe_name: 'کافه ما', instagram: '' });

  useEffect(() => {
    getBranches().then((r) => setBranches(r.data));
    getCategories().then((r) => setCategories(r.data));
    getSettings().then((r) => setCafeSettings(r.data));
  }, []);

  useEffect(() => {
    if (!activeBranch) return;
    setLoading(true);
    getMenu(activeBranch.id, activeCategory ?? undefined)
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [activeBranch, activeCategory]);

  function selectBranch(b: Branch) {
    setActiveBranch(b);
    setActiveCategory(null);
    setSearch('');
  }

  if (!activeBranch) {
    return <BranchSelector branches={branches} onSelect={selectBranch} settings={cafeSettings} />;
  }

  const filtered = search.trim()
    ? items.filter((i) => i.name.includes(search) || (i.description && i.description.includes(search)))
    : items;

  return (
    <>
      <BgLayer />
      <ParticleCanvas />
      <div className="min-h-screen" style={{ position: 'relative', zIndex: 1, color: '#ffffff' }}>

        {/* Header */}
        <header
          className="relative text-center py-14 px-4 overflow-hidden"
          style={{ background: 'rgba(6,4,2,0.6)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 opacity-10 blur-3xl rounded-full"
            style={{ background: '#ffffff' }} />

          <div className="relative z-10">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
            >
              <span className="text-3xl">☕</span>
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>{cafeSettings.cafe_name}</h1>
            <p className="text-sm mt-1 mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>لذت یک فنجان خوب، با هر سفارش</p>
            {cafeSettings.instagram && (
              <a
                href={`https://instagram.com/${cafeSettings.instagram}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mb-4"
                style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span dir="ltr">@{cafeSettings.instagram}</span>
              </a>
            )}

            {/* Branch switcher */}
            <div className="flex justify-center gap-2 flex-wrap">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBranch(b)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={
                    activeBranch.id === b.id
                      ? { background: '#ffffff', color: '#0d0d0d' }
                      : { background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)' }
                  }
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8" style={{ background: 'transparent' }}>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="جستجو در منو…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
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
                    ? { background: '#ffffff', color: '#0d0d0d' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
        <footer className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,4,2,0.4)' }}>
          © ۱۴۰۳ {cafeSettings.cafe_name} — با عشق تهیه شده
        </footer>
      </div>
    </>
  );
}
