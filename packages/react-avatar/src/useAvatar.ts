import React, { useCallback, useEffect, useRef, useState } from "react";

export type AvatarStatus = "loading" | "loaded" | "error";

export interface UseAvatarOptions {
  src?: string;
  name?: string;
  fallback?: React.ReactNode;
}

export interface UseAvatarResult {
  imgProps: React.ImgHTMLAttributes<HTMLImageElement>;
  fallbackProps: React.HTMLAttributes<HTMLSpanElement>;
  status: AvatarStatus;
  initials: string;
}

function deriveInitials(name: string | undefined): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function useAvatar(options: UseAvatarOptions = {}): UseAvatarResult {
  const { src, name } = options;

  const [status, setStatus] = useState<AvatarStatus>(src ? "loading" : "error");
  const prevSrcRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!src) {
      setStatus("error");
      prevSrcRef.current = undefined;
      return;
    }

    if (src === prevSrcRef.current && status !== "loading") {
      return;
    }

    prevSrcRef.current = src;
    setStatus("loading");

    const img = new Image();

    const handleLoad = () => setStatus("loaded");
    const handleError = () => setStatus("error");

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    img.src = src;

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => setStatus("error"), []);

  const initials = deriveInitials(name);

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt: name ?? "",
    onLoad: handleLoad,
    onError: handleError,
  };

  const fallbackProps: React.HTMLAttributes<HTMLSpanElement> = {
    role: "img",
    "aria-label": name ?? "avatar",
  };

  return { imgProps, fallbackProps, status, initials };
}
