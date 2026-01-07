"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/app/providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Sun, Moon, Monitor, Type, Wifi, Zap, LayoutGrid, Newspaper, List, Infinity } from "lucide-react";
import { toast } from "sonner";
import { useNewsPreferences, PaginationStyle } from "@/hooks/useNewsPreferences";

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  text_size: "small" | "medium" | "large";
  show_network_indicator: boolean;
  reduce_animations: boolean;
  compact_mode: boolean;
}

export default function AppearancePage() {
  const { session } = useAuth();
  const { setTheme: applyTheme } = useTheme();
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { preferences: newsPrefs, setPaginationStyle, isLoaded: newsPrefsLoaded } = useNewsPreferences();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.access_token) return;

      try {
        const res = await fetch(`${apiBase}/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session?.access_token, apiBase]);

  const updateSetting = async (key: keyof AppearanceSettings, value: unknown) => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiBase}/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setSettings(updated);

      if (key === "theme") {
        const themeValue = value as "light" | "dark" | "system";
        if (themeValue === "system") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          applyTheme(prefersDark ? "dark" : "light");
        } else {
          applyTheme(themeValue);
        }
      }

      toast.success("Setting saved");
    } catch {
      toast.error("Failed to save setting");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!settings) return null;

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[settings.theme];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Appearance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize how the app looks and feels
        </p>
      </div>

      {/* Theme */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-purple-500" />
            Color Theme
          </CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ThemeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Theme Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select light, dark, or system preference
                </p>
              </div>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(value) => updateSetting("theme", value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="h-5 w-5 text-blue-500" />
            Display Options
          </CardTitle>
          <CardDescription>Adjust text size and layout preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Type className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Text Size</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Adjust the default text size
                </p>
              </div>
            </div>
            <Select
              value={settings.text_size}
              onValueChange={(value) => updateSetting("text_size", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <LayoutGrid className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Compact Mode</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Use smaller spacing and elements
                </p>
              </div>
            </div>
            <Switch
              checked={settings.compact_mode}
              onCheckedChange={(checked) => updateSetting("compact_mode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interface Options */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5 text-green-500" />
            Interface Options
          </CardTitle>
          <CardDescription>Additional interface preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Network Indicator</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Show connection status in the interface
                </p>
              </div>
            </div>
            <Switch
              checked={settings.show_network_indicator}
              onCheckedChange={(checked) => updateSetting("show_network_indicator", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white">Reduce Animations</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Minimize motion for accessibility
                </p>
              </div>
            </div>
            <Switch
              checked={settings.reduce_animations}
              onCheckedChange={(checked) => updateSetting("reduce_animations", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* News Preferences */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5 text-brand" />
            News Preferences
          </CardTitle>
          <CardDescription>Customize how news articles are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 dark:bg-brand/20 rounded-lg">
                {newsPrefsLoaded && newsPrefs.paginationStyle === "infinite" ? (
                  <Infinity className="h-5 w-5 text-brand" />
                ) : (
                  <List className="h-5 w-5 text-brand" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Pagination Style</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose how to navigate through news articles
                </p>
              </div>
            </div>
            <Select
              value={newsPrefsLoaded ? newsPrefs.paginationStyle : "infinite"}
              onValueChange={(value: PaginationStyle) => {
                setPaginationStyle(value);
                toast.success("News pagination preference saved");
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infinite">
                  <div className="flex items-center gap-2">
                    <Infinity className="h-4 w-4" /> Infinite Scroll
                  </div>
                </SelectItem>
                <SelectItem value="numbered">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" /> Numbered Pages
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            This preference is stored locally in your browser and will persist across sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
