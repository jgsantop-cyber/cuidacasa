import { supabase, isSupabaseConfigured } from './supabase';

export { isSupabaseConfigured };

const PROFESSIONAL_SELECT = '*, professional_reviews(*)';
const ORDER_SELECT = '*, professional:professionals(*, professional_reviews(*))';

const DEFAULT_NOTIFICATIONS = {
  whatsappUpdates: false,
  emailReports: false,
  medicationAlerts: false,
};

function mapProfessional(row) {
  if (!row) return null;
  const reviews = (row.professional_reviews || [])
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(r => ({
      user: r.user_name,
      rating: r.rating,
      date: r.review_date_label,
      comment: r.comment,
    }));

  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    image: row.image,
    specialty: row.specialty,
    council: row.council,
    hourlyRate: Number(row.hourly_rate),
    isVerified: row.is_verified,
    distance: row.distance != null ? String(row.distance) : '',
    experience: row.experience,
    bio: row.bio,
    city: row.city,
    areas: row.areas || [],
    available: row.available,
    rating: Number(row.rating),
    totalServices: row.total_services,
    reviews,
  };
}

function mapOrder(row) {
  return {
    id: row.id,
    professional: mapProfessional(row.professional),
    date: row.service_date,
    startTime: (row.start_time || '').slice(0, 5),
    endTime: row.end_time ? row.end_time.slice(0, 5) : '',
    durationHours: row.duration_hours != null ? Number(row.duration_hours) : null,
    address: row.address,
    need: row.need,
    totalValue: row.total_value != null ? Number(row.total_value) : 0,
    paymentMethod: row.payment_method,
    status: row.status,
  };
}

function mapUserProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    cpf: row.cpf,
    avatar: row.avatar,
    role: row.role,
    patient: row.patient || {},
    address: row.address,
    paymentMethod: row.payment_method,
    pixKey: row.pix_key,
    notifications: { ...DEFAULT_NOTIFICATIONS, ...(row.notifications || {}) },
  };
}

export async function fetchProfessionals() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('professionals')
    .select(PROFESSIONAL_SELECT)
    .order('id');
  if (error) throw error;
  return (data || []).map(mapProfessional);
}

export async function fetchOrders() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function fetchUserProfile() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUserProfile(data) : null;
}

export async function createOrder(order, userProfileId) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_profile_id: userProfileId || null,
      professional_id: order.professional.id,
      service_date: order.date,
      start_time: order.startTime,
      end_time: order.endTime,
      duration_hours: order.durationHours,
      address: order.address,
      need: order.need,
      total_value: order.totalValue,
      payment_method: order.paymentMethod,
      status: 'Confirmado',
    })
    .select(ORDER_SELECT)
    .single();
  if (error) throw error;
  return mapOrder(data);
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function createReport(report) {
  const protocol = `CC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('reports')
    .insert({
      order_id: report.orderId || null,
      professional_id: report.professionalId || null,
      reason: report.reason,
      details: report.details,
      anonymous: Boolean(report.anonymous),
      attachments: report.attachments || [],
      protocol,
      status: 'Em análise',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(profile) {
  if (!isSupabaseConfigured || !profile?.id) return;
  const { error } = await supabase
    .from('user_profiles')
    .update({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      cpf: profile.cpf,
      avatar: profile.avatar,
      role: profile.role,
      patient: profile.patient,
      address: profile.address,
      payment_method: profile.paymentMethod,
      pix_key: profile.pixKey,
      notifications: profile.notifications,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
  if (error) throw error;
}
