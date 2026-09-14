'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Guest, Reservation } from '@/types'

export async function getGuests(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('guests')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (search) {
    const term = `%${search}%`
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching guests:', error)
    return []
  }

  return data as Guest[]
}

export async function getGuestById(id: string) {
  const supabase = await createClient()

  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .select('*')
    .eq('id', id)
    .single()

  if (guestError || !guest) {
    return null
  }

  const { data: reservations, error: reservationsError } = await supabase
    .from('reservations')
    .select('*, room:rooms(name)')
    .eq('guest_id', id)
    .order('check_in_date', { ascending: false })

  if (reservationsError) {
    console.error('Error fetching reservations:', reservationsError)
  }

  return {
    guest: guest as Guest,
    reservations: (reservations ?? []) as (Reservation & { room: { name: string } })[],
  }
}

export async function createGuest(formData: FormData) {
  const supabase = await createClient()

  const guestData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    id_document_type: (formData.get('id_document_type') as string) || null,
    id_document_number: (formData.get('id_document_number') as string) || null,
    nationality: (formData.get('nationality') as string) || null,
    country: (formData.get('country') as string) || null,
    state: (formData.get('state') as string) || null,
    city: (formData.get('city') as string) || null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  if (!guestData.first_name || !guestData.last_name) {
    return { error: 'El nombre y apellido son obligatorios.' }
  }

  const { data, error } = await supabase
    .from('guests')
    .insert(guestData)
    .select()
    .single()

  if (error) {
    console.error('Error creating guest:', error)
    return { error: 'Error al crear el huésped. Intente de nuevo.' }
  }

  revalidatePath('/huespedes')
  redirect('/huespedes')
}

export async function updateGuest(id: string, formData: FormData) {
  const supabase = await createClient()

  const guestData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    id_document_type: (formData.get('id_document_type') as string) || null,
    id_document_number: (formData.get('id_document_number') as string) || null,
    nationality: (formData.get('nationality') as string) || null,
    country: (formData.get('country') as string) || null,
    state: (formData.get('state') as string) || null,
    city: (formData.get('city') as string) || null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  if (!guestData.first_name || !guestData.last_name) {
    return { error: 'El nombre y apellido son obligatorios.' }
  }

  const { error } = await supabase
    .from('guests')
    .update(guestData)
    .eq('id', id)

  if (error) {
    console.error('Error updating guest:', error)
    return { error: 'Error al actualizar el huésped. Intente de nuevo.' }
  }

  revalidatePath('/huespedes')
  revalidatePath(`/huespedes/${id}`)
  redirect(`/huespedes/${id}`)
}

export async function deleteGuest(id: string) {
  const supabase = await createClient()

  // Check if guest has reservations
  const { count, error: countError } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('guest_id', id)

  if (countError) {
    console.error('Error checking reservations:', countError)
    return { error: 'Error al verificar las reservaciones.' }
  }

  if (count && count > 0) {
    return { error: 'No se puede eliminar un huésped que tiene reservaciones.' }
  }

  const { error } = await supabase.from('guests').delete().eq('id', id)

  if (error) {
    console.error('Error deleting guest:', error)
    return { error: 'Error al eliminar el huésped.' }
  }

  revalidatePath('/huespedes')
  redirect('/huespedes')
}
