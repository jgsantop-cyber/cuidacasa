import React, { useState, useRef, useEffect } from 'react';
import {
  Search, MapPin, MessageCircle, Star, ShieldCheck, Clock,
  CreditCard, QrCode, CheckCircle2, ChevronLeft, Send,
  ChevronRight, Filter, Zap, Heart, X, ArrowRight
} from 'lucide-react';
import { professionalsData } from './mock/professionals';

/* ════════════════════════════════════════════
   APP PRINCIPAL
   ════════════════════════════════════════════ */

export default function App() {
  const [fontScale, setFontScale] = useState(1);
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.fontSize = `${16 * fontScale}px`;
    }
  }, [fontScale]);

  const cycleFontSize = () =>
    setFontScale(prev => (prev >= 1.3 ? 1 : +(prev + 0.15).toFixed(2)));

  const [screen, setScreen] = useState('home');
  const [selectedPro, setSelectedPro] = useState(null);
  const [orders, setOrders] = useState([]);
  const [chatOrder, setChatOrder] = useState(null);
  const [finalizeOrder, setFinalizeOrder] = useState(null);

  const nav = (s) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-grid" style={{ background: 'var(--bg-primary)' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6, 10, 19, 0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #00D4FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 212, 255, 0.25)',
            }}>
              <HeartPulseIcon style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <span style={{
              fontWeight: 800, fontSize: '1.15rem',
              background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}>
              CuidaCasa
            </span>
          </div>

          <button
            onClick={cycleFontSize}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: fontScale > 1 ? 'var(--accent)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.25s',
              fontSize: '0.8rem', fontWeight: 700,
            }}
            title={`Fonte: ${Math.round(fontScale * 100)}%`}
            aria-label="Aumentar tamanho da fonte"
          >
            A+
          </button>
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 100px' }}>
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
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(6, 10, 19, 0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        }}>
          <NavBtn icon={<Search size={22} />} label="Buscar" active={screen === 'home'} onClick={() => nav('home')} />
          <NavBtn icon={<Clock size={22} />} label="Pedidos" active={screen === 'orders'} onClick={() => nav('orders')} badge={orders.filter(o => o.status === 'Confirmado').length || null} />
        </div>
      </nav>
    </div>
  );
}

/* ════════════════════════════════════════════
   COMPONENTES AUXILIARES
   ════════════════════════════════════════════ */

function NavBtn({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, padding: '6px 20px', border: 'none', background: 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      cursor: 'pointer', transition: 'color 0.2s', position: 'relative',
    }}>
      {badge && (
        <span style={{
          position: 'absolute', top: 2, right: 14,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--danger)', color: 'white',
          fontSize: '0.6rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{badge}</span>
      )}
      {icon}
      <span style={{
        fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>{label}</span>
      {active && <span style={{
        width: 20, height: 3, borderRadius: 2,
        background: 'var(--accent)', marginTop: 2,
      }} />}
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

function BackButton({ onClick, label = 'Voltar' }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'none', border: 'none', color: 'var(--text-secondary)',
      cursor: 'pointer', padding: '8px 0', marginBottom: 16,
      fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
    >
      <ChevronLeft size={18} /> {label}
    </button>
  );
}

function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= rating ? '#FBBF24' : 'transparent'}
          color={i <= rating ? '#FBBF24' : '#475569'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{
      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'var(--text-muted)',
      marginBottom: 12, paddingBottom: 8,
      borderBottom: '1px solid var(--border)',
    }}>{children}</h3>
  );
}

/* ════════════════════════════════════════════
   TELA 1 — HOME / BUSCA
   ════════════════════════════════════════════ */

function HomeScreen({ professionals, onSelect }) {
  const [search, setSearch] = useState('');
  const [distance, setDistance] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = professionals.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q);
    const matchDist = !distance || parseFloat(p.distance) <= parseFloat(distance);
    const matchAvail = !availableOnly || p.available;
    return matchSearch && matchDist && matchAvail;
  });

  return (
    <div className="animate-fade-in-up">
      {/* Hero section */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 6, lineHeight: 1.15 }}>
          Encontre quem cuida
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            da sua família.
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Profissionais verificados, a poucos cliques de distância.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={18} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          type="text" placeholder="Buscar por especialidade ou nome..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: 42, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <select
          value={distance} onChange={e => setDistance(e.target.value)}
          className="select-field"
          style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}
        >
          <option value="">Distância: Todas</option>
          <option value="3">Até 3 km</option>
          <option value="5">Até 5 km</option>
          <option value="10">Até 10 km</option>
        </select>
        <button
          onClick={() => setAvailableOnly(!availableOnly)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            border: `1px solid ${availableOnly ? 'var(--accent)' : 'var(--border)'}`,
            background: availableOnly ? 'var(--accent-glow)' : 'var(--bg-card)',
            color: availableOnly ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
            transition: 'all 0.25s', whiteSpace: 'nowrap',
          }}
        >
          <Zap size={14} /> Agora
        </button>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length > 0 ? (
          filtered.map((p, idx) => (
            <div key={p.id}
              className={`glass-card animate-fade-in-up stagger-${idx + 1}`}
              style={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => onSelect(p)}
            >
              <div style={{ padding: 18, display: 'flex', gap: 16 }}>
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={p.image} alt={p.name} style={{
                    width: 72, height: 72, borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '2px solid var(--border)',
                  }} />
                  {p.available && (
                    <div style={{
                      position: 'absolute', bottom: -3, right: -3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--success)',
                      border: '3px solid var(--bg-card)',
                      boxShadow: '0 0 8px var(--success-glow)',
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{p.name}</h3>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 700, color: '#FBBF24',
                    }}>
                      <Star size={11} fill="#FBBF24" color="#FBBF24" /> {p.rating}
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 0 8px' }}>{p.specialty}</p>

                  {p.isVerified && (
                    <span className="badge badge-verified" style={{ marginBottom: 10, display: 'inline-flex' }}>
                      <ShieldCheck size={11} /> Verificado
                    </span>
                  )}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    paddingTop: 10, borderTop: '1px solid var(--border)',
                    marginTop: 4,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {p.distance} km
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>a partir de</span>
                      <span style={{
                        fontSize: '1.05rem', fontWeight: 800,
                        background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>R$ {p.hourlyRate}<span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/h</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card-static" style={{
            padding: '48px 24px', textAlign: 'center',
            border: '1px dashed var(--border)',
          }}>
            <Search size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum profissional encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 2 — PERFIL DO PROFISSIONAL
   ════════════════════════════════════════════ */

function ProfileScreen({ professional: p, onBack, onRequest }) {
  if (!p) return null;
  const avgRating = (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1);

  return (
    <div className="animate-slide-right">
      <BackButton onClick={onBack} />

      {/* Header Card */}
      <div className="glass-card-static" style={{ overflow: 'hidden', marginBottom: 20 }}>
        {/* Gradient Banner */}
        <div style={{
          height: 80,
          background: 'linear-gradient(135deg, #0B101D 0%, #1E3A5F 50%, #0B101D 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.12), transparent 70%)',
          }} />
        </div>

        <div style={{ padding: '0 24px 24px', position: 'relative' }}>
          {/* Avatar */}
          <img src={p.image} alt={p.name} style={{
            width: 88, height: 88, borderRadius: 'var(--radius-lg)',
            objectFit: 'cover',
            border: '4px solid var(--bg-card)',
            marginTop: -44, position: 'relative',
            boxShadow: 'var(--shadow-lg)',
          }} />

          {/* Rating floating */}
          <div style={{
            position: 'absolute', top: -20, right: 24,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            padding: '8px 14px', borderRadius: 'var(--radius-full)',
            backdropFilter: 'blur(8px)',
          }}>
            <Star size={16} fill="#FBBF24" color="#FBBF24" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FBBF24' }}>{avgRating}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({p.reviews.length})</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px' }}>{p.name}</h2>
            <p style={{
              fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 12px',
              color: 'var(--accent)',
            }}>{p.specialty}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.isVerified && (
                <span className="badge badge-verified">
                  <ShieldCheck size={11} /> COREN/CREFITO
                </span>
              )}
              <span className="badge" style={{
                color: 'var(--text-secondary)',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border)',
              }}>
                <Clock size={11} /> {p.experience}
              </span>
              {p.available && (
                <span className="badge badge-available">
                  <Zap size={11} /> Disponível
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="glass-card-static animate-fade-in-up stagger-1" style={{ padding: 20, marginBottom: 20 }}>
        <SectionTitle>Áreas de Atuação</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.areas.map((a, i) => (
            <span key={i} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              fontSize: '0.8125rem', color: 'var(--text-primary)',
              fontWeight: 500,
            }}>{a}</span>
          ))}
        </div>
      </div>

      {/* Avaliações */}
      <div className="animate-fade-in-up stagger-2" style={{ marginBottom: 100 }}>
        <SectionTitle>Avaliações das Famílias</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {p.reviews.map((r, i) => (
            <div key={i} className="glass-card-static" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.user}</span>
                <StarRating rating={r.rating} size={12} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA fixo */}
      <div style={{
        position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 45,
        background: 'rgba(6, 10, 19, 0.95)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        padding: '14px 20px',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Valor/hora</span>
            <p style={{
              fontSize: '1.25rem', fontWeight: 800, margin: 0,
              background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>R$ {p.hourlyRate}</p>
          </div>
          <button onClick={onRequest} className="btn-primary" style={{ flex: 1, padding: '14px 20px', fontSize: '0.9375rem' }}>
            Solicitar Atendimento <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 3 — SOLICITAÇÃO + CHECKOUT SIMULADO
   ════════════════════════════════════════════ */

function RequestScreen({ professional: p, onBack, onCreated }) {
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [address, setAddress] = useState('');
  const [need, setNeed] = useState('');
  const [payment, setPayment] = useState('pix');
  const [loading, setLoading] = useState(false);

  const hours = 4;
  const total = p ? p.hourlyRate * hours : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!date || !start || !address) return;
    setLoading(true);
    setTimeout(() => {
      onCreated({ professional: p, date, startTime: start, endTime: end, address, need, totalValue: total, paymentMethod: payment });
    }, 1800);
  };

  return (
    <div className="animate-slide-right">
      <BackButton onClick={onBack} label="Voltar ao perfil" />
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Agendar Atendimento</h1>

      {/* Profissional selecionado */}
      <div className="glass-card-static" style={{
        padding: 16, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
        borderLeft: '3px solid var(--accent)',
      }}>
        <img src={p?.image} alt="" style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          objectFit: 'cover', border: '2px solid var(--border)',
        }} />
        <div>
          <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.9375rem' }}>{p?.name}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>{p?.specialty}</p>
        </div>
      </div>

      <form onSubmit={submit}>
        {/* Detalhes */}
        <div className="glass-card-static" style={{ padding: 20, marginBottom: 20 }}>
          <SectionTitle>Detalhes do Serviço</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <Label>Data</Label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <Label>Horário</Label>
              <input type="time" required value={start} onChange={e => setStart(e.target.value)} className="input-field" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label>Endereço Completo</Label>
            <input type="text" required placeholder="Rua, Nº, Bairro, Cidade" value={address} onChange={e => setAddress(e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Descrição da necessidade (Opcional)</Label>
            <textarea
              placeholder="Ex: Idoso com mobilidade reduzida, pós-cirurgia de quadril..."
              value={need} onChange={e => setNeed(e.target.value)}
              rows={3} className="input-field" style={{ resize: 'none', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Pagamento */}
        <div className="glass-card-static" style={{ padding: 20, marginBottom: 20 }}>
          <SectionTitle>Pagamento Seguro</SectionTitle>

          {/* Alerta */}
          <div style={{
            display: 'flex', gap: 12, padding: 14, borderRadius: 'var(--radius-md)',
            background: 'var(--accent-glow)',
            border: '1px solid var(--border-accent)',
            marginBottom: 16,
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
              O valor fica <strong style={{ color: 'var(--accent)' }}>retido com o CuidaCasa</strong> e só é liberado ao profissional após sua confirmação de conclusão do serviço.
            </p>
          </div>

          {/* Método */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <PaymentOption icon={<QrCode size={24} />} label="PIX" selected={payment === 'pix'} onClick={() => setPayment('pix')} />
            <PaymentOption icon={<CreditCard size={24} />} label="Cartão" selected={payment === 'card'} onClick={() => setPayment('card')} />
          </div>

          {/* Resumo */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: 16, border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>Valor por hora</span><span>R$ {p?.hourlyRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>Duração estimada</span><span>~{hours}h</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 12, borderTop: '1px solid var(--border)',
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total a reter</span>
              <span style={{
                fontSize: '1.35rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #00D4FF, #60A5FA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>R$ {total}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px 20px', fontSize: '1rem' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="animate-spin" style={{
                width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
              Processando...
            </span>
          ) : (
            <>Confirmar e Pagar <CheckCircle2 size={18} /></>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.6875rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--text-muted)', marginBottom: 6,
    }}>{children}</label>
  );
}

function PaymentOption({ icon, label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      padding: 16, borderRadius: 'var(--radius-md)',
      border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      background: selected ? 'var(--accent-glow)' : 'var(--bg-card)',
      color: selected ? 'var(--accent)' : 'var(--text-secondary)',
      cursor: 'pointer', transition: 'all 0.25s',
    }}>
      {icon}
      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════
   TELA 4 — MEUS PEDIDOS
   ════════════════════════════════════════════ */

function OrdersScreen({ orders, onChat, onFinalize }) {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Clock size={28} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Nenhum pedido ativo</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Suas solicitações de atendimento aparecerão aqui.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((o, idx) => (
            <div key={o.id} className={`glass-card-static animate-fade-in-up stagger-${idx + 1}`}
              style={{ overflow: 'hidden' }}
            >
              {/* Accent border */}
              <div style={{
                height: 3,
                background: o.status === 'Concluído'
                  ? 'linear-gradient(90deg, #059669, #10B981)'
                  : 'linear-gradient(90deg, #2563EB, #00D4FF)',
              }} />

              <div style={{ padding: 18 }}>
                {/* Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={o.professional.image} alt="" style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      objectFit: 'cover', border: '2px solid var(--border)',
                    }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', margin: '0 0 2px' }}>{o.professional.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{o.professional.specialty}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    o.status === 'Concluído' ? 'badge-status-done' :
                    o.status === 'Confirmado' ? 'badge-status-confirmed' :
                    'badge-status-waiting'
                  }`}>{o.status}</span>
                </div>

                {/* Details */}
                <div style={{
                  background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                  padding: 12, marginBottom: 14, fontSize: '0.8125rem', lineHeight: 1.7,
                  border: '1px solid var(--border)',
                }}>
                  <p style={{ margin: 0 }}><span style={{ color: 'var(--text-muted)' }}>Data:</span> {o.date}</p>
                  <p style={{ margin: 0 }}><span style={{ color: 'var(--text-muted)' }}>Horário:</span> {o.startTime}</p>
                  <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Local:</span> {o.address}
                  </p>
                </div>

                {/* Actions */}
                {o.status === 'Confirmado' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => onChat(o)} className="btn-secondary" style={{ flex: 1, padding: '10px 14px', fontSize: '0.8125rem' }}>
                      <MessageCircle size={16} /> Chat
                    </button>
                    <button onClick={() => onFinalize(o)} className="btn-success" style={{ flex: 1, padding: '10px 14px', fontSize: '0.8125rem' }}>
                      <CheckCircle2 size={16} /> Finalizar
                    </button>
                  </div>
                )}
                {o.status === 'Concluído' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 'var(--radius-md)',
                    background: 'var(--success-glow)',
                    color: 'var(--success)',
                    fontSize: '0.8125rem', fontWeight: 600,
                  }}>
                    <CheckCircle2 size={16} /> Serviço Finalizado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 4b — CHAT
   ════════════════════════════════════════════ */

function ChatScreen({ order, onBack }) {
  const [msgs, setMsgs] = useState([
    { id: 1, text: `Olá! Confirmo o atendimento para ${order?.date} às ${order?.startTime}. Estarei aí com 10 minutos de antecedência.`, sender: 'pro', time: '10:00' },
    { id: 2, text: 'Perfeito! O endereço que está no app é o correto. Obrigado!', sender: 'user', time: '10:02' },
    { id: 3, text: 'Ótimo, já conferi. Até lá! Qualquer dúvida estou à disposição.', sender: 'pro', time: '10:04' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMsgs(m => [...m, { id: Date.now(), text: input, sender: 'user', time: now }]);
    setInput('');
    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMsgs(m => [...m, { id: Date.now(), text: 'Entendido! Fico à disposição 😊', sender: 'pro', time: t }]);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', marginTop: -20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 0', borderBottom: '1px solid var(--border)',
        marginBottom: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', padding: 4,
        }}><ChevronLeft size={20} /></button>
        <img src={order?.professional?.image} alt="" style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          objectFit: 'cover', border: '2px solid var(--border)',
        }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{order?.professional?.name}</p>
          <p style={{
            fontSize: '0.6875rem', margin: 0, color: 'var(--success)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.map(m => (
            <div key={m.id} style={{
              display: 'flex',
              justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px',
                borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.sender === 'user'
                  ? 'linear-gradient(135deg, #2563EB, #0891B2)'
                  : 'var(--bg-elevated)',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                color: 'var(--text-primary)',
                boxShadow: m.sender === 'user' ? '0 2px 12px rgba(0,212,255,0.15)' : 'var(--shadow-sm)',
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{m.text}</p>
                <p style={{
                  margin: '4px 0 0', fontSize: '0.625rem', textAlign: 'right',
                  color: m.sender === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)',
                }}>{m.time}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={send} style={{
        display: 'flex', gap: 10, padding: '12px 0',
        borderTop: '1px solid var(--border)',
      }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="input-field"
          style={{
            flex: 1, borderRadius: 'var(--radius-full)', padding: '12px 18px',
            background: 'var(--bg-card)',
          }}
        />
        <button type="submit" style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB, #00D4FF)',
          border: 'none', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s',
          boxShadow: '0 2px 12px rgba(0,212,255,0.25)',
        }}>
          <Send size={18} style={{ marginLeft: 2 }} />
        </button>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════
   TELA 5 — FINALIZAÇÃO E AVALIAÇÃO
   ════════════════════════════════════════════ */

function FinalizeScreen({ order, onBack, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onSubmit, 2000);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in-up" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--success-glow)',
          border: '2px solid var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Obrigado!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sua avaliação foi enviada e o pagamento está sendo liberado.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-bottom">
      <BackButton onClick={onBack} />

      {/* Success indicator */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--success-glow)',
          border: '2px solid var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>Serviço Concluído!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          O valor retido será liberado ao profissional após sua avaliação.
        </p>
      </div>

      {/* Rating Card */}
      <div className="glass-card-static" style={{ padding: 24 }}>
        <h3 style={{ textAlign: 'center', fontSize: '0.9375rem', fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>
          Como foi o atendimento de <span style={{ color: 'var(--accent)' }}>{order?.professional?.name}</span>?
        </h3>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                transform: `scale(${(hoverRating || rating) >= s ? 1.15 : 1})`,
                transition: 'transform 0.2s',
              }}
            >
              <Star size={36}
                fill={(hoverRating || rating) >= s ? '#FBBF24' : 'transparent'}
                color={(hoverRating || rating) >= s ? '#FBBF24' : '#475569'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 16 }}>
            {rating <= 2 ? 'Que pena! Conte-nos o que aconteceu.' : rating <= 4 ? 'Bom! Obrigado pelo feedback.' : 'Excelente! Ficamos felizes! 🎉'}
          </p>
        )}

        <div style={{ marginBottom: 20 }}>
          <Label>Deixe um comentário (Opcional)</Label>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)}
            rows={3} placeholder="Como foi o cuidado com a sua família?"
            className="input-field" style={{ resize: 'none', lineHeight: 1.6, textAlign: 'center' }}
          />
        </div>

        <button onClick={handleSubmit} disabled={rating === 0} className="btn-primary" style={{ width: '100%', padding: '14px 20px', fontSize: '0.9375rem' }}>
          Liberar Pagamento e Avaliar <Heart size={16} />
        </button>
      </div>
    </div>
  );
}