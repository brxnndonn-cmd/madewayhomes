import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch, getAuthToken } from '../lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface FormData {
  category_id: string;
  city: string;
  description: string;
  budget_min: string;
  budget_max: string;
  preferred_date: string;
  contact_preference: 'phone' | 'text' | 'email';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

interface FormErrors {
  [key: string]: string;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error' | 'login_required';

interface SuccessData {
  display_id: string;
  category_name: string;
  email: string;
}

export default function RequestService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    category_id: '',
    city: '',
    description: '',
    budget_min: '',
    budget_max: '',
    preferred_date: '',
    contact_preference: 'email',
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  // ── Pre-fill from user when auth loads ─────────────────────────
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: prev.customer_email || user.email || '',
      }));
    }
  }, [user]);

  // ── Load categories ────────────────────────────────────────────
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiFetch('/categories', { skipAuth: true });
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // ── Input handlers ─────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (submitError) setSubmitError('');
  };

  // ── File handlers ──────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    const invalidFiles = selectedFiles.filter(
      f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Only JPG, PNG, and WebP images are allowed' }));
      return;
    }

    const oversized = selectedFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Each image must be under 5MB' }));
      return;
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next.images;
      return next;
    });

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Validation ─────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category_id) newErrors.category_id = 'Please select a service category';
    if (!formData.city.trim()) newErrors.city = 'City or ZIP code is required';
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide at least 20 characters';
    }
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Your name is required';
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Phone number is required';
    if (!agreed) newErrors.agreed = 'You must agree to the Terms of Service and Privacy Policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // If not logged in, show login prompt
    if (!user) {
      setSubmitState('login_required');
      return;
    }

    setSubmitState('loading');
    setSubmitError('');

    try {
      const body = new FormData();
      body.append('category_id', formData.category_id);
      body.append('city', formData.city.trim());
      body.append('description', formData.description.trim());
      if (formData.zip_code) body.append('zip_code', formData.zip_code.trim());
      if (formData.budget_min) body.append('budget_min', formData.budget_min);
      if (formData.budget_max) body.append('budget_max', formData.budget_max);
      if (formData.preferred_date) body.append('preferred_date', formData.preferred_date);
      body.append('contact_preference', formData.contact_preference);
      body.append('customer_name', formData.customer_name.trim());
      body.append('customer_email', formData.customer_email.trim());
      body.append('customer_phone', formData.customer_phone.trim());

      // Append files
      files.forEach(file => {
        body.append('images', file);
      });

      // Use raw fetch for multipart/form-data (apiFetch forces application/json)
      const fetchHeaders: Record<string, string> = {};
      const token = getAuthToken();
      if (token) {
        fetchHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: fetchHeaders,
        body,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        const error: any = new Error(data.error || 'Failed to submit request');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      setSuccessData({
        display_id: data.request.display_id,
        category_name: data.request.category_name,
        email: formData.customer_email,
      });
      setSubmitState('success');
    } catch (err: any) {
      if (err.status === 401) {
        setSubmitState('login_required');
      } else {
        setSubmitError(err.data?.error || err.message || 'Failed to submit request. Please try again.');
        setSubmitState('error');
      }
      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Reset form ─────────────────────────────────────────────────
  const handleReset = () => {
    setFormData({
      category_id: '',
      city: '',
      description: '',
      budget_min: '',
      budget_max: '',
      preferred_date: '',
      contact_preference: 'email',
      customer_name: user?.name || '',
      customer_email: user?.email || '',
      customer_phone: '',
    });
    setFiles([]);
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    setFilePreviews([]);
    setAgreed(false);
    setErrors({});
    setSubmitState('idle');
    setSubmitError('');
    setSuccessData(null);
  };

  // ── Get today's date for min on date input ─────────────────────
  const today = new Date().toISOString().split('T')[0];

  // ── Success Screen ─────────────────────────────────────────────
  if (submitState === 'success' && successData) {
    return (
      <div className="min-h-[80vh] bg-brand-gray flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-brand-black mb-2">Request Submitted!</h2>
          <p className="text-brand-gray-dark mb-6">
            Your request ID is{' '}
            <span className="font-mono font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded">
              {successData.display_id}
            </span>
          </p>

          <p className="text-brand-gray-dark mb-8 leading-relaxed">
            We'll review your request and match you with local <strong>{successData.category_name}</strong> providers.
            You'll receive a confirmation at <strong>{successData.email}</strong>.
          </p>

          {/* What happens next */}
          <div className="bg-brand-gray rounded-xl p-5 mb-8 text-left">
            <h3 className="font-semibold text-brand-black mb-3 text-sm uppercase tracking-wider">What happens next?</h3>
            <ol className="space-y-3 text-sm text-brand-gray-dark">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-red text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>We review your request and match it with qualified local providers.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-red text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Matched providers will reach out to you directly to discuss your project.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-red text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>You choose the provider that's right for you — there's no obligation.</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleReset} className="btn-secondary">
              Submit Another Request
            </button>
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Screen ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-gray py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-black mb-3">
            Request a Service
          </h1>
          <p className="text-brand-gray-dark text-lg">
            Tell us what you need and we'll connect you with local providers.
          </p>
        </div>

        {/* ── Login Prompt (if not authenticated) ──────────────── */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-800 text-sm mb-2">
              <strong>Please log in or create an account</strong> to submit your request.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="btn-primary text-sm px-4 py-1.5" state={{ from: '/request' }}>
                Log In
              </Link>
              <Link to="/register" className="btn-secondary text-sm px-4 py-1.5" state={{ from: '/request' }}>
                Create Account
              </Link>
            </div>
            <p className="text-amber-700 text-xs mt-3">
              You can fill out the form below — your progress won't be lost after logging in.
            </p>
          </div>
        )}

        {/* ── Login Required Banner (shown on submit) ──────────── */}
        {submitState === 'login_required' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 21a9 9 0 019.364-7.364z" />
              </svg>
              <div>
                <p className="text-amber-800 font-medium text-sm">Account required to submit</p>
                <p className="text-amber-700 text-sm mt-1">
                  Please{' '}
                  <Link to="/login" className="text-brand-red font-medium underline" state={{ from: '/request' }}>
                    log in
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="text-brand-red font-medium underline" state={{ from: '/request' }}>
                    create an account
                  </Link>{' '}
                  to submit your service request. Your form data will be preserved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Error Banner ──────────────────────────────────────── */}
        {submitState === 'error' && submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-medium text-sm">Submission failed</p>
                <p className="text-red-700 text-sm mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Form Card ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* 1. Service Category */}
          <div className="mb-6">
            <label htmlFor="category_id" className={`block text-sm font-semibold mb-2 ${errors.category_id ? 'text-red-600' : 'text-brand-black'}`}>
              Service Category <span className="text-brand-red">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={categoriesLoading}
              className={`input-field ${errors.category_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select a service...'}
              </option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-600 text-xs mt-1.5">{errors.category_id}</p>
            )}
          </div>

          {/* 2. City / ZIP Code */}
          <div className="mb-6">
            <label htmlFor="city" className={`block text-sm font-semibold mb-2 ${errors.city ? 'text-red-600' : 'text-brand-black'}`}>
              City or ZIP Code <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Lenoir, NC or 28645"
              className={`input-field ${errors.city ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.city && (
              <p className="text-red-600 text-xs mt-1.5">{errors.city}</p>
            )}
          </div>

          {/* 3. Job Description */}
          <div className="mb-6">
            <label htmlFor="description" className={`block text-sm font-semibold mb-2 ${errors.description ? 'text-red-600' : 'text-brand-black'}`}>
              Job Description <span className="text-brand-red">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what you need done — include details like room size, materials needed, or any special requirements..."
              className={`input-field resize-y ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-600 text-xs">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${formData.description.length < 20 ? 'text-brand-gray-medium' : 'text-green-600'}`}>
                {formData.description.length}/20 min
              </span>
            </div>
          </div>

          {/* 4. Estimated Budget */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-brand-black">
              Estimated Budget <span className="text-brand-gray-medium font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="budget_min" className="block text-xs text-brand-gray-dark mb-1">Min $</label>
                <input
                  type="number"
                  id="budget_min"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  min={0}
                  step={1}
                  placeholder="50"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="budget_max" className="block text-xs text-brand-gray-dark mb-1">Max $</label>
                <input
                  type="number"
                  id="budget_max"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleChange}
                  min={0}
                  step={1}
                  placeholder="150"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* 5. Preferred Date */}
          <div className="mb-6">
            <label htmlFor="preferred_date" className="block text-sm font-semibold mb-2 text-brand-black">
              Preferred Date <span className="text-brand-gray-medium font-normal">(optional)</span>
            </label>
            <input
              type="date"
              id="preferred_date"
              name="preferred_date"
              value={formData.preferred_date}
              onChange={handleChange}
              min={today}
              className="input-field"
            />
          </div>

          {/* 6. Contact Preference */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-brand-black">
              Contact Preference
            </label>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {[
                { value: 'phone' as const, label: '📞 Phone Call' },
                { value: 'text' as const, label: '💬 Text Message' },
                { value: 'email' as const, label: '📧 Email' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                    formData.contact_preference === opt.value
                      ? 'border-brand-red bg-red-50 text-brand-red'
                      : 'border-gray-200 text-brand-gray-dark hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="contact_preference"
                    value={opt.value}
                    checked={formData.contact_preference === opt.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* 7. Name */}
          <div className="mb-6">
            <label htmlFor="customer_name" className={`block text-sm font-semibold mb-2 ${errors.customer_name ? 'text-red-600' : 'text-brand-black'}`}>
              Your Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className={`input-field ${errors.customer_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.customer_name && (
              <p className="text-red-600 text-xs mt-1.5">{errors.customer_name}</p>
            )}
          </div>

          {/* 8. Email */}
          <div className="mb-6">
            <label htmlFor="customer_email" className={`block text-sm font-semibold mb-2 ${errors.customer_email ? 'text-red-600' : 'text-brand-black'}`}>
              Email Address <span className="text-brand-red">*</span>
            </label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className={`input-field ${errors.customer_email ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.customer_email && (
              <p className="text-red-600 text-xs mt-1.5">{errors.customer_email}</p>
            )}
          </div>

          {/* 9. Phone */}
          <div className="mb-6">
            <label htmlFor="customer_phone" className={`block text-sm font-semibold mb-2 ${errors.customer_phone ? 'text-red-600' : 'text-brand-black'}`}>
              Phone Number <span className="text-brand-red">*</span>
            </label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              placeholder="828-555-0123"
              className={`input-field ${errors.customer_phone ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.customer_phone && (
              <p className="text-red-600 text-xs mt-1.5">{errors.customer_phone}</p>
            )}
          </div>

          {/* 10. Upload Photos */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-brand-black">
              Upload Photos <span className="text-brand-gray-medium font-normal">(optional)</span>
            </label>
            <p className="text-xs text-brand-gray-dark mb-3">Add photos of the job — up to 5 images (JPG, PNG, WebP, max 5MB each)</p>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {filePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {files.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-brand-gray-dark hover:border-brand-red hover:text-brand-red transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Photos
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {errors.images && (
              <p className="text-red-600 text-xs mt-1.5">{errors.images}</p>
            )}
          </div>

          {/* 11. Agreement */}
          <div className="mb-8">
            <label className={`flex items-start gap-3 cursor-pointer ${errors.agreed ? 'text-red-600' : ''}`}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (errors.agreed) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.agreed;
                      return next;
                    });
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <span className="text-sm text-brand-gray-dark">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-brand-red underline hover:text-brand-red-dark">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-brand-red underline hover:text-brand-red-dark">
                  Privacy Policy
                </Link>
                <span className="text-brand-red"> *</span>
              </span>
            </label>
            {errors.agreed && (
              <p className="text-red-600 text-xs mt-1.5 ml-7">{errors.agreed}</p>
            )}
          </div>

          {/* ── Submit Button ──────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
          >
            {submitState === 'loading' ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>

          {/* ── Footer note ────────────────────────────────────── */}
          <p className="text-xs text-brand-gray-medium text-center mt-4">
            By submitting, you agree to be contacted by MadeWayHomes and up to 3 matched providers about your project.
          </p>
        </form>
      </div>
    </div>
  );
}
