'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

interface ChildrenCardProps {
  childrenCount: number;
}

export default function ChildrenCard({ childrenCount }: ChildrenCardProps) {
  const handleAddChildClick = () => {
    const tabsElement = document.querySelector('[role="tablist"]');
    const addTabElement = tabsElement?.querySelector('[data-value="add"]');
    if (addTabElement instanceof HTMLElement) {
      addTabElement.click();
    }
  };

  return (
    <Card className="bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-700">
          <Users className="h-5 w-5 mr-2" />
          Children
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{childrenCount}</div>
        <p className="text-sm text-muted-foreground mt-1">Connected children</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full" onClick={handleAddChildClick}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </CardFooter>
    </Card>
  );
}
