import { Search, Command, Sun } from 'lucide-react';
import logo from 'figma:asset/236f42e1c65ea276494fad9d8867c24518b18985.png';

export function Header() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="MarketView360" className="h-8" />
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Screens
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Watchlist
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Markets
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                News
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                AI Assistant
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          {/* Right side - Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ticker..."
                className="bg-transparent border-none outline-none text-sm w-32 lg:w-48"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Sun className="w-5 h-5" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0089FF] text-white">
              R
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
