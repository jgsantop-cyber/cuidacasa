import { useEffect, useMemo, useState } from 'react';
import {
  LogOut, Star, MapPin, Clock, Calendar, Wallet, Zap,
  CheckCircle2, ShieldCheck, Stethoscope, AlertCircle,
  PlayCircle, ChevronDown, HeartHandshake, Settings, MessageCircle,
  UserX, Save, Check, ClipboardList,
} from 'lucide-react';
import {
  fetchProfessionalById, fetchOrdersForProfessional,
  updateOrderStatus, updateProfessionalAvailability,
  declineOrder, updateProfessional,
} from '../lib/api';
import ChatPanel from '../components/ChatPanel';

function BrandMark() {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #2563EB, #00D4FF)', boxShadow: '0 0 18px rgba(0,212,255,0.3)' }}>
      <HeartHandshake className="w-5 h-5 text-white" />
    </div>
  );
}

const STATUS_STYLE = {
  'Confirmado': 'badge badge-status-confirmed',
  'Em andamento': 'badge badge-status-waiting',
  'Concluído': 'badge badge-status-done',
  'Recusado': 'badge badge-danger',
};

export default function ProfessionalDashboard({ profile, onSignOut }) {
  const [professional, setProfessional] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('orders');
  const [chatOrder, setChatOrder] = useState(null);

  // settings form
  const [form, setForm] = useState({
    name: '', specialty: '', city: '', bio: '', hourlyRate: '', experience: '', areas: '',
  });
  const [saved, setSaved] = useState(false);

  const professionalId = profile?.professionalId;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!professionalId) { if (active) setLoading(false); return; }
        const [pro, ords] = await Promise.all([
          fetchProfessionalById(professionalId),
          fetchOrdersForProfessional(professionalId),
        ]);
        if (!active) return;
        setProfessional(pro);
        setOrders(ords);
        setForm({
          name: pro?.name || '',
          specialty: pro?.specialty || '',
          city: pro?.city || '',
          bio: pro?.bio || '',
          hourlyRate: pro?.hourlyRate != null ? String(pro.hourlyRate) : '',
          experience: pro?.experience || '',
          areas: (pro?.areas || []).join(', '),
        });
      } catch (err) {
        console.error('Falha ao carregar painel do profissional:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [professionalId]);

  const stats = useMemo(() => {
    const earnings = orders.filter(o => o.status === 'Concluído').reduce((s, o) => s + o.totalValue, 0);
    const ongoing = orders.filter(o => o.status === 'Em andamento').length;
    const pending = orders.filter(o => o.status === 'Confirmado').length;
    return { total: orders.length, ongoing, pending, earnings };
  }, [orders]);

  const toggleAvailability = async () => {
    if (!professional) return;
    setBusy(true);
    try {
      await updateProfessionalAvailability(professional.id, !professional.available);
      setProfessional(p => ({ ...p, available: !p.available }));
    } catch (err) {
      console.error(err); alert('Não foi possível atualizar a disponibilidade.');
    } finally { setBusy(false); }
  };

  const startService = async (orderId) => {
    setBusy(true);
    try {
      await updateOrderStatus(orderId, 'Em andamento');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Em andamento' } : o));
    } catch (err) {
      console.error(err); alert('Não foi possível atualizar o status do pedido.');
    } finally { setBusy(false); }
  };

  const decline = async (o) => {
    const reason = window.prompt('Motivo da recusa (opcional):');
    if (reason === null) return;
    setBusy(true);
    try {
      await declineOrder(o.id, reason);
      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: 'Recusado', declineReason: reason } : x));
    } catch (err) {
      console.error(err); alert('Não foi possível recusar o atendimento.');
    } finally { setBusy(false); }
  };

  const saveSettings = async () => {
    if (!professional) return;
    setBusy(true);
    try {
      await updateProfessional(professional.id, {
        name: form.name,
        specialty: form.specialty,
        city: form.city,
        bio: form.bio,
        hourly_rate: Number(form.hourlyRate) || 0,
        experience: form.experience,
        areas: form.areas.split(',').map(a => a.trim()).filter(Boolean),
      });
      setProfessional(p => ({ ...p, ...{
        name: form.name, specialty: form.specialty, city: form.city, bio: form.bio,
        hourlyRate: Number(form.hourlyRate) || 0, experience: form.experience,
        areas: form.areas.split(',').map(a => a.trim()).filter(Boolean),
      }}));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err); alert('Não foi possível salvar as configurações.');
    } finally { setBusy(false); }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  if (chatOrder) {
    return (
      <div className="min-h-screen bg-grid flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
          <ChatPanel
            orderId={chatOrder.id}
            senderRole="professional"
            title="Solicitante (Familiar)"
            subtitle={`Pedido de ${formatDate(chatOrder.date)} · ${chatOrder.startTime} às ${chatOrder.endTime}`}
            onBack={() => setChatOrder(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 w-full border-b"
        style={{ background: 'rgba(6,10,19,0.94)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <span className="font-extrabold text-xl" style={{ background: 'linear-gradient(135deg,#fff 20%,#00D4FF 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CuidaCasa</span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-cyan-400">Painel do Profissional</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-tight">{profile?.name || 'Profissional'}</p>
              <p className="text-[10px] text-cyan-400">Profissional de Saúde</p>
            </div>
            <img
              src={profile?.avatar || ''}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <button onClick={onSignOut} title="Sair" className="btn-secondary p-2 rounded-xl">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : !professional ? (
          <div className="glass-card-static text-center py-16 px-4 rounded-3xl border border-slate-800 max-w-lg mx-auto">
            <Stethoscope size={40} className="text-slate-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Perfil profissional não vinculado</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sua conta foi criada como profissional, mas ainda não está ligada a um perfil do catálogo.
              Um administrador fará a vinculação para ativar seu painel.
            </p>
          </div>
        ) : (
          <>
            {/* Abas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
              <button onClick={() => setTab('orders')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all ${
                  tab === 'orders' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                }`}>
                <ClipboardList size={15} /> Atendimentos
              </button>
              <button onClick={() => setTab('settings')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all ${
                  tab === 'settings' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                }`}>
                <Settings size={15} /> Configurações
              </button>
            </div>

            {tab === 'orders' && (
              <>
                {/* Resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="glass-card-static p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <Calendar size={22} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{stats.total}</p>
                      <p className="text-[11px] text-slate-400">Pedidos</p>
                    </div>
                  </div>
                  <div className="glass-card-static p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Zap size={22} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{stats.pending}</p>
                      <p className="text-[11px] text-slate-400">Pendentes</p>
                    </div>
                  </div>
                  <div className="glass-card-static p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <PlayCircle size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{stats.ongoing}</p>
                      <p className="text-[11px] text-slate-400">Em andamento</p>
                    </div>
                  </div>
                  <div className="glass-card-static p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Wallet size={22} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">R$ {stats.earnings.toFixed(0)}</p>
                      <p className="text-[11px] text-slate-400">Ganhos</p>
                    </div>
                  </div>
                </div>

                {/* Perfil + Disponibilidade */}
                <div className="glass-card-static p-6 rounded-2xl mb-6">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <img
                      src={professional.avatar || professional.image}
                      alt={professional.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/50"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-extrabold text-white">{professional.name}</h1>
                        {professional.isVerified && <span className="badge badge-verified"><ShieldCheck size={11} /> Verificado</span>}
                      </div>
                      <p className="text-sm font-semibold text-cyan-400">{professional.specialty}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin size={12} /> {professional.city} · <Clock size={12} /> {professional.experience}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star size={14} fill="#FBBF24" color="#FBBF24" />
                        <span className="text-sm font-bold text-amber-400">{professional.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({professional.reviews.length} avaliações)</span>
                        <span className="text-xs text-slate-500">· R$ {professional.hourlyRate}/h</span>
                      </div>
                    </div>

                    <button onClick={toggleAvailability} disabled={busy}
                      className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        professional.available ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${professional.available ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {professional.available ? 'Disponível para plantões' : 'Indisponível no momento'}
                    </button>
                  </div>
                </div>

                {/* Pedidos */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Meus Atendimentos</h2>
                  {orders.length === 0 ? (
                    <div className="glass-card-static text-center py-12 px-4 rounded-2xl border border-slate-800">
                      <CheckCircle2 size={36} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-bold text-white">Nenhum pedido ainda</p>
                      <p className="text-xs text-slate-400">Quando um familiar solicitar seus serviços, aparecerá aqui.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.map(o => (
                        <div key={o.id} className="glass-card-static rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`${STATUS_STYLE[o.status] || 'badge badge-status-confirmed'}`}>{o.status}</span>
                            <span className="text-[11px] text-slate-400">{formatDate(o.date)}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                            <div className="flex items-center gap-2"><Clock size={13} className="text-cyan-400" /> das {o.startTime} às {o.endTime} ({o.durationHours}h)</div>
                            <div className="flex items-start gap-2"><MapPin size={13} className="text-cyan-400 shrink-0 mt-0.5" /> {o.address}</div>
                            {o.need && <div className="flex items-start gap-2 text-slate-400"><AlertCircle size={13} className="shrink-0 mt-0.5" /> {o.need}</div>}
                            {o.status === 'Recusado' && o.declineReason && (
                              <div className="text-rose-300 flex items-start gap-1.5"><UserX size={13} className="shrink-0 mt-0.5" /> Recusado: {o.declineReason}</div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-bold text-cyan-300">R$ {o.totalValue}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setChatOrder(o)} disabled={busy}
                                className="btn-secondary text-xs py-2 px-3 rounded-xl">
                                <MessageCircle size={15} /> Chat
                              </button>

                              {o.status === 'Confirmado' && (
                                <>
                                  <button onClick={() => startService(o.id)} disabled={busy}
                                    className="btn-primary text-xs py-2 px-3 rounded-xl">
                                    <PlayCircle size={15} /> Iniciar
                                  </button>
                                  <button onClick={() => decline(o)} disabled={busy}
                                    className="btn-danger text-xs py-2 px-3 rounded-xl">
                                    <UserX size={15} /> Recusar
                                  </button>
                                </>
                              )}
                              {o.status === 'Em andamento' && (
                                <span className="text-[11px] text-amber-400 flex items-center gap-1.5"><Zap size={13} /> Aguardando cliente</span>
                              )}
                              {o.status === 'Concluído' && (
                                <span className="text-[11px] text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={13} /> Concluído e pago</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avaliações */}
                <div className="glass-card-static rounded-2xl overflow-hidden">
                  <button onClick={() => setShowReviews(s => !s)}
                    className="w-full p-5 flex items-center justify-between cursor-pointer bg-transparent border-none">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Avaliações das Famílias</h2>
                    <ChevronDown size={16} className={`text-cyan-400 transition-transform ${showReviews ? 'rotate-180' : ''}`} />
                  </button>
                  {showReviews && (
                    <div className="px-5 pb-5 space-y-3">
                      {professional.reviews.map((r, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-white">{r.user}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{r.date}</span>
                              <span className="text-xs font-bold text-amber-400">★ {r.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 italic">"{r.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <div className="glass-card-static p-6 rounded-2xl space-y-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings size={18} className="text-cyan-400" /> Configurações do Perfil
                  </h2>
                  <p className="text-xs text-slate-400">Atualize suas informações públicas do catálogo. Os clientes verão estas informações ao contratar.</p>

                  {saved && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check size={15} /> Configurações salvas com sucesso!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Especialidade</label>
                      <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Região de Atendimento</label>
                      <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Valor por Hora (R$)</label>
                      <input type="number" min="0" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} className="input-field" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Experiência</label>
                      <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} className="input-field" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Biografia</label>
                      <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-field resize-none leading-relaxed" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Áreas de Atuação <span className="text-slate-500 normal-case">(separadas por vírgula)</span>
                      </label>
                      <input value={form.areas} onChange={e => setForm(f => ({ ...f, areas: e.target.value }))} className="input-field" />
                    </div>
                  </div>

                  <button onClick={saveSettings} disabled={busy}
                    className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl">
                    <Save size={16} /> Salvar Configurações
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
