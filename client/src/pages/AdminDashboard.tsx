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
  approval_status: string;
  user_name: string;
  user_email: string;
  services: { name: string; category_id: number }[];
  areas: { id: number; city: string; state: string; zip_code: string | null }[];
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
  new: 'bg-blue-100 text-blue-800',
  matched: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
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

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this provider?')) return;
    try {
      await apiFetch(`/admin/providers/${id}/approve`, { method: 'POST' });
      showToast('success', 'Provider approved');
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this provider?')) return;
    try {
      await apiFetch(`/admin/providers/${id}/reject`, { method: 'POST' });
      showToast('success', 'Provider rejected');
      fetchAll();
    } catch (err: any) {
      showToast('error', err.data?.error || 'Failed to reject');
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

  const approvedProviders = providers.filter(p => p.approval_status === 'approved');

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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-black mb-6">Admin Dashboard</h1>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-brand-gray-dark hover:text-brand-black hover:border-gray-300'
              }`}
            >
              {t.label}
              {t.key === 'requests' && requests.length > 0 && (
                <span className="ml-1.5 bg-brand-gray text-brand-gray-dark text-xs px-1.5 py-0.5 rounded-full">
                  {requests.length}
                </span>
              )}
              {t.key === 'providers' && pendingProviders.length > 0 && (
                <span className="ml-1.5 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
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
            <StatCard label="Total Requests" value={requests.length} />
            <StatCard label="Total Providers" value={stats.totalProviders} />
            <StatCard label="Pending Providers" value={stats.pendingProviders} highlight />
            <StatCard label="Total Customers" value={stats.totalCustomers} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-black">Recent Requests</h2>
                <button onClick={() => setTab('requests')} className="text-sm text-brand-red hover:text-brand-red-dark font-medium">
                  View all →
                </button>
              </div>
              {requests.length === 0 ? (
                <p className="text-brand-gray-dark text-sm">No requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-brand-gray-dark border-b border-gray-100">
                        <th className="pb-2 font-medium">ID</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">City</th>
                        <th className="pb-2 font-medium">Customer</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 5).map(r => (
                        <tr
                          key={r.id}
                          className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                          onClick={() => { setTab('requests'); setExpandedRequest(r.id); }}
                        >
                          <td className="py-2 pr-2 font-medium text-brand-black">{r.display_id}</td>
                          <td className="py-2 pr-2">{r.category_name}</td>
                          <td className="py-2 pr-2">{r.city}</td>
                          <td className="py-2 pr-2">{r.customer_name}</td>
                          <td className="py-2 pr-2"><StatusBadge status={r.status} /></td>
                          <td className="py-2 text-brand-gray-dark whitespace-nowrap">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Providers */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-black">Pending Providers</h2>
                <button onClick={() => setTab('providers')} className="text-sm text-brand-red hover:text-brand-red-dark font-medium">
                  View all →
                </button>
              </div>
              {pendingProviders.length === 0 ? (
                <p className="text-brand-gray-dark text-sm">No pending providers.</p>
              ) : (
                <div className="space-y-3">
                  {pendingProviders.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-brand-black text-sm">{p.business_name}</p>
                        <p className="text-xs text-brand-gray-dark">{p.user_email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }} className="btn-primary text-xs px-3 py-1.5">
                          Approve
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(p.id); }} className="btn-secondary text-xs px-3 py-1.5">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-black">Recent Activity</h2>
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
              <option value="matched">Matched</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-brand-gray-dark bg-brand-gray border-b border-gray-200">
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
                          className="px-4 py-3 font-medium cursor-pointer hover:text-brand-black whitespace-nowrap"
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
                        <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => handleExpandRequest(r.id)}>
                          <td className="px-4 py-3 font-medium text-brand-black">{r.display_id}</td>
                          <td className="px-4 py-3">{r.category_name}</td>
                          <td className="px-4 py-3">{r.city}</td>
                          <td className="px-4 py-3">{r.customer_name}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(r.created_at)}</td>
                        </tr>
                        {/* Expanded details */}
                        {expandedRequest === r.id && (
                          <tr key={`exp-${r.id}`}>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                              <RequestDetails
                                request={r}
                                onUpdateStatus={(status) => handleUpdateRequest(r.id, { status })}
                                onMatch={() => handleMatchRequest(r.id)}
                                matchProviderId={matchProviderId}
                                setMatchProviderId={setMatchProviderId}
                                approvedProviders={approvedProviders}
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-brand-gray-dark bg-brand-gray border-b border-gray-200">
                      {[
                        { key: 'business_name', label: 'Business Name' },
                        { key: 'user_name', label: 'Contact' },
                        { key: 'user_email', label: 'Email' },
                        { key: 'approval_status', label: 'Status' },
                        { key: 'created_at', label: 'Date' },
                      ].map(col => (
                        <th
                          key={col.key}
                          className="px-4 py-3 font-medium cursor-pointer hover:text-brand-black whitespace-nowrap"
                          onClick={() => sortBy(col.key, filteredProviders, provSort, setProvSort)}
                        >
                          {col.label} {provSort.key === col.key ? (provSort.dir === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.map(p => (
                      <Fragment key={p.id}>
                        <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedProvider(expandedProvider === p.id ? null : p.id)}>
                          <td className="px-4 py-3 font-medium text-brand-black">{p.business_name}</td>
                          <td className="px-4 py-3">{p.user_name}</td>
                          <td className="px-4 py-3 text-brand-gray-dark">{p.user_email}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.approval_status} /></td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(p.created_at)}</td>
                          <td className="px-4 py-3">
                            {p.approval_status === 'pending' && (
                              <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }} className="btn-primary text-xs px-2 py-1">
                                  Approve
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleReject(p.id); }} className="btn-secondary text-xs px-2 py-1">
                                  Reject
                                </button>
                              </div>
                            )}
                            {p.approval_status === 'approved' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditProvider(p); }}
                                className="text-brand-red hover:text-brand-red-dark text-xs font-medium"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedProvider === p.id && (
                          <tr key={`exp-p-${p.id}`}>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-brand-gray-dark bg-brand-gray border-b border-gray-200">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Message</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <Fragment key={m.id}>
                        <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedMessage(expandedMessage === m.id ? null : m.id)}>
                          <td className="px-4 py-3 font-medium text-brand-black">{m.name}</td>
                          <td className="px-4 py-3 text-brand-gray-dark">{m.email}</td>
                          <td className="px-4 py-3">{m.subject}</td>
                          <td className="px-4 py-3 text-brand-gray-dark max-w-xs truncate">{m.message}</td>
                          <td className="px-4 py-3 text-brand-gray-dark whitespace-nowrap">{formatDate(m.created_at)}</td>
                        </tr>
                        {expandedMessage === m.id && (
                          <tr key={`exp-m-${m.id}`}>
                            <td colSpan={5} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
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
  );
}

// ── Sub-Components ────────────────────────────────────────────────────

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${highlight ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
      <p className="text-sm text-brand-gray-dark">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-yellow-700' : 'text-brand-black'}`}>{value}</p>
    </div>
  );
}

function RequestDetails({
  request,
  onUpdateStatus,
  onMatch,
  matchProviderId,
  setMatchProviderId,
  approvedProviders,
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
  approvedProviders: Provider[];
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
              <option value="matched">Matched</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
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
              {approvedProviders.map(p => (
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
      <div>
        <p className="text-xs font-medium text-brand-gray-dark uppercase">Service Areas</p>
        <p className="text-brand-black">
          {provider.areas.length > 0 ? provider.areas.map(a => `${a.city}, ${a.state}`).join('; ') : 'None listed'}
        </p>
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
