import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MaintenanceStatus {
  id: number;
  created_at: string;
  scheduled_at: string | null;
  ends_at: string | null;
  is_Active: boolean | null;
  title: string | null;
  description: string | null;
}

export async function checkMaintenanceStatus(): Promise<MaintenanceStatus | null> {
  try {
    // Query the admin.maintenance table directly
    const { data, error } = await supabase
      .schema('admin')
      .from('maintenance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Maintenance check error:', error);
      return null;
    }

    return data as MaintenanceStatus | null;
  } catch (err) {
    console.error('Failed to check maintenance status:', err);
    return null;
  }
}

// Decide when to show the lightweight banner (not the full maintenance page).
// We show it when:
// 1) The current time is within the maintenance window [scheduled_at, ends_at]
//    OR
// 2) The maintenance is scheduled to start within the next 24 hours.
export function shouldShowMaintenanceBanner(
  scheduledAt: string | null,
  endsAt: string | null,
): boolean {
  if (!scheduledAt) return false;

  const now = new Date();
  const start = new Date(scheduledAt);

  // If we have an end time, treat [start, end] as the active window
  if (endsAt) {
    const end = new Date(endsAt);
    if (now >= start && now <= end) {
      return true;
    }
  }

  // Otherwise, or if we're not yet in the window, show banner when
  // the maintenance is scheduled within the next 24 hours
  const diffMs = start.getTime() - now.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return hours > 0 && hours <= 24;
}

export function formatMaintenanceTime(scheduledAt: string | null, endsAt: string | null): string {
  if (!scheduledAt) return 'Soon';

  const scheduled = new Date(scheduledAt);

  // Local date/time (no timezone name)
  const localOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  const localStr = scheduled.toLocaleString(undefined, localOptions);

  // Extract local timezone name (e.g. GMT+5:30)
  const tzFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' });
  const tzParts = tzFormatter.formatToParts(scheduled);
  const tzName = tzParts.find((p) => p.type === 'timeZoneName')?.value ?? 'UTC';

  let durationText = '';
  if (endsAt) {
    const ends = new Date(endsAt);
    const duration = (ends.getTime() - scheduled.getTime()) / (1000 * 60);
    if (duration > 0) {
      if (duration < 60) {
        durationText = `, ${Math.round(duration)} min`;
      } else {
        const hours = Math.round(duration / 60);
        durationText = `, ${hours} hour${hours > 1 ? 's' : ''}`;
      }
    }
  }

  // Example: "Jan 28, 12:00 AM (GMT+5:30, 1 hour)"
  return `${localStr} (${tzName}${durationText})`;
}
