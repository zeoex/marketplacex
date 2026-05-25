'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Check, X, Send, Phone, Mail, Clock, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Participant {
  userId: string;
  user: { id: string; name: string; avatarUrl?: string; username?: string; phone?: string; email?: string };
}
interface Msg {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl?: string };
}
interface Conversation {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestMessage?: string;
  productId?: string;
  lastMessage?: string;
  updatedAt: string;
  participants: Participant[];
  messages: Msg[];
}

function Avatar({ user, size = 'md' }: { user: Participant['user']; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${cls} rounded-full bg-primary-100 dark:bg-primary-900/30 overflow-hidden shrink-0 flex items-center justify-center text-primary-700 font-bold`}>
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
        : user.name[0]?.toUpperCase()}
    </div>
  );
}

function ChatView({ conv, meId, onBack }: { conv: Conversation; meId: string; onBack: () => void }) {
  const [text, setText] = useState('');
  const qc = useQueryClient();
  const other = conv.participants.find((p) => p.userId !== meId)?.user;

  const { data: msgsData } = useQuery({
    queryKey: ['messages', conv.id],
    queryFn: () => api.messages.getMessages(conv.id),
    refetchInterval: 5000,
  });
  const messages: Msg[] = (msgsData as any)?.data ?? [];

  const sendMut = useMutation({
    mutationFn: () => api.messages.send(conv.id, { receiverId: other?.id, content: text }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', conv.id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => toast.error('Error al enviar el mensaje'),
  });

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {other && <Avatar user={other} />}
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{other?.name}</p>
          {other?.username && <p className="text-xs text-slate-400">@{other.username}</p>}
        </div>
        {/* Contact info revealed after acceptance */}
        <div className="flex items-center gap-3 text-sm">
          {other?.phone && (
            <a href={`tel:${other.phone}`} className="flex items-center gap-1 text-primary-600 hover:underline text-xs">
              <Phone className="w-3.5 h-3.5" /> {other.phone}
            </a>
          )}
          {other?.email && (
            <a href={`mailto:${other.email}`} className="flex items-center gap-1 text-primary-600 hover:underline text-xs">
              <Mail className="w-3.5 h-3.5" /> {other.email}
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">¡El chat está abierto! Mandá el primer mensaje.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === meId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (text.trim()) sendMut.mutate(); } }}
          placeholder="Escribí un mensaje..."
          className="input-field flex-1 py-2.5"
        />
        <button
          onClick={() => { if (text.trim()) sendMut.mutate(); }}
          disabled={!text.trim() || sendMut.isPending}
          className="btn-brand px-4 py-2.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => api.messages.getConversations(),
    enabled: !!user,
    refetchInterval: 10000,
  });

  const conversations: Conversation[] = (data as any)?.data ?? [];
  const pending  = conversations.filter((c) => c.status === 'PENDING');
  const accepted = conversations.filter((c) => c.status === 'ACCEPTED');

  const acceptMut = useMutation({
    mutationFn: (id: string) => api.messages.acceptRequest(id),
    onSuccess: (res: any, id) => {
      toast.success('Solicitud aceptada');
      qc.invalidateQueries({ queryKey: ['conversations'] });
      const conv = conversations.find((c) => c.id === id);
      if (conv) setSelected({ ...conv, status: 'ACCEPTED' });
    },
    onError: () => toast.error('Error al aceptar'),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => api.messages.rejectRequest(id),
    onSuccess: () => {
      toast.success('Solicitud rechazada');
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setSelected(null);
    },
    onError: () => toast.error('Error al rechazar'),
  });

  if (!user) return null;
  const meId = user.id;
  const getOther = (conv: Conversation) => conv.participants.find((p) => p.userId !== meId)?.user;

  return (
    <main className="container-app py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-brand" />
        <h1 className="text-2xl font-bold">Mensajes</h1>
        {pending.length > 0 && (
          <span className="w-5 h-5 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {pending.length}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar */}
        <div className={`space-y-4 ${selected ? 'hidden md:block' : ''}`}>
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Solicitudes pendientes ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map((conv) => {
                  const other = getOther(conv);
                  return (
                    <div key={conv.id} onClick={() => setSelected(conv)}
                      className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        {other && <Avatar user={other} size="sm" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{other?.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(conv.updatedAt)}
                          </p>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-800/30 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Pendiente
                        </span>
                      </div>
                      {conv.requestMessage && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 italic">"{conv.requestMessage}"</p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); acceptMut.mutate(conv.id); }}
                          disabled={acceptMut.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                          <Check className="w-3.5 h-3.5" /> Aceptar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); rejectMut.mutate(conv.id); }}
                          disabled={rejectMut.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl transition-colors">
                          <X className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {accepted.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Conversaciones ({accepted.length})
              </h2>
              <div className="space-y-2">
                {accepted.map((conv) => {
                  const other = getOther(conv);
                  const isSel = selected?.id === conv.id;
                  return (
                    <button key={conv.id} onClick={() => setSelected(conv)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                        isSel
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary-200'
                      }`}>
                      {other && <Avatar user={other} size="sm" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{other?.name}</p>
                        {conv.lastMessage && <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>}
                      </div>
                      <span className="text-2xs text-slate-400 shrink-0">{timeAgo(conv.updatedAt)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && pending.length === 0 && accepted.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tenés mensajes todavía</p>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 ${!selected ? 'hidden md:flex md:items-center md:justify-center' : ''}`}>
          {selected ? (
            selected.status === 'ACCEPTED' ? (
              <ChatView conv={selected} meId={meId} onBack={() => setSelected(null)} />
            ) : (
              <div className="flex flex-col h-[70vh] items-center justify-center text-center px-8">
                <button onClick={() => setSelected(null)} className="self-start mb-4 p-1.5 rounded-lg hover:bg-slate-100 md:hidden">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <MessageCircle className="w-16 h-16 text-amber-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">Solicitud de contacto</h3>
                <p className="text-slate-500 text-sm mb-4">
                  <span className="font-semibold">{getOther(selected)?.name}</span> quiere ponerse en contacto con vos.
                </p>
                {selected.requestMessage && (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6 max-w-sm text-sm text-slate-600 dark:text-slate-300 italic text-left w-full">
                    "{selected.requestMessage}"
                  </div>
                )}
                <div className="flex gap-3 w-full max-w-xs">
                  <button onClick={() => rejectMut.mutate(selected.id)} disabled={rejectMut.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                  <button onClick={() => acceptMut.mutate(selected.id)} disabled={acceptMut.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                    <Check className="w-4 h-4" /> Aceptar
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Seleccioná una conversación</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
