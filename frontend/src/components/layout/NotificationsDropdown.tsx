import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Inbox } from 'lucide-react';
import api from '../../api/client';

interface Notif {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Relative time helper (e.g., "5m ago", "2h ago", "Yesterday")
const rel = (dateStr: string) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// Icon/color per type
const typeColor = (t: string): string => {
  if (t.includes('REGISTRATION_SUBMITTED')) return 'bg-blue-100 text-blue-700';
  if (t.includes('APPROVED')) return 'bg-green-100 text-green-700';
  if (t.includes('REJECTED')) return 'bg-red-100 text-red-700';
  if (t.includes('SUPPORT') || t.includes('TICKET')) return 'bg-amber-100 text-amber-700';
  if (t.includes('PAYMENT') || t.includes('BILL')) return 'bg-purple-100 text-purple-700';
  if (t.includes('DEPARTMENT')) return 'bg-cyan-100 text-cyan-700';
  return 'bg-slate-100 text-slate-600';
};

export default function NotificationsDropdown() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await api.get('/notifications');
      setItems(r.data.data || []);
      setUnreadCount(r.data.unreadCount || 0);
    } catch {/* silent */} finally { setLoading(false); }
  };

  const fetchUnreadOnly = async () => {
    try {
      const r = await api.get('/notifications', { params: { unread: 'true' } });
      setUnreadCount(r.data.unreadCount || 0);
    } catch {/* silent */}
  };

  // Poll unread count every 60 s
  useEffect(() => {
    fetchUnreadOnly();
    const t = setInterval(fetchUnreadOnly, 60000);
    return () => clearInterval(t);
  }, []);

  // Load full list when opening
  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {/* silent */}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {/* silent */}
  };

  const onClickItem = async (n: Notif) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.link) nav(n.link);
  };

  const recent = items.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-slate-100 rounded-full transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-erp-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-slate-200 shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-govt-navy to-slate-800 text-white flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" /> Notifications
              </div>
              <div className="text-[10px] text-slate-200">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : !recent.length ? (
              <div className="p-10 text-center text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1 text-slate-400">
                  You'll see updates here when things happen
                </p>
              </div>
            ) : (
              recent.map((n) => (
                <button
                  key={n._id}
                  onClick={() => onClickItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex items-start gap-3 ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColor(
                      n.type
                    )}`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          n.read ? 'text-slate-600' : 'font-semibold text-slate-800'
                        } truncate`}
                      >
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-govt-navy flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="text-[10px] text-slate-400 mt-1">{rel(n.createdAt)}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Showing {recent.length} of {items.length}
            </span>
            <button
              onClick={() => {
                setOpen(false);
                nav('/notifications');
              }}
              className="text-xs font-medium text-govt-navy hover:underline"
            >
              View all →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
