import {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

export interface TooltipProviderContextValue {
  delayIn: number;
  delayOut: number;
  skipDelay: number;
  isGroupOpen: () => boolean;
  onOpen: () => void;
  onClose: () => void;
  getDelay: () => number;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue | null>(null);

export function useTooltipProvider(): TooltipProviderContextValue | null {
  return useContext(TooltipProviderContext);
}

export interface TooltipProviderProps {
  children: ReactNode;
  /** Delay in ms before first tooltip opens. Default: 700 */
  delayIn?: number;
  /** After all tooltips close, wait this long before resetting the skip timer. Default: 200 */
  delayOut?: number;
  /** Delay for subsequent tooltips while the group is active (sweep). Default: 50 */
  skipDelay?: number;
  className?: string;
}

export function TooltipProvider({
  children,
  delayIn = 700,
  delayOut = 200,
  skipDelay = 50,
  className,
}: TooltipProviderProps) {
  const openCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const groupActive = useRef(false);

  const isGroupOpen = useCallback(() => groupActive.current, []);

  const getDelay = useCallback(() => {
    return groupActive.current ? skipDelay : delayIn;
  }, [delayIn, skipDelay]);

  const onOpen = useCallback(() => {
    if (resetTimer.current !== null) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    openCount.current += 1;
    groupActive.current = true;
  }, []);

  const onClose = useCallback(() => {
    openCount.current = Math.max(0, openCount.current - 1);
    if (openCount.current === 0) {
      resetTimer.current = setTimeout(() => {
        groupActive.current = false;
        resetTimer.current = null;
      }, delayOut);
    }
  }, [delayOut]);

  return (
    <TooltipProviderContext.Provider
      value={{ delayIn, delayOut, skipDelay, isGroupOpen, onOpen, onClose, getDelay }}
    >
      <div className={`rtt-provider${className ? ` ${className}` : ""}`}>
        {children}
      </div>
    </TooltipProviderContext.Provider>
  );
}
