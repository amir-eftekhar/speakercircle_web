// Declare global window properties for social media SDKs
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    twttr?: {
      widgets: {
        load: (element?: HTMLElement | null) => void;
      };
    };
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement | null) => void;
      };
    };
  }
}

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPlatformIcon, getPlatformColor } from '@/lib/social-media-utils';
// Define SocialMedia interface since it's not exported from @prisma/client
interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  embedCode?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Import icons
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Link, ExternalLink } from 'lucide-react';

interface SocialPostProps {
  post: SocialMedia;
  showControls?: boolean;
  onEdit?: (post: SocialMedia) => void;
  onDelete?: (post: SocialMedia) => void;
}

const SocialPost: React.FC<SocialPostProps> = ({ 
  post, 
  showControls = false,
  onEdit,
  onDelete
}) => {
  const embedRef = useRef<HTMLDivElement>(null);

  // Get the appropriate icon based on platform
  const IconComponent = () => {
    const platform = post.platform.toLowerCase();
    
    if (platform.includes('instagram')) return <Instagram className="h-5 w-5" />;
    if (platform.includes('youtube')) return <Youtube className="h-5 w-5" />;
    if (platform.includes('twitter') || platform.includes('x')) return <Twitter className="h-5 w-5" />;
    if (platform.includes('facebook')) return <Facebook className="h-5 w-5" />;
    if (platform.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (platform.includes('tiktok')) return <div className="h-5 w-5 flex items-center justify-center font-bold">TT</div>;
    
    return <Link className="h-5 w-5" />;
  };



  // Load social media scripts after component mounts
  useEffect(() => {
    // Function to load Instagram embed
    const loadInstagram = () => {
      if (window.instgrm && post.platform.toLowerCase().includes('instagram')) {
        window.instgrm.Embeds.process();
      }
    };

    // Function to load Twitter embed
    const loadTwitter = () => {
      if (window.twttr && (post.platform.toLowerCase().includes('twitter') || post.platform.toLowerCase().includes('x'))) {
        window.twttr.widgets.load(embedRef.current);
      }
    };

    // Function to load Facebook embed
    const loadFacebook = () => {
      if (window.FB && post.platform.toLowerCase().includes('facebook')) {
        window.FB.XFBML.parse(embedRef.current);
      }
    };
    
    // Function to load TikTok embed
    const loadTikTok = () => {
      if (post.platform.toLowerCase().includes('tiktok')) {
        // Check if TikTok script already exists
        const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
        
        if (!existingScript) {
          // TikTok requires its script to be loaded dynamically
          const tikTokScript = document.createElement('script');
          tikTokScript.src = 'https://www.tiktok.com/embed.js';
          tikTokScript.async = true;
          document.body.appendChild(tikTokScript);
        } else {
          // If script already exists, try to force TikTok to process embeds
          // This is a workaround since TikTok doesn't expose a global object like Instagram or Twitter
          const tikTokEmbeds = document.querySelectorAll('.tiktok-embed');
          tikTokEmbeds.forEach(embed => {
            // Force a small layout change to trigger TikTok's embed processing
            const htmlEmbed = embed as HTMLElement;
            const currentDisplay = htmlEmbed.style.display;
            htmlEmbed.style.display = 'none';
            setTimeout(() => {
              htmlEmbed.style.display = currentDisplay;
            }, 50);
          });
        }
      }
    };

    // Set a timeout to allow the embed code to be inserted into the DOM
    const timer = setTimeout(() => {
      loadInstagram();
      loadTwitter();
      loadFacebook();
      loadTikTok();
    }, 500);

    return () => clearTimeout(timer);
  }, [post.embedCode, post.platform]);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge 
            style={{ backgroundColor: getPlatformColor(post.platform) }}
            className="text-white"
          >
            <IconComponent />
            <span className="ml-1">{post.platform}</span>
          </Badge>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(post)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(post)}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <div 
          ref={embedRef}
          className={`social-media-embed w-full h-full flex justify-center items-center ${post.platform.toLowerCase().includes('tiktok') ? 'tiktok-container' : ''}`}
          style={{ 
            maxWidth: '100%', 
            minHeight: post.platform.toLowerCase().includes('tiktok') ? '500px' : '300px', 
            height: 'auto' 
          }}
          dangerouslySetInnerHTML={{ __html: post.embedCode || '' }}
        />
      </CardContent>
      
      <CardFooter className="pt-3 pb-4 px-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View Original <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default SocialPost;
