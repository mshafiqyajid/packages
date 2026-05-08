import { useState, useEffect, useCallback } from "react";

export interface UseImageOptions {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
  onLoad?: () => void;
  onError?: () => void;
}

export interface UseImageResult {
  imgProps: {
    src: string;
    alt: string;
    loading: "lazy" | "eager";
    crossOrigin?: "anonymous" | "use-credentials";
    onLoad: () => void;
    onError: () => void;
    "aria-hidden": true | undefined;
  };
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
}

export function useImage(options: UseImageOptions): UseImageResult {
  const { src, alt, fallbackSrc, lazy = true, crossOrigin, onLoad, onError } = options;

  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setIsError(false);
    setIsLoaded(false);
    setUsedFallback(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (fallbackSrc && !usedFallback) {
      setCurrentSrc(fallbackSrc);
      setUsedFallback(true);
    } else {
      setIsLoading(false);
      setIsError(true);
      setIsLoaded(false);
      onError?.();
    }
  }, [fallbackSrc, usedFallback, onError]);

  return {
    imgProps: {
      src: currentSrc,
      alt,
      loading: lazy ? "lazy" : "eager",
      crossOrigin,
      onLoad: handleLoad,
      onError: handleError,
      "aria-hidden": alt === "" ? true : undefined,
    },
    isLoading,
    isError,
    isLoaded,
  };
}
