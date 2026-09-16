import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, MapPin, MessageCircle, Star, ShieldCheck, Clock,
  CreditCard, QrCode, CheckCircle2, ChevronLeft, Send,
  ChevronRight, Filter, Zap, Heart, X, ArrowRight,
  PhoneCall, Award, UserCheck, HelpCircle, ChevronDown,
  Calendar, Check, AlertCircle, Info, Sparkles, Volume2,
  Lock, ThumbsUp, Activity, FileText, User, Settings,
  Bell, LogOut, Plus, Edit3, Shield, HeartHandshake, Phone
} from 'lucide-react';
import { professionalsData } from './mock/professionals';

/* ════════════════════════════════════════════
   DADOS MOCK DO USUÁRIO LOGADO
   ════════════════════════════════════════════ */

const initialUserData = {
  name: "João Guilherme Santos",
  email: "joao.santos@email.com",
  phone: "(11) 98765-4321",
  cpf: "342.***.***-80",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  role: "Familiar Responsável (Titular)",
  patient: {
    name: "Sr. Antônio Santos",
    kinship: "Pai",
    age: 78,
    condition: "Pós-operatório de fratura de fêmur e hipertensão arterial controlada.",
    mobility: "Mobilidade reduzida com andador de 4 rodas.",
    allergies: "Alérgico a Dipirona e Iodo.",
    healthInsurance: "Bradesco Saúde Top Nacional",
    emergencyContact: "(11) 99123-0000 (Irmã - Mariana Santos)"
  },
  address: "Rua Bela Cintra, 1420, Apto 82 - Jardins, São Paulo - SP",
  paymentMethod: "Mastercard final 4092 (Crédito)",
  pixKey: "joao.santos@email.com",
  notifications: {
    whatsappUpdates: true,
    emailReports: true,
    medicationAlerts: true
  }
};

/* ════════════════════════════════════════════
   UTILITÁRIOS & COMPONENTES COMPARTILHADOS
   ════════════════════════════════════════════ */

// Avatar com tratamento automático de erro de imagem
function ProfessionalAvatar({ src, name, size = 56, className = '', rounded = 'rounded-2xl' }) {
  const [hasError, setHasError] = useState(!src);
  const initials = useMemo(() => {
    if (!name) return 'CC';
    const parts = name.replace(/^(Dr\.|Dra\.|Enfª\.|Téc\.)\s*/i, '').trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center font-bold text-white shadow-md select-none shrink-0 ${rounded} ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #1E3A8A, #0284C7)',
          fontSize: size * 0.38,
          border: '2px solid rgba(0, 212, 255, 0.4)',
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`object-cover shrink-0 ${rounded} ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(51, 65, 85, 0.6)',
      }}
    />
  );
}

// Botão de voltar padronizado
function BackButton({ onClick, label = 'Voltar' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 py-2 px-3 mb-4 rounded-lg transition-all text-sm font-medium"
      style={{
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <ChevronLeft size={16} />
      <span>{label}</span>
    </button>
  );
}

// Estrelas de Avaliação
function StarRating({ rating, size = 14, showValue = false }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={size}
            fill={i <= Math.round(rating) ? '#FBBF24' : 'transparent'}
            color={i <= Math.round(rating) ? '#FBBF24' : '#475569'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-amber-400 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Título de Seção
function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
        <span>{children}</span>
      </h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════
   APLICAÇÃO PRINCIPAL (APP)
   ════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedPro, setSelectedPro] = useState(null);
  const [userProfile, setUserProfile] = useState(initialUserData);
  const [orders, setOrders] = useState([
    {
      id: 101,
      professional: professionalsData[0],
      date: '2026-09-17',
      startTime: '08:00',
      endTime: '14:00',
      durationHours: 6,
      address: initialUserData.address,
      need: 'Acompanhamento pós-cirúrgico de quadril e medicação endovenosa.',
      totalValue: 510,
      paymentMethod: 'pix',
      status: 'Confirmado'
    }
  ]);
  const [chatOrder, setChatOrder] = useState(null);
  const [finalizeOrder, setFinalizeOrder] = useState(null);

  const nav = (s) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-grid flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* ── HEADER RESPONSIVO (DESKTOP + MOBILE) ── */}
      <header
        className="sticky top-0 z-50 w-full border-b transition-all"
        style={{
          background: 'rgba(6, 10, 19, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">

          {/* Logo & Marca */}
          <div
            onClick={() => nav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #00D4FF)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              }}
            >
              <HeartPulseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-extrabold text-xl tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 20%, #00D4FF 80%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  CuidaCasa
                </span>
                <span
                  className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(0, 212, 255, 0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                  }}
                >
                  Saúde Domiciliar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Profissionais de Saúde Verificados pelo COREN & CREFITO
              </p>
            </div>
          </div>

          {/* Navegação Desktop (Escondida em telas de celular) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => nav('home')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                screen === 'home'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search size={15} />
              Buscar Profissionais
            </button>

            <button
              onClick={() => nav('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 relative ${
                screen === 'orders' || screen === 'chat' || screen === 'finalize'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock size={15} />
              Meus Pedidos
              {orders.filter(o => o.status === 'Confirmado').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-sm">
                  {orders.filter(o => o.status === 'Confirmado').length}
                </span>
              )}
            </button>
          </nav>

          {/* ── BOLINHA DE PERFIL DO USUÁRIO NO TOPO (DESKTOP + MOBILE) ── */}
          <div className="flex items-center gap-3">
            {/* Botão Plantão 24h (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-800">
              <a
                href="#ajuda"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Central CuidaCasa 24h: Ligue 0800 882 2424 ou fale conosco pelo WhatsApp.");
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors px-2 py-1"
              >
                <PhoneCall size={14} className="text-cyan-400" />
                <span>Plantão 24h</span>
              </a>
            </div>

            {/* BOLINHA DE PERFIL / MINHA CONTA */}
            <button
              onClick={() => nav('user-profile')}
              className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl transition-all border cursor-pointer ${
                screen === 'user-profile'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
              title="Meu Perfil, Informações e Configurações"
            >
              {/* Bolinha com foto e anel gradiente */}
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-cyan-400 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold text-xs items-center justify-center border-2 border-cyan-400"
                >
                  JS
                </div>
                {/* Ponto indicador de status ativo */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
              </div>

              {/* Informações resumidas visíveis em Desktop */}
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-white block leading-tight truncate max-w-[130px]">
                  {userProfile.name.split(' ')[0]} Santos
                </span>
                <span className="text-[10px] text-cyan-400 font-medium block leading-none">
                  Minha Conta
                </span>
              </div>

              <Settings size={14} className="text-slate-400 hidden sm:block ml-0.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL COM CONTAINER RESPONSIVO ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {screen === 'home' && (
          <HomeScreen
            professionals={professionalsData}
            onSelect={(p) => { setSelectedPro(p); nav('profile'); }}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            professional={selectedPro}
            onBack={() => nav('home')}
            onRequest={() => nav('request')}
          />
        )}
        {screen === 'request' && (
          <RequestScreen
            professional={selectedPro}
            onBack={() => nav('profile')}
            onCreated={(order) => {
              setOrders([{ ...order, id: Date.now(), status: 'Confirmado' }, ...orders]);
              nav('orders');
            }}
          />
        )}
        {screen === 'orders' && (
          <OrdersScreen
            orders={orders}
            onChat={(o) => { setChatOrder(o); nav('chat'); }}
            onFinalize={(o) => { setFinalizeOrder(o); nav('finalize'); }}
            onNewSearch={() => nav('home')}
          />
        )}
        {screen === 'chat' && (
          <ChatScreen order={chatOrder} onBack={() => nav('orders')} />
        )}
        {screen === 'finalize' && (
          <FinalizeScreen
            order={finalizeOrder}
            onBack={() => nav('orders')}
            onSubmit={() => {
              setOrders(orders.map(o => o.id === finalizeOrder.id ? { ...o, status: 'Concluído' } : o));
              nav('orders');
            }}
          />
        )}
        {screen === 'user-profile' && (
          <UserProfileScreen
            userData={userProfile}
            onUpdate={setUserProfile}
            onBack={() => nav('home')}
          />
        )}
      </main>

      {/* ── RODAPÉ INSTITUCIONAL RICO (DESKTOP + MOBILE) ── */}
      <footer className="w-full bg-slate-950/80 border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <HeartPulseIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">CuidaCasa</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A plataforma líder em intermediação de cuidados domiciliares seguros, com verificação de antecedentes e suporte técnico 24 horas por dia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Segurança & Garantias</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
                <span>Profissionais com COREN/CREFITO checados</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock size={14} className="text-cyan-400 shrink-0" />
                <span>Pagamento retido com liberação segura</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                <span>Antecedentes criminais validados</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Especialidades</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Enfermagem Padrão (Pós-Operatório & Curativos)</li>
              <li>Técnicos de Enfermagem (Plantões & Medicação)</li>
              <li>Fisioterapia Domiciliar & Respiratória</li>
              <li>Cuidadores de Idosos com foco em Alzheimer</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Atendimento às Famílias</h4>
            <p className="mb-2">Dúvidas ou auxílio com agendamento?</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-bold text-white flex items-center gap-1.5">
                <PhoneCall size={14} className="text-cyan-400" />
                0800 882 2424 (Gratuito)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Segunda a Domingo, plantão 24 horas.</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} CuidaCasa Serviços de Saúde Domiciliar Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Termos de Uso</span>
            <span>•</span>
            <span>Política de Privacidade & LGPD</span>
            <span>•</span>
            <span className="text-cyan-400">Ambiente 100% Criptografado</span>
          </div>
        </div>
      </footer>

      {/* ── NAVEGAÇÃO INFERIOR APENAS PARA MOBILE (< 768px) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: 'rgba(6, 10, 19, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex justify-around items-center py-2 px-3 pb-[max(8px,env(safe-area-inset-bottom))]">
          <NavBtn
            icon={<Search size={22} />}
            label="Buscar"
            active={screen === 'home'}
            onClick={() => nav('home')}
          />
          <NavBtn
            icon={<Clock size={22} />}
            label="Pedidos"
            active={screen === 'orders' || screen === 'chat' || screen === 'finalize'}
            onClick={() => nav('orders')}
            badge={orders.filter(o => o.status === 'Confirmado').length || null}
          />
          <NavBtn
            icon={<User size={22} />}
            label="Minha Conta"
            active={screen === 'user-profile'}
            onClick={() => nav('user-profile')}
          />
        </div>
      </nav>

    </div>
  );
}

function NavBtn({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center relative py-1 px-4 transition-colors cursor-pointer border-none bg-transparent"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {badge && (
        <span
          className="absolute top-0 right-3 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
          style={{ background: 'var(--danger)' }}
        >
          {badge}
        </span>
      )}
      {icon}
      <span className="text-[10px] font-semibold mt-1 tracking-tight">{label}</span>
      {active && (
        <span
          className="w-4 h-0.5 rounded-full mt-0.5"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </button>
  );
}

function HeartPulseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

/* ════════════════════════════════════════════
   TELA NOVA: PERFIL DO USUÁRIO & CONFIGURAÇÕES
   ════════════════════════════════════════════ */

function UserProfileScreen({ userData, onUpdate, onBack }) {
  const [activeTab, setActiveTab] = useState('patient');
  const [notifications, setNotifications] = useState(userData.notifications);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleNotif = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    onUpdate({ ...userData, notifications: updated });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="animate-slide-right max-w-4xl mx-auto pb-16">
      <BackButton onClick={onBack} label="Voltar à tela inicial" />

      {/* ── CARD PRINCIPAL DO USUÁRIO (HEADER DE PERFIL) ── */}
      <div className="glass-card-static p-6 rounded-3xl mb-6 relative overflow-hidden border border-slate-800">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar com badge */}
          <div className="relative">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full object-cover border-3 border-cyan-400 shadow-xl"
            />
            <button
              onClick={() => alert("Função para atualizar foto de perfil ativada.")}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 flex items-center justify-center hover:bg-slate-800 cursor-pointer shadow-md"
              title="Alterar foto"
            >
              <Edit3 size={14} />
            </button>
          </div>

          {/* Dados Pessoais */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{userData.name}</h1>
              <span className="badge badge-verified">
                <ShieldCheck size={11} /> Conta Verificada
              </span>
            </div>

            <p className="text-xs font-semibold text-cyan-400 mb-3">{userData.role}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">E-mail</span>
                <span className="truncate block">{userData.email}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">WhatsApp</span>
                <span>{userData.phone}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">CPF Cadastrado</span>
                <span>{userData.cpf}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} /> Preferências salvas com sucesso!
        </div>
      )}

      {/* ── ABAS DE NAVEGAÇÃO INTERNA ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('patient')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'patient'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HeartHandshake size={15} />
          Ficha do Familiar / Paciente
        </button>

        <button
          onClick={() => setActiveTab('address')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'address'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MapPin size={15} />
          Endereço de Atendimento
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'payment'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard size={15} />
          Pagamentos & Reembolso
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings size={15} />
          Configurações & Notificações
        </button>
      </div>

      {/* ── CONTEÚDO DAS ABAS ── */}

      {/* ABA 1: FICHA DO PACIENTE */}
      {activeTab === 'patient' && (
        <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle subtitle="Estes dados auxiliam o profissional de saúde a preparar os materiais adequados">
              Ficha Clínica do Paciente Atendido
            </SectionTitle>
            <button
              onClick={() => alert("Modo de edição da ficha do paciente habilitado.")}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Edit3 size={13} /> Editar dados
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Nome do Paciente / Parentesco
              </span>
              <p className="text-sm font-bold text-white">
                {userData.patient.name} ({userData.patient.kinship})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{userData.patient.age} anos</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Convênio / Plano de Saúde
              </span>
              <p className="text-sm font-bold text-white">{userData.patient.healthInsurance}</p>
              <p className="text-xs text-emerald-400 mt-0.5">Emite relatório para reembolso</p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Diagnóstico Principal & Histórico Clínico
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {userData.patient.condition}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Locomoção e Mobilidade
              </span>
              <p className="text-xs text-slate-300">{userData.patient.mobility}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Alergias / Cuidados Críticos
              </span>
              <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} /> {userData.patient.allergies}
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Contato de Emergência Secundário
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {userData.patient.emergencyContact}
                </p>
              </div>
              <Phone size={18} className="text-cyan-400" />
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ENDEREÇOS */}
      {activeTab === 'address' && (
        <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle subtitle="Locais onde os profissionais comparecerão para os plantões">
              Endereços Cadastrados
            </SectionTitle>
            <button
              onClick={() => alert("Formulário de novo endereço.")}
              className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            >
              <Plus size={14} /> Adicionar Endereço
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 relative">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-cyan-400" />
                <span className="text-sm font-bold text-white">Residência Principal (Casa do Pai)</span>
              </div>
              <span className="badge badge-verified">Padrão</span>
            </div>
            <p className="text-xs text-slate-300 pl-6 leading-relaxed mb-3">
              {userData.address}
            </p>
            <div className="flex items-center gap-3 pl-6 text-xs text-cyan-400">
              <button onClick={() => alert("Editar endereço")} className="hover:underline">
                Editar endereço
              </button>
              <span>•</span>
              <span className="text-slate-500">Ponto de referência: Próximo à estação Paulista</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: PAGAMENTOS */}
      {activeTab === 'payment' && (
        <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
          <SectionTitle subtitle="Gerencie seus métodos para pagamentos e recebimento de reembolsos">
            Formas de Pagamento & Carteira
          </SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <CreditCard size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Cartão Salvo</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{userData.paymentMethod}</p>
              <p className="text-xs text-slate-400">Expira em 08/2029</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <QrCode size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Chave Pix para Estorno</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{userData.pixKey}</p>
              <p className="text-xs text-emerald-400">Reembolso em até 10 minutos se houver cancelamento</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Notas Fiscais e Relatórios para o Convênio</p>
                <p className="text-[11px] text-slate-400">Baixe os comprovantes detalhados com CRM/COREN para reembolso</p>
              </div>
            </div>
            <button
              onClick={() => alert("Histórico de notas fiscais emitidas.")}
              className="btn-secondary text-xs py-2 px-3 rounded-xl"
            >
              Visualizar Recibos
            </button>
          </div>
        </div>
      )}

      {/* ABA 4: CONFIGURAÇÕES & NOTIFICAÇÕES */}
      {activeTab === 'settings' && (
        <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
          <SectionTitle subtitle="Ajuste suas notificações e preferências de segurança">
            Configurações da Conta
          </SectionTitle>

          {/* Notificações */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Notificações de Atendimento
            </h4>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-white">Avisos via WhatsApp em tempo real</p>
                <p className="text-[11px] text-slate-400">Receba aviso quando o profissional sair e chegar ao local.</p>
              </div>
              <button
                onClick={() => toggleNotif('whatsappUpdates')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                  notifications.whatsappUpdates ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.whatsappUpdates ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-white">Relatório diário de evolução por e-mail</p>
                <p className="text-[11px] text-slate-400">Resumo dos sinais vitais, medicamentos administrados e evolução clínica.</p>
              </div>
              <button
                onClick={() => toggleNotif('emailReports')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                  notifications.emailReports ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.emailReports ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Segurança */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Segurança & Acesso
            </h4>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => alert("Instruções de redefinição enviadas para seu e-mail.")}
                className="btn-secondary text-xs py-2.5 px-4 rounded-xl"
              >
                Alterar Senha de Acesso
              </button>
              <button
                onClick={() => alert("Autenticação em 2 fatores já está ativa para este número.")}
                className="btn-secondary text-xs py-2.5 px-4 rounded-xl text-emerald-400 border-emerald-500/30"
              >
                <ShieldCheck size={14} /> Autenticação 2FA Ativada
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <p className="text-xs text-slate-500">Versão da Plataforma 2.4.0 (Conforme LGPD)</p>
            <button
              onClick={() => {
                if (confirm("Deseja realmente sair da sua conta?")) {
                  onBack();
                }
              }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            >
              <LogOut size={14} /> Sair da Conta
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 1 — HOME / BUSCA & INFORMAÇÕES
   ════════════════════════════════════════════ */

function HomeScreen({ professionals, onSelect }) {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [distance, setDistance] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const specialties = [
    'Todas',
    'Enfermeira',
    'Técnico de Enfermagem',
    'Fisioterapeuta',
    'Cuidador de Idosos'
  ];

  const filtered = professionals.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase()) ||
      p.areas.some(a => a.toLowerCase().includes(search.toLowerCase()));

    const matchSpec =
      selectedSpecialty === 'Todas' ||
      p.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchDist = !distance || parseFloat(p.distance) <= parseFloat(distance);
    const matchAvail = !availableOnly || p.available;

    return matchSearch && matchSpec && matchDist && matchAvail;
  });

  return (
    <div className="animate-fade-in space-y-10">

      {/* ── HERO BANNER INSTITUCIONAL ── */}
      <section
        className="rounded-3xl p-6 sm:p-10 relative overflow-hidden border"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
          borderColor: 'rgba(0, 212, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Assistência Domiciliar Segura & Humanizada</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Cuidado profissional para quem você ama, no conforto do lar.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Conectamos sua família aos melhores <strong>enfermeiros, técnicos de enfermagem e fisioterapeutas</strong> da sua região. Todos com registro verificado no COREN/CREFITO e antecedentes checados.
          </p>

          {/* Destaques de Confiança */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">100% Verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Atendimento Imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Pagamento Protegido</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Nota 4.9 pelas Famílias</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE BUSCA & FILTROS ── */}
      <section className="space-y-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Campo de Busca */}
            <div className="md:col-span-6 relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Busque por nome, especialidade ou procedimento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filtro de Distância */}
            <div className="md:col-span-3">
              <select
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="select-field"
              >
                <option value="">Qualquer distância</option>
                <option value="2">Até 2 km de você</option>
                <option value="5">Até 5 km de você</option>
                <option value="10">Até 10 km de você</option>
              </select>
            </div>

            {/* Switch de Disponibilidade Imediata */}
            <div className="md:col-span-3 flex items-center">
              <button
                type="button"
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-full h-full min-h-[46px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  availableOnly
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Zap size={14} className={availableOnly ? 'text-emerald-400' : 'text-slate-500'} />
                <span>Disponível Agora</span>
                {availableOnly && <Check size={14} />}
              </button>
            </div>
          </div>

          {/* Chips de Especialidades */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium shrink-0 mr-1 hidden sm:inline">Filtrar por:</span>
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da busca */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Mostrando <strong>{filtered.length}</strong> profissionais qualificados</span>
          {(search || distance || availableOnly || selectedSpecialty !== 'Todas') && (
            <button
              onClick={() => {
                setSearch('');
                setDistance('');
                setAvailableOnly(false);
                setSelectedSpecialty('Todas');
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      </section>

      {/* ── GRID DE PROFISSIONAIS (1 COL NO CELULAR, 2-3 COLUNAS NO PC/NOTEBOOK) ── */}
      <section>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                className={`glass-card cursor-pointer group flex flex-col justify-between p-5 rounded-2xl relative transition-all duration-300 hover:-translate-y-1 stagger-${(idx % 4) + 1}`}
              >
                <div>
                  {/* Topo do card: Avatar + Status + Rating */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <ProfessionalAvatar
                        src={p.avatar || p.image}
                        name={p.name}
                        size={64}
                        rounded="rounded-2xl"
                      />
                      {p.available && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm"
                          title="Disponível para atendimento imediato"
                        />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        <Star size={12} fill="#FBBF24" color="#FBBF24" />
                        <span>{Number(p.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400">({p.reviews.length})</span>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin size={11} /> {p.distance} km de você
                      </span>
                    </div>
                  </div>

                  {/* Informações Principais */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs font-semibold text-cyan-400 mb-1">
                      {p.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Award size={12} className="text-slate-400" />
                      <span>{p.council || 'Conselho Verificado'}</span>
                    </p>
                  </div>

                  {/* Badges de Destaque */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.isVerified && (
                      <span className="badge badge-verified">
                        <ShieldCheck size={11} /> Verificado
                      </span>
                    )}
                    <span className="badge" style={{ background: 'rgba(30, 41, 59, 0.6)', color: 'var(--text-secondary)' }}>
                      <Clock size={11} /> {p.experience}
                    </span>
                    {p.available && (
                      <span className="badge badge-available">
                        <Zap size={11} /> Plantão Hoje
                      </span>
                    )}
                  </div>

                  {/* Áreas de Atuação (Tags) */}
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Principais Cuidados:</p>
                    <div className="flex flex-wrap gap-1">
                      {p.areas.slice(0, 3).map((area, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 truncate max-w-[200px]"
                        >
                          {area}
                        </span>
                      ))}
                      {p.areas.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 font-semibold">
                          +{p.areas.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card: Preço + Botão de Ação */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Valor por hora</span>
                    <span
                      className="text-lg font-black tracking-tight"
                      style={{
                        background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      R$ {p.hourlyRate}
                      <span className="text-xs text-slate-400 font-medium">/h</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-primary text-xs py-2 px-3.5 rounded-xl group-hover:shadow-cyan-500/25"
                  >
                    <span>Ver Perfil</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-static text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800">
            <Search size={36} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Nenhum profissional encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Não localizamos profissionais com esses filtros no momento. Tente expandir o raio de distância ou escolher outra especialidade.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setDistance('');
                setAvailableOnly(false);
                setSelectedSpecialty('Todas');
              }}
              className="btn-secondary text-xs"
            >
              Restaurar busca padrão
            </button>
          </div>
        )}
      </section>

      {/* ── SEÇÃO INFORMATIVA 1: COMO FUNCIONA (PASSO A PASSO) ── */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Processo Transparente</span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1">Como funciona o CuidaCasa</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Contratar assistência médica domiciliar nunca foi tão simples, ágil e protegido.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30 mb-4">
              01
            </div>
            <h3 className="text-sm font-bold text-white mb-2">1. Escolha o Especialista</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consulte credenciais, experiência hospitalar, avaliações de outras famílias e valores por hora.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30 mb-4">
              02
            </div>
            <h3 className="text-sm font-bold text-white mb-2">2. Defina Data e Horário</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha a data do atendimento, o horário de início e de término. O sistema calcula a duração exata.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30 mb-4">
              03
            </div>
            <h3 className="text-sm font-bold text-white mb-2">3. Atendimento no Lar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O profissional comparece pontualmente com material esterilizado e conduta pautada pela ética.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30 mb-4">
              04
            </div>
            <h3 className="text-sm font-bold text-white mb-2">4. Pagamento Seguro</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O dinheiro fica retido e garantido pela plataforma, sendo liberado apenas após a sua confirmação.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO INFORMATIVA 2: PILARES DE SEGURANÇA & RIGOR ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Validação nos Conselhos de Classe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consultamos ativamente a situação de regularidade no COREN (Enfermagem) e CREFITO (Fisioterapia).
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <UserCheck size={24} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Checagem Criminal e de Idoneidade</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Certidões de antecedentes criminais das polícias civil e federal checadas antes da aprovação do perfil.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <PhoneCall size={24} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Acompanhamento e Suporte 24h</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipe de enfermagem de suporte disponível para orientar familiares em qualquer momento do atendimento.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO INFORMATIVA 3: PERGUNTAS FREQUENTES (FAQ) ── */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-6 text-center">
          Dúvidas Frequentes das Famílias
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FaqItem
            question="Como o profissional é verificado pelo CuidaCasa?"
            answer="Exigimos diploma autenticado, registro ativo no conselho regional (COREN/CREFITO), certidão negativa de antecedentes criminais e realizamos entrevista com equipe técnica de saúde."
          />
          <FaqItem
            question="O que acontece se o profissional não puder comparecer?"
            answer="Nossa equipe aciona imediatamente outro profissional qualificado da mesma especialidade no mesmo raio de distância ou realiza o reembolso integral de forma instantânea via Pix."
          />
          <FaqItem
            question="Como funciona o pagamento? É seguro?"
            answer="O pagamento é 100% protegido. O valor fica retido na custódia segura do CuidaCasa e só é transferido ao profissional após você atestar a realização do serviço no aplicativo."
          />
          <FaqItem
            question="Posso contratar atendimento para o mesmo dia?"
            answer="Sim! Os profissionais marcados com a tag 'Disponível Agora' atendem chamados imediatos em domicílio com chegada estimada a partir de 45 minutos."
          />
        </div>
      </section>

    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs sm:text-sm font-semibold text-white">{question}</h4>
        <ChevronDown size={16} className={`text-cyan-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 2 — PERFIL DO PROFISSIONAL
   (DESIGN EM 2 COLUNAS NO DESKTOP, SEM NENHUMA
    SOBREPOSIÇÃO NAS AVALIAÇÕES)
   ════════════════════════════════════════════ */

function ProfileScreen({ professional: p, onBack, onRequest }) {
  if (!p) return null;
  const avgRating = (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1);

  return (
    <div className="animate-slide-right pb-36 md:pb-12">
      <BackButton onClick={onBack} label="Voltar à busca" />

      {/* Grid Responsivo: 2 colunas em telas médias/grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── COLUNA PRINCIPAL: DETALHES & AVALIAÇÕES (8 COLUNAS NO DESKTOP) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Header Card com Avatar e Dados Principais */}
          <div className="glass-card-static overflow-hidden rounded-2xl">
            {/* Banner Decorativo de Fundo */}
            <div
              className="h-28 relative"
              style={{
                background: 'linear-gradient(135deg, #0B101D 0%, #1E3A5F 50%, #0B101D 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.18), transparent 70%)' }}
              />
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              {/* Foto do Profissional com Fallback */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-3">
                <ProfessionalAvatar
                  src={p.avatar || p.image}
                  name={p.name}
                  size={96}
                  rounded="rounded-2xl"
                  className="shadow-2xl border-4 border-slate-900"
                />

                <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md self-start sm:self-auto">
                  <Star size={16} fill="#FBBF24" color="#FBBF24" />
                  <span className="text-sm font-extrabold text-amber-400">{avgRating}</span>
                  <span className="text-xs text-slate-400">({p.reviews.length} avaliações)</span>
                </div>
              </div>

              {/* Título & Especialidade */}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1">{p.name}</h1>
                <p className="text-sm font-semibold text-cyan-400 mb-3">{p.specialty}</p>

                {/* Badges de Credenciamento */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.isVerified && (
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} /> {p.council || 'Conselho Verificado'}
                    </span>
                  )}
                  <span className="badge" style={{ background: 'rgba(30, 41, 59, 0.6)', color: 'var(--text-secondary)' }}>
                    <Clock size={12} /> {p.experience}
                  </span>
                  {p.available && (
                    <span className="badge badge-available">
                      <Zap size={12} /> Disponibilidade Imediata
                    </span>
                  )}
                  <span className="badge" style={{ background: 'rgba(30, 41, 59, 0.6)', color: 'var(--text-secondary)' }}>
                    <MapPin size={12} /> {p.city || `${p.distance} km de você`}
                  </span>
                </div>

                {/* Biografia / Sobre o Profissional */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sobre o Profissional</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {p.bio || 'Profissional dedicado ao cuidado domiciliar humanizado, com ampla experiência em recuperação clínica e suporte à família.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Procedimentos e Áreas de Atuação */}
          <div className="glass-card-static p-6 rounded-2xl">
            <SectionTitle subtitle="Procedimentos habilitados e cuidados especializados inclusos">
              Procedimentos & Cuidados Realizados
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              {p.areas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200"
                >
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AVALIAÇÕES DAS FAMÍLIAS (COM ESPAÇO AMPLO, NUNCA COBERTO) ── */}
          <div className="glass-card-static p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle subtitle="Opinião real de famílias que já contrataram este profissional">
                Avaliações de Famílias Atendidas
              </SectionTitle>
              <span className="text-xs text-cyan-400 font-semibold">{p.reviews.length} depoimentos</span>
            </div>

            <div className="space-y-3">
              {p.reviews.map((r, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-cyan-300">
                        {r.user.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-white">{r.user}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.date && <span className="text-[11px] text-slate-400">{r.date}</span>}
                      <StarRating rating={r.rating} size={12} />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic pl-9">
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── COLUNA LATERAL: CARD DE RESERVA STICKY EM DESKTOP (4 COLUNAS) ── */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <div
            className="glass-card-static p-6 rounded-2xl border"
            style={{ borderColor: 'rgba(0, 212, 255, 0.25)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Investimento
            </span>

            <div className="flex items-baseline gap-1.5 mb-4">
              <span
                className="text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                R$ {p.hourlyRate}
              </span>
              <span className="text-sm text-slate-400 font-semibold">/ por hora</span>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span>Disponibilidade:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {p.available ? 'Atendimento Hoje' : 'Agendamento Flexível'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tempo de Chegada:</span>
                <span className="font-semibold text-white">~45 min na sua região</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Garantia CuidaCasa:</span>
                <span className="font-semibold text-cyan-400">100% Protegido</span>
              </div>
            </div>

            <button
              onClick={onRequest}
              className="btn-primary w-full py-4 text-sm font-bold tracking-wide rounded-xl shadow-lg"
            >
              <span>Solicitar Atendimento</span>
              <ArrowRight size={18} />
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
              <Lock size={12} className="text-cyan-400" />
              <span>Você só paga após o término do serviço</span>
            </p>
          </div>
        </div>

      </div>

      {/* ── BARRA FIXA INFERIOR EXCLUSIVA DO CELULAR (MOBILE-ONLY) ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: 'rgba(6, 10, 19, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 212, 255, 0.2)',
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.6)',
          padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Valor/hora</span>
            <span
              className="text-xl font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              R$ {p.hourlyRate}
            </span>
          </div>

          <button
            onClick={onRequest}
            className="btn-primary flex-1 py-3.5 px-4 text-sm font-bold rounded-xl"
          >
            <span>Solicitar Atendimento</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 3 — SOLICITAÇÃO DE ATENDIMENTO
   ════════════════════════════════════════════ */

function RequestScreen({ professional: p, onBack, onCreated }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('14:00');
  const [address, setAddress] = useState('Rua Bela Cintra, 1420, Apto 82 - Jardins, São Paulo');
  const [need, setNeed] = useState('');
  const [payment, setPayment] = useState('pix');
  const [loading, setLoading] = useState(false);

  // Cálculo preciso das horas entre início e fim
  const calculatedHours = useMemo(() => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const diffMinutes = endMinutes - startMinutes;
    const diffHours = +(diffMinutes / 60).toFixed(1);
    return diffHours;
  }, [start, end]);

  const totalValue = useMemo(() => {
    if (!p) return 0;
    return Math.round(calculatedHours * p.hourlyRate);
  }, [calculatedHours, p]);

  const submit = (e) => {
    e.preventDefault();
    if (!date || !start || !end || !address) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (calculatedHours <= 0) {
      alert('Por favor, informe um horário de término posterior ao horário de início.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onCreated({
        professional: p,
        date,
        startTime: start,
        endTime: end,
        durationHours: calculatedHours,
        address,
        need,
        totalValue,
        paymentMethod: payment,
      });
    }, 1200);
  };

  return (
    <div className="animate-slide-right max-w-4xl mx-auto pb-16">
      <BackButton onClick={onBack} label="Voltar ao perfil" />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Agendar Atendimento Domiciliar</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Defina o dia e o período desejado. O profissional saberá exatamente a duração que você precisa.
        </p>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── COLUNA ESQUERDA: FORMULÁRIO COMPLETO (7 COLUNAS) ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Profissional Selecionado */}
            <div className="glass-card-static p-4 rounded-2xl flex items-center gap-4 border-l-4 border-l-cyan-400">
              <ProfessionalAvatar
                src={p?.avatar || p?.image}
                name={p?.name}
                size={52}
                rounded="rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p?.name}</p>
                <p className="text-xs text-cyan-400 truncate">{p?.specialty}</p>
                <p className="text-[11px] text-slate-400">{p?.council}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase">Taxa</span>
                <span className="text-sm font-bold text-white">R$ {p?.hourlyRate}/h</span>
              </div>
            </div>

            {/* Período do Atendimento */}
            <div className="glass-card-static p-6 rounded-2xl space-y-4">
              <SectionTitle subtitle="Informe o dia e a janela exata de horas necessárias">
                Data e Horário do Atendimento
              </SectionTitle>

              {/* Campo Data */}
              <div>
                <Label required>Data do Atendimento</Label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                {date === todayStr && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Zap size={12} /> Solicitação com atendimento imediato para hoje!
                  </p>
                )}
              </div>

              {/* Grid de Horário de Início e Término */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Horário de Início</Label>
                  <input
                    type="time"
                    required
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label required>Horário de Término</Label>
                  <input
                    type="time"
                    required
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Box de Resumo da Duração Calculada */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                style={{
                  background: 'rgba(0, 212, 255, 0.08)',
                  borderColor: 'rgba(0, 212, 255, 0.25)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Duração Total Calculada: {calculatedHours} {calculatedHours === 1 ? 'hora' : 'horas'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Das {start} às {end} ({date})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400 block">
                    {calculatedHours}h × R$ {p?.hourlyRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Endereço e Necessidades */}
            <div className="glass-card-static p-6 rounded-2xl space-y-4">
              <SectionTitle subtitle="Onde o profissional deve comparecer e orientações iniciais">
                Localização & Detalhes Clínicos
              </SectionTitle>

              <div>
                <Label required>Endereço Completo</Label>
                <input
                  type="text"
                  required
                  placeholder="Rua / Avenida, Número, Complemento, Bairro e Cidade"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <Label>Orientações ou Necessidades Especiais (Opcional)</Label>
                <textarea
                  placeholder="Ex: Paciente acamado com cirurgia recente no joelho, necessita de curativo diário e auxílio na locomoção."
                  value={need}
                  onChange={e => setNeed(e.target.value)}
                  rows={3}
                  className="input-field resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

          {/* ── COLUNA DIREITA: RESUMO FINANCEIRO & PAGAMENTO (5 COLUNAS) ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Pagamento Seguro & Resumo de Valores */}
            <div className="glass-card-static p-6 rounded-2xl space-y-5">
              <SectionTitle subtitle="Seu valor fica retido com segurança">
                Forma de Pagamento
              </SectionTitle>

              {/* Alerta de Retenção e Segurança */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-start gap-3">
                <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  O valor de <strong>R$ {totalValue}</strong> fica em custódia e só é liberado para <strong className="text-white">{p?.name}</strong> após o atendimento ser concluído.
                </p>
              </div>

              {/* Seletor de Método de Pagamento */}
              <div className="grid grid-cols-2 gap-3">
                <PaymentOption
                  icon={<QrCode size={22} />}
                  label="PIX (Instantâneo)"
                  selected={payment === 'pix'}
                  onClick={() => setPayment('pix')}
                />
                <PaymentOption
                  icon={<CreditCard size={22} />}
                  label="Cartão de Crédito"
                  selected={payment === 'card'}
                  onClick={() => setPayment('card')}
                />
              </div>

              {/* Discriminativo Financeiro Detalhado */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Profissional:</span>
                  <span className="font-semibold text-white">{p?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span className="font-semibold text-white">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Período solicitado:</span>
                  <span className="font-semibold text-white">{start} às {end}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas contratadas:</span>
                  <span className="font-semibold text-cyan-400">{calculatedHours} horas</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor/hora:</span>
                  <span className="font-semibold text-white">R$ {p?.hourlyRate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxa de Intermediação:</span>
                  <span className="text-emerald-400 font-semibold">Grátis (Promoção)</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white">Total a Pagar:</span>
                  <span
                    className="text-2xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    R$ {totalValue}
                  </span>
                </div>
              </div>

              {/* Botão de Envio do Pedido */}
              <button
                type="submit"
                disabled={loading || calculatedHours <= 0}
                className="btn-primary w-full py-4 text-sm font-bold rounded-xl shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando Agendamento...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Confirmar e Agendar <CheckCircle2 size={18} />
                  </span>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Cancelamento gratuito com até 2 horas de antecedência.
              </p>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
      {children}
      {required && <span className="text-cyan-400 ml-1">*</span>}
    </label>
  );
}

function PaymentOption({ icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold gap-2 transition-all cursor-pointer ${
        selected
          ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-md'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════
   TELA 4 — MEUS PEDIDOS (DESKTOP + MOBILE)
   ════════════════════════════════════════════ */

function OrdersScreen({ orders, onChat, onFinalize, onNewSearch }) {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Meus Pedidos de Atendimento</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe o status dos plantões, fale com os profissionais e finalize os atendimentos.
          </p>
        </div>

        <button
          onClick={onNewSearch}
          className="btn-secondary text-xs py-2.5 px-4 rounded-xl self-start sm:self-auto"
        >
          <Search size={14} />
          <span>Buscar Novos Profissionais</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card-static text-center py-16 px-4 rounded-2xl border border-slate-800">
          <Clock size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum atendimento solicitado ainda</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Quando você solicitar um atendimento domiciliar, todos os detalhes, datas, horários e chat aparecerão nesta página.
          </p>
          <button onClick={onNewSearch} className="btn-primary text-xs py-2.5 px-5 rounded-xl">
            Encontrar um Cuidador ou Enfermeiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orders.map((o, idx) => (
            <div
              key={o.id}
              className={`glass-card-static rounded-2xl overflow-hidden border flex flex-col justify-between stagger-${idx + 1}`}
              style={{
                borderColor: o.status === 'Concluído' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 212, 255, 0.3)',
              }}
            >
              {/* Linha superior de cor indicativa */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: o.status === 'Concluído'
                    ? 'linear-gradient(90deg, #059669, #10B981)'
                    : 'linear-gradient(90deg, #2563EB, #00D4FF)',
                }}
              />

              <div className="p-5 space-y-4">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfessionalAvatar
                      src={o.professional.avatar || o.professional.image}
                      name={o.professional.name}
                      size={48}
                      rounded="rounded-xl"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{o.professional.name}</h3>
                      <p className="text-xs text-cyan-400">{o.professional.specialty}</p>
                      <p className="text-[11px] text-slate-400">{o.professional.council}</p>
                    </div>
                  </div>

                  <span className={`badge ${
                    o.status === 'Concluído' ? 'badge-status-done' :
                    o.status === 'Confirmado' ? 'badge-status-confirmed' :
                    'badge-status-waiting'
                  }`}>
                    {o.status}
                  </span>
                </div>

                {/* Dados da Programação */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-cyan-400 shrink-0" />
                    <span><strong>Data:</strong> {o.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-cyan-400 shrink-0" />
                    <span>
                      <strong>Horário:</strong> das {o.startTime} às {o.endTime || '--:--'}
                      {o.durationHours ? ` (${o.durationHours}h)` : ''}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span className="truncate"><strong>Local:</strong> {o.address}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total retido:</span>
                    <span className="font-bold text-cyan-300">R$ {o.totalValue}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-2">
                  {o.status === 'Confirmado' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onChat(o)}
                        className="btn-secondary text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={15} />
                        <span>Chat Direto</span>
                      </button>

                      <button
                        onClick={() => onFinalize(o)}
                        className="btn-success text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={15} />
                        <span>Concluir Serviço</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Atendimento Concluído & Liberado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 4b — CHAT COM O PROFISSIONAL
   ════════════════════════════════════════════ */

function ChatScreen({ order, onBack }) {
  const [msgs, setMsgs] = useState([
    {
      id: 1,
      text: `Olá! Confirmado o atendimento para o dia ${order?.date}, das ${order?.startTime} às ${order?.endTime} (${order?.durationHours || 4} horas de plantão).`,
      sender: 'pro',
      time: '08:30'
    },
    {
      id: 2,
      text: 'Perfeito! O endereço que está no aplicativo é o correto. Estamos aguardando você com os medicamentos prescritos já separados.',
      sender: 'user',
      time: '08:32'
    },
    {
      id: 3,
      text: 'Excelente! Chegarei 10 minutos antes com jaleco e equipamentos esterilizados. Qualquer dúvida, pode me mandar mensagem por aqui.',
      sender: 'pro',
      time: '08:35'
    },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMsgs(m => [...m, { id: Date.now(), text: input, sender: 'user', time: now }]);
    setInput('');

    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMsgs(m => [...m, {
        id: Date.now(),
        text: 'Combinado! Mensagem recebida. Estou a caminho e focado no melhor cuidado!',
        sender: 'pro',
        time: t
      }]);
    }, 1500);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header do Chat */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            <ChevronLeft size={20} />
          </button>

          <ProfessionalAvatar
            src={order?.professional?.avatar || order?.professional?.image}
            name={order?.professional?.name}
            size={40}
            rounded="rounded-xl"
          />

          <div>
            <h3 className="text-sm font-bold text-white">{order?.professional?.name}</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Online agora
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400 hidden sm:block">
          <span>Plantão em: <strong>{order?.date}</strong></span>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-3">
        {msgs.map(m => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <span className={`block text-[10px] text-right mt-1.5 ${m.sender === 'user' ? 'text-cyan-100/70' : 'text-slate-400'}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input de Mensagem */}
      <form onSubmit={send} className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Envie uma mensagem para o profissional..."
          className="input-field rounded-2xl"
        />
        <button
          type="submit"
          className="btn-primary rounded-2xl px-5 shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 5 — FINALIZAÇÃO & AVALIAÇÃO
   ════════════════════════════════════════════ */

function FinalizeScreen({ order, onBack, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onSubmit, 1800);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in text-center py-20 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Atendimento Concluído com Sucesso!</h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Sua avaliação foi registrada e o valor foi liberado com segurança ao profissional.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-bottom max-w-xl mx-auto pb-16">
      <BackButton onClick={onBack} label="Voltar aos pedidos" />

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
          <Award size={28} className="text-cyan-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Concluir e Avaliar Atendimento</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ao avaliar, você atesta que o atendimento ocorreu conforme o combinado e libera o valor em custódia.
        </p>
      </div>

      <div className="glass-card-static p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <ProfessionalAvatar
            src={order?.professional?.avatar || order?.professional?.image}
            name={order?.professional?.name}
            size={48}
            rounded="rounded-xl"
          />
          <div>
            <p className="text-sm font-bold text-white">{order?.professional?.name}</p>
            <p className="text-xs text-cyan-400">{order?.professional?.specialty}</p>
            <p className="text-[11px] text-slate-400">Total a liberar: <strong>R$ {order?.totalValue}</strong></p>
          </div>
        </div>

        {/* Avaliação em Estrelas */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Como foi a experiência da sua família?</p>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1.5 transition-transform hover:scale-125 cursor-pointer bg-transparent border-none"
              >
                <Star
                  size={36}
                  fill={(hoverRating || rating) >= s ? '#FBBF24' : 'transparent'}
                  color={(hoverRating || rating) >= s ? '#FBBF24' : '#475569'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-amber-400">
            {rating === 5 && 'Excepcional! Cuidado e dedicação impecáveis.'}
            {rating === 4 && 'Muito bom! Atendimento bem prestado.'}
            {rating === 3 && 'Atendimento satisfatório.'}
            {rating <= 2 && 'Deixe seu relato para apurarmos.'}
          </p>
        </div>

        {/* Comentário */}
        <div>
          <Label>Deixe um elogio ou relato para o profissional (Opcional)</Label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Ex: A profissional foi extremamente pontual, carinhosa com meu pai e cuidou de tudo com muita calma e perícia técnica."
            className="input-field resize-none leading-relaxed"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="btn-primary w-full py-4 text-sm font-bold rounded-xl"
        >
          <span>Liberar Pagamento e Enviar Avaliação</span>
          <Heart size={16} />
        </button>
      </div>
    </div>
  );
}