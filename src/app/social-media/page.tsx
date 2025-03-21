'use client';

import { useState, useEffect } from 'react';
// Define SocialMedia interface since it's not exported from @prisma/client
interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  username: string;
  displayName?: string;
  embedCode?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Link, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import SocialPost from '@/components/social-media/social-post';

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SocialMediaPage() {
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchSocialMediaAccounts();
  }, []);

  const fetchSocialMediaAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/social-media');
      const data = await response.json();
      setSocialMediaAccounts(data.socialMedia || []);
    } catch (error) {
      console.error('Error fetching social media accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group accounts by platform
  const groupedAccounts = socialMediaAccounts.reduce((acc, account) => {
    const platform = getPlatformKey(account.platform);
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(account);
    return acc;
  }, {} as Record<string, SocialMedia[]>);

  // Get a standardized platform key
  function getPlatformKey(platform: string): string {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return 'instagram';
    if (platformLower.includes('youtube')) return 'youtube';
    if (platformLower.includes('twitter') || platformLower.includes('x')) return 'twitter';
    if (platformLower.includes('facebook')) return 'facebook';
    if (platformLower.includes('linkedin')) return 'linkedin';
    if (platformLower.includes('tiktok')) return 'tiktok';
    return 'other';
  }

  // Get available platforms for tabs
  const availablePlatforms = Object.keys(groupedAccounts).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      {/* Hero Section */}
      <div className="relative bg-primary/10 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/30"></div>
          <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-secondary/20"></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-accent/20"></div>
        </div>
        
        <div className="container relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Connect With Us
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground">
            Follow our social channels to stay updated with the latest events, classes, and community activities.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-6 -mt-10">
        <Card className="shadow-xl border-0 bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto py-2">
                <TabsTrigger value="all" className="rounded-full">
                  All Platforms
                </TabsTrigger>
                
                {availablePlatforms.map(platform => (
                  <TabsTrigger key={platform} value={platform} className="rounded-full flex items-center gap-2">
                    {getPlatformIcon(platform)}
                    <span className="capitalize">{platform}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="pt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="h-[400px] animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="h-6 bg-muted rounded w-1/3"></div>
                        </CardHeader>
                        <CardContent className="h-full">
                          <div className="h-full bg-muted rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : socialMediaAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {socialMediaAccounts.map(account => (
                      <SocialPost key={account.id} post={account} />
                    ))}
                  </div>
                ) : (
                  <EmptyState platform="all" />
                )}
              </TabsContent>
              
              {availablePlatforms.map(platform => (
                <TabsContent key={platform} value={platform} className="pt-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-[400px] animate-pulse">
                          <CardHeader className="pb-2">
                            <div className="h-6 bg-muted rounded w-1/3"></div>
                          </CardHeader>
                          <CardContent className="h-full">
                            <div className="h-full bg-muted rounded"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : groupedAccounts[platform]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedAccounts[platform].map(account => (
                        <SocialPost key={account.id} post={account} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState platform={platform} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ platform }: { platform: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="bg-primary/5 inline-flex rounded-full p-4 mb-4">
        {getPlatformIcon(platform)}
      </div>
      <h3 className="text-xl font-medium mb-2">No social media posts found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {platform === 'all' 
          ? "We haven't added any social media posts yet. Check back later!" 
          : `We don't have any ${platform} posts yet. Check back later!`}
      </p>
      <Button variant="outline" size="sm">
        <ArrowRight className="h-4 w-4 mr-2" />
        Visit our website
      </Button>
    </div>
  );
}

// Helper functions
function getPlatformIcon(platform: string) {
  const platformLower = platform.toLowerCase();
  
  if (platformLower.includes('instagram')) return <Instagram className="h-5 w-5" />;
  if (platformLower.includes('youtube')) return <Youtube className="h-5 w-5" />;
  if (platformLower.includes('twitter') || platformLower.includes('x')) return <Twitter className="h-5 w-5" />;
  if (platformLower.includes('facebook')) return <Facebook className="h-5 w-5" />;
  if (platformLower.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
  
  return <Link className="h-5 w-5" />;
}
