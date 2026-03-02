"use client";

import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

interface BannerItem {
  id: number;
  text: string;
  isClickable: boolean;
}

interface AnnouncementsBannerProps {
  announcements: BannerItem[];
}

export function AnnouncementsBanner({ announcements }: AnnouncementsBannerProps) {
  const router = useRouter();

  if (!announcements || announcements.length === 0) return null;

  const handleClick = (item: BannerItem) => {
    if (item.isClickable) {
      router.push(`/blog/announcements/${item.id}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b border-blue-200 dark:border-blue-900/50 overflow-hidden">
      <div 
        className="flex items-center gap-3 py-2.5"
      >
        <div className="flex items-center gap-3 px-4">
          <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        </div>
        
        {/* Marquee text container */}
        <div className="flex-1 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content">
              {announcements.map((item) => (
                <span
                  key={item.id}
                  className={`text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap mr-16 ${
                    item.isClickable ? "cursor-pointer underline-offset-2 hover:underline" : ""
                  }`}
                  onClick={() => handleClick(item)}
                >
                  {item.text}
                </span>
              ))}
              {/* Duplicate sequence for seamless loop */}
              {announcements.map((item) => (
                <span
                  key={`${item.id}-dup`}
                  className={`text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap mr-16 ${
                    item.isClickable ? "cursor-pointer underline-offset-2 hover:underline" : ""
                  }`}
                  onClick={() => handleClick(item)}
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          display: flex;
          overflow: hidden;
          width: 100%;
        }
        
        .marquee-content {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
