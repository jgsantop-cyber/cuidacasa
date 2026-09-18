import { useEffect, useMemo, useState } from 'react';
import {
  LogOut, Users, Stethoscope, ClipboardList, Flag, Wallet,
  ShieldCheck, ShieldOff, CheckCircle2, XCircle,
  UserCog, Calendar, HeartHandshake,
} from 'lucide-react';
import {
  fetchAllUsers, fetchProfessionals, fetchAllOrders, fetchAllReports,
  updateUserAccountType, updateProfessionalVerified, updateProfessionalAvailability,
} from '../lib/api';

const ACCOUNT_LABEL = {
  admin: 'Admin',
  professional: 'Profissional',
  user: 'Usuário',
};

function BrandMark() {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #2563EB, #00D4FF)', boxShadow: '0 0 18px rgba(0,212,255,0.3)' }}>
      <HeartHandshake className="w-5 h-5 text-white" />
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: Wallet },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'professionals', label: 'Profissionais', icon: Stethoscope },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList },
  { id: 'reports', label: 'Denúncias', icon: Flag },
];

export default function AdminDashboard({ profile, onSignOut }) {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [u, p, o, r] = await Promise.all([
          fetchAllUsers(), fetchProfessionals(), fetchAllOrders(), fetchAllReports(),
        ]);
        if (!active) return;
        setUsers(u); setProfessionals(p); setOrders(o); setReports(r);
      } catch (err) {
        console.error('Falha ao carregar painel admin:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.filter(o => o.status === 'Concluído').reduce((s, o) => s + o.totalValue, 0);
    return {
      users: users.filter(u => u.accountType === 'user').length,
      professionals: users.filter(u => u.accountType === 'professional').length,
      orders: orders.length,
      reports: reports.length,
      revenue,
    };
  }, [users, orders, reports]);

  const setAccountType = async (id, type) => {
    setBusy(true);
    try {
      await updateUserAccountType(id, type);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, accountType: type } : u));
    } catch (err) {
      console.error(err); alert('Não foi possível alterar o tipo de conta.');
    } finally { setBusy(false); }
  };

  const toggleVerified = async (id, v) => {
    try { await updateProfessionalVerified(id, v); setProfessionals(prev => prev.map(p => p.id === id ? { ...p, isVerified: v } : p)); }
    catch (e) { console.error(e); alert('Erro ao alterar verificação.'); }
  };

  const toggleAvailable = async (id, v) => {
    try { await updateProfessionalAvailability(id, v); setProfessionals(prev => prev.map(p => p.id === id ? { ...p, available: v } : p)); }
    catch (e) { console.error(e); alert('Erro ao alterar disponibilidade.'); }
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
  };

  const isSelf = (id) => id === profile?.userId;

  return (
    <div className="min-h-screen bg-grid flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 w-full border-b"
        style={{ background: 'rgba(6,10,19,0.94)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <span className="font-extrabold text-xl" style={{ background: 'linear-gradient(135deg,#fff 20%,#00D4FF 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CuidaCasa</span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-cyan-400">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-tight">{profile?.name || 'Administrador'}</p>
              <p className="text-[10px] text-cyan-400">Administrador</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold text-xs flex items-center justify-center border-2 border-cyan-400">
              AD
            </div>
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
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Usuários', value: stats.users, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { label: 'Profissionais', value: stats.professionals, icon: Stethoscope, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Pedidos', value: stats.orders, icon: ClipboardList, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                { label: 'Denúncias', value: stats.reports, icon: Flag, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Receita (R$)', value: stats.revenue.toFixed(0), icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map(s => (
                <div key={s.label} className="glass-card-static p-4 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon size={20} className={s.color} />
                  </div>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all ${
                    tab === t.id ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                  }`}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            {/* Visão Geral */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card-static p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-white mb-2">Últimos Usuários</h3>
                  <div className="space-y-2">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate">{u.name}</span>
                        <span className={`badge ${u.accountType === 'admin' ? 'badge-danger' : u.accountType === 'professional' ? 'badge-available' : 'badge-verified'}`}>{ACCOUNT_LABEL[u.accountType]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card-static p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-white mb-2">Denúncias Recentes</h3>
                  <div className="space-y-2">
                    {reports.slice(0, 5).map(r => (
                      <div key={r.id} className="text-xs">
                        <p className="text-slate-300 font-semibold">{r.reason}</p>
                        <p className="text-[11px] text-slate-500">{r.protocol} · {r.status}</p>
                      </div>
                    ))}
                    {reports.length === 0 && <p className="text-xs text-slate-500">Nenhuma denúncia registrada.</p>}
                  </div>
                </div>
                <div className="glass-card-static p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-white mb-2">Pedidos Recentes</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="text-xs flex items-center justify-between">
                        <span className="text-slate-300 truncate">{o.professional?.name}</span>
                        <span className="text-slate-500">{o.status}</span>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-xs text-slate-500">Nenhum pedido.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Usuários */}
            {tab === 'users' && (
              <div className="glass-card-static rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Nome</th>
                        <th className="p-4">E-mail</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-800/60">
                          <td className="p-4 text-white font-semibold">{u.name}</td>
                          <td className="p-4 text-slate-400">{u.email}</td>
                          <td className="p-4">
                            <span className={`badge ${u.accountType === 'admin' ? 'badge-danger' : u.accountType === 'professional' ? 'badge-available' : 'badge-verified'}`}>
                              {ACCOUNT_LABEL[u.accountType]}
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            {isSelf(u.userId) ? (
                              <span className="text-[11px] text-slate-500">(você)</span>
                            ) : u.accountType === 'admin' ? (
                              <button disabled={busy} onClick={() => setAccountType(u.id, 'user')}
                                className="btn-secondary text-[11px] py-1.5 px-2.5 rounded-lg">
                                <ShieldOff size={13} /> Remover admin
                              </button>
                            ) : (
                              <button disabled={busy} onClick={() => setAccountType(u.id, 'admin')}
                                className="btn-secondary text-[11px] py-1.5 px-2.5 rounded-lg text-cyan-300">
                                <UserCog size={13} /> Tornar admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Profissionais */}
            {tab === 'professionals' && (
              <div className="glass-card-static rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Profissional</th>
                        <th className="p-4">Especialidade</th>
                        <th className="p-4">Valor/h</th>
                        <th className="p-4">Verificado</th>
                        <th className="p-4">Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      {professionals.map(p => (
                        <tr key={p.id} className="border-b border-slate-800/60">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.avatar || p.image} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                                onError={e => { e.currentTarget.style.display = 'none'; }} />
                              <div>
                                <p className="text-white font-semibold">{p.name}</p>
                                <p className="text-[10px] text-slate-500">{p.council}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">{p.specialty}</td>
                          <td className="p-4 text-slate-300">R$ {p.hourlyRate}</td>
                          <td className="p-4">
                            <button onClick={() => toggleVerified(p.id, !p.isVerified)}
                              className={`flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-transparent border-none ${p.isVerified ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                              {p.isVerified ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                              {p.isVerified ? 'Verificado' : 'Não verificado'}
                            </button>
                          </td>
                          <td className="p-4">
                            <button onClick={() => toggleAvailable(p.id, !p.available)}
                              className={`flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-transparent border-none ${p.available ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                              {p.available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                              {p.available ? 'Disponível' : 'Indisponível'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pedidos */}
            {tab === 'orders' && (
              <div className="glass-card-static rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Profissional</th>
                        <th className="p-4">Data</th>
                        <th className="p-4">Horário</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-slate-800/60">
                          <td className="p-4 text-white font-semibold">{o.professional?.name}</td>
                          <td className="p-4 text-slate-400"><Calendar size={12} className="inline mr-1" />{o.date}</td>
                          <td className="p-4 text-slate-400">{o.startTime}–{o.endTime}</td>
                          <td className="p-4 text-cyan-300 font-semibold">R$ {o.totalValue}</td>
                          <td className="p-4">
                            <span className={`badge ${o.status === 'Concluído' ? 'badge-status-done' : o.status === 'Confirmado' ? 'badge-status-confirmed' : 'badge-status-waiting'}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum pedido.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Denúncias */}
            {tab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="glass-card-static text-center py-12 rounded-2xl border border-slate-800">
                    <Flag size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">Nenhuma denúncia registrada</p>
                  </div>
                ) : reports.map(r => (
                  <div key={r.id} className="glass-card-static p-5 rounded-2xl border-l-4 border-l-rose-500">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <span className="badge badge-danger">{r.reason}</span>
                      <span className="text-[11px] text-slate-400">{r.protocol} · {fmtDate(r.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{r.details}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                      <span className="text-[11px] text-slate-500">
                        {r.anonymous ? 'Denúncia anônima' : 'Denúncia identificada'}
                      </span>
                      <span className={`badge ${r.status === 'Em análise' ? 'badge-status-waiting' : 'badge-status-done'}`}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
