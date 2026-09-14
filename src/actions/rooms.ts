'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Room, RoomCategory } from '@/types'

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*, category:room_categories(*)')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching rooms:', error)
    return []
  }

  return data as Room[]
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*, category:room_categories(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching room:', error)
    return null
  }

  return data as Room
}

export async function getRoomCategories(): Promise<RoomCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('room_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching room categories:', error)
    return []
  }

  return data as RoomCategory[]
}

export async function updateRoomStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating room status:', error)
    return { error: error.message }
  }

  revalidatePath('/cabanas')
  revalidatePath(`/cabanas/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCleaningStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .update({ cleaning_status: status })
    .eq('id', id)

  if (error) {
    console.error('Error updating cleaning status:', error)
    return { error: error.message }
  }

  revalidatePath('/cabanas')
  revalidatePath(`/cabanas/${id}`)
  revalidatePath('/cabanas/limpieza')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateRoomNotes(id: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .update({ notes })
    .eq('id', id)

  if (error) {
    console.error('Error updating room notes:', error)
    return { error: error.message }
  }

  revalidatePath(`/cabanas/${id}`)
  return { success: true }
}

export async function getRoomReservations(roomId: string) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('*, guest:guests(*)')
    .eq('room_id', roomId)
    .gte('check_out_date', today)
    .in('status', ['pending', 'confirmed', 'checked_in'])
    .order('check_in_date', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching room reservations:', error)
    return []
  }

  return data
}
