'use client';

import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Category,
  MenuItem,
  getCategories,
  adminGetMenu,
  adminCreateItem,
  adminUpdateItem,
  adminDeleteItem,
  adminCreateCategory,
  adminDeleteCategory,
  photoUrl,
} from '@/lib/api';

type Tab = 'items' | 'categories';

function formatPrice(p: number) {
  return new Intl.NumberFormat('fa-IR').format(p) + ' تومان';
}

// ── Item Form Modal ───────────────────────────────────────────────────────────

interface ItemFormProps {
  categories: Category[];
  editing: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function ItemFormModal({ categories, editing, onClose, onSaved }: ItemFormProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [price, setPrice] = useState(editing?.price.toString() ?? '');
  const [categoryId, setCategoryId] = useState(editing?.category_id.toString() ?? '');
  const [isAvailable, setIsAvailable] = useState(editing?.is_available ?? true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    editing?.photo ? photoUrl(editing.photo) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('price', price);
    form.append('category_id', categoryId);
    form.append('is_available', isAvailable.toString());
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
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'خطایی رخ داد';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تصویر</label>
            <div
              className="border-2 border-dashed border-amber-300 rounded-xl p-4 text-center cursor-pointer hover:bg-amber-50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <Image src={preview} alt="preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="py-6 text-amber-600">
                  <span className="text-3xl block mb-2">📷</span>
                  <span className="text-sm">برای آپلود کلیک کنید</span>
                  <p className="text-xs text-gray-400 mt-1">JPG، PNG، WebP — حداکثر ۵ مگابایت</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام آیتم *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="مثلاً: اسپرسو دوبل"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="توضیح کوتاهی درباره آیتم…"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان) *</label>
              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="۵۰۰۰۰"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">انتخاب کنید</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 accent-amber-600"
            />
            <span className="text-sm text-gray-700">موجود در منو</span>
          </label>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
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

interface CategoryFormProps {
  onCreated: () => void;
}

function CategoryForm({ onCreated }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
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
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'خطایی رخ داد';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">افزودن دسته‌بندی جدید</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">نام *</label>
          <input
            required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="مثلاً: قهوه گرم"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">شناسه (slug) *</label>
          <input
            required value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="hot-coffee"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">ترتیب نمایش</label>
          <input
            type="number" value={order} onChange={(e) => setOrder(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="mt-4 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        {loading ? 'در حال افزودن…' : '+ افزودن دسته‌بندی'}
      </button>
    </form>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('items');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const [cats, its] = await Promise.all([getCategories(), adminGetMenu()]);
      setCategories(cats.data);
      setItems(its.data);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <h1 className="font-bold text-lg">پنل مدیریت کافه</h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="text-amber-200 hover:text-white text-sm transition-colors"
          >
            مشاهده منو ↗
          </a>
          <button
            onClick={logout}
            className="bg-amber-900/50 hover:bg-amber-900 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            خروج
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['items', 'categories'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50'
              }`}
            >
              {t === 'items' ? 'آیتم‌های منو' : 'دسته‌بندی‌ها'}
            </button>
          ))}
        </div>

        {/* ── Items tab ── */}
        {tab === 'items' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="جستجو…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1 max-w-xs bg-white"
              />
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
              >
                + آیتم جدید
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50 text-amber-900 text-right">
                    <tr>
                      <th className="px-4 py-3 font-semibold">تصویر</th>
                      <th className="px-4 py-3 font-semibold">نام</th>
                      <th className="px-4 py-3 font-semibold hidden md:table-cell">دسته‌بندی</th>
                      <th className="px-4 py-3 font-semibold hidden sm:table-cell">قیمت</th>
                      <th className="px-4 py-3 font-semibold">وضعیت</th>
                      <th className="px-4 py-3 font-semibold">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          آیتمی یافت نشد
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-amber-100 flex-shrink-0">
                              {item.photo ? (
                                <Image
                                  src={photoUrl(item.photo)!}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-xl">
                                  ☕
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-gray-400 text-xs truncate max-w-[180px]">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                            {item.category?.name ?? '—'}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-amber-700 font-medium">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.is_available
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {item.is_available ? 'موجود' : 'ناموجود'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditing(item); setShowForm(true); }}
                                className="text-amber-700 hover:text-amber-900 text-xs px-3 py-1.5 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-600 hover:text-red-800 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Categories tab ── */}
        {tab === 'categories' && (
          <>
            <CategoryForm onCreated={fetchData} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-amber-900 text-right">
                  <tr>
                    <th className="px-4 py-3 font-semibold">نام</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">شناسه</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">ترتیب</th>
                    <th className="px-4 py-3 font-semibold">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">
                        دسته‌بندی‌ای وجود ندارد
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-500" dir="ltr">
                          {cat.slug}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{cat.order}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-red-600 hover:text-red-800 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
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
      </div>

      {/* Item form modal */}
      {showForm && (
        <ItemFormModal
          categories={categories}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
