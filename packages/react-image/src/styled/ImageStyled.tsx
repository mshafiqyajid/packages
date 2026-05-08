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
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  radius?: "none" | "sm" | "md" | "lg" | "full";
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
      objectFit = "cover",
      objectPosition = "center",
      radius = "none",
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
      onLoad,
      onError,
    });

    const wrapperClass = ["rimg-wrapper", className].filter(Boolean).join(" ");

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
          backgroundColor:
            placeholder === "color" ? placeholderColor : undefined,
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

        {isError &&
          (fallback !== undefined ? (
            fallback
          ) : (
            <div className="rimg-fallback">&#9888;</div>
          ))}
      </div>
    );
  },
);
