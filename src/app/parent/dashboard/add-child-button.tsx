'use client';

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface AddChildButtonProps {
  className?: string;
}

export default function AddChildButton({ className }: AddChildButtonProps) {
  const handleClick = () => {
    const tabsElement = document.querySelector('[role="tablist"]');
    const addTabElement = tabsElement?.querySelector('[data-value="add"]');
    if (addTabElement instanceof HTMLElement) {
      addTabElement.click();
    }
  };

  return (
    <Button className={className} onClick={handleClick}>
      <UserPlus className="h-4 w-4 mr-2" />
      Add Child
    </Button>
  );
}
