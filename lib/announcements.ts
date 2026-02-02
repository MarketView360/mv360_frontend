import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Announcement {
  id: number;
  created_at: string;
  text: string | null;
  isActive: boolean | null;
  isClickable: boolean | null;
  Description: string | null;
}

/**
 * Fetch all active announcements (most recent first)
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .schema('admin')
      .from('announcements')
      .select('*')
      .eq('isActive', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Announcement fetch error:', error);
      return [];
    }

    return (data as Announcement[]) || [];
  } catch (err) {
    console.error('Failed to fetch announcement:', err);
    return [];
  }
}

/**
 * Fetch a specific announcement by ID
 */
export async function getAnnouncementById(id: number): Promise<Announcement | null> {
  try {
    const { data, error } = await supabase
      .schema('admin')
      .from('announcements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Announcement fetch error:', error);
      return null;
    }

    return data as Announcement | null;
  } catch (err) {
    console.error('Failed to fetch announcement:', err);
    return null;
  }
}
