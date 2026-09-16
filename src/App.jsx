import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, MessageCircle, Star, ShieldCheck, UserPlus, Clock, CreditCard, QrCode, CheckCircle2, ChevronLeft, Send } from 'lucide-react';
import { professionalsData } from './mock/professionals';

export default function App() {
  const [fontSize, setFontSize] = useState(1);
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.fontSize = `${14 * fontSize}px`;
    }
  }, [fontSize]);

  const increaseFontSize = () => setFontSize(prev => prev < 1.4 ? prev + 0.1 : 1);

  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [orderToFinalize, setOrderToFinalize] = useState(null);

  const professionals = professionalsData;

  const navigateTo = (screen) => setCurrentScreen(screen);

  return (
    <div ref={rootRef} className="min-h-screen bg-[var(--bg)] text-[var(--text)] min-w-[360px] pb-20">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-4 mb-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xl">
            <HeartPulseIcon className="w-6 h-6" />
            CuidaCasa
          </div>
          <button
            onClick={increaseFontSize}
            className="p-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            title="Aumentar tamanho da fonte"
            aria-label="Aumentar tamanho da fonte"
          >
            <span className="font-bold flex items-center gap-1 text-sm">
              A <span className="text-xs">+</span>
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4">
        {currentScreen === 'home' && (
          <HomeScreen 
            professionals={professionals} 
            onSelectProfessional={(prof) => {
              setSelectedProfessional(prof);
              navigateTo('profile');
            }} 
          />
        )}
        
        {currentScreen === 'profile' && (
          <ProfessionalProfile 
            professional={selectedProfessional} 
            onBack={() => navigateTo('home')}
            onRequest={() => navigateTo('request')} 
          />
        )}
        
        {currentScreen === 'request' && (
          <RequestScreen 
            professional={selectedProfessional}
            onBack={() => navigateTo('profile')}
            onOrderCreated={(order) => {
              const newOrders = [{ ...order, status: 'Confirmado', id: Date.now() }, ...orders];
              setOrders(newOrders);
              navigateTo('orders');
            }} 
          />
        )}
        
        {currentScreen === 'orders' && (
          <OrdersScreen 
            orders={orders} 
            onOpenChat={(order) => {
              setActiveChatOrder(order);
              navigateTo('chat');
            }}
            onFinalize={(order) => {
              setOrderToFinalize(order);
              navigateTo('finalization');
            }}
          />
        )}
        
        {currentScreen === 'chat' && (
          <ChatScreen 
            order={activeChatOrder} 
            onBack={() => navigateTo('orders')} 
          />
        )}

        {currentScreen === 'finalization' && (
          <FinalizationScreen 
            order={orderToFinalize}
            onRatingSubmit={(rating, comment) => {
              setOrders(orders.map(o => o.id === orderToFinalize.id ? { ...o, status: 'Concluído' } : o));
              navigateTo('orders');
            }} 
            onBack={() => navigateTo('orders')}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] z-40 pb-safe">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => navigateTo('home')}
            className={`flex flex-col items-center py-3 px-4 flex-1 ${currentScreen === 'home' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white transition-colors'}`}
          >
            <Search className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Buscar</span>
          </button>
          <button 
            onClick={() => navigateTo('orders')}
            className={`flex flex-col items-center py-3 px-4 flex-1 ${currentScreen === 'orders' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white transition-colors'}`}
          >
            <Clock className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Pedidos</span>
          </button>
        </div>
      </nav>
    </div>
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

function HomeScreen({ professionals, onSelectProfessional }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(false);

  const filteredProfessionals = professionals.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || p.specialty.toLowerCase().includes(term);
    const matchesDistance = !distanceFilter || parseFloat(p.distance) <= parseFloat(distanceFilter);
    const matchesAvailability = !availabilityFilter || p.available;
    return matchesSearch && matchesDistance && matchesAvailability;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold mb-2">Cuidadores de Confiança</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6">Encontre o profissional ideal para sua família.</p>
      
      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar especialidade (ex: Enfermeiro, Cuidador)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="select-field text-sm"
            >
              <option value="">Distância: Qualquer</option>
              <option value="5">Até 5km</option>
              <option value="10">Até 10km</option>
              <option value="20">Até 20km</option>
            </select>
          </div>
          
          <button
            onClick={() => setAvailabilityFilter(!availabilityFilter)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              availabilityFilter 
                ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]' 
                : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Agora
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((prof) => (
            <div key={prof.id} className="card overflow-hidden cursor-pointer group" onClick={() => onSelectProfessional(prof)}>
              <div className="p-4 flex gap-4">
                <div className="relative">
                  <img src={prof.image} alt={prof.name} className="w-20 h-20 rounded-xl object-cover border border-[var(--border)]" />
                  {prof.available && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--success)] rounded-full border-2 border-[var(--card)]" title="Disponível agora"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors">{prof.name}</h3>
                    <div className="flex items-center gap-1 text-sm bg-[var(--bg)] px-2 py-0.5 rounded-md text-yellow-400 font-medium border border-[#334155]/50">
                      <Star className="h-3 w-3 fill-current" />
                      {prof.rating}
                    </div>
                  </div>
                  
                  <p className="text-[var(--text-muted)] text-sm mb-2">{prof.specialty}</p>
                  
                  {prof.isVerified && (
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[var(--accent)] bg-[var(--accent)]/10 w-fit px-2 py-1 rounded mb-2">
                      <ShieldCheck className="h-3 w-3" />
                      COREN/CREFITO Verificado
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end mt-3 border-t border-[var(--border)]/50 pt-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin className="h-3 w-3" />
                      {prof.distance} km
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[var(--text-muted)]">A partir de</span>
                      <p className="text-[var(--accent)] font-bold">R$ {prof.hourlyRate}<span className="text-xs font-normal">/h</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 card border-dashed">
            <Search className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-muted)]">Nenhum profissional encontrado com esses filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalProfile({ professional, onBack, onRequest }) {
  if (!professional) return null;
  
  return (
    <div className="animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-4 -ml-2 p-2">
        <ChevronLeft className="w-5 h-5" />
        Voltar
      </button>
      
      <div className="card overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-[#1E293B] to-[#0F172A] relative"></div>
        <div className="px-5 pb-5 relative">
          <img 
            src={professional.image} 
            alt={professional.name} 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-[var(--card)] absolute -top-12 shadow-lg" 
          />
          
          <div className="flex justify-end pt-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-lg font-bold border border-yellow-400/20">
              <Star className="h-4 w-4 fill-current" />
              {professional.rating}
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{professional.name}</h2>
            <p className="text-[var(--accent)] font-medium mb-3">{professional.specialty}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {professional.isVerified && (
                <span className="flex items-center gap-1 text-[11px] uppercase font-bold text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded border border-[var(--success)]/20">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] uppercase font-bold text-[var(--text-muted)] bg-[var(--bg)] px-2 py-1 rounded border border-[var(--border)]">
                <Clock className="h-3 w-3" /> {professional.experience}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-[var(--text-muted)] uppercase tracking-wider">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {professional.areas.map((area, index) => (
                  <span key={index} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] text-sm border border-[var(--border)]">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Avaliações das Famílias</h3>
        <div className="space-y-3">
          {professional.reviews.map((review, index) => (
            <div key={index} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{review.user}</p>
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg)] border-t border-[var(--border)] z-50 mb-[68px]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Valor hora</p>
            <p className="text-xl font-bold text-[var(--accent)]">R$ {professional.hourlyRate}</p>
          </div>
          <button onClick={onRequest} className="btn-primary flex-1 py-3 text-lg">
            Solicitar Atendimento
          </button>
        </div>
      </div>
      {/* spacer for fixed bottom bar */}
      <div className="h-20"></div>
    </div>
  );
}

function RequestScreen({ professional, onBack, onOrderCreated }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [address, setAddress] = useState('');
  const [need, setNeed] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate simulated value (e.g. 4 hours)
  const durationHours = 4;
  const totalValue = professional ? professional.hourlyRate * durationHours : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !address) return;
    
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      onOrderCreated({
        professional,
        date,
        startTime,
        endTime,
        address,
        need,
        totalValue,
        paymentMethod
      });
    }, 1500);
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-4 -ml-2 p-2">
        <ChevronLeft className="w-5 h-5" />
        Voltar ao perfil
      </button>

      <h1 className="text-2xl font-bold mb-6">Agendar Atendimento</h1>
      
      <div className="card p-4 mb-6 flex items-center gap-4 bg-[#1E293B] border-[#334155]">
        <img src={professional?.image} className="w-12 h-12 rounded-full object-cover border border-[var(--border)]" alt="" />
        <div>
          <p className="font-semibold">{professional?.name}</p>
          <p className="text-[var(--text-muted)] text-sm">{professional?.specialty}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-[var(--border)] pb-2">Detalhes do Serviço</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1.5 block">Data</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1.5 block">Início</label>
              <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1.5 block">Endereço Completo</label>
            <input type="text" required placeholder="Rua, Número, Complemento, Bairro" value={address} onChange={e => setAddress(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1.5 block">Descrição da Necessidade (Opcional)</label>
            <textarea 
              placeholder="Ex: Idoso com mobilidade reduzida, necessita de banho de leito e medicação às 14h."
              value={need} onChange={e => setNeed(e.target.value)} 
              rows={3} className="input-field resize-none text-sm"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold border-b border-[var(--border)] pb-2">Pagamento Seguro</h3>
          
          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg p-3 flex gap-3 text-sm text-[var(--accent-dark)]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[var(--accent)]" />
            <p className="text-[var(--text)] text-xs">
              O valor fica <span className="font-bold text-[var(--accent)]">retido com o CuidaCasa</span>. O dinheiro só é liberado ao profissional após a conclusão do serviço e sua aprovação.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'pix' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]'}`}
            >
              <QrCode className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">PIX</span>
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]'}`}
            >
              <CreditCard className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Cartão</span>
            </button>
          </div>

          <div className="card p-4 bg-[#1E293B]">
            <div className="flex justify-between mb-2 text-sm text-[var(--text-muted)]">
              <span>Valor por hora</span>
              <span>R$ {professional?.hourlyRate}</span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-[var(--text-muted)]">
              <span>Duração estimada</span>
              <span>~{durationHours}h</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[var(--border)]">
              <span className="font-medium">Total a reter</span>
              <span className="font-bold text-xl text-[var(--accent)]">R$ {totalValue}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-lg mt-8 flex justify-center items-center gap-2">
          {isSubmitting ? (
            <span className="animate-pulse">Processando...</span>
          ) : (
            <>Pagar e Solicitar <CheckCircle2 className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </div>
  );
}

function OrdersScreen({ orders, onOpenChat, onFinalize }) {
  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-[var(--text-muted)]">Nenhum pedido ativo</h3>
          <p className="text-sm text-[#64748B] mt-2">Suas solicitações de atendimento aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5 border-l-4 border-l-[var(--accent)]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={order.professional.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold">{order.professional.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{order.professional.specialty}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  order.status === 'Confirmado' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
                  order.status === 'Concluído' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="bg-[var(--bg)] rounded-lg p-3 text-sm mb-4 border border-[var(--border)]">
                <p><span className="text-[var(--text-muted)]">Data:</span> {order.date}</p>
                <p><span className="text-[var(--text-muted)]">Horário:</span> {order.startTime}</p>
                <p className="truncate"><span className="text-[var(--text-muted)]">Endereço:</span> {order.address}</p>
              </div>

              {order.status === 'Confirmado' && (
                <div className="flex gap-3">
                  <button onClick={() => onOpenChat(order)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Chat
                  </button>
                  <button onClick={() => onFinalize(order)} className="flex-1 btn-primary bg-gradient-to-r from-[var(--success)] to-emerald-400 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20">
                    Finalizar Serviço
                  </button>
                </div>
              )}
              {order.status === 'Concluído' && (
                <button className="w-full btn-secondary opacity-50 cursor-not-allowed" disabled>
                  Serviço Finalizado
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatScreen({ order, onBack }) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Olá! Confirmo nosso atendimento para o dia ${order?.date} às ${order?.startTime}.`, sender: 'prof', time: '10:00' },
    { id: 2, text: 'Muito obrigado! O endereço está correto no aplicativo?', sender: 'user', time: '10:05' },
    { id: 3, text: 'Sim, já conferi. Chegarei com 10 minutos de antecedência.', sender: 'prof', time: '10:07' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setNewMessage('');
    
    // Auto-reply mock
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text: 'Entendido. Estou à disposição.', sender: 'prof', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[85vh] -mt-6">
      <div className="bg-[var(--card)] p-4 flex items-center gap-3 border-b border-[var(--border)] sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <img src={order?.professional?.image} className="w-10 h-10 rounded-full object-cover" alt="" />
        <div>
          <h3 className="font-semibold text-sm">{order?.professional?.name}</h3>
          <p className="text-[10px] text-[var(--success)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] block"></span> Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-[var(--accent)] text-[#0B101D] rounded-tr-sm' 
                : 'bg-[#1E293B] text-white border border-[#334155] rounded-tl-sm'
            }`}>
              <p className="text-sm font-medium">{msg.text}</p>
              <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-black/50' : 'text-[#94A3B8]'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[var(--card)] border-t border-[var(--border)] flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="input-field bg-[var(--bg)] border-none rounded-full px-5"
        />
        <button type="submit" className="w-12 h-12 rounded-full bg-[var(--accent)] text-[#0B101D] flex items-center justify-center shrink-0 hover:bg-[#00D4FF]/80 transition-colors">
          <Send className="w-5 h-5 ml-1" />
        </button>
      </form>
    </div>
  );
}

function FinalizationScreen({ order, onRatingSubmit, onBack }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-6 -ml-2 p-2">
        <ChevronLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--success)]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[var(--success)] text-[var(--success)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Serviço Finalizado!</h1>
        <p className="text-[var(--text-muted)] mt-2">O valor retido agora será liberado para o profissional.</p>
      </div>
      
      <div className="card p-6 border-t-4 border-t-[var(--accent)]">
        <h3 className="font-semibold text-center mb-6">Avalie o atendimento de {order?.professional?.name}</h3>
        
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
              <Star className={`w-10 h-10 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-[#334155]'}`} />
            </button>
          ))}
        </div>
        
        <div className="mb-6">
          <label className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2 block text-center">
            Deixe um elogio (Opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Como foi o cuidado com a sua família?"
            className="input-field text-center resize-none bg-[#0B101D]/50"
          ></textarea>
        </div>
        
        <button
          onClick={() => onRatingSubmit(rating, comment)}
          disabled={rating === 0}
          className="btn-primary w-full py-3"
        >
          Enviar Avaliação e Concluir
        </button>
      </div>
    </div>
  );
}