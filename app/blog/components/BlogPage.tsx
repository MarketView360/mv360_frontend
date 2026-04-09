import { useState } from 'react';
import { BlogCard, BlogPost } from './BlogCard';
import { Search, Mail, Zap } from 'lucide-react';

const categories = ['All', 'Investing Tips', 'Market Analysis', 'Guides'];

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 Essential Metrics Every Stock Investor Should Track',
    excerpt: 'Learn about the key financial metrics and ratios that can help you make informed investment decisions in the US stock market.',
    author: {
      name: 'Sarah Chen',
      avatar: 'SC',
    },
    date: 'Apr 7, 2026',
    readTime: '5 min read',
    category: 'Investing Tips',
    imageUrl: 'https://images.unsplash.com/photo-1766218326892-4b261b02a03f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGFuYWx5c2lzJTIwZGF0YXxlbnwxfHx8fDE3NzU3NTM5ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'post',
  },
  {
    id: '2',
    title: 'Understanding Technical Analysis: Charts and Patterns',
    excerpt: 'A comprehensive guide to reading stock charts and identifying patterns that can signal potential trading opportunities.',
    author: {
      name: 'Michael Torres',
      avatar: 'MT',
    },
    date: 'Apr 5, 2026',
    readTime: '8 min read',
    category: 'Guides',
    imageUrl: 'https://images.unsplash.com/photo-1762279389020-eeeb69c25813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBjaGFydHMlMjBncmFwaHN8ZW58MXx8fHwxNzc1NjgyNTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'post',
  },
  {
    id: '3',
    title: 'Q1 2026 Market Outlook: Trends and Predictions',
    excerpt: 'Our analysis of the current market conditions and what to expect in the coming quarter based on economic indicators and sector performance.',
    author: {
      name: 'David Kumar',
      avatar: 'DK',
    },
    date: 'Apr 3, 2026',
    readTime: '10 min read',
    category: 'Market Analysis',
    imageUrl: 'https://images.unsplash.com/photo-1771778403262-c76572576352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGludmVzdG1lbnQlMjBzdHJhdGVneXxlbnwxfHx8fDE3NzU3NTM5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'post',
  },
  {
    id: '4',
    title: 'Introducing AI-Powered Stock Screening',
    excerpt: 'MarketView360 v2.0 now features advanced AI capabilities to help you discover investment opportunities faster than ever before.',
    author: {
      name: 'Emma Wilson',
      avatar: 'EW',
    },
    date: 'Apr 1, 2026',
    readTime: '4 min read',
    category: 'Product Updates',
    imageUrl: 'https://images.unsplash.com/photo-1735825764485-93a381fd5779?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjB0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc3NTczMDk4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'announcement',
  },
  {
    id: '5',
    title: 'How to Build a Diversified Portfolio in 2026',
    excerpt: 'Expert strategies for balancing risk and reward across different sectors, asset classes, and market capitalizations.',
    author: {
      name: 'Rachel Green',
      avatar: 'RG',
    },
    date: 'Mar 30, 2026',
    readTime: '7 min read',
    category: 'Investing Tips',
    imageUrl: 'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMHRyYWRpbmclMjBzY3JlZW58ZW58MXx8fHwxNzc1NzUzOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'post',
  },
  {
    id: '6',
    title: 'New Collaboration Features for Team Investors',
    excerpt: 'Share watchlists, insights, and strategies with your investment team using our new collaboration tools.',
    author: {
      name: 'James Park',
      avatar: 'JP',
    },
    date: 'Mar 28, 2026',
    readTime: '3 min read',
    category: 'Product Updates',
    imageUrl: 'https://images.unsplash.com/photo-1562577309-87b9a3f86d15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwYW5ub3VuY2VtZW50JTIwbWVldGluZ3xlbnwxfHx8fDE3NzU3NTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'announcement',
  },
];

export function BlogPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'announcements'>('posts');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    // First filter by tab
    if (post.type !== activeTab) return false;

    // Then filter by category if on posts tab
    const matchesCategory = activeTab === 'announcements' || selectedCategory === 'All' || post.category === selectedCategory;
    
    // Finally filter by search
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border pt-16 pb-8 sm:pt-20 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-center mb-6 max-w-4xl mx-auto font-semibold">
            Insights & Updates
          </h1>
          
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Expert analysis, investing guides, and product updates from the MarketView360 team
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0089FF] focus:border-transparent transition-shadow"
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center border-b border-border mt-8">
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setActiveTab('posts');
                  setSelectedCategory('All');
                }}
                className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-[#0089FF] text-[#0089FF]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Blog Posts
              </button>
              <button
                onClick={() => {
                  setActiveTab('announcements');
                  setSelectedCategory('All');
                }}
                className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'announcements'
                    ? 'border-[#0089FF] text-[#0089FF]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Announcements
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter - Only show for posts */}
      {activeTab === 'posts' && (
        <div className="border-b border-border sticky top-16 bg-background/95 backdrop-blur z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-[#0089FF] text-white shadow-md'
                      : 'bg-muted/50 text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[400px]">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We couldn't find any articles matching your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 bg-blue-50 text-[#0089FF] rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Stay Ahead of the Market</h2>
                <p className="text-sm text-muted-foreground">
                  Get the latest insights and product updates delivered to your inbox.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              <button className="w-full sm:w-auto px-5 py-2.5 bg-[#0089FF] text-white rounded-xl text-sm font-medium hover:bg-[#0077DD] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                <Zap className="w-4 h-4" />
                1-Click Subscribe
              </button>
              
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">or</span>
              
              <div className="flex w-full sm:w-auto gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089FF] focus:border-transparent transition-all"
                  />
                </div>
                <button className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
