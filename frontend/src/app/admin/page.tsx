'use client';

import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Branch, Category, MenuItem, CafeSettings,
  getBranches, getCategories, getSettings,
  adminGetMenu, adminCreateItem, adminUpdateItem, adminDeleteItem,
  adminCreateCategory, adminDeleteCategory,
  adminUpdateSettings,
  photoUrl,
} from '@/lib/api';
import ParticleCanvas from '@/components/ParticleCanvas';

type Tab = 'items' | 'categories' | 'settings';

function formatPrice(p: number) {
  return new Intl.NumberFormat('fa-IR').format(p) + ' تومان';
}

// ── shared input style ────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '10px 16px',
  color: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: 6,
};

// ── Item Form Modal ───────────────────────────────────────────────────────────

interface ItemFormProps {
  branches: Branch[];
  categories: Category[];
  editing: MenuItem | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}

function ItemFormModal({ branches, categories, editing, nextOrder, onClose, onSaved }: ItemFormProps) {
  const [name, setName]               = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [price, setPrice]             = useState(editing?.price.toString() ?? '');
  const [categoryId, setCategoryId]   = useState(editing?.category_id.toString() ?? '');
  const [isAvailable, setIsAvailable] = useState(editing?.is_available ?? true);
  const [order, setOrder]             = useState(editing?.order.toString() ?? nextOrder.toString());
  const [selectedBranches, setSelectedBranches] = useState<number[]>(
    editing?.branches.map((b) => b.id) ?? branches.map((b) => b.id)
  );
  const [photo, setPhoto]     = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    editing?.photo ? photoUrl(editing.photo) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleBranch(id: number) {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!categoryId) { setError('لطفاً دسته‌بندی را انتخاب کنید'); return; }
    if (selectedBranches.length === 0) { setError('حداقل یک شعبه را انتخاب کنید'); return; }

    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('price', price);
    form.append('category_id', categoryId);
    form.append('is_available', isAvailable.toString());
    form.append('order', order);
    selectedBranches.forEach((id) => form.append('branch_ids', id.toString()));
    if (photo) form.append('photo', photo);

    setLoading(true);
    try {
      if (editing) {
        await adminUpdateItem(editing.id, form);
      } else {
        await adminCreateItem(form);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'خطایی رخ داد';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="font-bold text-base" style={{ color: '#ffffff' }}>
            {editing ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Photo upload */}
          <div>
            <label style={labelStyle}>تصویر</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '1px dashed rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'border-color .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
            >
              {preview ? (
                <div className="relative rounded-lg overflow-hidden" style={{ height: 160 }}>
                  <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div style={{ padding: '24px 0', color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📷</span>
                  <span style={{ fontSize: '0.875rem' }}>برای آپلود کلیک کنید</span>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>JPG، PNG، WebP — حداکثر ۵ مگابایت</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>نام آیتم *</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              style={inputStyle} placeholder="مثلاً: اسپرسو دوبل"
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>توضیحات</label>
            <textarea
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }} placeholder="توضیح کوتاهی درباره آیتم…"
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Price & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>قیمت (تومان) *</label>
              <input
                required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                style={inputStyle} placeholder="۵۰۰۰۰"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <div>
              <label style={labelStyle}>ترتیب نمایش</label>
              <input
                type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)}
                style={inputStyle} placeholder="0"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                عدد کمتر = نمایش اول
              </p>
            </div>
            <div>
              <label style={labelStyle}>دسته‌بندی *</label>
              <select
                required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                <option value="" style={{ background: '#1a1a1a' }}>انتخاب کنید</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#1a1a1a' }}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Branches */}
          <div>
            <label style={labelStyle}>شعبه‌ها * (می‌توان چند شعبه انتخاب کرد)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {branches.map((b) => {
                const active = selectedBranches.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBranch(b.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? '#111111' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#ffffff' }}
            />
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>موجود در منو</span>
          </label>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button" onClick={onClose}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12, fontSize: '0.875rem',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
            >
              انصراف
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600,
                background: loading ? 'rgba(255,255,255,0.3)' : '#ffffff',
                color: '#111111', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity .2s',
              }}
            >
              {loading ? 'در حال ذخیره…' : editing ? 'ذخیره تغییرات' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────────

function CategoryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName]   = useState('');
  const [slug, setSlug]   = useState('');
  const [order, setOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminCreateCategory({ name, slug, order: parseInt(order) });
      setName(''); setSlug(''); setOrder('0');
      onCreated();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'خطایی رخ داد';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: 'rgba(17,17,17,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 }}
    >
      <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>افزودن دسته‌بندی جدید</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
        <div>
          <label style={labelStyle}>نام *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            style={inputStyle} placeholder="مثلاً: قهوه گرم"
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>شناسه (slug) *</label>
          <input required value={slug} onChange={(e) => setSlug(e.target.value)}
            style={{ ...inputStyle }} placeholder="hot-coffee" dir="ltr"
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>ترتیب</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 8 }}>{error}</p>}
      <button
        type="submit" disabled={loading}
        style={{
          marginTop: 16, padding: '9px 24px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
          background: '#ffffff', color: '#111111', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'در حال افزودن…' : '+ افزودن دسته‌بندی'}
      </button>
    </form>
  );
}

// ── Settings Form ─────────────────────────────────────────────────────────────

function SettingsForm({ initial, onSaved }: { initial: CafeSettings; onSaved: (s: CafeSettings) => void }) {
  const [cafeName, setCafeName]   = useState(initial.cafe_name);
  const [subtitle, setSubtitle]   = useState(initial.subtitle);
  const [instagram, setInstagram] = useState(initial.instagram);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(false);
    setLoading(true);
    try {
      const res = await adminUpdateSettings({ cafe_name: cafeName, subtitle, instagram });
      onSaved(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('خطا در ذخیره تنظیمات');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: 'rgba(17,17,17,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div>
          <label style={labelStyle}>نام کافه</label>
          <input
            required value={cafeName} onChange={e => setCafeName(e.target.value)}
            style={inputStyle} placeholder="مثلاً: کافه آرامش"
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            این نام در صفحه منو و انتخاب شعبه نمایش داده می‌شود
          </p>
        </div>

        <div>
          <label style={labelStyle}>متن زیرعنوان</label>
          <input
            value={subtitle} onChange={e => setSubtitle(e.target.value)}
            style={inputStyle} placeholder="مثلاً: لذت یک فنجان خوب، با هر سفارش"
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            متنی که زیر نام کافه در صفحه منو نمایش داده می‌شود
          </p>
        </div>

        <div>
          <label style={labelStyle}>صفحه اینستاگرام</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', pointerEvents: 'none' }}>@</span>
            <input
              value={instagram} onChange={e => setInstagram(e.target.value.replace('@', ''))}
              style={{ ...inputStyle, paddingRight: 32 }} placeholder="cafe.username" dir="ltr"
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            اگر خالی باشد لینک اینستاگرام نمایش داده نمی‌شود
          </p>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: '#4ade80', fontSize: '0.8rem', background: 'rgba(74,222,128,0.08)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(74,222,128,0.2)' }}>
            ✓ تنظیمات با موفقیت ذخیره شد
          </p>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            padding: '11px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.9rem',
            background: loading ? 'rgba(255,255,255,0.3)' : '#ffffff',
            color: '#111111', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
        </button>
      </form>
    </div>
  );
}


// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]               = useState<Tab>('items');
  const [branches, setBranches]     = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems]           = useState<MenuItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<MenuItem | null>(null);
  const [search, setSearch]         = useState('');
  const [cafeSettings, setCafeSettings] = useState<CafeSettings>({ cafe_name: 'کافه ما', subtitle: 'لذت یک فنجان خوب، با هر سفارش', instagram: '' });

  async function fetchData() {
    setLoading(true);
    try {
      const [br, cats, its, sett] = await Promise.all([getBranches(), getCategories(), adminGetMenu(), getSettings()]);
      setBranches(br.data);
      setCategories(cats.data);
      setItems(its.data);
      setCafeSettings(sett.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  function logout() {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`آیا از حذف "${item.name}" مطمئن هستید؟`)) return;
    await adminDeleteItem(item.id);
    fetchData();
  }

  async function handleDeleteCategory(cat: Category) {
    if (!confirm(`حذف "${cat.name}"؟ تمام آیتم‌های آن نیز حذف می‌شوند.`)) return;
    await adminDeleteCategory(cat.id);
    fetchData();
  }

  const filteredItems = search.trim()
    ? items.filter((i) => i.name.includes(search) || i.category?.name.includes(search))
    : items;

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'right',
    letterSpacing: '0.03em',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.75)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#ffffff', position: 'relative' }}>
      <ParticleCanvas />

      {/* Topbar */}
      <header style={{
        background: 'rgba(13,13,13,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>☕</span>
          <h1 style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>پنل مدیریت کافه</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="/" target="_blank"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            مشاهده منو ↗
          </a>
          <button
            onClick={logout}
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: '0.85rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            خروج
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px', position: 'relative', zIndex: 1 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {([
            { key: 'items',      label: 'آیتم‌های منو' },
            { key: 'categories', label: 'دسته‌بندی‌ها' },
            { key: 'settings',   label: 'تنظیمات' },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 22px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all .2s',
                background: tab === key ? '#ffffff' : 'transparent',
                color: tab === key ? '#111111' : 'rgba(255,255,255,0.45)',
                border: tab === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Items tab ── */}
        {tab === 'items' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text" placeholder="جستجو…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, width: 'auto', flex: '1', maxWidth: 280 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                style={{
                  padding: '10px 24px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600,
                  background: '#ffffff', color: '#111111', border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                + آیتم جدید
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: 'rgba(255,255,255,0.7)',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem',
                background: 'rgba(17,17,17,0.8)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                آیتمی یافت نشد
              </div>
            ) : (
              <>
                {/* ── Desktop table (hidden on mobile) ── */}
                <div className="admin-table-wrap" style={{ background: 'rgba(17,17,17,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <th style={thStyle}>تصویر</th>
                        <th style={thStyle}>نام</th>
                        <th style={thStyle}>دسته‌بندی</th>
                        <th style={thStyle}>شعبه‌ها</th>
                        <th style={thStyle}>قیمت</th>
                        <th style={thStyle}>وضعیت</th>
                        <th style={thStyle}>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: idx < filteredItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background .15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={tdStyle}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#1e1e1e', position: 'relative' }}>
                              {item.photo ? <Image src={photoUrl(item.photo)!} alt={item.name} fill className="object-cover" unoptimized /> : <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:18 }}>☕</div>}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <p style={{ fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>{item.name}</p>
                            {item.description && <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{item.description}</p>}
                          </td>
                          <td style={tdStyle}>
                            {item.category?.name
                              ? <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}>{item.category.name}</span>
                              : <span style={{ color:'rgba(255,255,255,0.2)' }}>—</span>}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                              {item.branches.length === 0
                                ? <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.75rem' }}>—</span>
                                : item.branches.map(b => <span key={b.id} style={{ fontSize:'0.7rem', padding:'2px 10px', borderRadius:20, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)' }}>{b.name}</span>)}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, color:'#ffffff', fontWeight:500, whiteSpace:'nowrap' }}>{formatPrice(item.price)}</td>
                          <td style={tdStyle}>
                            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:500,
                              background: item.is_available ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                              color: item.is_available ? '#4ade80' : 'rgba(255,255,255,0.3)',
                              border:`1px solid ${item.is_available ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                              {item.is_available ? 'موجود' : 'ناموجود'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display:'flex', gap:8 }}>
                              <button onClick={() => { setEditing(item); setShowForm(true); }}
                                style={{ fontSize:'0.75rem', padding:'5px 12px', borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', cursor:'pointer', transition:'all .2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'; e.currentTarget.style.color='#ffffff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}>
                                ویرایش
                              </button>
                              <button onClick={() => handleDelete(item)}
                                style={{ fontSize:'0.75rem', padding:'5px 12px', borderRadius:8, background:'transparent', border:'1px solid rgba(239,68,68,0.25)', color:'rgba(239,68,68,0.7)', cursor:'pointer', transition:'all .2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(239,68,68,0.6)'; e.currentTarget.style.color='#f87171'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(239,68,68,0.25)'; e.currentTarget.style.color='rgba(239,68,68,0.7)'; }}>
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards (hidden on desktop) ── */}
                <div className="admin-cards-wrap" style={{ flexDirection:'column', gap:10 }}>
                  {filteredItems.map(item => (
                    <div key={item.id} style={{ background:'rgba(17,17,17,0.85)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:14 }}>
                      {/* top row: photo + info */}
                      <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                        <div style={{ width:52, height:52, borderRadius:10, overflow:'hidden', background:'#1e1e1e', position:'relative', flexShrink:0 }}>
                          {item.photo ? <Image src={photoUrl(item.photo)!} alt={item.name} fill className="object-cover" unoptimized /> : <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:20 }}>☕</div>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:700, color:'#ffffff', fontSize:'0.95rem', marginBottom:4 }}>{item.name}</p>
                          {item.description && <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</p>}
                        </div>
                      </div>
                      {/* meta row */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12, alignItems:'center' }}>
                        {item.category?.name && <span style={{ fontSize:'0.72rem', padding:'2px 10px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)' }}>{item.category.name}</span>}
                        {item.branches.map(b => <span key={b.id} style={{ fontSize:'0.72rem', padding:'2px 10px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)' }}>{b.name}</span>)}
                        <span style={{ fontSize:'0.8rem', color:'#ffffff', fontWeight:600, marginRight:'auto' }}>{formatPrice(item.price)}</span>
                        <span style={{ fontSize:'0.72rem', padding:'2px 10px', borderRadius:20, fontWeight:500,
                          background: item.is_available ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                          color: item.is_available ? '#4ade80' : 'rgba(255,255,255,0.3)',
                          border:`1px solid ${item.is_available ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                          {item.is_available ? 'موجود' : 'ناموجود'}
                        </span>
                      </div>
                      {/* action buttons */}
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={() => { setEditing(item); setShowForm(true); }}
                          style={{ flex:1, padding:'8px 0', borderRadius:9, fontSize:'0.82rem', fontWeight:600, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#ffffff', cursor:'pointer' }}>
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{ flex:1, padding:'8px 0', borderRadius:9, fontSize:'0.82rem', fontWeight:600, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer' }}>
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Categories tab ── */}
        {tab === 'categories' && (
          <>
            <CategoryForm onCreated={fetchData} />
            <div style={{ background: 'rgba(17,17,17,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th style={thStyle}>نام</th>
                    <th style={thStyle}>شناسه</th>
                    <th style={thStyle}>ترتیب</th>
                    <th style={thStyle}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>
                        دسته‌بندی‌ای وجود ندارد
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat, idx) => (
                      <tr
                        key={cat.id}
                        style={{ borderBottom: idx < categories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#ffffff' }}>{cat.name}</td>
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }} dir="ltr">{cat.slug}</td>
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)' }}>{cat.order}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            style={{
                              fontSize: '0.75rem', padding: '5px 12px', borderRadius: 8,
                              background: 'transparent', border: '1px solid rgba(239,68,68,0.25)',
                              color: 'rgba(239,68,68,0.7)', cursor: 'pointer', transition: 'all .2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; e.currentTarget.style.color = '#f87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Settings tab ── */}
        {tab === 'settings' && (
          <SettingsForm initial={cafeSettings} onSaved={setCafeSettings} />
        )}

      </div>

      {showForm && (
        <ItemFormModal
          branches={branches}
          categories={categories}
          editing={editing}
          nextOrder={items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 0}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={fetchData}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1a1a1a; color: #ffffff; }
        /* desktop: show table, hide cards */
        .admin-table-wrap { display: block; }
        .admin-cards-wrap { display: none; }
        /* mobile: hide table, show cards */
        @media (max-width: 640px) {
          .admin-table-wrap { display: none; }
          .admin-cards-wrap { display: flex; }
        }
      `}</style>
    </div>
  );
}
