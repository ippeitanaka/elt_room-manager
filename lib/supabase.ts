import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null
let serverClient: SupabaseClient | null = null

export function hasSupabaseConfig() {
	return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function getSupabaseClient(): SupabaseClient {
	if (typeof window !== 'undefined') {
		browserClient ??= createPagesBrowserClient()
		return browserClient
	}

	if (!hasSupabaseConfig()) {
		throw new Error('Supabase environment variables are not configured.')
	}

	serverClient ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
	return serverClient
}

export const supabase = new Proxy({} as SupabaseClient, {
	get(_target, prop) {
		const client = getSupabaseClient()
		const value = Reflect.get(client, prop)
		return typeof value === 'function' ? value.bind(client) : value
	},
})
