import { useState, useEffect, useCallback, Fragment } from 'react';
import { apiFetch } from '../lib/api';

// ── Types ────────────────────────────────────────────────────────────

interface Request {
  id: number;
  display_id: string;
  category_name: string;
  city: string;
  zip_code: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  contact_preference: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
}

interface Provider {
  id: number;
  user_id: number;
  business_name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  approval_status: string;
  is_verified: number;
  licensed: string;
  insured: string;
  license_number: string | null;
  credential_document_path: string | null;
  custom_other_service: string | null;
  user_name: string;
  user_email: string;
  services: { name: string; category_id: number }[];
  areas: { id: number; city: string; state: string; zip_code: string | null }[];
  images: string[];
  created_at: string;
}

interface Note {
  id: number;
  note: string;
  admin_id: number;
  admin_name: string;
  created_at: string;
}

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
}

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface Stats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  pendingProviders: number;
}

// ── Status Badge ─────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  new: 'tag tag-red',
  reviewing: 'tag tag-gold',
  sent_to_provider: 'tag bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'tag bg-purple-100 text-purple-700 border-purple-200',
  completed: 'tag bg-green-100 text-green-700 border-green-200',
  closed: 'tag bg-red-100 text-red-700 border-red-200',
  matched: 'tag tag-gold',
  in_progress: 'tag bg-orange-100 text-orange-700 border-orange-200',
  canceled: 'tag bg-red-100 text-red-700 border-red-200',
  pending_review: 'tag tag-gold',
  published: 'tag bg-green-100 text-green-700 border-green-200',
  rejected: 'tag bg-red-100 text-red-700 border-red-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'tag tag-gray'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'requests' | 'providers' | 'messages'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pendingProviders, setPendingProviders] = useState<Provider[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [reqStatusFilter, setReqStatusFilter] = useState('all');
  const [reqCityFilter, setReqCityFilter] = useState('');
  const [reqSearch, setReqSearch] = useState('');
  const [provStatusFilter, setProvStatusFilter] = useState('all');
  const [provSearch, setProvSearch] = useState('');

  // Expanded rows
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  // Inline editing
  const [editingProvider, setEditingProvider] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ business_name: '', description: '', phone: '' });

  // Request details state
  const [requestNotes, setRequestNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [matchProviderId, setMatchProviderId] = useState<number | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Sorting
  const [reqSort, setReqSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'created_at', dir: 'desc' });
  const [provSort, setProvSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'created_at', dir: 'desc' });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Data Fetching ──────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, reqData, provData, pendData, msgData, notifData] = await Promise.all([
        apiFetch('/admin/dashboard'),
        apiFetch('/admin/requests'),
        apiFetch('/admin/providers'),
        apiFetch('/admin/providers/pending'),
        apiFetch('/admin/contact-messages'),
        apiFetch('/admin/notifications?limit=10'),
      ]);
      setStats(dashData.stats);
      setRequests(reqData.requests || []);
      setProviders(provData.providers || []);
      setPendingProviders(pendData.providers || []);
      setMessages(msgData.messages || []);
      setRecentNotifications(notifData.notifications || []);
    } catch (err: any) {
      setError(err.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleProviderStatus = async (id: number, status: string) => {
    const labels: Record<string, string> = {
      published: 'Approve & Publish',
      rejected: 'Reject',
    };
    if (!confirm(`${labels[status] || status} this provider?`)) return;
    try {
      await apiFetch(`/admin/providers/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      showToast('success', `Provider ${status.replace('_', ' ')}`);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to update provider');
    }
  };

  const handleProviderVerify = async (id: number, verified: boolean) => {
    try {
      await apiFetch(`/admin/providers/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ verified }),
      });
      showToast('success', verified ? 'Provider verified' : 'Verification removed');
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to update verification');
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm('Permanently delete this provider? This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/providers/${id}`, { method: 'DELETE' });
      showToast('success', 'Provider deleted');
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to delete provider');
    }
  };

  const handleUpdateRequest = async (id: number, data: Record<string, any>) => {
    try {
      const res = await apiFetch(`/admin/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...res.request } : r));
      showToast('success', 'Request updated');
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to update');
    }
  };

  const handleMatchRequest = async (requestId: number) => {
    if (!matchProviderId) return;
    try {
      await apiFetch(`/admin/requests/${requestId}/match`, {
        method: 'POST',
        body: JSON.stringify({ provider_id: matchProviderId }),
      });
      showToast('success', 'Request matched');
      setMatchProviderId(null);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to match');
    }
  };

  const handleAddNote = async (requestId: number) => {
    if (!newNote.trim()) return;
    try {
      await apiFetch(`/admin/requests/${requestId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote.trim() }),
      });
      setNewNote('');
      loadNotes(requestId);
      showToast('success', 'Note added');
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to add note');
    }
  };

  const loadNotes = async (requestId: number) => {
    setLoadingNotes(true);
    try {
      const res = await apiFetch(`/admin/requests/${requestId}/notes`);
      setRequestNotes(res.notes || []);
    } catch {
      setRequestNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleExpandRequest = (id: number) => {
    if (expandedRequest === id) {
      setExpandedRequest(null);
      setRequestNotes([]);
      setNewNote('');
      setMatchProviderId(null);
    } else {
      setExpandedRequest(id);
      loadNotes(id);
      setNewNote('');
      setMatchProviderId(null);
    }
  };

  const handleEditProvider = (p: Provider) => {
    setEditingProvider(p.id);
    setEditForm({
      business_name: p.business_name || '',
      description: p.description || '',
      phone: p.phone || '',
    });
  };

  const handleSaveProvider = async (id: number) => {
    try {
      await apiFetch(`/admin/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      showToast('success', 'Provider updated');
      setEditingProvider(null);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to update');
    }
  };

  const handleExport = (type: 'requests' | 'providers') => {
    // Open export URL in new tab to trigger download
    window.open(`/api/admin/export/${type}`, '_blank');
  };

  // ── Sorting ─────────────────────────────────────────────────────────

  const sortBy = (key: string, list: any[], currentSort: { key: string; dir: string }, setSort: any) => {
    const dir = currentSort.key === key && currentSort.dir === 'asc' ? 'desc' : 'asc';
    setSort({ key, dir });
  };

  const sorted = <T extends Record<string, any>>(list: T[], sort: { key: string; dir: string }) => {
    return [...list].sort((a, b) => {
      const va = a[sort.key] ?? '';
      const vb = b[sort.key] ?? '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  };

  // ── Filtering ───────────────────────────────────────────────────────

  const filteredRequests = sorted(
    requests.filter(r => {
      if (reqStatusFilter !== 'all' && r.status !== reqStatusFilter) return false;
      if (reqCityFilter && !r.city.toLowerCase().includes(reqCityFilter.toLowerCase())) return false;
      if (reqSearch) {
        const s = reqSearch.toLowerCase();
        return (
          r.display_id.toLowerCase().includes(s) ||
          r.category_name.toLowerCase().includes(s) ||
          r.customer_name.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s)
        );
      }
      return true;
    }),
    reqSort,
  );

  const filteredProviders = sorted(
    providers.filter(p => {
      if (provStatusFilter !== 'all' && p.approval_status !== provStatusFilter) return false;
      if (provSearch) {
        const s = provSearch.toLowerCase();
        return (
          p.business_name.toLowerCase().includes(s) ||
          p.user_name.toLowerCase().includes(s) ||
          (p.user_email && p.user_email.toLowerCase().includes(s))
        );
      }
      return true;
    }),
    provSort,
  );

  const publishedProviders = providers.filter(p => p.approval_status === 'published');

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchAll} className="btn-primary">Retry</button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'requests' as const, label: 'Requests' },
    { key: 'providers' as const, label: 'Providers' },
    { key: 'messages' as const, label: 'Messages' },
  ];

  return (
    <div>
      {/* ── Admin Header Banner ─────────────────────────────────── */}
      <section className="hero-dark-gradient py-10 sm:py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white text-lg">⚙️</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
              <p className="text-white/50 text-sm">Manage requests, providers, and platform activity</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b-2 border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg -mb-0.5 ${
                tab === t.key
                  ? 'border-brand-red text-brand-red bg-red-50/50'
                  : 'border-transparent text-brand-gray-dark hover:text-brand-black hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t.label}
              {t.key === 'requests' && requests.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-brand-red/10 text-brand-red' : 'bg-gray-100 text-brand-gray-dark'
                }`}>
                  {requests.length}
                </span>
              )}
              {t.key === 'providers' && pendingProviders.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-brand-gray-dark'
                }`}>
                  {pendingProviders.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────── */}
      {tab === 'overview' && stats && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard label="Total Requests" value={requests.length} icon="📋" borderColor="#3B82F6" />
            <StatCard label="Total Providers" value={stats.totalProviders} icon="🏢" borderColor="#10B981" />
            <StatCard label="Pending Providers" value={stats.pendingProviders} icon="⏳" borderColor="#C8963E" />
            <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" borderColor="#9B1B30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-brand-black">Recent Requests</h2>
                <button onClick={() => setTab('requests')} className="text-sm text-brand-red hover:text-brand-red-dark font-semibold transition-colors">
                  View all →
                </button>
              </div>
              {requests.length === 0 ? (
                <p className="text-brand-gray-dark text-sm">No requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-brand-gray border-b-2 border-gray-100">
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">ID</th>
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Category</th>
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">City</th>
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Customer</th>
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Status</th>
                        <th className="pb-2.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 5).map(r => (
                        <tr
                          key={r.id}
                          className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors"
                          onClick={() => { setTab('requests'); setExpandedRequest(r.id); }}
                        >
                          <td className="py-2.5 pr-2 font-semibold text-brand-black">{r.display_id}</td>
                          <td className="py-2.5 pr-2">{r.category_name}</td>
                          <td className="py-2.5 pr-2">{r.city}</td>
                          <td className="py-2.5 pr-2">{r.customer_name}</td>
                          <td className="py-2.5 pr-2"><StatusBadge status={r.status} /></td>
                          <td className="py-2.5 text-brand-gray-dark whitespace-nowrap">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Providers */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-brand-black">Pending Providers</h2>
                <button onClick={() => setTab('providers')} className="text-sm text-brand-red hover:text-brand-red-dark font-semibold transition-colors">
                  View all →
                </button>
              </div>
              {pendingProviders.length === 0 ? (
                <p className="text-brand-gray-dark text-sm">No pending providers.</p>
              ) : (
                <div className="space-y-3">
                  {pendingProviders.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-semibold text-brand-black text-sm">{p.business_name}</p>
                        <p className="text-xs text-brand-gray-dark mt-0.5">{p.user_email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }} className="btn-primary text-xs !px-3 !py-1.5">
                          Approve
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(p.id); }} className="btn-secondary text-xs !px-3 !py-1.5">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="card p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-brand-black">Recent Activity</h2>
              </div>
              {recentNotifications.length === 0 ? (
                <p className="text-brand-gray-dark text-sm">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotifIcon(n.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-black">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-brand-gray-dark mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-brand-gray">{formatDate(n.created_at)}</span>
                          <span className="text-xs text-brand-gray">•</span>
                          <span className="text-xs text-brand-gray">{n.user_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Requests Tab ──────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={reqStatusFilter}
              onChange={e => setReqStatusFilter(e.target.value)}
              className="input-field sm:w-auto text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="sent_to_provider">Sent to Provider</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="matched">Matched</option>
              <option value="in_progress">In Progress</option>
              <option value="canceled">Canceled</option>
            </select>
            <input
              type="text"
              placeholder="Filter by city..."
              value={reqCityFilter}
              onChange={e => setReqCityFilter(e.target.value)}
              className="input-field sm:w-auto text-sm"
            />
            <input
              type="text"
              placeholder="Search..."
              value={reqSearch}
              onChange={e => setReqSearch(e.target.value)}
              className="input-field sm:flex-1 text-sm"
            />
            <button onClick={() => handleExport('requests')} className="btn-secondary text-sm whitespace-nowrap w-full sm:w-auto">
              Export CSV
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-brand-gray-dark">
              <p className="text-lg mb-2">No requests found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-brand-gray border-b-2 border-gray-200">
                      {[
                        { key: 'display_id', label: 'ID' },
                        { key: 'category_name', label: 'Category' },
                        { key: 'city', label: 'City' },
                        { key: 'customer_name', label: 'Customer' },
                        { key: 'status', label: 'Status' },
                        { key: 'created_at', label: 'Date' },
                      ].map(col => (
                        <th
                          key={col.key}
                          className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider cursor-pointer hover:text-brand-black transition-colors whitespace-nowrap"
                          onClick={() => sortBy(col.key, filteredRequests, reqSort, setReqSort)}
                        >
                          {col.label} {reqSort.key === col.key ? (reqSort.dir === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(r => (
                      <Fragment key={r.id}>
                        {/* Summary row */}
                        <tr className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => handleExpandRequest(r.id)}>
                          <td className="px-4 py-3 font-semibold text-brand-black">{r.display_id}</td>
                          <td className="px-4 py-3">{r.category_name}</td>
                          <td className="px-4 py-3">{r.city}</td>
                          <td className="px-4 py-3">{r.customer_name}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(r.created_at)}</td>
                        </tr>
                        {/* Expanded details */}
                        {expandedRequest === r.id && (
                          <tr key={`exp-${r.id}`}>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50/80 border-b border-gray-200">
                              <RequestDetails
                                request={r}
                                onUpdateStatus={(status) => handleUpdateRequest(r.id, { status })}
                                onMatch={() => handleMatchRequest(r.id)}
                                matchProviderId={matchProviderId}
                                setMatchProviderId={setMatchProviderId}
                                publishedProviders={publishedProviders}
                                notes={requestNotes}
                                loadingNotes={loadingNotes}
                                newNote={newNote}
                                setNewNote={setNewNote}
                                onAddNote={() => handleAddNote(r.id)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Providers Tab ─────────────────────────────────────────────── */}
      {tab === 'providers' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={provStatusFilter}
              onChange={e => setProvStatusFilter(e.target.value)}
              className="input-field sm:w-auto text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Search providers..."
              value={provSearch}
              onChange={e => setProvSearch(e.target.value)}
              className="input-field sm:flex-1 text-sm"
            />
            <button onClick={() => handleExport('providers')} className="btn-secondary text-sm whitespace-nowrap w-full sm:w-auto">
              Export CSV
            </button>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="text-center py-12 text-brand-gray-dark">
              <p className="text-lg mb-2">No providers found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-brand-gray border-b-2 border-gray-200">
                      {[
                        { key: 'business_name', label: 'Business Name' },
                        { key: 'user_name', label: 'Contact' },
                        { key: 'user_email', label: 'Email' },
                        { key: 'approval_status', label: 'Status' },
                        { key: 'created_at', label: 'Date' },
                      ].map(col => (
                        <th
                          key={col.key}
                          className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider cursor-pointer hover:text-brand-black transition-colors whitespace-nowrap"
                          onClick={() => sortBy(col.key, filteredProviders, provSort, setProvSort)}
                        >
                          {col.label} {provSort.key === col.key ? (provSort.dir === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.map(p => (
                      <Fragment key={p.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => setExpandedProvider(expandedProvider === p.id ? null : p.id)}>
                          <td className="px-4 py-3 font-semibold text-brand-black">{p.business_name}</td>
                          <td className="px-4 py-3">{p.user_name}</td>
                          <td className="px-4 py-3 text-brand-gray-dark">{p.user_email}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.approval_status} /></td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(p.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {p.approval_status === 'pending_review' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleProviderStatus(p.id, 'published'); }} className="btn-primary text-xs px-2 py-1">
                                    Approve &amp; Publish
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleProviderStatus(p.id, 'rejected'); }} className="btn-secondary text-xs px-2 py-1">
                                    Reject
                                  </button>
                                </>
                              )}
                              {p.approval_status === 'published' && (
                                <button onClick={(e) => { e.stopPropagation(); handleProviderStatus(p.id, 'pending_review'); }} className="btn-secondary text-xs px-2 py-1">
                                  Unpublish
                                </button>
                              )}
                              {p.approval_status === 'rejected' && (
                                <button onClick={(e) => { e.stopPropagation(); handleProviderStatus(p.id, 'pending_review'); }} className="btn-secondary text-xs px-2 py-1">
                                  Re-review
                                </button>
                              )}
                              {p.approval_status === 'published' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleProviderVerify(p.id, !p.is_verified); }}
                                  className={`text-xs px-2 py-1 ${p.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} rounded font-medium`}
                                >
                                  {p.is_verified ? '✓ Verified' : 'Verify'}
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteProvider(p.id); }}
                                className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedProvider === p.id && (
                          <tr key={`exp-p-${p.id}`}>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50/80 border-b border-gray-200">
                              <ProviderDetails
                                provider={p}
                                editing={editingProvider === p.id}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onSave={() => handleSaveProvider(p.id)}
                                onCancel={() => setEditingProvider(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Messages Tab ──────────────────────────────────────────────── */}
      {tab === 'messages' && (
        <div>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-brand-gray-dark">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-brand-gray border-b-2 border-gray-200">
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Message</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-brand-gray-dark uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <Fragment key={m.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => setExpandedMessage(expandedMessage === m.id ? null : m.id)}>
                          <td className="px-4 py-3 font-semibold text-brand-black">{m.name}</td>
                          <td className="px-4 py-3 text-brand-gray-dark">{m.email}</td>
                          <td className="px-4 py-3">{m.subject}</td>
                          <td className="px-4 py-3 text-brand-gray-dark max-w-xs truncate">{m.message}</td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(m.created_at)}</td>
                        </tr>
                        {expandedMessage === m.id && (
                          <tr key={`exp-m-${m.id}`}>
                            <td colSpan={5} className="px-4 py-4 bg-gray-50/80 border-b border-gray-200">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-medium text-brand-gray-dark uppercase">From</p>
                                  <p className="text-brand-black">{m.name} &lt;{m.email}&gt;</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-brand-gray-dark uppercase">Subject</p>
                                  <p className="text-brand-black font-medium">{m.subject}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-brand-gray-dark uppercase">Message</p>
                                  <p className="text-brand-black whitespace-pre-wrap">{m.message}</p>
                                </div>
                                <p className="text-xs text-brand-gray-dark">Received: {formatDateTime(m.created_at)}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

// ── Sub-Components ────────────────────────────────────────────────────

function StatCard({ label, value, icon, borderColor }: { label: string; value: number; icon?: string; borderColor?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200`}
         style={borderColor ? { borderLeftWidth: '4px', borderLeftColor: borderColor } : undefined}>
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-lg">{icon}</div>}
        <p className="text-sm font-medium text-brand-gray-dark">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-brand-black">{value}</p>
    </div>
  );
}

function RequestDetails({
  request,
  onUpdateStatus,
  onMatch,
  matchProviderId,
  setMatchProviderId,
  publishedProviders,
  notes,
  loadingNotes,
  newNote,
  setNewNote,
  onAddNote,
}: {
  request: Request;
  onUpdateStatus: (status: string) => void;
  onMatch: () => void;
  matchProviderId: number | null;
  setMatchProviderId: (id: number | null) => void;
  publishedProviders: Provider[];
  notes: Note[];
  loadingNotes: boolean;
  newNote: string;
  setNewNote: (v: string) => void;
  onAddNote: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Column: Details */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Customer</p>
          <p className="text-brand-black">{request.customer_name}</p>
          <p className="text-sm text-brand-gray-dark">{request.customer_email}</p>
          <p className="text-sm text-brand-gray-dark">{request.customer_phone}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Description</p>
          <p className="text-brand-black">{request.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-brand-gray-dark uppercase">Budget</p>
            <p className="text-brand-black">
              {request.budget_min != null ? `$${request.budget_min}` : '—'}
              {request.budget_max != null ? ` - $${request.budget_max}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-brand-gray-dark uppercase">Preferred Date</p>
            <p className="text-brand-black">{request.preferred_date || 'Not specified'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Contact Preference</p>
          <p className="text-brand-black capitalize">{request.contact_preference}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Created</p>
          <p className="text-brand-gray-dark text-sm">{formatDateTime(request.created_at)}</p>
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="space-y-4">
        {/* Status Update */}
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase mb-1">Update Status</p>
          <div className="flex gap-2">
            <select
              value={request.status}
              onChange={e => onUpdateStatus(e.target.value)}
              className="input-field text-sm w-auto"
            >
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="sent_to_provider">Sent to Provider</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Match to Provider */}
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase mb-1">Match to Provider</p>
          <div className="flex gap-2">
            <select
              value={matchProviderId ?? ''}
              onChange={e => setMatchProviderId(e.target.value ? parseInt(e.target.value) : null)}
              className="input-field text-sm flex-1"
            >
              <option value="">Select provider...</option>
              {publishedProviders.map(p => (
                <option key={p.id} value={p.id}>{p.business_name}</option>
              ))}
            </select>
            <button
              onClick={onMatch}
              disabled={!matchProviderId}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase mb-1">Admin Notes</p>
          {loadingNotes ? (
            <p className="text-sm text-brand-gray-dark">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-brand-gray-dark">No notes yet.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              {notes.map(n => (
                <div key={n.id} className="bg-white rounded border border-gray-100 p-2 text-sm">
                  <p className="text-brand-black">{n.note}</p>
                  <p className="text-xs text-brand-gray-dark mt-1">
                    {n.admin_name} — {formatDateTime(n.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="input-field text-sm flex-1 resize-none"
            />
            <button
              onClick={onAddNote}
              disabled={!newNote.trim()}
              className="btn-primary text-sm self-end disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderDetails({
  provider,
  editing,
  editForm,
  setEditForm,
  onSave,
  onCancel,
}: {
  provider: Provider;
  editing: boolean;
  editForm: { business_name: string; description: string; phone: string };
  setEditForm: (f: { business_name: string; description: string; phone: string }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (editing) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-brand-gray-dark">Business Name</label>
          <input
            value={editForm.business_name}
            onChange={e => setEditForm({ ...editForm, business_name: e.target.value })}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-brand-gray-dark">Description</label>
          <textarea
            value={editForm.description}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            rows={3}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-brand-gray-dark">Phone</label>
          <input
            value={editForm.phone}
            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
            className="input-field text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onSave} className="btn-primary text-sm">Save</button>
          <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Business Name</p>
          <p className="text-brand-black font-semibold">{provider.business_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Status</p>
          <p className="text-brand-black"><StatusBadge status={provider.approval_status} /></p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Verified</p>
          <p className="text-brand-black">{provider.is_verified ? '✅ Yes' : '❌ No'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Licensed</p>
          <p className="text-brand-black capitalize">{provider.licensed?.replace('_', ' ') || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Insured</p>
          <p className="text-brand-black capitalize">{provider.insured || 'Not specified'}</p>
        </div>
        {provider.license_number && (
          <div>
            <p className="text-xs font-medium text-brand-gray-dark uppercase">License Number</p>
            <p className="text-brand-black">{provider.license_number}</p>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-brand-gray-dark uppercase">Description</p>
        <p className="text-brand-black">{provider.description || 'No description'}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Phone</p>
          <p className="text-brand-black">{provider.phone || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Website</p>
          <p className="text-brand-black">{provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">{provider.website}</a> : '—'}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-brand-gray-dark uppercase">Services</p>
        <p className="text-brand-black">
          {provider.services.length > 0 ? provider.services.map(s => s.name).join(', ') : 'None listed'}
        </p>
      </div>
      {provider.custom_other_service && (
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Other Service</p>
          <p className="text-brand-black">{provider.custom_other_service}</p>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-brand-gray-dark uppercase">Service Areas</p>
        <p className="text-brand-black">
          {provider.areas.length > 0 ? provider.areas.map(a => `${a.city}, ${a.state}${a.zip_code ? ' ' + a.zip_code : ''}`).join('; ') : 'None listed'}
        </p>
      </div>
      {/* Credential Document */}
      <div>
        <p className="text-xs font-medium text-brand-gray-dark uppercase">🔒 Credential Document</p>
        {provider.credential_document_path ? (
          <a
            href={provider.credential_document_path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red hover:underline text-sm"
          >
            View uploaded document
          </a>
        ) : (
          <p className="text-brand-gray-dark text-sm">No document uploaded</p>
        )}
      </div>
      {/* Logo */}
      {provider.logo_url && (
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Logo</p>
          <img src={provider.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded-lg border" />
        </div>
      )}
      {/* Work Photos */}
      {provider.images && provider.images.length > 0 && (
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Work Photos ({provider.images.length})</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {provider.images.map((img: string, i: number) => (
              <img key={i} src={img} alt={`Work ${i+1}`} className="w-16 h-16 object-cover rounded border" />
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Contact Name</p>
          <p className="text-brand-black">{provider.user_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-dark uppercase">Contact Email</p>
          <p className="text-brand-black">{provider.user_email}</p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getNotifIcon(type: string): string {
  switch (type) {
    case 'new_request':
    case 'new_lead':
      return '🔔';
    case 'application_submitted':
    case 'new_provider_application':
      return '📋';
    case 'application_approved':
      return '✅';
    case 'application_rejected':
      return '⚠️';
    case 'request_received':
      return '📨';
    default:
      return '💬';
  }
}
