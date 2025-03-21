'use client';

import { Button } from "@/components/ui/button";

interface ViewClassesButtonProps {
  childId: string;
}

export default function ViewClassesButton({ childId }: ViewClassesButtonProps) {
  const handleClick = () => {
    const tabsElement = document.querySelector('[role="tablist"]');
    const childTabElement = tabsElement?.querySelector(`[data-value="${childId}"]`);
    if (childTabElement instanceof HTMLElement) {
      childTabElement.click();
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      View Classes
    </Button>
  );
}
