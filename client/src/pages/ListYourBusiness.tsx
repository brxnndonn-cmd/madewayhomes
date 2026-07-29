import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthToken } from '../lib/api';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface ServiceArea {
  id: number;
  city: string;
  state: string;
  zip_code: string;
}

const CALDWELL_CITIES = [
  { city: 'Lenoir', zip: '28645' },
  { city: 'Granite Falls', zip: '28630' },
  { city: 'Hudson', zip: '28638' },
  { city: 'Sawmills', zip: '28667' },
  { city: 'Gamewell', zip: '28645' },
  { city: 'Collettsville', zip: '28611' },
  { city: 'Patterson', zip: '28661' },
  { city: 'Rhodhiss', zip: '28667' },
];

export default function ListYourBusiness() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [authBanner, setAuthBanner] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([
    { id: Date.now(), city: '', state: 'NC', zip_code: '' },
  ]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setOwnerName(user.name || '');
      setEmail((user as any).email || '');
    }
  }, [user]);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => setApiError('Failed to load service categories'))
      .finally(() => setLoading(false));
  }, []);

  // Check if user already has a provider profile
  useEffect(() => {
    if (user) {
      const token = getAuthToken();
      if (token) {
        fetch('/api/providers/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            if (data.profile) {
              setApiError('You have already submitted a provider application.');
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!description.trim() || description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Select at least one service category';
    }
    const validAreas = areas.filter(a => a.city.trim());
    if (validAreas.length === 0) {
      newErrors.areas = 'At least one service area is required';
    }
    if (!termsAgreed) {
      newErrors.terms = 'You must agree to the Provider Agreement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    if (errors.categories) setErrors(prev => ({ ...prev, categories: '' }));
  };

  const handleAreaChange = (id: number, field: 'city' | 'state' | 'zip_code', value: string) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    if (errors.areas) setErrors(prev => ({ ...prev, areas: '' }));
  };

  const addArea = () => {
    setAreas(prev => [...prev, { id: Date.now(), city: '', state: 'NC', zip_code: '' }]);
  };

  const removeArea = (id: number) => {
    setAreas(prev => prev.length > 1 ? prev.filter(a => a.id !== id) : prev);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setApiError('Logo must be JPG, PNG, or WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setApiError('Logo must be under 5MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setApiError('All photos must be JPG, PNG, or WebP');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setApiError('Each photo must be under 5MB');
        return;
      }
      if (photoFiles.length + newFiles.length >= 10) {
        setApiError('Maximum 10 work photos allowed');
        return;
      }
      newFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreviews(prev => {
          const updated = [...prev, reader.result as string];
          return updated.slice(0, 10);
        });
      };
      reader.readAsDataURL(file);
    }

    setPhotoFiles(prev => [...prev, ...newFiles].slice(0, 10));
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!user) {
      setAuthBanner(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('business_name', businessName.trim());
      formData.append('owner_name', ownerName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      if (website.trim()) formData.append('website', website.trim());
      if (facebook.trim()) formData.append('facebook', facebook.trim());
      if (instagram.trim()) formData.append('instagram', instagram.trim());
      if (yearsInBusiness) formData.append('years_in_business', yearsInBusiness);
      formData.append('description', description.trim());
      formData.append('service_categories', JSON.stringify(selectedCategories));
      formData.append('service_areas', JSON.stringify(
        areas.filter(a => a.city.trim()).map(a => ({
          city: a.city.trim(),
          state: a.state || 'NC',
          zip_code: a.zip_code?.trim() || undefined,
        }))
      ));
      formData.append('terms_agreed', 'true');

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      for (const photo of photoFiles) {
        formData.append('photos', photo);
      }

      const token = getAuthToken();
      const res = await fetch('/api/providers/apply', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setAuthBanner(true);
          return;
        }
        setApiError(data.error || 'Failed to submit application');
        return;
      }

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setApiError(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-brand-black mb-3">Application Submitted!</h1>
          <p className="text-brand-gray-dark text-lg mb-6">
            Thank you! We'll review your application and get back to you within 1-2 business days.
          </p>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const hasExistingApp = apiError === 'You have already submitted a provider application.';

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="bg-brand-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            List Your Business on Made<span className="text-brand-red-light">Way</span>Homes
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join our network of trusted local service providers in Caldwell County.
          </p>
        </div>
      </div>

      {/* ── Auth Banner ─────────────────────────────────────────── */}
      {(!isLoggedIn || authBanner) && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-4xl mx-auto px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.364z" />
              </svg>
              <span className="text-yellow-800 font-medium">
                Create an account or log in to apply
              </span>
              <Link to="/login" className="btn-primary text-sm px-4 py-1.5">
                Log In
              </Link>
              <Link to="/register" className="btn-secondary text-sm px-4 py-1.5">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── API Error Banner ────────────────────────────────────── */}
      {apiError && !authBanner && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 py-3 text-center">
            <p className="text-red-700">{apiError}</p>
            {hasExistingApp && (
              <button
                onClick={() => setApiError(null)}
                className="text-sm text-red-600 underline mt-1"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Form ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* ── Section 1: Business Information ───────────────────── */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-black mb-1">Business Information</h2>
              <p className="text-brand-gray-dark text-sm mb-6">Tell us about your business.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Business Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.businessName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    value={businessName}
                    onChange={e => { setBusinessName(e.target.value); setErrors(p => ({ ...p, businessName: '' })); }}
                    placeholder="Your business name"
                    disabled={!isLoggedIn}
                  />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Owner / Contact Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="Your name"
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Phone Number <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`input-field ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="(828) 555-0123"
                    disabled={!isLoggedIn}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Email Address <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="email"
                    className={`input-field ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    placeholder="you@business.com"
                    disabled={!isLoggedIn}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Website URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Facebook URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={facebook}
                    onChange={e => setFacebook(e.target.value)}
                    placeholder="facebook.com/yourbusiness"
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Instagram URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="instagram.com/yourbusiness"
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Years in Business</label>
                  <input
                    type="number"
                    className="input-field"
                    value={yearsInBusiness}
                    onChange={e => setYearsInBusiness(e.target.value)}
                    placeholder="5"
                    min="0"
                    disabled={!isLoggedIn}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-brand-black mb-1">
                  Business Description <span className="text-brand-red">*</span>
                </label>
                <textarea
                  className={`input-field min-h-[120px] ${errors.description ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                  placeholder="Describe your business, experience, and what makes you great (minimum 50 characters)..."
                  disabled={!isLoggedIn}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                  <p className="text-xs text-brand-gray-dark ml-auto">{description.length} / 5000</p>
                </div>
              </div>
            </section>

            {/* ── Section 2: Services Offered ───────────────────────── */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-black mb-1">Services Offered</h2>
              <p className="text-brand-gray-dark text-sm mb-6">Select all categories that apply to your business.</p>

              {errors.categories && (
                <p className="text-red-500 text-sm mb-3">{errors.categories}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map(cat => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${selected
                          ? 'border-brand-red bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                        ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="sr-only"
                        disabled={!isLoggedIn}
                      />
                      <span className="text-lg">{cat.icon || '🔧'}</span>
                      <span className="text-sm font-medium text-brand-black">{cat.name}</span>
                      {selected && (
                        <svg className="w-4 h-4 text-brand-red ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  );
                })}
              </div>

              {selectedCategories.length > 0 && (
                <p className="text-sm text-brand-gray-dark mt-3">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                </p>
              )}
            </section>

            {/* ── Section 3: Service Areas ──────────────────────────── */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-black mb-1">Service Areas</h2>
              <p className="text-brand-gray-dark text-sm mb-6">
                Where do you provide services? Add all cities you serve in Caldwell County and surrounding areas.
              </p>

              {errors.areas && (
                <p className="text-red-500 text-sm mb-3">{errors.areas}</p>
              )}

              {/* Quick suggestions */}
              <div className="mb-4">
                <p className="text-xs text-brand-gray-dark mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {CALDWELL_CITIES.map(city => (
                    <button
                      type="button"
                      key={city.city}
                      onClick={() => {
                        if (!areas.some(a => a.city === city.city)) {
                          const emptyIdx = areas.findIndex(a => !a.city.trim());
                          if (emptyIdx >= 0) {
                            handleAreaChange(areas[emptyIdx].id, 'city', city.city);
                            handleAreaChange(areas[emptyIdx].id, 'zip_code', city.zip);
                          } else {
                            setAreas(prev => [...prev, { id: Date.now(), city: city.city, state: 'NC', zip_code: city.zip }]);
                          }
                        }
                      }}
                      disabled={!isLoggedIn}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                        ${areas.some(a => a.city === city.city)
                          ? 'bg-brand-red text-white border-brand-red'
                          : 'border-gray-300 text-brand-gray-dark hover:border-brand-red hover:text-brand-red'
                        }
                        ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {city.city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {areas.map((area, index) => (
                  <div key={area.id} className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-brand-gray-dark mb-1">City <span className="text-brand-red">*</span></label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          value={area.city}
                          onChange={e => handleAreaChange(area.id, 'city', e.target.value)}
                          placeholder="Lenoir"
                          disabled={!isLoggedIn}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-gray-dark mb-1">State</label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          value={area.state}
                          onChange={e => handleAreaChange(area.id, 'state', e.target.value)}
                          placeholder="NC"
                          maxLength={2}
                          disabled={!isLoggedIn}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-brand-gray-dark mb-1">ZIP Code</label>
                          <input
                            type="text"
                            className="input-field text-sm"
                            value={area.zip_code}
                            onChange={e => handleAreaChange(area.id, 'zip_code', e.target.value)}
                            placeholder="28645"
                            disabled={!isLoggedIn}
                          />
                        </div>
                        {areas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArea(area.id)}
                            className="text-red-500 hover:text-red-700 p-1 mb-0.5"
                            title="Remove"
                            disabled={!isLoggedIn}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addArea}
                disabled={!isLoggedIn}
                className="mt-4 text-sm text-brand-red hover:text-brand-red-dark font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Area
              </button>
            </section>

            {/* ── Section 4: Work Photos & Logo ──────────────────────── */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-black mb-1">Work Photos &amp; Logo</h2>
              <p className="text-brand-gray-dark text-sm mb-6">
                Showcase your best work and add your business logo.
              </p>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Business Logo (optional)
                  </label>
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => isLoggedIn && logoInputRef.current?.click()}
                      className={`w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
                        ${logoPreview ? 'border-brand-red' : 'border-gray-300 hover:border-gray-400'}
                        ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center px-2">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-400">Upload logo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-brand-gray-dark">
                        Upload your business logo (optional). JPG, PNG, or WebP up to 5MB.
                      </p>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => { setLogoFile(null); setLogoPreview(null); if (logoInputRef.current) logoInputRef.current.value = ''; }}
                          className="text-sm text-red-500 hover:text-red-700 mt-1"
                          disabled={!isLoggedIn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={!isLoggedIn}
                    />
                  </div>
                </div>

                {/* Work Photos Upload */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Work Photos (optional, up to 10)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 group">
                        <img src={preview} alt={`Work photo ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={!isLoggedIn}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {photoPreviews.length < 10 && (
                      <div
                        onClick={() => isLoggedIn && photoInputRef.current?.click()}
                        className={`w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
                          ${'border-gray-300 hover:border-gray-400'}
                          ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="text-center">
                          <svg className="w-6 h-6 text-gray-400 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs text-gray-400">Add</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-brand-gray-dark mt-2">
                    Upload photos of your work. JPG, PNG, or WebP up to 5MB each. {photoFiles.length} / 10
                  </p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotosChange}
                    className="hidden"
                    multiple
                    disabled={!isLoggedIn}
                  />
                </div>
              </div>
            </section>

            {/* ── Section 5: Terms ───────────────────────────────────── */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-black mb-1">Provider Agreement</h2>
              <p className="text-brand-gray-dark text-sm mb-4">
                Please review and agree to our terms before submitting your application.
              </p>

              <label className={`flex items-start gap-3 cursor-pointer ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={e => { setTermsAgreed(e.target.checked); setErrors(p => ({ ...p, terms: '' })); }}
                  className="mt-1 h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                  disabled={!isLoggedIn}
                />
                <span className="text-sm text-brand-gray-dark">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">
                    Provider Agreement and Terms of Service
                  </a>
                  . I confirm that the information provided is accurate and that I am authorized to represent this business.
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs mt-1 ml-7">{errors.terms}</p>}
            </section>

            {/* ── Submit ─────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-3 pb-8">
              <button
                type="submit"
                disabled={submitting || !isLoggedIn}
                className="btn-primary text-lg px-10 py-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
              {!isLoggedIn && (
                <p className="text-sm text-brand-gray-dark">
                  <Link to="/login" className="text-brand-red hover:underline">Log in</Link>
                  {' '}or{' '}
                  <Link to="/register" className="text-brand-red hover:underline">create an account</Link>
                  {' '}to submit your application.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
