import { useState } from 'react';
import { apiFetch } from '../lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus('error');
      setStatusMsg('All fields are required.');
      return;
    }
    setStatus('loading');
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(form),
        skipAuth: true,
      });
      setStatus('success');
      setStatusMsg("Thanks! We'll get back to you soon.");
      setForm({ name: '', email: '', subject: 'General', message: '' });
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.data?.error || 'Failed to send. Please try again.');
    }
  };

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">Contact Us</h1>
          <p className="text-white/70 text-lg">
            We'd love to hear from you. Reach out with questions, feedback, or just to say hello.
          </p>
        </div>
      </section>

      {/* ── Contact Form + Info ─────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card p-6 sm:p-8">
                {status === 'success' ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-brand-black mb-2">Message Sent!</h2>
                    <p className="text-brand-gray-dark">{statusMsg}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-brand-black mb-1">Name *</label>
                      <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className="input-field" placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-brand-black mb-1">Email *</label>
                      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-brand-black mb-1">Subject *</label>
                      <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="input-field">
                        <option value="General">General Inquiry</option>
                        <option value="Provider Question">Provider Question</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-brand-black mb-1">Message *</label>
                      <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} className="input-field resize-y" placeholder="How can we help you?" />
                    </div>
                    {status === 'error' && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span> {statusMsg}</p>}
                    <button type="submit" disabled={status === 'loading'} className="btn-primary w-full sm:w-auto inline-flex items-center gap-2">
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-brand-black mb-2">Email Us</h3>
                <p className="text-brand-gray-dark text-sm">
                  <a href="mailto:hello@madewayhomes.com" className="text-brand-red hover:underline font-medium">hello@madewayhomes.com</a>
                </p>
                <p className="text-xs text-brand-gray-dark mt-2">We typically respond within 1-2 business days.</p>
              </div>

              <div className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center mb-4">
                  <span className="text-xl">📍</span>
                </div>
                <h3 className="font-bold text-brand-black mb-2">Service Area</h3>
                <p className="text-brand-gray-dark text-sm">We serve Lenoir and all of Caldwell County, North Carolina.</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell'].map((city) => (
                    <span key={city} className="text-xs bg-brand-gray px-2.5 py-1 rounded-full text-brand-gray-dark">{city}</span>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-brand-black mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/how-it-works" className="text-brand-red hover:underline font-medium">How It Works</a></li>
                  <li><a href="/about" className="text-brand-red hover:underline font-medium">About MadeWayHomes</a></li>
                  <li><a href="/request" className="text-brand-red hover:underline font-medium">Request a Service</a></li>
                  <li><a href="/list-your-business" className="text-brand-red hover:underline font-medium">List Your Business</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
