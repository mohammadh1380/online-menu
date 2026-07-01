'use client';

import React, { useEffect, useState } from 'react';
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
      {/* dark overlay — keep some depth but let the photo breathe */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,3,2,0.55)' }} />
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


        {/* logo + title */}
        <div className="text-center mb-16">
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color .2s', direction: 'ltr' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span>{settings.instagram}</span>
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

      </div>
    </>
  );
}

// ── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({ item }: { item: MenuItem }) {
  const url = photoUrl(item.photo);
  return (
    <div
      className="group transition-all duration-300"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'rgba(18,18,18,0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.18)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Photo — top */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#111', flexShrink: 0 }}>
        {url ? (
          <Image
            src={url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: 48, opacity: 0.08 }}>☕</span>
          </div>
        )}
        {/* Category badge — top corner */}
        {item.category && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            fontSize: '0.7rem', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {item.category.name}
          </span>
        )}
      </div>

      {/* Content — bottom */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', lineHeight: 1.4, marginBottom: 4, textAlign: 'right' }}>
            {item.name}
          </h3>
          {item.description && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, textAlign: 'right', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2 } as React.CSSProperties}>
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom: price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [branches, setBranches]         = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [items, setItems]               = useState<MenuItem[]>([]);
  // 'featured' = پیشنهاد روز tab; number = category id
  const [activeTab, setActiveTab]       = useState<'featured' | number>('featured');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cafeSettings, setCafeSettings] = useState<CafeSettings>({ cafe_name: 'کافه ما', subtitle: 'لذت یک فنجان خوب، با هر سفارش', instagram: '' });

  useEffect(() => {
    Promise.all([
      getBranches().then((r) => setBranches(r.data)),
      getCategories().then((r) => setCategories(r.data)),
      getSettings().then((r) => setCafeSettings(r.data)),
    ]).finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!activeBranch) return;
    setLoading(true);
    const catId    = activeTab !== 'featured' ? activeTab : undefined;
    const featured = activeTab === 'featured' ? true : undefined;
    getMenu(activeBranch.id, catId, featured)
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [activeBranch, activeTab]);

  function selectBranch(b: Branch) {
    setActiveBranch(b);
    setActiveTab('featured');
    setSearch('');
  }

  if (initialLoading) {
    return (
      <>
        <BgLayer />
        <ParticleCanvas />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.7)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
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

        {/* Hero header — full bleed, bg.jpg shows through */}
        <header style={{ position: 'relative', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 16px 48px', overflow: 'hidden' }}>
          {/* bottom gradient fade into the content area */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, rgba(5,3,2,0.9))', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 700, color: '#ffffff', marginBottom: 8, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {cafeSettings.cafe_name}
            </h1>
            {cafeSettings.subtitle && (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: cafeSettings.instagram ? 8 : 20 }}>
                {cafeSettings.subtitle}
              </p>
            )}

            {cafeSettings.instagram && (
              <a
                href={`https://instagram.com/${cafeSettings.instagram}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color .2s', direction: 'ltr' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>{cafeSettings.instagram}</span>
              </a>
            )}

            {/* Branch switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBranch(b)}
                  style={{
                    padding: '8px 22px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all .2s',
                    ...(activeBranch.id === b.id
                      ? { background: '#ffffff', color: '#0d0d0d', border: 'none' }
                      : { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }
                    )
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto px-4 py-8" style={{ background: 'transparent', maxWidth: 1200 }}>


          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {/* پیشنهاد روز — always first */}
            <button
              onClick={() => setActiveTab('featured')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeTab === 'featured'
                  ? { background: '#f59e0b', color: '#0d0d0d' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              ⭐ پیشنهاد روز
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  activeTab === cat.id
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
              <span className="text-5xl block mb-4">{activeTab === 'featured' ? '⭐' : '☕'}</span>
              <p>{activeTab === 'featured' ? 'هنوز پیشنهادی انتخاب نشده' : 'آیتمی یافت نشد'}</p>
            </div>
          ) : (
            <>
              <style>{`
                @media (max-width: 768px) { .menu-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 480px) { .menu-grid { grid-template-columns: 1fr !important; } }
              `}</style>
              <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.map((item) => <MenuCard key={item.id} item={item} />)}
              </div>
            </>
          )}
        </main>

      </div>
    </>
  );
}
