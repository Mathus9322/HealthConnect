import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const DoctorMessages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les conversations
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  // Charger les messages d'une conversation sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await api.get("/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      const response = await api.get(`/messages/${user.id}/${otherUserId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post("/messages", {
        receiver_id: selectedConversation.user.id,
        content: newMessage.trim(),
      });

      setNewMessage("");
      // Recharger les messages
      loadMessages(selectedConversation.user.id);
      // Recharger les conversations pour mettre à jour le dernier message
      loadConversations();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Liste des conversations */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500">Aucune conversation</p>
          ) : (
            conversations.map((conversation, index) => (
              <div
                key={index}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.user.id === conversation.user.id
                    ? "bg-blue-100 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {conversation.user.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message.content}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conversation.last_message.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Zone de messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
          {selectedConversation ? (
            <>
              {/* En-tête de la conversation */}
              <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">
                  Conversation avec {selectedConversation.user.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedConversation.user.role === 'patient' ? 'Patient' : 'Docteur'}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulaire d'envoi */}
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;