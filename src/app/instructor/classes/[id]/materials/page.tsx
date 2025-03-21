'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash, Edit, Eye, Download } from 'lucide-react';

type ClassMaterial = {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  fileType?: string;
  content?: string;
  order: number;
  dueDate?: string;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ClassMaterialsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        const classResponse = await fetch(`/api/classes/${params.id}`);
        if (!classResponse.ok) {
          throw new Error('Failed to fetch class details');
        }
        const classData = await classResponse.json();
        setClassDetails(classData.class);
        
        // Fetch class materials
        const materialsResponse = await fetch(`/api/classes/${params.id}/curriculum`);
        if (!materialsResponse.ok) {
          throw new Error('Failed to fetch class materials');
        }
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load class materials');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchClassDetails();
    }
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{classDetails?.title || 'Class'} Materials</h1>
            <p className="text-muted-foreground">
              Manage your course materials for this class
            </p>
          </div>
          <Button asChild>
            <Link href={`/instructor/classes/${params.id}/materials/create`}>
              <Plus className="mr-2 h-4 w-4" /> Create Material
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {materials.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Materials Found</CardTitle>
                  <CardDescription>
                    You haven't created any materials for this class yet.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild>
                    <Link href={`/instructor/classes/${params.id}/materials/create`}>
                      <Plus className="mr-2 h-4 w-4" /> Create Material
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((material) => (
                  <Card key={material.id} className="hover-card-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant={material.isPublished ? "default" : "outline"}>
                          {material.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{material.type}</Badge>
                      </div>
                      <CardTitle className="text-xl mt-2">{material.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {material.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        {material.dueDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Due:</span>
                            <span>{new Date(material.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/instructor/classes/${params.id}/materials/${material.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/instructor/classes/${params.id}/materials/${material.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Filter by type tabs */}
          {['lessons', 'assignments', 'resources'].map((type) => (
            <TabsContent key={type} value={type} className="space-y-6">
              {materials.filter(m => m.type.toUpperCase() === type.slice(0, -1).toUpperCase()).length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No {type.charAt(0).toUpperCase() + type.slice(1)} Found</CardTitle>
                    <CardDescription>
                      You haven't created any {type} for this class yet.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild>
                      <Link href={`/instructor/classes/${params.id}/materials/create?type=${type.slice(0, -1)}`}>
                        <Plus className="mr-2 h-4 w-4" /> Create {type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {materials
                    .filter(m => m.type.toUpperCase() === type.slice(0, -1).toUpperCase())
                    .map((material) => (
                      <Card key={material.id} className="hover-card-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge variant={material.isPublished ? "default" : "outline"}>
                              {material.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mt-2">{material.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {material.description || 'No description provided'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 text-sm">
                            {material.dueDate && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Due:</span>
                                <span>{new Date(material.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/instructor/classes/${params.id}/materials/${material.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/instructor/classes/${params.id}/materials/${material.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
