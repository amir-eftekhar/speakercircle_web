'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  Copy, 
  FolderPlus,
  Filter,
  Link2,
  Check,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GalleryPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  
  // Mock data
  const mockFolders = [
    { id: 'all', name: 'All Images' },
    { id: 'events', name: 'Event Images' },
    { id: 'classes', name: 'Class Images' },
    { id: 'banners', name: 'Banners' },
    { id: 'profiles', name: 'Profile Images' },
  ];
  
  const mockImages = [
    { 
      id: '1', 
      url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'public_speaking_workshop.jpg',
      folder: 'events',
      size: '2.4 MB',
      uploadDate: '2025-02-01',
      dimensions: '1920 x 1080'
    },
    { 
      id: '2', 
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'speech_training.jpg',
      folder: 'classes',
      size: '1.8 MB',
      uploadDate: '2025-02-15',
      dimensions: '1920 x 1080'
    },
    { 
      id: '3', 
      url: 'https://images.unsplash.com/photo-1560439513-74b037a25d84?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'conference_banner.jpg',
      folder: 'banners',
      size: '3.1 MB',
      uploadDate: '2025-03-05',
      dimensions: '2560 x 1080'
    },
    { 
      id: '4', 
      url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'students_practicing.jpg',
      folder: 'classes',
      size: '1.5 MB',
      uploadDate: '2025-03-10',
      dimensions: '1080 x 720'
    },
    { 
      id: '5', 
      url: 'https://images.unsplash.com/photo-1522152302542-71a8e5172aa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'profile_speaker.jpg',
      folder: 'profiles',
      size: '0.9 MB',
      uploadDate: '2025-03-01',
      dimensions: '800 x 800'
    },
    { 
      id: '6', 
      url: 'https://images.unsplash.com/photo-1553002401-c0e266128f13?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
      name: 'event_crowd.jpg',
      folder: 'events',
      size: '2.7 MB',
      uploadDate: '2025-02-20',
      dimensions: '2048 x 1365'
    },
  ];
  
  const filteredImages = currentTab === 'all' 
    ? mockImages 
    : mockImages.filter(img => img.folder === currentTab);
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };
  
  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    // In a real app, you would call an API to delete the selected images
    console.log('Deleting images:', selectedImages);
    setSelectedImages([]);
    setShowDeleteConfirm(false);
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Media Gallery</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Images uploaded successfully!
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete {selectedImages.length} selected image(s)? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {mockFolders.map(folder => (
                  <button
                    key={folder.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-100 flex items-center gap-2 ${currentTab === folder.id ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => setCurrentTab(folder.id)}
                  >
                    {folder.id === 'all' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : folder.id === 'events' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : folder.id === 'classes' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : folder.id === 'banners' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {folder.name}
                  </button>
                ))}
              </nav>
              
              <Separator className="my-4" />
              
              <Button className="w-full gap-2" variant="outline" size="sm">
                <FolderPlus className="h-4 w-4" /> New Folder
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="w-full" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </Label>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>Supported files: JPEG, PNG, GIF, WebP</p>
                  <p>Max file size: 10MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {currentTab === 'all' ? 'All Images' : mockFolders.find(f => f.id === currentTab)?.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="latest">
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
                  <span className="text-sm">{selectedImages.length} selected</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit2 className="h-4 w-4" /> Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div 
                    key={image.id}
                    className={`group relative border rounded-md overflow-hidden ${
                      selectedImages.includes(image.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="absolute top-2 left-2">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-gray-300"
                            checked={selectedImages.includes(image.id)}
                            onChange={() => toggleImageSelection(image.id)}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="bg-white/80 hover:bg-white text-gray-800 h-8 w-8 p-0 rounded-full"
                            onClick={() => handleCopyUrl(image.url)}
                            title="Copy URL"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="bg-white/80 hover:bg-white text-gray-800 h-8 w-8 p-0 rounded-full"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="bg-white/80 hover:bg-white text-red-600 h-8 w-8 p-0 rounded-full"
                            title="Delete"
                            onClick={() => {
                              setSelectedImages([image.id]);
                              handleBulkDelete();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 text-xs truncate">{image.name}</div>
                  </div>
                ))}
              </div>
              
              {filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium">No images found</h3>
                  <p className="text-gray-500 mb-4">Upload some images to get started</p>
                  <Label htmlFor="file-upload-empty">
                    <Button asChild>
                      <span>Upload Images</span>
                    </Button>
                  </Label>
                  <Input
                    type="file"
                    id="file-upload-empty"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500">
              {filteredImages.length > 0 && (
                <>
                  <div>Total: {filteredImages.length} images</div>
                  <Button variant="link" size="sm" className="gap-1">
                    Load More
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
