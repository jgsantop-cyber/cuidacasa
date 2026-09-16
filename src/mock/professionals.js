export const professionalsData = [
  {
    id: 1,
    name: "Maria Silva",
    image: "https://images.unsplash.com/photo-1594822613047-49e088d1d482?w=200&h=200&fit=crop",
    specialty: "Enfermeira",
    hourlyRate: 85,
    isVerified: true,
    distance: "3.2",
    experience: "5 anos de experiência",
    areas: ["Cuidados Pós-Operatório", "Hidratação Endovenosa", "Controle de Medicação"],
    available: true,
    rating: 5,
    reviews: [
      { user: "Família Santos", rating: 5, comment: "Excelente cuidado com meu pai pós-cirurgia. Muito atenciosa." },
      { user: "Família Oliveira", rating: 4, comment: "Profissional qualificada e confiável." }
    ]
  },
  {
    id: 2,
    name: "João Costa",
    image: "https://images.unsplash.com/photo-1600596542815-5a9c4b1d0b5e?w=200&h=200&fit=crop",
    specialty: "Técnico de Enfermagem",
    hourlyRate: 65,
    isVerified: true,
    distance: "1.8",
    experience: "3 anos de experiência",
    areas: ["Cuidados com Idoso", "Auxílio Mobilidade", "Banho e Higiene"],
    available: false,
    rating: 5,
    reviews: [
      { user: "Família Rezende", rating: 5, comment: "Muito paciente e cuidadoso. Recomendo muito." }
    ]
  },
  {
    id: 3,
    name: "Ana Lima",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    specialty: "Fisioterapeuta",
    hourlyRate: 100,
    isVerified: false,
    distance: "5.6",
    experience: "7 anos de experiência",
    areas: ["Fisioterapia Ortopédica", "Reabilitação", "Exercícios Funcionais"],
    available: true,
    rating: 4.5,
    reviews: [
      { user: "Família Rocha", rating: 5, comment: "Melhor fisioterapeuta que já tive. Resultados visíveis imediatos." },
      { user: "Família Pereira", rating: 4, comment: "Profissional dedicada, mas agenda bastante concorrida." }
    ]
  }
];