import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UptimeRobotMonitor {
  id: number;
  friendly_name: string;
  url: string;
  type: number;
  status: number;
  all_time_uptime_ratio: string;
  custom_uptime_ratio: string;
  average_response_time: string;
  logs?: {
    type: number;
    datetime: number;
    duration: number;
    reason?: {
      code: string;
      detail: string;
    };
  }[];
}

interface UptimeRobotResponse {
  stat: string;
  monitors: UptimeRobotMonitor[];
}

// Map UptimeRobot status codes to our status
function mapUptimeRobotStatus(status: number): string {
  switch (status) {
    case 0: return 'paused';
    case 1: return 'not_checked';
    case 2: return 'operational';
    case 8: return 'degraded';
    case 9: return 'major_outage';
    default: return 'unknown';
  }
}

export async function GET() {
  try {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;
    
    // Fetch monitors from UptimeRobot
    let uptimeData: UptimeRobotResponse | null = null;
    
    if (apiKey) {
      const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          format: 'json',
          logs: 1,
          logs_limit: 10,
          custom_uptime_ratios: '1-7-30',
          response_times: 1,
          response_times_limit: 1,
        }),
        next: { revalidate: 60 }, // Cache for 60 seconds
      });
      
      if (response.ok) {
        uptimeData = await response.json();
      }
    }

    // Fetch services from database
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
    }

    // Fetch active incidents
    const { data: incidents, error: incidentsError } = await supabase
      .from('incidents')
      .select(`
        *,
        incident_updates (
          id,
          status,
          message,
          created_at
        )
      `)
      .neq('status', 'resolved')
      .order('started_at', { ascending: false });

    if (incidentsError) {
      console.error('Error fetching incidents:', incidentsError);
    }

    // Fetch recent resolved incidents (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentIncidents, error: recentError } = await supabase
      .from('incidents')
      .select(`
        *,
        incident_updates (
          id,
          status,
          message,
          created_at
        )
      `)
      .eq('status', 'resolved')
      .gte('resolved_at', sevenDaysAgo.toISOString())
      .order('resolved_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent incidents:', recentError);
    }

    // Merge UptimeRobot data with services and update status based on incidents
    const enrichedServices = (services || []).map(service => {
      let uptimeInfo = null;
      
      if (uptimeData?.monitors && service.uptimerobot_monitor_id) {
        const monitor = uptimeData.monitors.find(
          m => m.id.toString() === service.uptimerobot_monitor_id
        );
        
        if (monitor) {
          const uptimeRatios = monitor.custom_uptime_ratio?.split('-') || [];
          uptimeInfo = {
            status: mapUptimeRobotStatus(monitor.status),
            uptime_24h: uptimeRatios[0] || monitor.all_time_uptime_ratio,
            uptime_7d: uptimeRatios[1] || monitor.all_time_uptime_ratio,
            uptime_30d: uptimeRatios[2] || monitor.all_time_uptime_ratio,
            response_time: monitor.average_response_time,
            recent_events: monitor.logs?.slice(0, 5).map(log => ({
              type: log.type === 1 ? 'down' : log.type === 2 ? 'up' : 'unknown',
              datetime: new Date(log.datetime * 1000).toISOString(),
              duration: log.duration,
              reason: log.reason,
            })),
          };
        }
      }
      
      // Check if this service is affected by any active incidents
      let derivedStatus = service.status;
      if (incidents && incidents.length > 0) {
        const affectingIncidents = incidents.filter(incident => 
          incident.affected_services?.includes(service.name)
        );
        
        if (affectingIncidents.length > 0) {
          // Use the highest severity incident to determine service status
          const criticalIncident = affectingIncidents.find(i => i.severity === 'critical');
          const majorIncident = affectingIncidents.find(i => i.severity === 'major');
          const minorIncident = affectingIncidents.find(i => i.severity === 'minor');
          
          if (criticalIncident) {
            derivedStatus = 'major_outage';
          } else if (majorIncident) {
            derivedStatus = 'partial_outage';
          } else if (minorIncident) {
            derivedStatus = 'degraded';
          }
        }
      }
      
      return {
        ...service,
        status: derivedStatus,
        uptime: uptimeInfo,
      };
    });

    // Calculate overall status
    const hasActiveIncidents = incidents && incidents.length > 0;
    const criticalIncident = incidents?.find(i => i.severity === 'critical');
    const majorIncident = incidents?.find(i => i.severity === 'major');
    
    let overallStatus = 'operational';
    if (criticalIncident) {
      overallStatus = 'major_outage';
    } else if (majorIncident) {
      overallStatus = 'partial_outage';
    } else if (hasActiveIncidents) {
      overallStatus = 'degraded';
    }

    return NextResponse.json({
      overall_status: overallStatus,
      services: enrichedServices,
      active_incidents: incidents || [],
      recent_incidents: recentIncidents || [],
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
