import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
}

/**
 * Cloudinary URL transformation parameters
 */
interface CloudinaryTransform {
  width?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'scale' | 'fit' | 'limit';
  dpr?: number | 'auto';
}

/**
 * Transforms a Cloudinary URL with optimization parameters
 */
function transformCloudinaryUrl(url: string, options: CloudinaryTransform): string {
  // Check if it's a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const transforms: string[] = [];
  
  // Auto format for optimal delivery
  transforms.push('f_auto');
  
  // Quality
  if (options.quality === 'auto' || options.quality === undefined) {
    transforms.push('q_auto');
  } else {
    transforms.push(`q_${options.quality}`);
  }
  
  // Width
  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  
  // Crop mode
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }
  
  // DPR for retina displays
  if (options.dpr) {
    transforms.push(options.dpr === 'auto' ? 'dpr_auto' : `dpr_${options.dpr}`);
  }

  const transformString = transforms.join(',');
  
  // Insert transforms after /upload/ in Cloudinary URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Generate responsive srcset for Cloudinary images
 */
function generateSrcSet(url: string, widths: number[], quality?: number): string {
  return widths
    .map((width) => {
      const transformedUrl = transformCloudinaryUrl(url, {
        width,
        quality: quality ?? 'auto',
        format: 'auto',
      });
      return `${transformedUrl} ${width}w`;
    })
    .join(', ');
}

// Default responsive widths for product images
const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536];

/**
 * OptimizedImage Component
 * 
 * A performance-optimized image component with:
 * - Lazy loading (native browser lazy loading)
 * - Cloudinary auto format (f_auto) and quality (q_auto)
 * - Responsive images with srcset
 * - Blur placeholder support
 * - Intersection Observer for visibility-based loading
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  quality,
  placeholder = 'empty',
  onLoad,
  onError,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before in view
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized URL
  const optimizedSrc = transformCloudinaryUrl(src, {
    width: width || 800,
    quality: quality ?? 'auto',
    format: 'auto',
  });

  // Generate srcset for responsive images
  const srcSet = src.includes('cloudinary.com')
    ? generateSrcSet(src, DEFAULT_WIDTHS, quality)
    : undefined;

  // Low quality placeholder for blur effect
  const placeholderSrc = placeholder === 'blur' && src.includes('cloudinary.com')
    ? transformCloudinaryUrl(src, {
        width: 20,
        quality: 10,
        format: 'auto',
      })
    : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio }),
  };

  const imgStyle: React.CSSProperties = {
    transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    filter: isLoaded ? 'none' : 'blur(5px)',
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...({ fetchpriority: priority ? 'high' : 'auto' } as Record<string, string>)}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...imgStyle,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        className={hasError ? 'bg-gray-200' : ''}
      />

      {/* Error fallback */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
          aria-label="Image failed to load"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Utility hook for preloading critical images
 */
export function usePreloadImage(src: string, priority: boolean = false) {
  useEffect(() => {
    if (!priority || !src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = transformCloudinaryUrl(src, {
      width: 800,
      quality: 'auto',
      format: 'auto',
    });
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src, priority]);
}

export default OptimizedImage;
