'use server'

import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  arrivalsToday: number
  departuresToday: number
  occupiedRooms: number
  availableRooms: number
  todayIncome: number
  dirtyRooms: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    arrivalsResult,
    departuresResult,
    occupiedResult,
    availableResult,
    incomeResult,
    dirtyResult,
  ] = await Promise.all([
    // Today's arrivals
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('check_in_date', today)
      .in('status', ['confirmed', 'pending']),

    // Today's departures
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('check_out_date', today)
      .eq('status', 'checked_in'),

    // Occupied rooms
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'occupied'),

    // Available rooms
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'available'),

    // Today's income
    supabase
      .from('payments')
      .select('amount')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59.999`),

    // Dirty rooms
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('cleaning_status', 'dirty'),
  ])

  const todayIncome = incomeResult.data
    ? incomeResult.data.reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0

  return {
    arrivalsToday: arrivalsResult.count ?? 0,
    departuresToday: departuresResult.count ?? 0,
    occupiedRooms: occupiedResult.count ?? 0,
    availableRooms: availableResult.count ?? 0,
    todayIncome,
    dirtyRooms: dirtyResult.count ?? 0,
  }
}

export async function getRecentReservations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select('*, guest:guests(*), room:rooms(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent reservations:', error)
    return []
  }

  return data
}

export async function getTodayMovements() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [arrivalsResult, departuresResult] = await Promise.all([
    supabase
      .from('reservations')
      .select('*, guest:guests(*), room:rooms(name)')
      .eq('check_in_date', today)
      .in('status', ['confirmed', 'pending', 'checked_in']),

    supabase
      .from('reservations')
      .select('*, guest:guests(*), room:rooms(name)')
      .eq('check_out_date', today)
      .in('status', ['checked_in', 'checked_out']),
  ])

  return {
    arrivals: arrivalsResult.data ?? [],
    departures: departuresResult.data ?? [],
  }
}
