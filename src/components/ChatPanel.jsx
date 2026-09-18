import { useEffect, useRef, useState } from 'react';
import { Send, ChevronLeft } from 'lucide-react';
import { fetchMessages, sendMessage, subscribeMessages } from '../lib/api';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ orderId, senderRole, title, avatar, subtitle, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let active = true;

    const addMessage = (m) => {
      setMessages(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m]));
    };

    fetchMessages(orderId)
      .then(msgs => { if (active) setMessages(msgs); })
      .catch(err => console.error('Falha ao carregar mensagens:', err))
      .finally(() => { if (active) setLoading(false); });

    const channel = subscribeMessages(orderId, addMessage);

    return () => {
      active = false;
      channel?.unsubscribe?.();
    };
  }, [orderId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(orderId, text, senderRole);
      setMessages(prev => (prev.some(x => x.id === msg.id) ? prev : [...prev, msg]));
      setInput('');
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
      alert('Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col h-[calc(100dvh-140px)]">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none shrink-0">
              <ChevronLeft size={20} />
            </button>
          )}
          {avatar && (
            <img
              src={avatar}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 flex items-center gap-1 shrink-0 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Chat protegido
        </span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="w-7 h-7 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">
            Nenhuma mensagem ainda. Inicie a conversa para alinhar os detalhes do atendimento.
          </p>
        ) : (
          messages.map(m => {
            const own = m.senderRole === senderRole;
            return (
              <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    own
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.content}</p>
                  <span className={`block text-[10px] text-right mt-1.5 ${own ? 'text-cyan-100/70' : 'text-slate-400'}`}>
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="input-field rounded-2xl"
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary rounded-2xl px-5 shrink-0">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
