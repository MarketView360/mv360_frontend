"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Server,
  Database,
  Shield,
  Bot,
  BarChart3,
  Wrench
} from "lucide-react";

type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
type IncidentSeverity = 'minor' | 'major' | 'critical';

interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  message: string;
  created_at: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  affected_services: string[];
  started_at: string;
  resolved_at: string | null;
  incident_updates: IncidentUpdate[];
}

interface UptimeInfo {
  status: string;
  uptime_24h: string;
  uptime_7d: string;
  uptime_30d: string;
  response_time: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  uptime?: UptimeInfo | null;
}

interface StatusData {
  overall_status: string;
  services: Service[];
  active_incidents: Incident[];
  recent_incidents: Incident[];
  last_updated: string;
}

const serviceIcons: Record<string, React.ElementType> = {
  'Web Application': Activity,
  'API': Server,
  'Database': Database,
  'Authentication': Shield,
  'AI Services': Bot,
  'Market Data': BarChart3,
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; label: string }> = {
  operational: { 
    color: 'text-green-600 dark:text-green-400', 
    bgColor: 'bg-green-100 dark:bg-green-900/30', 
    icon: CheckCircle, 
    label: 'Operational' 
  },
  degraded: { 
    color: 'text-yellow-600 dark:text-yellow-400', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
    icon: AlertTriangle, 
    label: 'Degraded Performance' 
  },
  partial_outage: { 
    color: 'text-orange-600 dark:text-orange-400', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
    icon: AlertTriangle, 
    label: 'Partial Outage' 
  },
  major_outage: { 
    color: 'text-red-600 dark:text-red-400', 
    bgColor: 'bg-red-100 dark:bg-red-900/30', 
    icon: XCircle, 
    label: 'Major Outage' 
  },
  maintenance: { 
    color: 'text-blue-600 dark:text-blue-400', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
    icon: Wrench, 
    label: 'Under Maintenance' 
  },
};

const incidentStatusConfig: Record<IncidentStatus, { color: string; label: string }> = {
  investigating: { color: 'text-red-600 dark:text-red-400', label: 'Investigating' },
  identified: { color: 'text-orange-600 dark:text-orange-400', label: 'Identified' },
  monitoring: { color: 'text-yellow-600 dark:text-yellow-400', label: 'Monitoring' },
  resolved: { color: 'text-green-600 dark:text-green-400', label: 'Resolved' },
};

const severityConfig: Record<IncidentSeverity, { color: string; bgColor: string; label: string }> = {
  minor: { color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Minor' },
  major: { color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'Major' },
  critical: { color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Critical' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function IncidentCard({ incident, isExpanded, onToggle }: { 
  incident: Incident; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const severity = severityConfig[incident.severity];
  const status = incidentStatusConfig[incident.status];
  const isResolved = incident.status === 'resolved';

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isResolved 
        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' 
        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
    }`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${severity.bgColor} ${severity.color}`}>
              {severity.label}
            </span>
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {incident.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Started {formatRelativeTime(incident.started_at)}
            {incident.resolved_at && ` • Resolved ${formatRelativeTime(incident.resolved_at)}`}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700">
          {incident.description && (
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-3">
              {incident.description}
            </p>
          )}
          
          {incident.affected_services.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Affected Services
              </p>
              <div className="flex flex-wrap gap-1">
                {incident.affected_services.map((service) => (
                  <span
                    key={service}
                    className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {incident.incident_updates && incident.incident_updates.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Updates
              </p>
              <div className="space-y-3">
                {incident.incident_updates
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((update) => {
                    const updateStatus = incidentStatusConfig[update.status];
                    return (
                      <div key={update.id} className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            update.status === 'resolved' ? 'bg-green-500' :
                            update.status === 'monitoring' ? 'bg-yellow-500' :
                            update.status === 'identified' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-medium ${updateStatus.color}`}>
                              {updateStatus.label}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {formatDate(update.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                            {update.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const status = statusConfig[service.status] || statusConfig.operational;
  const StatusIcon = status.icon;
  const ServiceIcon = serviceIcons[service.name] || Server;

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status.bgColor}`}>
          <ServiceIcon className={`h-5 w-5 ${status.color}`} />
        </div>
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {service.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {service.uptime && (
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {parseFloat(service.uptime.uptime_30d).toFixed(2)}% uptime
          </span>
        )}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bgColor}`}>
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatusData(data);
      setError(null);
      
      // Auto-expand active incidents
      if (data.active_incidents?.length > 0) {
        setExpandedIncidents(new Set(data.active_incidents.map((i: Incident) => i.id)));
      }
    } catch (err) {
      setError('Unable to load status. Please try again.');
      console.error('Status fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchStatus(), 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleIncident = (incidentId: string) => {
    setExpandedIncidents(prev => {
      const next = new Set(prev);
      if (next.has(incidentId)) {
        next.delete(incidentId);
      } else {
        next.add(incidentId);
      }
      return next;
    });
  };

  const overallStatus = statusData?.overall_status || 'operational';
  const overallConfig = statusConfig[overallStatus] || statusConfig.operational;
  const OverallIcon = overallConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Status
            </h1>
            <button
              onClick={() => fetchStatus(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Current status of MarketView360 services and any ongoing incidents.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading status...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <button
              onClick={() => fetchStatus(true)}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Overall Status Banner */}
            <div className={`${overallConfig.bgColor} border ${
              overallStatus === 'operational' 
                ? 'border-green-200 dark:border-green-800' 
                : overallStatus === 'degraded'
                ? 'border-yellow-200 dark:border-yellow-800'
                : overallStatus === 'partial_outage'
                ? 'border-orange-200 dark:border-orange-800'
                : 'border-red-200 dark:border-red-800'
            } rounded-xl p-6 mb-8`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-white dark:bg-slate-900`}>
                  <OverallIcon className={`h-8 w-8 ${overallConfig.color}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${overallConfig.color}`}>
                    {overallStatus === 'operational' 
                      ? 'All Systems Operational'
                      : overallStatus === 'degraded'
                      ? 'Degraded Performance'
                      : overallStatus === 'partial_outage'
                      ? 'Partial System Outage'
                      : 'Major System Outage'
                    }
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Last updated: {statusData?.last_updated 
                      ? formatRelativeTime(statusData.last_updated)
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Incidents */}
            {statusData?.active_incidents && statusData.active_incidents.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Incidents
                </h2>
                <div className="space-y-3">
                  {statusData.active_incidents.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      isExpanded={expandedIncidents.has(incident.id)}
                      onToggle={() => toggleIncident(incident.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Services Status */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Services
              </h2>
              <div className="space-y-3">
                {statusData?.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>

            {/* Recent Incidents */}
            {statusData?.recent_incidents && statusData.recent_incidents.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  Recent Incidents (Last 7 Days)
                </h2>
                <div className="space-y-3">
                  {statusData.recent_incidents.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      isExpanded={expandedIncidents.has(incident.id)}
                      onToggle={() => toggleIncident(incident.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Recent Incidents */}
            {(!statusData?.recent_incidents || statusData.recent_incidents.length === 0) && 
             (!statusData?.active_incidents || statusData.active_incidents.length === 0) && (
              <section className="mb-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    No Recent Incidents
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    All systems have been running smoothly with no reported incidents in the last 7 days.
                  </p>
                </div>
              </section>
            )}

            {/* Footer Info */}
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Need help? Check our status updates or contact support.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contact Support
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
