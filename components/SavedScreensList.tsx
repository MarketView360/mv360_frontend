"use client";

import { useState } from "react";
import { SavedScreen } from "@/hooks/useSavedScreens";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trash2,
  Edit2,
  FileText,
  Clock,
  LogIn,
  UserPlus,
  Save,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SavedScreensListProps {
  savedScreens: SavedScreen[];
  loading: boolean;
  onRun: (screen: SavedScreen) => void;
  onUpdate: (
    id: string,
    updates: { name?: string; description?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAuthenticated?: boolean;
}

export function SavedScreensList({
  savedScreens,
  loading,
  onRun,
  onUpdate,
  onDelete,
  isAuthenticated = true,
}: SavedScreensListProps) {
  const [editingScreen, setEditingScreen] = useState<SavedScreen | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleEdit = (screen: SavedScreen) => {
    setEditingScreen(screen);
    setEditName(screen.name);
    setEditDescription(screen.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingScreen) return;
    await onUpdate(editingScreen.id, {
      name: editName,
      description: editDescription,
    });
    setEditingScreen(null);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <Save className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Save Your Custom Screens
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mb-6">
          Sign in to save your queries and access them anytime from any device.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          <Link href="/auth?mode=login">
            <Button
              style={{ backgroundColor: '#0087f6' }}
              className="w-full hover:opacity-90 text-white transition-opacity"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/auth?mode=register">
            <Button
              variant="outline"
              className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>
        <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 max-w-[280px]">
          <Info className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            Free users can save up to 5 screens. Premium users get unlimited saves.
          </p>
        </div>
      </div>
    );
  }

  if (savedScreens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No saved screens yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mb-4">
          Save your custom queries to quickly access them later
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 max-w-[280px]">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 text-left">
            Click the "Save" button in the query editor to save your first screen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-2 p-4">
          {savedScreens.map((screen) => (
            <div
              key={screen.id}
              className={cn(
                "group p-4 rounded-lg border transition-all",
                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                "hover:border-brand/50 dark:hover:border-brand/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {screen.name}
                  </h3>
                  {screen.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {screen.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent">
                  {screen.exchange}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  {screen.limit_count} results
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(screen.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  style={{ backgroundColor: '#0087f6' }}
                  className="flex-1 hover:opacity-90 text-white h-8 transition-opacity"
                  onClick={() => onRun(screen)}
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Run
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEdit(screen)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => setDeleteConfirm(screen.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={!!editingScreen} onOpenChange={() => setEditingScreen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Saved Screen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingScreen(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              style={{ backgroundColor: '#0087f6' }}
              className="hover:opacity-90 text-white transition-opacity"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Saved Screen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            This action cannot be undone. This will permanently delete the saved
            screen and its query.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteConfirm!)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
