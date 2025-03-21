'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FallbackImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
}

export default function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackText
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    // Create a fallback SVG with the person's name or initials
    const text = fallbackText || alt;
    const fallbackSvg = `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22${width}%22%20height%3D%22${height}%22%20viewBox%3D%220%200%20${width}%20${height}%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22${width}%22%20height%3D%22${height}%22%2F%3E%3Ctext%20fill%3D%22%23212529%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20dy%3D%22.3em%22%20text-anchor%3D%22middle%22%20x%3D%22${width/2}%22%20y%3D%22${height/2}%22%3E${text}%3C%2Ftext%3E%3C%2Fsvg%3E`;
    setImgSrc(fallbackSvg);
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
