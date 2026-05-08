import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

import {
  MessageCircle,
  Send,
  Search,
  Users,
  Activity,
} from "lucide-react";

const DoctorMessages = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const bottomRef = useRef(null);

  /* ───────────────────────────── */
  /* Charger conversations         */
  /* ───────────────────────────── */
  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations");

      const data = Array.isArray(res.data)
        ? res.data
        : Object.values(res.data);

      setConversations(data);
    } catch (err) {
      console.error(err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  /* ───────────────────────────── */
  /* Charger messages              */
  /* ───────────────────────────── */
  const loadMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/${user.id}/${otherUserId}`);

      setMessages(res.data);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selected) {
      loadMessages(selected.user.id);
    }
  }, [selected]);

  /* Scroll auto */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ───────────────────────────── */
  /* Envoyer message               */
  /* ───────────────────────────── */
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

      await loadMessages(selected.user.id);
      await loadConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  /* ───────────────────────────── */
  /* Helpers                       */
  /* ───────────────────────────── */
  const getInitials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const COLORS = [
    "bg-cyan-100 text-cyan-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];

  const colorFor = (name = "") =>
    COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dt) => {
    const d = new Date(dt);
    const today = new Date();

    if (d.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }

    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ───────────────────────────── */
  /* Loading                       */
  /* ───────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">
            Chargement des conversations...
          </p>
        </div>
      </div>
    );
  }

  /* ───────────────────────────── */
  /* Render                        */
  /* ───────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg">
              <MessageCircle className="text-white" size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Messagerie Médecin
              </h1>

              <p className="text-gray-500 mt-1">
                Communication professionnelle avec vos patients
              </p>
            </div>
          </div>

          <div className="bg-cyan-50 px-5 py-4 rounded-2xl">
            <p className="text-sm text-gray-500">
              Conversations
            </p>

            <p className="text-3xl font-bold text-cyan-700">
              {conversations.length}
            </p>
          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Conversations
          </p>

          <h2 className="text-3xl font-bold text-cyan-600">
            {conversations.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Messages
          </p>

          <h2 className="text-3xl font-bold text-teal-600">
            {messages.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Statut
          </p>

          <h2 className="text-lg font-semibold text-green-600">
            En ligne
          </h2>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex gap-5 h-[75vh]">

        {/* SIDEBAR */}
        <div className="w-80 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

          {/* SEARCH */}
          <div className="p-5 border-b border-gray-100">

            <div className="relative">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* CONVERSATIONS */}
          <div className="flex-1 overflow-y-auto">

            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

                <Users size={42} className="text-gray-300 mb-3" />

                <p className="text-gray-400 text-sm">
                  Aucune conversation trouvée
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, i) => (

                <div
                  key={i}
                  onClick={() => setSelected(conv)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 ${
                    selected?.user?.id === conv.user?.id
                      ? "bg-cyan-50 border-l-4 border-l-cyan-600"
                      : "hover:bg-gray-50"
                  }`}
                >

                  <div className="flex gap-3">

                    {/* AVATAR */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorFor(
                        conv.user?.name
                      )}`}
                    >
                      {getInitials(conv.user?.name)}
                    </div>

                    {/* INFOS */}
                    <div className="flex-1 min-w-0">

                      <div className="flex justify-between items-center gap-2">

                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {conv.user?.name}
                        </p>

                        {conv.unread_count > 0 && (
                          <span className="bg-cyan-600 text-white text-xs rounded-full px-2 py-0.5">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.last_message?.content}
                      </p>

                      <p className="text-[11px] text-gray-300 mt-1">
                        {conv.last_message?.created_at
                          ? formatDate(conv.last_message.created_at)
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

          {selected ? (
            <>
              {/* HEADER CHAT */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${colorFor(
                    selected.user?.name
                  )}`}
                >
                  {getInitials(selected.user?.name)}
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    {selected.user?.name}
                  </h3>

                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Activity
                      size={12}
                      className="text-cyan-500"
                    />
                    Patient suivi
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  En ligne
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300">

                    <MessageCircle size={48} />

                    <p className="mt-3 text-sm">
                      Aucun message pour le moment
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] ${
                          isMe
                            ? "bg-cyan-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >

                        <p className="text-sm">
                          {msg.content}
                        </p>

                        <p
                          className={`text-[11px] mt-1 ${
                            isMe
                              ? "text-cyan-100"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>

              {/* INPUT */}
              <div className="p-5 border-t border-gray-100 bg-white">

                <form
                  onSubmit={sendMessage}
                  className="flex items-center gap-3"
                >

                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) =>
                      setNewMessage(e.target.value)
                    }
                    className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      sending || !newMessage.trim()
                    }
                    className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>

                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

              <div className="w-24 h-24 rounded-full bg-cyan-50 flex items-center justify-center mb-5">

                <MessageCircle
                  size={40}
                  className="text-cyan-600"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-700">
                Messagerie Médecin
              </h2>

              <p className="text-gray-400 text-sm mt-2 max-w-sm">
                Sélectionnez une conversation pour discuter
                avec vos patients.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;