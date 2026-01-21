"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Globe, Clock, MapPin } from "lucide-react";

export default function GeneralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">General</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          General application preferences
        </p>
      </div>

      {/* Regional Settings */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-blue-500" />
            Regional Settings
          </CardTitle>
          <CardDescription>Locale and timezone preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">Language</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">English (US)</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">Timezone</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-purple-500" />
            Application Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Version</p>
              <p className="font-medium text-slate-900 dark:text-white">1.0.0</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Environment</p>
              <p className="font-medium text-slate-900 dark:text-white">Production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
