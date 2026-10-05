import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Bell, BellOff, CalendarPlus, CalendarCheck, CalendarX, CalendarClock, CheckCircle,
  MessageCircle, FileText, UserPlus, ShieldCheck, X, CheckCheck, Loader,
} from "lucide-react";

const POLL_MS = 20000;
const BASE_TITLE = "HealthConnect";

// Icône et couleur selon le type de notification
const KIND_STYLE = {
  appointment_new:       { icon: CalendarPlus,  color: "bg-blue-100 text-blue-600" },
  appointment_accepted:  { icon: CalendarCheck, color: "bg-green-100 text-green-600" },
  appointment_rejected:  { icon: CalendarX,     color: "bg-red-100 text-red-600" },
  appointment_cancelled: { icon: CalendarX,     color: "bg-orange-100 text-orange-600" },
  appointment_completed: { icon: CheckCircle,   color: "bg-teal-100 text-teal-600" },
  appointment_updated:   { icon: CalendarClock, color: "bg-amber-100 text-amber-600" },
  message:               { icon: MessageCircle, color: "bg-purple-100 text-purple-600" },
  prescription_new:      { icon: FileText,      color: "bg-teal-100 text-teal-600" },
  user_registered:       { icon: UserPlus,      color: "bg-blue-100 text-blue-600" },
  account_updated:       { icon: ShieldCheck,   color: "bg-gray-100 text-gray-600" },
};
const styleFor = (kind) => KIND_STYLE[kind] || { icon: Bell, color: "bg-gray-100 text-gray-600" };

// "à l'instant", "il y a 5 min", "il y a 3 h", "hier", "12 sept."
export const timeAgo = (dt) => {
  const seconds = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 172800) return "hier";
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)} jours`;
  return new Date(dt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const NotificationIcon = ({ kind, size = "md" }) => {
  const { icon: Icon, color } = styleFor(kind);
  const box = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <div className={`${box} ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
      <Icon size={size === "sm" ? 16 : 18} />
    </div>
  );
};

/**
 * Cloche de notifications : liste déroulante + toasts pour les nouvelles notifications.
 * align : "right" (menu aligné à droite du bouton) ou "left"
 */
const NotificationBell = ({ align = "right" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const knownIdsRef = useRef(null); // null tant que le premier chargement n'est pas fait
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      const list = res.data.notifications || [];
      setNotifications(list);
      setUnreadCount(res.data.unread_count || 0);

      // Toasts uniquement pour les notifications arrivées depuis le dernier chargement
      // (une notification de message regroupée change de date : on suit aussi created_at)
      const keys = list.map((n) => `${n.id}|${n.created_at}`);
      if (knownIdsRef.current) {
        const fresh = list.filter((n) => !n.read_at && !knownIdsRef.current.has(`${n.id}|${n.created_at}`));
        if (fresh.length) {
          setToasts((prev) => [...fresh.slice(0, 3).map((n) => ({ ...n, toastId: `${n.id}-${n.created_at}` })), ...prev].slice(0, 3));
        }
      }
      knownIdsRef.current = new Set(keys);
    } catch (err) {
      console.error("Erreur chargement notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Chargement + rafraîchissement automatique (en pause si l'onglet est masqué) ── */
  useEffect(() => {
    load();
    const timer = setInterval(() => !document.hidden && load(), POLL_MS);
    const onVisible = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  /* ── Nombre de non lues dans le titre de l'onglet ── */
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) ${BASE_TITLE}` : BASE_TITLE;
    return () => { document.title = BASE_TITLE; };
  }, [unreadCount]);

  /* ── Fermer le menu au clic extérieur ou avec Échap ── */
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => panelRef.current && !panelRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ── Fermeture automatique des toasts ── */
  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(0, -1)), 6000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const markAsRead = async (notification) => {
    if (notification.read_at) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.post(`/notifications/${notification.id}/read`);
    } catch {
      load();
    }
  };

  const openNotification = (notification) => {
    markAsRead(notification);
    setOpen(false);
    setToasts((prev) => prev.filter((t) => t.id !== notification.id));
    if (notification.link) navigate(notification.link);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await api.post("/notifications/read-all");
    } catch {
      load();
    }
  };

  const remove = async (e, notification) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    if (!notification.read_at) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.delete(`/notifications/${notification.id}`);
    } catch {
      load();
    }
  };

  return (
    <>
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => { setOpen(!open); if (!open) load(); }}
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lues)` : ""}`}
          aria-expanded={open}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition ${
            open ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className={`absolute ${align === "left" ? "left-0" : "right-0"} mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 px-2 py-1 rounded-lg hover:bg-teal-50"
                >
                  <CheckCheck size={14} /> Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin text-teal-600" size={22} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <BellOff size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">Aucune notification</p>
                  <p className="text-xs text-gray-400 mt-1">Vous serez prévenu ici de vos rendez-vous, messages et ordonnances.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openNotification(n)}
                    onKeyDown={(e) => e.key === "Enter" && openNotification(n)}
                    className={`group relative flex gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition ${
                      n.read_at ? "hover:bg-gray-50" : "bg-teal-50/50 hover:bg-teal-50"
                    }`}
                  >
                    <NotificationIcon kind={n.kind} />
                    <div className="flex-1 min-w-0 pr-5">
                      <p className={`text-sm ${n.read_at ? "text-gray-700" : "font-semibold text-gray-900"}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className={`text-[11px] mt-1 ${n.read_at ? "text-gray-400" : "text-teal-600 font-medium"}`}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read_at && <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-teal-500 group-hover:hidden" />}
                    <button
                      onClick={(e) => remove(e, n)}
                      aria-label="Supprimer la notification"
                      className="absolute right-2.5 top-2.5 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* TOASTS */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.toastId}
            role="status"
            onClick={() => openNotification(t)}
            className="pointer-events-auto cursor-pointer flex gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 pr-8 relative animate-fade-up"
          >
            <NotificationIcon kind={t.kind} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{t.body}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId)); }}
              aria-label="Fermer"
              className="absolute right-2 top-2 p-1 rounded-md text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationBell;
