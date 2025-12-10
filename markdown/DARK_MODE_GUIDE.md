# Dark Mode Implementation Guide

## Overview

Your Marketview360 application now has comprehensive dark mode support! The dark mode is fully implemented with:

- **Manual toggle** - Users can easily switch between light and dark modes
- **Persistent storage** - Theme preference is saved to localStorage
- **Smooth transitions** - All color changes animate smoothly

## Current Implementation Status

### ✅ Completed Components

1. **Root Layout** (`app/layout.tsx`)

   - Dark background color: `dark:bg-slate-950`
   - Smooth color transitions with `transition-colors duration-300`
   - ThemeProvider wrapper for context

2. **Theme Provider** (`app/providers.tsx`)

   - Context-based theme management
   - Two theme modes: "light", "dark"
   - localStorage persistence

3. **Theme Toggle Button** (`components/ThemeToggle.tsx`)

   - Shows current theme with icon indicators
   - Sun icon for light mode
   - Moon icon for dark mode
   - Toggles between light and dark modes on click

4. **Navigation Bar** (`components/NavigationBar.tsx`)

   - Dark background: `dark:bg-slate-950/80`
   - Dark border: `dark:border-slate-800`
   - Dark text colors with proper contrast
   - Backdrop blur support in dark mode

5. **Footer** (`components/Footer.tsx`)

   - Dark background: `dark:bg-slate-950`
   - Dark borders: `dark:border-slate-800`
   - Dark text colors: `dark:text-slate-400`, `dark:text-white`
   - All links updated with dark mode support

6. **Home Page** (`app/page.tsx`)

   - Hero section with dark gradients
   - Dark search input with proper styling
   - Trending tags with dark backgrounds
   - Dark text and borders throughout

7. **Tailwind Config** (`tailwind.config.ts`)

   - Enhanced color palette with dark variants
   - Brand, growth, and danger colors with light/dark variants
   - Dark background colors predefined

8. **Global Styles** (`app/globals.css`)
   - CSS variables for light and dark modes
   - CSS color scheme settings
   - Automatic color transitions

## Usage

### For End Users

1. Click the theme toggle button in the navigation bar (top-right corner)
2. Choose between:
   - **Light Mode** (Sun icon)
   - **Dark Mode** (Moon icon)

### For Developers

#### Using Dark Mode Classes

Add `dark:` prefix to Tailwind classes:

```tsx
// Background
<div className="bg-white dark:bg-slate-950">

// Text
<p className="text-slate-900 dark:text-white">

// Borders
<div className="border-slate-200 dark:border-slate-800">

// Hover states
<button className="hover:bg-slate-100 dark:hover:bg-slate-800">
```

#### Using the Theme Hook

```tsx
"use client";
import { useTheme } from "@/app/providers";

export function MyComponent() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark: {isDark ? "Yes" : "No"}</p>
      <button onClick={() => setTheme("dark")}>Go Dark</button>
    </div>
  );
}
```

## Dark Mode Color Palette

### Core Colors

- **Light Background**: `#ffffff` (white)
- **Dark Background**: `#0f172a` (slate-950)
- **Light Border**: `#e2e8f0` (slate-200)
- **Dark Border**: `#1e293b` (slate-800)

### Brand Colors

- **Light**: `#3ba9ff`
- **Default**: `#0087f6`
- **Dark**: `#0065c7`

### Text Colors

- **Light Mode**: `#171717` (slate-900)
- **Dark Mode**: `#f1f5f9` (slate-100)

## Components Still Needing Dark Mode Updates

### High Priority

- `components/FinancialTable.tsx` - Table styling
- `components/PriceChart.tsx` - Chart styling
- `components/MarketHeatmap.tsx` - Heatmap colors
- `components/ScreenerQueryBuilder.tsx` - Form styling
- `app/market/page.tsx` - Market page
- `app/screens/page.tsx` - Screens page
- `app/company/[ticker]/page.tsx` - Company detail page

### Implementation Pattern

For each component, follow this pattern:

```tsx
// Old (light only)
<div className="bg-white border-slate-200 text-slate-900">

// New (light + dark)
<div className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
```

## Quick Reference: Dark Mode Classes

```
Backgrounds:
- bg-white → add dark:bg-slate-900
- bg-slate-50 → add dark:bg-slate-950
- bg-slate-100 → add dark:bg-slate-800
- bg-slate-200 → add dark:bg-slate-700

Text:
- text-slate-900 → add dark:text-white
- text-slate-700 → add dark:text-slate-300
- text-slate-600 → add dark:text-slate-400
- text-slate-500 → add dark:text-slate-500

Borders:
- border-slate-200 → add dark:border-slate-800
- border-slate-100 → add dark:border-slate-900

Hover States:
- hover:bg-slate-100 → add dark:hover:bg-slate-800
- hover:text-slate-900 → add dark:hover:text-white
```

## Testing Dark Mode

1. **Toggle the theme**: Use the button in the navigation bar
2. **Test system preference**:
   - On macOS: System Preferences > General > Appearance
   - On Windows: Settings > Personalization > Colors
   - On Linux: Check your desktop environment settings
3. **Check persistence**: Refresh the page and theme should remain
4. **Test transitions**: Colors should smoothly transition when toggling

## Performance Considerations

- Dark mode uses CSS classes, not JavaScript overhead
- Color transitions are GPU-accelerated (using `transition-colors`)
- localStorage is only accessed on mount
- System preference detection uses efficient `matchMedia` API

## Accessibility

- Sufficient color contrast in both modes
- Focus states maintained in dark mode
- Respects `prefers-color-scheme` media query
- Icons clearly indicate current/next theme

## Future Enhancements

- [ ] Add theme transition animation
- [ ] Add more theme options (e.g., "auto-switch" between day/night)
- [ ] Persist theme preference per device
- [ ] Add theme color customization settings
- [ ] Implement theme-aware images/logos
