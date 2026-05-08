import { forwardRef } from "react";
import type { ReactNode } from "react";
import { useImage } from "../useImage";

export interface ImageStyledProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallback?: ReactNode;
  placeholder?: "blur" | "skeleton" | "color" | "none";
  blurDataURL?: string;
  placeholderColor?: string;
  lazy?: boolean;
  aspectRatio?: string | number;
  width?: number | string;
  height?: number | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "full";
  crossOrigin?: "anonymous" | "use-credentials";
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageStyled = forwardRef<HTMLImageElement, ImageStyledProps>(
  function ImageStyled(
    {
      src,
      alt,
      fallbackSrc,
      fallback,
      placeholder = "skeleton",
      blurDataURL,
      placeholderColor,
      lazy = true,
      aspectRatio,
      width,
      height,
      objectFit = "cover",
      objectPosition = "center",
      radius = "none",
      crossOrigin,
      onLoad,
      onError,
      className,
      style,
    },
    ref,
  ) {
    const { imgProps, isLoading, isError, isLoaded } = useImage({
      src,
      alt,
      fallbackSrc,
      lazy,
      crossOrigin,
      onLoad,
      onError,
    });

    const wrapperClass = ["rimg-wrapper", className].filter(Boolean).join(" ");

    const resolvedPlaceholderColor =
      placeholder === "color" ? (placeholderColor ?? "#f4f4f5") : undefined;

    return (
      <div
        className={wrapperClass}
        data-loaded={isLoaded ? "true" : undefined}
        data-error={isError ? "true" : undefined}
        data-placeholder={placeholder}
        data-object-fit={objectFit}
        data-radius={radius}
        aria-busy={isLoading ? true : undefined}
        style={{
          aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
          width: width !== undefined ? width : undefined,
          height: height !== undefined ? height : undefined,
          backgroundColor: resolvedPlaceholderColor,
          ...style,
        }}
      >
        {!isLoaded && !isError && placeholder === "skeleton" && (
          <div className="rimg-skeleton" aria-hidden="true" />
        )}

        {!isLoaded && !isError && placeholder === "blur" && blurDataURL && (
          <img
            className="rimg-blur"
            src={blurDataURL}
            aria-hidden="true"
            alt=""
          />
        )}

        {!isError && (
          <img
            ref={ref}
            {...imgProps}
            className="rimg-img"
            style={{ objectFit, objectPosition }}
          />
        )}

        {isError && (
          fallback ?? (
            <div className="rimg-fallback">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 17l5-5 4 4 3-3 6 6"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              <span>Failed to load</span>
            </div>
          )
        )}
      </div>
    );
  },
);
