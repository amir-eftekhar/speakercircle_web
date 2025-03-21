'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Image as ImageIcon,
  Calendar,
  Users,
  Bookmark,
  X,
  ZoomIn
} from 'lucide-react';

export default function PublicGalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Gallery images - empty for now, will be populated from the database
  const galleryImages: {
    id: string;
    url: string;
    title: string;
    description: string;
    category: string;
    date: string;
  }[] = [];
  
  const filteredImages = galleryImages
    .filter(image => 
      (activeTab === 'all' || image.category === activeTab) &&
      (searchQuery === '' || 
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
      
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            type="text"
            placeholder="Search photos..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> All Photos
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Classes
            </TabsTrigger>
            <TabsTrigger value="speakers" className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" /> Speakers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <GalleryItem 
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <GalleryItem 
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="classes" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <GalleryItem 
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="speakers" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <GalleryItem 
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Image lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button 
              variant="ghost" 
              className="absolute right-0 top-0 text-white z-10 p-1 h-8 w-8" 
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative">
                <div className="relative w-full h-[70vh]">
                  <Image 
                    src={galleryImages.find(img => img.id === selectedImage)?.url || ''} 
                    alt={galleryImages.find(img => img.id === selectedImage)?.title || ''}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">
                  {galleryImages.find(img => img.id === selectedImage)?.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  {galleryImages.find(img => img.id === selectedImage)?.description}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {galleryImages.find(img => img.id === selectedImage)?.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {filteredImages.length === 0 && (
        <div className="text-center py-12 border rounded-md">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Our Gallery is Coming Soon!</h3>
          <p className="text-gray-500">We're currently collecting photos from our events and classes.</p>
          <p className="text-gray-500 mt-2">Check back soon to see highlights from our community!</p>
        </div>
      )}
    </div>
  );
}

type GalleryItemProps = {
  image: {
    id: string;
    url: string;
    title: string;
    description: string;
    category: string;
    date: string;
  };
  onClick: () => void;
};

function GalleryItem({ image, onClick }: GalleryItemProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square">
        <Image 
          src={image.url} 
          alt={image.title} 
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="ghost" className="text-white bg-black bg-opacity-50 rounded-full h-10 w-10 p-0">
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium line-clamp-1">{image.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{image.description}</p>
      </CardContent>
    </Card>
  );
}
