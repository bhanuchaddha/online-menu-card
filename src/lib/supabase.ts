import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqgehcucndncjbgcussq.supabase.co'

// Server-side client for API routes and server components
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Server-side client with service role key (for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Client-side supabase for browser usage
export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    return null // Don't create browser client on server
  }
  
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!publicKey) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return null
  }
  
  return createClient(supabaseUrl, publicKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}
