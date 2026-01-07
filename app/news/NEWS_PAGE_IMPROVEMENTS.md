# News Page Improvements - Task List

## Overview
Comprehensive overhaul of the `/news` page to improve UX, design, functionality, and alignment with MarketView360 theme.

---

## Tasks

### 1. News Card Redesign
- [ ] Add thumbnail/image support with smart image distribution (avoid repetition)
- [ ] Improve card layout with better visual hierarchy
- [ ] Add hover effects and transitions
- [ ] Show source hostname with favicon/badge
- [ ] Display formatted date (relative time for recent, full date for older)
- [ ] Show read time estimate
- [ ] Display associated ticker badges (max 3-4)
- [ ] Add "Visit Source" button with external link warning
- [ ] Make card clickable to navigate to dedicated news article page
- [ ] Clean content preview (remove "View Comments", etc.)
- [ ] Proper light/dark theme support

### 2. News Header & Search Improvements
- [ ] Clean, prominent search bar for headline/keyword search
- [ ] Move ticker filter inside a Filters dropdown/panel
- [ ] Move date range inside Filters dropdown/panel
- [ ] Add Sort By dropdown (Latest First, Oldest First, Relevance)
- [ ] Improve responsive design
- [ ] Better visual hierarchy

### 3. Filters Panel
- [ ] Create collapsible Filters button/panel
- [ ] Ticker search with toggle "Show news for these tickers only"
- [ ] Multi-ticker selection support
- [ ] Date range picker (From - To)
- [ ] Clear filters functionality
- [ ] Active filter indicators/badges

### 4. Pagination System
- [ ] Implement infinite scroll with "Load More" button option
- [ ] Implement numbered pagination (1, 2, 3...) option
- [ ] User preference selection stored in localStorage
- [ ] Add pagination preference setting to Appearance settings page

### 5. News Article Detail Page (Slug Page)
- [ ] Create `/news/[slug]` dynamic route
- [ ] Full article content display with good typography
- [ ] Handle very large content (collapsible sections or "Read More")
- [ ] Handle hyperlinks with privacy warning (show URL before clicking)
- [ ] Related tickers section
- [ ] Source attribution with "Visit Original Source" button (with warning)
- [ ] Share functionality (optional)
- [ ] Back to news list navigation
- [ ] Responsive design for comfortable reading

### 6. External Link Warning Dialog
- [ ] Create reusable warning dialog component
- [ ] Show destination URL
- [ ] Explain user is leaving MarketView360
- [ ] "Continue" and "Cancel" buttons
- [ ] Optional "Don't show again" checkbox (stored in localStorage)

### 7. Image Management
- [ ] Use images from `/public/news_images/` folder
- [ ] Implement smart distribution algorithm to avoid same image appearing close together
- [ ] Fallback for missing images
- [ ] Proper image optimization with Next.js Image component

### 8. Skeleton & Loading States
- [ ] Update skeleton to match new card design
- [ ] Add skeleton for article detail page
- [ ] Smooth loading transitions

### 9. Empty & Error States
- [ ] Improved empty state design
- [ ] Better error handling with retry

### 10. Appearance Settings Integration
- [ ] Add "News Pagination Style" option (Infinite Scroll / Numbered Pages)
- [ ] Persist using localStorage
- [ ] Apply setting in news page

---

## Progress Tracking

| Task | Status | Notes |
|------|--------|-------|
| 1. News Card Redesign | ✅ Complete | NewsCardNew.tsx with images, better layout, theme support |
| 2. News Header & Search | ✅ Complete | NewsHeaderNew.tsx with clean search bar |
| 3. Filters Panel | ✅ Complete | NewsFilters.tsx with ticker filter, date range, sort |
| 4. Pagination System | ✅ Complete | NewsGridNew.tsx with infinite scroll / numbered pages |
| 5. News Article Detail Page | ✅ Complete | [slug]/page.tsx with full article view |
| 6. External Link Warning | ✅ Complete | ExternalLinkWarning.tsx dialog component |
| 7. Image Management | ✅ Complete | newsImages.ts with smart distribution |
| 8. Skeleton & Loading States | ✅ Complete | NewsSkeletonNew.tsx for cards and article |
| 9. Empty & Error States | ✅ Complete | Included in NewsGridNew.tsx |
| 10. Appearance Settings | ✅ Complete | Added pagination preference to settings |

---

## Technical Notes
- Use `lucide-react` and `react-icons` for icons
- Use existing UI components from `@/components/ui/`
- Theme colors: `brand`, `growth`, `danger`, slate variants
- Use `cn()` from `@/lib/utils` for class merging
- LocalStorage keys: `news_pagination_style`, `external_link_warning_dismissed`
- Available packages: `date-fns`, `framer-motion`, `react-intersection-observer`
