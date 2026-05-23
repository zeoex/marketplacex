'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDistanceToNow } from 'date-fns';
import Cookies from 'js-cookie';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect socket
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('new:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('user:typing', () => setIsTyping(true));
    socket.on('user:typing:stop', () => setIsTyping(false));

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (activeConv) {
      socketRef.current?.emit('join:conversation', { conversationId: activeConv });
      loadMessages(activeConv);
    }
  }, [activeConv]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (convId: string) => {
    const res = await api.messages.getConversation(convId) as any;
    setMessages(res.data.messages || []);
    setTimeout(scrollToBottom, 100);
  };

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.messages.getConversations(),
    enabled: !!user,
  });

  const sendMessage = () => {
    if (!message.trim() || !activeConv || !user) return;

    const convData = (conversations as any)?.data?.find((c: any) => c.id === activeConv);
    const receiverId = convData?.participants?.find((p: any) => p.userId !== user.id)?.userId;

    socketRef.current?.emit('send:message', {
      conversationId: activeConv,
      content: message,
      receiverId,
    });

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const convList = (conversations as any)?.data || [];

  return (
    <main className="container-app py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
           style={{ height: 'calc(100vh - 200px)' }}>
        <div className="grid grid-cols-3 h-full">
          {/* Conversations list */}
          <div className="border-r border-slate-100 dark:border-slate-700 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            {convList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No conversations yet</div>
            ) : (
              convList.map((conv: any) => {
                const other = conv.participants?.find((p: any) => p.userId !== user?.id);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left ${
                      activeConv === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {other?.user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{other?.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-brand text-white text-xs rounded-full flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Chat window */}
          <div className="col-span-2 flex flex-col">
            {activeConv ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-700 rounded-bl-sm'
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Attachment" className="rounded-xl mb-2 max-w-full" />
                          )}
                          {msg.content && <p>{msg.content}</p>}
                          <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          {[0,1,2].map((i) => (
                            <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 rounded-2xl px-4 py-2">
                    <button className="text-slate-400 hover:text-slate-600 p-1" aria-label="Attach image">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 p-1" aria-label="Emoji">
                      <Smile className="w-5 h-5" />
                    </button>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        socketRef.current?.emit('typing:start', { conversationId: activeConv });
                      }}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent resize-none focus:outline-none text-sm py-1 max-h-32"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center
                                 hover:bg-primary-700 disabled:opacity-40 transition-all active:scale-95"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-10">
                <div>
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Select a conversation</p>
                  <p className="text-sm text-slate-400 mt-1">or start a new chat from a product page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
