import { useState } from 'react';
import {
  Mail, Lock, User, UserCheck, Stethoscope, Eye, EyeOff,
  ArrowRight, ShieldCheck, Loader2,
} from 'lucide-react';
import { signIn, signUp } from '../lib/api';

function BrandIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

export default function AuthScreen({ initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reset = () => { setError(''); setNotice(''); };

  const submit = async (e) => {
    e.preventDefault();
    reset();
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        const data = await signUp({ email, password, name, accountType });
        if (!data?.session) {
          setNotice('Conta criada! Confirme seu e-mail (link enviado) para ativar o login.');
          setMode('login');
        }
      }
    } catch (err) {
      setError(err?.message || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-grid flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            ← Voltar ao catálogo
          </button>
        )}

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #00D4FF)',
              boxShadow: '0 0 24px rgba(0, 212, 255, 0.35)',
            }}
          >
            <BrandIcon className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 20%, #00D4FF 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CuidaCasa
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cuidado domiciliar seguro, verificado e conectado.</p>
        </div>

        <div className="glass-card-static p-6 sm:p-8 rounded-3xl">
          {/* Alternador */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); reset(); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); reset(); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome Completo <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="input-field"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                E-mail <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Senha <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tipo de Conta <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      accountType === 'user'
                        ? 'bg-cyan-950/40 border-cyan-500/60'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <UserCheck size={20} className={accountType === 'user' ? 'text-cyan-400' : 'text-slate-500'} />
                    <p className={`text-xs font-bold mt-2 ${accountType === 'user' ? 'text-white' : 'text-slate-300'}`}>Usuário / Familiar</p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Contrato cuidados para quem você ama.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('professional')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      accountType === 'professional'
                        ? 'bg-cyan-950/40 border-cyan-500/60'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Stethoscope size={20} className={accountType === 'professional' ? 'text-cyan-400' : 'text-slate-500'} />
                    <p className={`text-xs font-bold mt-2 ${accountType === 'professional' ? 'text-white' : 'text-slate-300'}`}>Profissional de Saúde</p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Presto atendimento domiciliar.</p>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-cyan-400" />
                  Contas de administrador são criadas apenas internamente.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                {error}
              </div>
            )}
            {notice && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Aguarde...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'login' ? 'Entrar na Plataforma' : 'Criar Minha Conta'} <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade & LGPD.
        </p>
      </div>
    </div>
  );
}
