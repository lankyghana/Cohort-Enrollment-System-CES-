// Supabase Edge Function (Deno) — final-save
// This function accepts a POST with course payload and performs a secure insert/update
// using the Supabase service role key. Deploy this as a Supabase Edge Function and set
// the environment variable SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const body = await req.json()
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env variables' }), { status: 500 })
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // If id present -> update, else insert
    if (body.id) {
      const { data, error } = await sb.from('courses').update(body).eq('id', body.id).select()
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    const toInsert = { status: body.status ?? 'published', ...body }
    const { data, error } = await sb.from('courses').insert([toInsert]).select()
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ data }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500 })
  }
})
