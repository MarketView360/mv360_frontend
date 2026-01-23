"use client";

import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-lg",
  };

  // Get initials from user's name or email
  const getInitials = () => {
    if (!user) return "?";

    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      const names = fullName.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }

    const email = user.email;
    if (email) {
      return email[0].toUpperCase();
    }

    return "?";
  };

  const avatarUrl = user?.user_metadata?.avatar_url;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="User avatar"
        className={cn(
          "rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  // Fallback to initials avatar
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-blue-600 font-medium text-white ring-2 ring-slate-200 dark:ring-slate-700",
        sizeClasses[size],
        className
      )}
    >
      {getInitials()}
    </div>
  );
}
