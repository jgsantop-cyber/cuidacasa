import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, MessageCircle, Star, Trash2, Heart, Shield, UserPlus } from 'lucide-react';
import { professionalsData } from './mock/professionals';

export default function App() {
  const [fontSize, setFontSize] = useState(1);
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.fontSize = `${14 * fontSize}px`;
    }
  }, [fontSize]);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 1, 2));

  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  const professionals = professionalsData;

  const screenConfigs = {
    home: 'Home / Busca de Profissionais',
    profile: 'Perfil do Profissional',
    request: 'Solicitação e Pagamento',
    orders: 'Meus Pedidos & Chat',
    finalization: 'Finalização e Avaliação',
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] min-w-[360px]"
    >
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Font Size Accessibility Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={increaseFont}
            className="p-2 rounded-md bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Aumentar tamanho da fonte"
          >
            {fontSize < 2 ? 'A+' : 'A++'}
            <Search className="ml-1 h-4 w-4" />
          </button>
          
          <span className="text-xs text-[var(--text-muted)]">
            Tamanho da fonte: {' '.repeat(3)}12px {' '.repeat(3)}14px {' '.repeat(3)}16px{' '.repeat(3)}18px{' '.repeat(3)}20px
          </span>
        </div>

        {/* Screen Navigation */}
        <div className="mb-6 flex space-x-2">
          {Object.keys(screenConfigs).map((key) => (
            <button
              key={key}
              onClick={() => setCurrentScreen(key)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                currentScreen === key
                  ? 'bg-[var(--accent)] text-[var(--bg)]'
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            >
              {screenConfigs[key]}
            </button>
          ))}
        </div>

        {/* Screen Content */}
        <div className="mt-8">
          {currentScreen === 'home' && <HomeScreen professionals={professionals} setSelectedProfessional={setSelectedProfessional} />}
          {currentScreen === 'profile' && <ProfessionalProfile professional={selectedProfessional} setSelectedProfessional={setSelectedProfessional} />}
          {currentScreen === 'request' && <RequestScreen onOrderCreated={(order) => {
            const newOrders = [...orders, { ...order, status: 'Aguardando Aceite', id: Date.now() }];
            setOrders(newOrders);
            setCurrentScreen('orders');
          }} />}
          {currentScreen === 'orders' && <OrdersScreen orders={orders} onEdit={setEditingOrder} onDelete={(id) => setOrders(orders.filter(o => o.id !== id))} />}
          {currentScreen === 'finalization' && <FinalizationScreen onRatingSubmit={(rating, comment) => {
            // Handle rating submission
            setCurrentScreen('orders');
          }} />}
        </div>

        {/* Professional Profile Modal */}
        {selectedProfessional && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="card w-full max-w-md p-6 transform scale-100 transition-transform duration-300">
              <h2 className="text-xl font-semibold mb-4">{selectedProfessional.name}</h2>
              <img src={selectedProfessional.image} alt={selectedProfessional.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
              <p className="text-[var(--text-muted)] text-sm mb-6">{selectedProfessional.specialty}</p>
              
              <div className="mb-4">
                <p className="font-medium mb-1">Distância: {selectedProfessional.distance}</p>
                <p className="text-[var(--text-muted)]">{selectedProfessional.experience}</p>
              </div>
              
              <p className="text-[var(--text-muted)] text-sm mb-6">Credenciais: {selectedProfessional.creen}</p>
              
              <div className="mb-6">
                <p className="font-medium mb-2">Áreas de Atuação</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProfessional.areas.map((area, index) => (
                    <span key={index} className="px-3 py-1 rounded-md bg-[var(--accent)] text-[var(--bg)] text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="font-medium mb-2">Avaliações</p>
                {selectedProfessional.reviews.map((review, index) => (
                  <div key={index} className="p-3 rounded-md bg-[var(--card)] mb-2">
                    <p className="font-medium">{review.user}</p>
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 text-yellow-500 ${
                            i < review.rating ? 'fill-current' : 'opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[var(--text-muted)] mt-1 ml-1">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedProfessional(null)}
                className="btn-primary w-full"
              >
                Solicitar Atendimento
              </button>
              <button
                onClick={() => setSelectedProfessional(null)}
                className="btn-secondary w-full mt-2"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ professionals, setSelectedProfessional }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = !searchTerm || professional.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || professional.specialty === selectedSpecialty;
    const matchesAvailability = !availabilityFilter || professional.available;
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const specialties = [...new Set(professionals.map(p => p.specialty))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Encontre Profissionais</h1>
      
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[var(--text-muted)] text-sm mb-2">Especialidade</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="select-field"
            >
              <option value="">Todas as especialidades</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-[var(--text-muted)] text-sm mb-2">Distância</label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="select-field"
            >
              <option value="">Até qualquer distância</option>
              <option value="5">Até 5km</option>
              <option value="10">Até 10km</option>
              <option value="20">Até 20km</option>
            </select>
          </div>
          
          <div>
            <label className="text-[var(--text-muted)] text-sm mb-2">Disponibilidade</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="select-field"
            >
              <option value="">Todas disponibilidades</option>
              <option value="available">Apenas disponíveis agora</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProfessionals.map((professional) => (
          <div
            key={professional.id}
            className="card p-5 hover:shadow-lg transition-shadow"
          >
            <img
              src={professional.image}
              alt={professional.name}
              className="w-20 h-20 rounded-md object-cover mb-4"
            />
            <h3 className="text-xl font-medium mb-2">{professional.name}</h3>
            <p className="text-[var(--text-muted)] text-sm mb-1">{professional.specialty}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{professional.rating}</span>
            </div>
            
            <p className="text-[var(--accent)] font-medium">R$ {professional.hourlyRate}/h</p>
            
            <span className="px-2 py-1 rounded-md text-xs bg-[var(--accent)] text-[var(--bg)]">
              {professional.isVerified ? 'COREN/CREFITO Verificado' : 'Não verificado'}
            </span>
            
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-[var(--text-muted)] text-sm mb-2">Localização</p>
              <p className="text-sm">{professional.distance} de você</p>
              <p className="text-[var(--text-muted)] text-xs">Disponível: {professional.available ? 'Sim' : 'Não'}</p>
            </div>
            
            <button
              onClick={() => setSelectedProfessional(professional)}
              className="mt-3 w-full btn-primary"
            >
              Ver Perfil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfessionalProfile({ professional, setSelectedProfessional }) {
  if (!professional) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="card w-full max-w-lg p-6 transform scale-100 transition-transform duration-300">
        <h2 className="text-xl font-semibold mb-4">{professional.name}</h2>
        <img src={professional.image} alt={professional.name} className="w-24 h-24 rounded-full object-cover mb-4" />
        <p className="text-[var(--text-muted)] text-sm mb-6">{professional.specialty}</p>
        
        <div className="mb-4">
          <p className="font-medium mb-1">Distância: {professional.distance}</p>
          <p className="text-[var(--text-muted)]">{professional.experience}</p>
        </div>
        
        <p className="text-[var(--text-muted)] text-sm mb-6">Credenciais: {professional.isVerified ? 'COREN/CREFITO Verificado' : 'Awaiting verification'}</p>
        
        <div className="mb-6">
          <p className="font-medium mb-2">Áreas de Atuação</p>
          <div className="flex flex-wrap gap-2">
            {professional.areas.map((area, index) => (
              <span key={index} className="px-3 py-1 rounded-md bg-[var(--accent)] text-[var(--bg)] text-xs">
                {area}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="font-medium mb-2">Avaliações</p>
          {professional.reviews.map((review, index) => (
            <div key={index} className="p-3 rounded-md bg-[var(--card)] mb-2">
              <p className="font-medium">{review.user}</p>
              <div className="flex gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 text-yellow-500 ${
                      i < review.rating ? 'fill-current' : 'opacity-50'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[var(--text-muted)] mt-1 ml-1">{review.comment}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setSelectedProfessional(null)}
          className="btn-primary w-full"
        >
          Solicitar Atendimento
        </button>
        <button
          onClick={() => setSelectedProfessional(null)}
          className="btn-secondary w-full mt-2"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function RequestScreen({ onOrderCreated }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [address, setAddress] = useState('');
  const [need, setNeed] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Solicitar Atendimento</h1>
      
      {selectedProfessional && (
        <div className="card p-6 mb-8">
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Profissional selecionado: {selectedProfessional.name}
          </p>
          <p className="text-[var(--text-muted)] text-sm">
            Taxa hora: R$ {selectedProfessional.hourlyRate}
          </p>
        </div>
      )}

      <form
        onSubmit={ (e) => {
          e.preventDefault();
          if (!date || !startTime || !endTime || !address || !need) return;
          
          const durationHours = 2; // Simulated
          const totalValue = selectedProfessional ? selectedProfessional.hourlyRate * durationHours : 0;
          
          onOrderCreated({
            id: Date.now(),
            professionalId: selectedProfessional.id,
            date,
            startTime,
            endTime,
            address,
            need,
            totalValue,
            status: 'Aguardando Aceite',
          });
          
          setDate('');
          setStartTime('');
          setEndTime('');
          setAddress('');
          setNeed('');
          setSelectedProfessional(null);
        }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[var(--text-muted)] text-sm block mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] text-sm block mb-1">Horário Início</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[var(--text-muted)] text-sm block mb-1">Horário Fim</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[var(--text-muted)] text-sm block mb-1">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        
        <div>
          <label className="text-[var(--text-muted)] text-sm block mb-1">Descrição da Necessidade</label>
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            rows={3}
            className="input-field h-24 resize-none"
          ></textarea>
        </div>
        
        <div className="mt-6">
          <p className="text-[var(--text-muted)] text-sm mb-4">
            Resumo do Valor: R$ {selectedProfessional ? selectedProfessional.hourlyRate * 2 : 0} (retido até conclusão do serviço)
          </p>
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Confirmar Solicitação
          </button>
        </div>
      </form>
    </div>
  );
}

function OrdersScreen({ orders, onEdit, onDelete }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <p className="text-[var(--text-muted)]">Nenhum pedido ativo</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card p-5 border-t border-[var(--border)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{order.need || 'Solicitação sem descrição'}</h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    {order.date ? `${order.date} - ` : ''}
                    {order.startTime} - {order.endTime}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {order.status}
                </span>
              </div>
              
              <p className="text-[var(--text-muted)] text-sm mb-2">
                Endereço: {order.address || 'Não informado'}
              </p>
              
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-sm py-1 px-3"
                  onClick={() => onEdit(order)}
                >
                  Editar
                </button>
                <button
                  className="btn-primary text-sm py-1 px-3"
                  onClick={() => onDelete(order.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinalizationScreen({ onRatingSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Finalizar Serviço</h1>
      
      <div className="card p-6 mb-8">
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Serviço concluído com sucesso! Deixe sua avaliação para ajudar outras famílias.
        </p>
        
        <div className="mb-6">
          <p className="font-medium mb-2">Nota final</p>
          <div className="flex gap-1">
            {Array(5).fill(0).map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 text-yellow-500 ${
                  i < rating ? 'fill-current' : 'opacity-50'
                }`}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            {rating}/5 estrelas
          </p>
        </div>
        
        <div>
          <label className="text-[var(--text-muted)] text-sm block mb-1">
            Comentário opcional
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="input-field h-24 resize-none"
          ></textarea>
        </div>
        
        <button
          onClick={() => onRatingSubmit(rating, comment)}
          className="btn-primary w-full mt-6"
        >
          Liberar Pagamento e Finalizar
        </button>
      </div>
    </div>
  );
}