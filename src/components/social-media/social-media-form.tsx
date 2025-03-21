import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { detectPlatformFromUrl, generateEmbedCode } from '@/lib/social-media-utils';

interface SocialMediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SocialMedia>) => void;
  initialData?: SocialMedia;
}

const PLATFORM_OPTIONS = [
  'Instagram',
  'YouTube',
  'Twitter',
  'X',
  'Facebook',
  'TikTok',
  'LinkedIn',
  'Other'
];

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<SocialMedia>>({
    platform: '',
    url: '',
    embedCode: '',
    isActive: true
  });
  
  const [isGeneratingEmbed, setIsGeneratingEmbed] = useState(false);
  const [previewEmbed, setPreviewEmbed] = useState<string>('');

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewEmbed(initialData.embedCode || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      embedCode: '',
      isActive: true
    });
    setPreviewEmbed('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If URL is changing, try to detect platform
    if (name === 'url' && !formData.platform) {
      const detectedPlatform = detectPlatformFromUrl(value);
      setFormData((prev: Partial<SocialMedia>) => ({
        ...prev,
        [name]: value,
        platform: detectedPlatform
      }));
    } else {
      setFormData((prev: Partial<SocialMedia>) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<SocialMedia>) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateEmbed = () => {
    if (!formData.platform || !formData.url) return;
    
    setIsGeneratingEmbed(true);
    
    try {
      const embedCode = generateEmbedCode(formData.platform, formData.url);
      setFormData((prev: Partial<SocialMedia>) => ({
        ...prev,
        embedCode
      }));
      setPreviewEmbed(embedCode);
    } catch (error) {
      console.error('Error generating embed code:', error);
    } finally {
      setIsGeneratingEmbed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate embed code before submitting
    if (formData.platform && formData.url && !formData.embedCode) {
      try {
        const embedCode = generateEmbedCode(formData.platform, formData.url);
        const updatedFormData = {
          ...formData,
          embedCode
        };
        setFormData(updatedFormData);
        onSubmit(updatedFormData);
      } catch (error) {
        console.error('Error generating embed code:', error);
        onSubmit(formData);
      }
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Social Media Post' : 'Add New Social Media Post'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => handleSelectChange('platform', value)}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Post URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url || ''}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
              <p className="text-xs text-muted-foreground">Paste the full URL to the social media post</p>
            </div>
          </div>

          <div className="hidden">
            <input
              type="hidden"
              id="embedCode"
              name="embedCode"
              value={formData.embedCode || ''}
            />
          </div>
          
          {previewEmbed && (
            <div className="space-y-2 border rounded-md p-4">
              <Label>Preview</Label>
              <div 
                className="w-full overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewEmbed }}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaForm;
