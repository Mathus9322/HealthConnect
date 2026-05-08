import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { MessageCircle, Send, Search, Users, Plus, X, Stethoscope } from "lucide-react";

const PatientMessages = () => {
  const { user } = useAuth();

  const [conversations, setConversations]   = useState([]);
  const [selected, setSelected]             = useState(null);
  const [messages, setMessages]             = useState([]);
  const [newMessage, setNewMessage]         = useState("");
  const [loading, setLoading]               = useState(true);
  const [sending, setSending]               = useState(false);
  const [search, setSearch]                 = useState("");

  // Nouveau message → modal médecins
  const [showNewMsg, setShowNewMsg]         = useState(false);
  const [doctors, setDoctors]               = useState([]);
  const [doctorSearch, setDoctorSearch]     = useState("");
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const bottomRef = useRef(null);

  /* ─────────────────────────────────────── */
  /*  Conversations                          */
  /* ─────────────────────────────────────── */
  const loadConversations = async () => {
    try {
      const res  = await api.get("/conversations");
      const data = Array.isArray(res.data) ? res.data : Object.values(res.data);
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  /* ─────────────────────────────────────── */
  /*  Messages d'une conversation            */
  /* ─────────────────────────────────────── */
  const loadMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/${user.id}/${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selected) loadMessages(selected.user.id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─────────────────────────────────────── */
  /*  Envoi                                  */
  /* ─────────────────────────────────────── */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected || sending) return;
    try {
      setSending(true);
      await api.post("/messages", {
        receiver_id: selected.user.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      loadMessages(selected.user.id);
      loadConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  /* ─────────────────────────────────────── */
  /*  Nouveau message : charger médecins     */
  /* ─────────────────────────────────────── */
  const openNewMessage = async () => {
    setShowNewMsg(true);
    setDoctorSearch("");
    if (doctors.length > 0) return; // déjà chargés
    try {
      setDoctorsLoading(true);
      const res = await api.get("/doctors"); // GET /api/doctors (public)
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDoctorsLoading(false);
    }
  };

  /* Sélectionner un médecin depuis le modal → ouvrir la conversation */
  const startConversation = async (doctor) => {
    // Le "user" du médecin est dans doctor.user (relation DoctorProfile→User)
    const doctorUser = doctor.user ?? doctor;

    // Envoie un message vide pour créer la conv si elle n'existe pas encore,
    // OU ouvre simplement la conversation existante
    const existingConv = conversations.find((c) => c.user?.id === doctorUser.id);

    if (existingConv) {
      setSelected(existingConv);
    } else {
      // Prépare une "fausse" conversation locale pour ouvrir le chat
      setSelected({
        user: {
          id:    doctorUser.id,
          name:  doctorUser.name,
          email: doctorUser.email,
          role:  "doctor",
        },
        last_message: null,
        unread_count: 0,
      });
      setMessages([]);
    }

    setShowNewMsg(false);
    setDoctorSearch("");
  };

  /* ─────────────────────────────────────── */
  /*  Helpers UI                             */
  /* ─────────────────────────────────────── */
  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const COLORS = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
  ];
  const colorFor = (name = "") => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dt) => {
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const filteredConversations = conversations.filter((c) =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDoctors = doctors.filter((d) => {
    const name = d.user?.name ?? d.name ?? "";
    const spec = d.specialty ?? d.speciality ?? "";
    return (
      name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      spec.toLowerCase().includes(doctorSearch.toLowerCase())
    );
  });

  /* ─────────────────────────────────────── */
  /*  Render                                 */
  /* ─────────────────────────────────────── */
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle className="text-teal-600" /> Mes Messages
        </h1>
        <button
          onClick={openNewMessage}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition shadow"
        >
          <Plus size={16} /> Nouveau message
        </button>
      </div>

      <div className="flex gap-4 h-[75vh]">

        {/* ── LISTE CONVERSATIONS ── */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Aucune conversation</p>
                <button
                  onClick={openNewMessage}
                  className="mt-3 text-xs text-teal-600 font-medium hover:underline"
                >
                  Écrire à un médecin →
                </button>
              </div>
            ) : (
              filteredConversations.map((conv, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(conv)}
                  className={`p-4 cursor-pointer transition border-b border-gray-50 ${
                    selected?.user.id === conv.user.id
                      ? "bg-teal-50 border-l-4 border-l-teal-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${colorFor(conv.user?.name)}`}>
                      {getInitials(conv.user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          Dr. {conv.user?.name}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-teal-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1 flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.last_message?.content}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {conv.last_message?.created_at ? formatDate(conv.last_message.created_at) : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── ZONE MESSAGES ── */}
        <div className="flex-1 bg-white rounded-2xl shadow flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colorFor(selected.user?.name)}`}>
                  {getInitials(selected.user?.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Dr. {selected.user?.name}</p>
                  <p className="text-xs text-gray-500">Médecin</p>
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs text-teal-600">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> En ligne
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-gray-300">
                    <MessageCircle size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Commencez la conversation</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-auto ${colorFor(selected.user?.name)}`}>
                          {getInitials(selected.user?.name)}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-teal-200" : "text-gray-400"}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-gray-50">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
              <MessageCircle size={48} />
              <p className="text-sm text-gray-400">Sélectionnez une conversation</p>
              <button
                onClick={openNewMessage}
                className="mt-2 flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
              >
                <Plus size={16} /> Écrire à un médecin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL NOUVEAU MESSAGE ── */}
      {showNewMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Stethoscope size={20} className="text-teal-600" />
                Choisir un médecin
              </h2>
              <button onClick={() => setShowNewMsg(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Recherche médecin */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom ou spécialité..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Liste médecins */}
            <div className="overflow-y-auto max-h-80">
              {doctorsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Aucun médecin trouvé</p>
              ) : (
                filteredDoctors.map((doc) => {
                  const name = doc.user?.name ?? doc.name ?? "";
                  const spec = doc.specialty ?? doc.speciality ?? "";
                  const alreadyInConv = conversations.some((c) => c.user?.id === (doc.user?.id ?? doc.id));
                  return (
                    <div
                      key={doc.id}
                      onClick={() => startConversation(doc)}
                      className="flex items-center gap-3 p-4 hover:bg-teal-50 cursor-pointer transition border-b border-gray-50"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorFor(name)}`}>
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800">Dr. {name}</p>
                        {spec && <p className="text-xs text-teal-600">{spec}</p>}
                      </div>
                      {alreadyInConv ? (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0">
                          Conversation existante
                        </span>
                      ) : (
                        <span className="text-xs text-teal-600 font-medium flex-shrink-0">
                          Écrire →
                        </span>
                      )}
                    </div>
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

export default PatientMessages;