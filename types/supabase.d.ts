import { Session } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
    interface Session {
        tier?: string
    }
}
