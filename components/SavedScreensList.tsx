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
  ChevronRight,
  Clock,
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

interface SavedScreensListProps {
  savedScreens: SavedScreen[];
  loading: boolean;
  onRun: (screen: SavedScreen) => void;
  onUpdate: (
    id: string,
    updates: { name?: string; description?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SavedScreensList({
  savedScreens,
  loading,
  onRun,
  onUpdate,
  onDelete,
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

  if (savedScreens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No saved screens yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">
          Save your custom queries to quickly access them later
        </p>
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
                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
                "hover:border-brand dark:hover:border-brand hover:shadow-md"
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
                <Badge variant="secondary" className="text-xs">
                  {screen.exchange.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {screen.limit_count} results
                </Badge>
                {screen.last_run_at && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(screen.last_run_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-brand hover:bg-brand/90 h-8"
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
            <Button onClick={handleSaveEdit} className="bg-brand hover:bg-brand/90">
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
