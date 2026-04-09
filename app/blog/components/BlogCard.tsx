import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  type: 'post' | 'announcement';
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'investing tips':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'market analysis':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'product updates':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'guides':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <article className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-[#0089FF]/30">
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs border ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl mb-3 group-hover:text-[#0089FF] transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0089FF] flex items-center justify-center text-white text-sm">
              {post.author.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm">{post.author.name}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-1 text-[#0089FF] opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm">Read</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
