import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  MessageCircle, Send, Search, Plus, X, ArrowLeft, Check, CheckCheck,
  AlertCircle, RotateCcw, Stethoscope, Users, MapPin, Loader, Paperclip, Upload,
} from "lucide-react";
import Attachment, { FileIcon, formatFileSize } from "./Attachment";

/* ─── Réglages ─────────────────────────────────────────────── */
const POLL_THREAD_MS = 5000;   // rafraîchissement de la conversation ouverte
const POLL_LIST_MS = 10000;    // rafraîchissement de la liste des conversations
const MAX_LENGTH = 2000;

// Fichiers joints : mêmes règles que l'API (10 Mo max)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

const checkFile = (file) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return "Type de fichier non autorisé (images, PDF, Word, Excel, PowerPoint, texte).";
  if (file.size > MAX_FILE_SIZE) return "Le fichier ne doit pas dépasser 10 Mo.";
  return null;
};

/* ─── Helpers ──────────────────────────────────────────────── */
const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];
const colorFor = (name = "") => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const displayName = (contact) =>
  contact ? (contact.role === "doctor" ? `Dr. ${contact.name}` : contact.name) : "";

const subtitleFor = (contact) =>
  contact?.role === "doctor" ? contact.specialty || "Médecin" : "Patient";

const normalize = (text = "") =>
  text.toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const isSameDay = (a, b) => a.toDateString() === b.toDateString();

const formatTime = (dt) =>
  new Date(dt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

// Heure si aujourd'hui, "Hier", sinon date courte
const formatListDate = (dt) => {
  const d = new Date(dt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return formatTime(dt);
  if (isSameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const formatDaySeparator = (dt) => {
  const d = new Date(dt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return "Aujourd'hui";
  if (isSameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

/* ─── Avatar ───────────────────────────────────────────────── */
const Avatar = ({ contact, size = "md" }) => {
  const sizeClass = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-12 h-12 text-base" }[size];
  if (contact?.avatar) {
    return <img src={contact.avatar} alt={contact.name} className={`${sizeClass} rounded-full object-cover flex-shrink-0 bg-gray-100`} />;
  }
  return (
    <div className={`${sizeClass} ${colorFor(contact?.name)} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {getInitials(contact?.name)}
    </div>
  );
};

/* ─── Composant principal ──────────────────────────────────── */
const Messenger = ({ role }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");

  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState(null);
  const [contactSearch, setContactSearch] = useState("");

  const activeIdRef = useRef(null);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const contactLabel = role === "doctor" ? "patient" : "médecin";

  /* ── Liste des conversations ── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement conversations", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  /* ── Fil d'une conversation (marque les messages reçus comme lus côté API) ── */
  const loadThread = useCallback(async (contactId) => {
    try {
      const res = await api.get(`/messages/${contactId}`);
      if (activeIdRef.current !== contactId) return; // l'utilisateur a changé de conversation entre-temps
      setActiveUser(res.data.user);
      // On garde les messages locaux en cours d'envoi ou en échec
      setMessages((prev) => [...res.data.messages, ...prev.filter((m) => m.status)]);
      setConversations((prev) =>
        prev.map((c) => (c.user.id === contactId ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error("Erreur chargement messages", err);
    } finally {
      if (activeIdRef.current === contactId) setLoadingThread(false);
    }
  }, []);

  const openConversation = useCallback((contact) => {
    activeIdRef.current = contact.id;
    nearBottomRef.current = true;
    setActiveUser(contact);
    setMessages([]);
    setDraft("");
    setPendingFile(null);
    setFileError("");
    setLoadingThread(true);
    loadThread(contact.id);
    setSearchParams({ user: contact.id }, { replace: true });
  }, [loadThread, setSearchParams]);

  const closeConversation = () => {
    activeIdRef.current = null;
    setActiveUser(null);
    setMessages([]);
    setSearchParams({}, { replace: true });
  };

  /* ── Chargement initial + conversation demandée dans l'URL (?user=, ?patient_id=, ?doctor=) ── */
  useEffect(() => {
    loadConversations();
    const requestedId = parseInt(
      searchParams.get("user") || searchParams.get("patient_id") || searchParams.get("doctor")
    );
    if (requestedId) openConversation({ id: requestedId, name: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Rafraîchissement automatique (en pause si l'onglet est masqué) ── */
  useEffect(() => {
    const listTimer = setInterval(() => {
      if (!document.hidden) loadConversations();
    }, POLL_LIST_MS);
    const threadTimer = setInterval(() => {
      if (!document.hidden && activeIdRef.current) loadThread(activeIdRef.current);
    }, POLL_THREAD_MS);
    return () => {
      clearInterval(listTimer);
      clearInterval(threadTimer);
    };
  }, [loadConversations, loadThread]);

  /* ── Défilement : on reste en bas si l'utilisateur y était déjà ── */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  /* ── Zone de saisie qui s'agrandit avec le texte ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  /* ── Choix d'un fichier (bouton trombone, glisser-déposer ou coller) ── */
  const selectFile = (file) => {
    if (!file) return;
    const error = checkFile(file);
    setFileError(error || "");
    setPendingFile(error ? null : file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handlePaste = (e) => {
    const file = e.clipboardData?.files?.[0];
    if (file) {
      e.preventDefault();
      selectFile(file);
    }
  };

  /* ── Envoi (affichage immédiat, puis confirmation du serveur) ── */
  const deliver = async (tempMessage) => {
    try {
      let res;
      if (tempMessage.file) {
        const form = new FormData();
        form.append("receiver_id", tempMessage.receiver_id);
        if (tempMessage.content) form.append("content", tempMessage.content);
        form.append("file", tempMessage.file);
        res = await api.post("/messages", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (!event.total) return;
            const progress = Math.round((event.loaded * 100) / event.total);
            setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? { ...m, progress } : m)));
          },
        });
      } else {
        res = await api.post("/messages", {
          receiver_id: tempMessage.receiver_id,
          content: tempMessage.content,
        });
      }
      // Remplace le message temporaire ; le rafraîchissement a pu déjà ajouter le vrai message
      setMessages((prev) =>
        prev
          .map((m) => (m.id === tempMessage.id ? res.data.data : m))
          .filter((m, i, list) => list.findIndex((x) => x.id === m.id) === i)
      );
      loadConversations();
    } catch (err) {
      const data = err.response?.data;
      const error =
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        data?.message ||
        (err.response?.status === 413 ? "Fichier trop volumineux." : "Échec de l'envoi");
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: "failed", error, progress: undefined } : m))
      );
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    const content = draft.trim();
    if ((!content && !pendingFile) || !activeUser) return;

    const tempMessage = {
      id: `tmp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeUser.id,
      content: content || null,
      read_at: null,
      created_at: new Date().toISOString(),
      status: "sending",
      file: pendingFile || undefined,
      attachment: pendingFile
        ? { name: pendingFile.name, mime: pendingFile.type, size: pendingFile.size, url: null }
        : null,
      localUrl: pendingFile?.type.startsWith("image/") ? URL.createObjectURL(pendingFile) : undefined,
      progress: pendingFile ? 0 : undefined,
    };
    nearBottomRef.current = true;
    setMessages((prev) => [...prev, tempMessage]);
    setDraft("");
    setPendingFile(null);
    setFileError("");
    deliver(tempMessage);
  };

  const retry = (message) => {
    const again = { ...message, status: "sending", error: null, progress: message.file ? 0 : undefined };
    setMessages((prev) => prev.map((m) => (m.id === message.id ? again : m)));
    deliver(again);
  };

  const handleKeyDown = (e) => {
    // Entrée = envoyer, Maj + Entrée = retour à la ligne
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Nouveau message : liste des contacts ── */
  const openContacts = async () => {
    setShowContacts(true);
    setContactSearch("");
    if (contacts) return;
    try {
      const res = await api.get("/messages/contacts");
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement contacts", err);
      setContacts([]);
    }
  };

  const pickContact = (contact) => {
    setShowContacts(false);
    openConversation(contact);
  };

  /* ── Données dérivées ── */
  const filteredConversations = useMemo(() => {
    const term = normalize(search);
    return conversations.filter((c) => !term || normalize(c.user?.name).includes(term));
  }, [conversations, search]);

  const filteredContacts = useMemo(() => {
    const term = normalize(contactSearch);
    return (contacts || []).filter((c) =>
      !term || [c.name, c.specialty, c.locality, c.region].some((v) => normalize(v).includes(term))
    );
  }, [contacts, contactSearch]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Dernier message envoyé par moi : c'est lui qui porte l'indicateur "Lu"
  const lastMineId = [...messages].reverse().find((m) => m.sender_id === user?.id && !m.status)?.id;

  /* ─── Rendu ──────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)]">

      {/* EN-TÊTE */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="text-teal-600" /> Messagerie
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {role === "doctor" ? "Échangez avec vos patients" : "Échangez avec vos médecins"}
            {totalUnread > 0 && (
              <span className="ml-2 text-teal-700 font-medium">
                · {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openContacts}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition shadow-md shadow-teal-600/20"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nouveau message</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">

        {/* ── LISTE DES CONVERSATIONS ── */}
        <aside className={`${activeUser ? "hidden md:flex" : "flex"} w-full md:w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin text-teal-600" size={24} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-14 px-6">
                <Users size={34} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  {search ? "Aucune conversation trouvée" : "Aucune conversation pour le moment"}
                </p>
                {!search && (
                  <button onClick={openContacts} className="mt-3 text-sm text-teal-600 font-medium hover:underline">
                    Écrire à un {contactLabel}
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeUser?.id === conv.user.id;
                const unread = conv.unread_count > 0;
                const fromMe = conv.last_message?.sender_id === user?.id;
                return (
                  <button
                    key={conv.user.id}
                    onClick={() => openConversation(conv.user)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-l-4 transition ${
                      isActive ? "bg-teal-50 border-l-teal-600" : "border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    <Avatar contact={conv.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                          {displayName(conv.user)}
                        </p>
                        <span className={`text-[11px] flex-shrink-0 ${unread ? "text-teal-600 font-semibold" : "text-gray-400"}`}>
                          {conv.last_message && formatListDate(conv.last_message.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-xs truncate ${unread ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                          {fromMe && "Vous : "}
                          {conv.last_message?.content || (conv.last_message?.attachment && (
                            <span className="inline-flex items-center gap-1 align-middle">
                              <Paperclip size={11} /> {conv.last_message.attachment.name}
                            </span>
                          ))}
                        </p>
                        {unread && (
                          <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-teal-600 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── CONVERSATION ── */}
        <section className={`${activeUser ? "flex" : "hidden md:flex"} flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden`}>
          {activeUser ? (
            <>
              {/* En-tête */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={closeConversation}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Retour aux conversations"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar contact={activeUser} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{displayName(activeUser) || "…"}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {activeUser.role === "doctor" ? <Stethoscope size={12} /> : <Users size={12} />}
                    {subtitleFor(activeUser)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
                onDrop={handleDrop}
                className="relative flex-1 overflow-y-auto px-4 py-5 bg-gray-50/70"
              >
                {dragging && (
                  <div className="absolute inset-2 z-10 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/90 flex flex-col items-center justify-center text-teal-700 pointer-events-none">
                    <Upload size={32} />
                    <p className="mt-2 text-sm font-medium">Déposez le fichier pour l'envoyer</p>
                    <p className="text-xs text-teal-600">Images, PDF, Word, Excel… 10 Mo max</p>
                  </div>
                )}
                {loadingThread && messages.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader className="animate-spin text-teal-600" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                      <MessageCircle size={28} className="text-teal-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Démarrez la conversation</p>
                    <p className="text-xs mt-1">Votre message sera visible par {displayName(activeUser)}.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg, index) => {
                      const isMe = msg.sender_id === user?.id;
                      const prev = messages[index - 1];
                      const next = messages[index + 1];
                      const newDay = !prev || !isSameDay(new Date(prev.created_at), new Date(msg.created_at));
                      const groupedWithNext = next && next.sender_id === msg.sender_id &&
                        isSameDay(new Date(next.created_at), new Date(msg.created_at));
                      return (
                        <React.Fragment key={msg.id}>
                          {newDay && (
                            <div className="flex justify-center py-3">
                              <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-100 shadow-sm px-3 py-1 rounded-full first-letter:uppercase">
                                {formatDaySeparator(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${groupedWithNext ? "" : "mb-2"}`}>
                            {!isMe && (
                              <div className="w-8 flex-shrink-0">
                                {!groupedWithNext && <Avatar contact={activeUser} size="sm" />}
                              </div>
                            )}
                            <div className={`max-w-[80%] md:max-w-[65%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                              isMe
                                ? `bg-teal-600 text-white ${groupedWithNext ? "" : "rounded-br-md"} ${msg.status === "failed" ? "opacity-70" : ""}`
                                : `bg-white text-gray-800 border border-gray-100 ${groupedWithNext ? "" : "rounded-bl-md"}`
                            }`}>
                              {msg.attachment && (
                                <Attachment attachment={msg.attachment} localUrl={msg.localUrl} isMe={isMe} />
                              )}
                              {msg.content && (
                                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                              )}
                              {msg.status === "sending" && msg.progress !== undefined && (
                                <div className="mt-1.5 h-1 rounded-full bg-white/30 overflow-hidden">
                                  <div className="h-full bg-white transition-all" style={{ width: `${msg.progress}%` }} />
                                </div>
                              )}
                              <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-teal-100" : "text-gray-400"}`}>
                                <span>{formatTime(msg.created_at)}</span>
                                {isMe && msg.status === "sending" && <Loader size={11} className="animate-spin" />}
                                {isMe && !msg.status && (msg.read_at
                                  ? <CheckCheck size={13} className="text-white" />
                                  : <Check size={13} />)}
                              </div>
                            </div>
                          </div>
                          {isMe && msg.id === lastMineId && msg.read_at && !groupedWithNext && (
                            <p className="text-right text-[10px] text-gray-400 -mt-1 mb-2 pr-1">Lu</p>
                          )}
                          {msg.status === "failed" && (
                            <div className="flex justify-end items-center gap-2 text-xs text-red-600 -mt-1 mb-2">
                              <AlertCircle size={13} /> {msg.error}
                              <button onClick={() => retry(msg)} className="inline-flex items-center gap-1 font-medium hover:underline">
                                <RotateCcw size={12} /> Réessayer
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Saisie */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 bg-white">
                {fileError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 mb-2 px-1">
                    <AlertCircle size={13} /> {fileError}
                  </p>
                )}
                {pendingFile && (
                  <div className="flex items-center gap-3 mb-2 p-2 pr-3 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="w-9 h-9 rounded-lg bg-white text-teal-600 flex items-center justify-center flex-shrink-0">
                      <FileIcon mime={pendingFile.type} name={pendingFile.name} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
                      <p className="text-[11px] text-gray-500">{formatFileSize(pendingFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingFile(null)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white"
                      aria-label="Retirer le fichier"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={(e) => { selectFile(e.target.files?.[0]); e.target.value = ""; }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Joindre un fichier"
                    title="Joindre un fichier (10 Mo max)"
                    className="w-11 h-11 rounded-full text-gray-500 hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center transition flex-shrink-0"
                  >
                    <Paperclip size={20} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={draft}
                    maxLength={MAX_LENGTH}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={pendingFile ? "Ajouter un message (facultatif)..." : "Écrivez votre message..."}
                    className="flex-1 resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 max-h-36"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() && !pendingFile}
                    aria-label="Envoyer"
                    className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex justify-between mt-1.5 px-2 text-[11px] text-gray-400">
                  <span className="hidden sm:inline">Entrée pour envoyer · Maj + Entrée pour aller à la ligne · Glissez un fichier pour le joindre</span>
                  {draft.length > MAX_LENGTH - 200 && <span className="ml-auto">{draft.length}/{MAX_LENGTH}</span>}
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <MessageCircle size={36} className="text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Vos messages</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Sélectionnez une conversation à gauche ou écrivez à un {contactLabel}.
              </p>
              <button
                onClick={openContacts}
                className="mt-5 flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
              >
                <Plus size={16} /> Nouveau message
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── MODAL : NOUVEAU MESSAGE ── */}
      {showContacts && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowContacts(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                {role === "doctor" ? <Users size={20} className="text-teal-600" /> : <Stethoscope size={20} className="text-teal-600" />}
                Écrire à un {contactLabel}
              </h2>
              <button onClick={() => setShowContacts(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={role === "doctor" ? "Nom du patient..." : "Nom, spécialité ou ville..."}
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts === null ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin text-teal-600" size={24} />
                </div>
              ) : filteredContacts.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Aucun {contactLabel} trouvé</p>
              ) : (
                filteredContacts.map((contact, index) => {
                  const existing = conversations.some((c) => c.user.id === contact.id);
                  const showSection = role === "doctor" &&
                    (index === 0 || filteredContacts[index - 1].is_my_patient !== contact.is_my_patient);
                  return (
                    <React.Fragment key={contact.id}>
                      {showSection && (
                        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          {contact.is_my_patient ? "Mes patients" : "Autres patients"}
                        </p>
                      )}
                      <button
                        onClick={() => pickContact(contact)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition"
                      >
                        <Avatar contact={contact} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{displayName(contact)}</p>
                          {contact.role === "doctor" ? (
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <span className="text-teal-600">{contact.specialty}</span>
                              {contact.locality && (
                                <>
                                  <span>·</span>
                                  <MapPin size={11} className="shrink-0" />
                                  {contact.locality}
                                </>
                              )}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Patient</p>
                          )}
                        </div>
                        <span className={`text-xs flex-shrink-0 ${existing ? "text-gray-400" : "text-teal-600 font-medium"}`}>
                          {existing ? "Ouvrir" : "Écrire"}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messenger;
