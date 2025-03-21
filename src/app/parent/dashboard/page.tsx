import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, User, UserPlus, Calendar, DollarSign, PlusCircle, Clock, MapPin, BookOpen, GraduationCap, School, Users, Bell, BarChart } from "lucide-react";
import Link from "next/link";
import AddChildForm from "./add-child-form";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ChildrenCard from "./children-card";
import ViewClassesButton from "./view-classes-button";
import AddChildButton from "./add-child-button";

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Check if user is a parent
  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }
  
  // Get parent-child relationships
  const relationships = await (prisma as any).parentChild.findMany({
    where: {
      parentId: session.user.id,
    },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  // Get student enrollments for all children
  const childIds = relationships.map((rel: any) => rel.childId);
  
  // Define types for the enrollment data
  type ClassInstructor = {
    user: {
      name: string;
    };
  };

  type ClassData = {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    instructorProfile?: ClassInstructor;
    instructor?: string;
    location?: string;
    price?: number;
  };

  type EnrollmentWithClass = {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    classId: string;
    class: ClassData;
    user: {
      id: string;
      name: string;
    };
  };

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: {
        in: childIds,
      },
      status: {
        in: ["CONFIRMED", "TEST"],
      },
    },
    include: {
      class: {
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          instructor: true,
          location: true,
          price: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  }) as unknown as EnrollmentWithClass[];
  
  // Group enrollments by child
  const enrollmentsByChild = enrollments.reduce((acc, enrollment) => {
    const childId = enrollment.userId;
    if (!acc[childId]) {
      acc[childId] = [];
    }
    acc[childId].push(enrollment);
    return acc;
  }, {} as Record<string, EnrollmentWithClass[]>);
  
  // Format dates
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your children's education</p>
        </div>
        <div className="flex gap-3">
          <Link href="/parent/enroll">
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Enroll Child
            </Button>
          </Link>
          <Link href="/parent/messages">
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ChildrenCard childrenCount={relationships.length} />
        
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-700">
              <School className="h-5 w-5 mr-2" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.values(enrollmentsByChild).reduce((total, enrollments) => total + enrollments.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active enrollments</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/parent/enroll">
                <PlusCircle className="h-4 w-4 mr-2" />
                Enroll in Class
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-purple-700">
              <BarChart className="h-5 w-5 mr-2" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relationships
                .filter((rel: any) => rel.status === "APPROVED")
                .slice(0, 2)
                .map((rel: any) => (
                  <div key={rel.childId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{rel.child.name}</span>
                      <span className="text-muted-foreground">
                        {enrollmentsByChild[rel.childId]?.length || 0} classes
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/parent/progress">
                <GraduationCap className="h-4 w-4 mr-2" />
                View Progress
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Family Management
        </h2>
        <Separator className="my-4" />
        
        <Tabs defaultValue={relationships.filter((rel: any) => rel.status === "APPROVED").length > 0 ? relationships.filter((rel: any) => rel.status === "APPROVED")[0].childId : "add"} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          {relationships.filter((rel: any) => rel.status === "APPROVED").map((rel: any) => (
            <TabsTrigger key={rel.childId} value={rel.childId}>
              <User className="h-4 w-4 mr-2" />
              {rel.child.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="children">
            <User className="h-4 w-4 mr-2" />
            All Children
          </TabsTrigger>
          <TabsTrigger value="add">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Child
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="children">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relationships.length > 0 ? (
              relationships.map((rel: any) => (
                <Card key={rel.id}>
                  <CardHeader>
                    <CardTitle>{rel.child.name}</CardTitle>
                    <CardDescription>{rel.child.email}</CardDescription>
                    <div className="mt-2">{getStatusBadge(rel.status)}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {rel.status === "APPROVED" 
                        ? "You can manage classes and enrollments for this child." 
                        : rel.status === "PENDING" 
                          ? "Waiting for child to approve your connection request." 
                          : "This child has rejected your connection request."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {rel.status === "APPROVED" && (
                      <ViewClassesButton childId={rel.childId} />
                    )}
                    {rel.status === "PENDING" && (
                      <Button variant="secondary" className="w-full" disabled>
                        Awaiting Approval
                      </Button>
                    )}
                    {rel.status === "REJECTED" && (
                      <Button variant="destructive" className="w-full">
                        Remove
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">You haven't added any children yet.</p>
                <AddChildButton className="mt-4" />
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Create a tab content for each child */}
        {relationships
          .filter((rel: any) => rel.status === "APPROVED")
          .map((rel: any) => {
            const childId = rel.childId;
            const childEnrollments = enrollmentsByChild[childId] || [];
            
            return (
              <TabsContent key={childId} value={childId}>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{rel.child.name}'s Enrollments</h3>
                    <Link href={`/parent/enroll?childId=${childId}`}>
                      <Button variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Enroll in Class
                      </Button>
                    </Link>
                  </div>
                  
                  {childEnrollments.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {childEnrollments.map(enrollment => (
                        <Card key={enrollment.id}>
                          <CardHeader>
                            <CardTitle>{enrollment.class.title}</CardTitle>
                            <CardDescription>
                              Instructor: {enrollment.class.instructor || "TBA"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatDate(enrollment.class.startDate)} - {formatDate(enrollment.class.endDate)}
                                </span>
                              </div>
                              {enrollment.class.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">{enrollment.class.location}</span>
                                </div>
                              )}
                              {enrollment.class.price !== undefined && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">
                                    {typeof enrollment.class.price === 'number' 
                                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(enrollment.class.price)
                                      : 'Free'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  Status: <Badge variant="outline" className="ml-1">{enrollment.status}</Badge>
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col gap-2">
                            <Button variant="default" className="w-full" asChild>
                              <Link href={`/parent/classes/${enrollment.class.id}?childId=${childId}&childName=${rel.child.name}`}>View Class Materials</Link>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/parent/enrollments/${enrollment.id}`}>Manage Enrollment</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No enrollments found for {rel.child.name}.</p>
                      <div className="flex justify-center gap-4 mt-4">
                        <Link href={`/parent/enroll?childId=${childId}`}>
                          <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Enroll in Class
                          </Button>
                        </Link>
                        <Link href="/classes">
                          <Button variant="outline">
                            Browse Classes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })
        }
        
        <TabsContent value="add">
          <AddChildForm />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
