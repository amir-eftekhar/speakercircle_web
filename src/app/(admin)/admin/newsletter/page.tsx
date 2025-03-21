'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Save, 
  CheckCircle2, 
  FileText,
  Clock,
  Users,
} from 'lucide-react';

export default function NewsletterPage() {
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Audience options
  const audienceOptions = [
    { id: 'all', name: 'All Users' },
    { id: 'event', name: 'Event Attendees' },
    { id: 'class', name: 'Class Participants' },
  ];

  const handleSendNewsletter = async () => {
    if (!newsletterTitle || !newsletterContent) {
      return; // Validate form
    }
    
    setIsSending(true);
    
    try {
      // Here you would implement the API call to send the newsletter
      // For demonstration purposes, we'll use a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Newsletter sent:', {
        title: newsletterTitle,
        content: newsletterContent,
        audience: selectedAudience,
      });
      
      // Reset form and show success message
      setNewsletterTitle('');
      setNewsletterContent('');
      setSelectedAudience('all');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending newsletter:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Newsletter</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Newsletter sent successfully!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compose Newsletter</CardTitle>
          <CardDescription>
            Create and send newsletters to your audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Newsletter Title</Label>
            <Input 
              id="title" 
              placeholder="Enter newsletter title" 
              value={newsletterTitle}
              onChange={(e) => setNewsletterTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              placeholder="Write your newsletter content here..." 
              className="min-h-[200px]" 
              value={newsletterContent}
              onChange={(e) => setNewsletterContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select 
              value={selectedAudience} 
              onValueChange={setSelectedAudience}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAudience === 'event' && (
            <div className="space-y-2">
              <Label htmlFor="eventSelect">Select Event</Label>
              <Select defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event1">Public Speaking Workshop (Mar 15)</SelectItem>
                  <SelectItem value="event2">Debate Competition (Apr 2)</SelectItem>
                  <SelectItem value="event3">Leadership Summit (May 10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAudience === 'class' && (
            <div className="space-y-2">
              <Label htmlFor="classSelect">Select Class</Label>
              <Select defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class1">Public Speaking 101</SelectItem>
                  <SelectItem value="class2">Advanced Presentation Skills</SelectItem>
                  <SelectItem value="class3">Voice and Diction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setNewsletterTitle('');
              setNewsletterContent('');
              setSelectedAudience('all');
            }}>
              Clear
            </Button>
            <Button
              onClick={handleSendNewsletter} 
              disabled={isSending || !newsletterTitle || !newsletterContent}
              className="gap-2"
            >
              {isSending ? 'Sending...' : (
                <>
                  <Send className="h-4 w-4" /> Send Newsletter
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
