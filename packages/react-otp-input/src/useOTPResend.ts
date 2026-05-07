import { useCallback, useEffect, useRef, useState } from "react";

export interface UseOTPResendOptions {
  /** Cooldown duration in milliseconds. Default: 30 000. */
  cooldownMs?: number;
  /** Called when the user requests a resend. May return a Promise. */
  onResend: () => void | Promise<void>;
}

export interface UseOTPResendResult {
  /** Trigger a resend. No-op while cooldown is active or a request is in flight. */
  resend: () => void;
  /** True when a resend can be triggered (no cooldown, no pending request). */
  canResend: boolean;
  /** Seconds remaining in the cooldown period (0 when not cooling down). */
  secondsLeft: number;
  /** True while `onResend` promise is in flight. */
  isPending: boolean;
}

export function useOTPResend({
  cooldownMs = 30_000,
  onResend,
}: UseOTPResendOptions): UseOTPResendResult {
  const [isPending, setIsPending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onResendRef = useRef(onResend);
  onResendRef.current = onResend;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    clearTimer();
    const totalSeconds = Math.ceil(cooldownMs / 1000);
    setSecondsLeft(totalSeconds);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownMs, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const resend = useCallback(() => {
    if (isPending || secondsLeft > 0) return;
    const result = onResendRef.current();
    if (result instanceof Promise) {
      setIsPending(true);
      result.finally(() => {
        setIsPending(false);
        startCooldown();
      });
    } else {
      startCooldown();
    }
  }, [isPending, secondsLeft, startCooldown]);

  return {
    resend,
    canResend: !isPending && secondsLeft === 0,
    secondsLeft,
    isPending,
  };
}
