import { forwardRef, type ReactNode } from "react";
import { useStepper, type StepperStep, type UseStepperOptions } from "../useStepper";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperSize = "sm" | "md" | "lg";
export type StepperTone = "neutral" | "primary";

export interface StepperRenderContext {
  step: StepperStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  isVisited: boolean;
}

export interface StepperStyledProps extends UseStepperOptions {
  /** Step content keyed by step id. */
  content?: Record<string, ReactNode>;
  /** Custom render for each step's content (alternative to `content`). Receives the active step. */
  renderContent?: (ctx: StepperRenderContext) => ReactNode;
  /** Render the nav indicators yourself. */
  renderStep?: (ctx: StepperRenderContext) => ReactNode;
  orientation?: StepperOrientation;
  size?: StepperSize;
  tone?: StepperTone;
  /** Show a Back / Next footer (and Finish on the last step). Default: true. */
  showFooter?: boolean;
  /** Customise the footer button labels. */
  labels?: { back?: string; next?: string; finish?: string };
  className?: string;
}

export const StepperStyled = forwardRef<HTMLDivElement, StepperStyledProps>(
  function StepperStyled(props, ref) {
    const {
      content,
      renderContent,
      renderStep,
      orientation = "horizontal",
      size = "md",
      tone = "primary",
      showFooter = true,
      labels,
      className,
      steps,
      ...hookOpts
    } = props;

    const stepper = useStepper({ steps, ...hookOpts });

    const visit = (i: number, step: StepperStep): StepperRenderContext => ({
      step,
      index: i,
      isActive: stepper.activeStep === i,
      isCompleted: stepper.isCompleted(step.id),
      isDisabled: !!step.disabled,
      isVisited: stepper.visitedIds.includes(step.id),
    });

    return (
      <div
        ref={ref}
        className={["rstep-root", className].filter(Boolean).join(" ")}
        data-orientation={orientation}
        data-size={size}
        data-tone={tone}
      >
        <ol className="rstep-list" aria-label="Progress">
          {steps.map((step, i) => {
            const ctx = visit(i, step);
            return (
              <li
                key={step.id}
                className="rstep-item"
                data-active={ctx.isActive || undefined}
                data-completed={ctx.isCompleted || undefined}
                data-disabled={ctx.isDisabled || undefined}
                data-visited={ctx.isVisited || undefined}
              >
                {renderStep ? (
                  renderStep(ctx)
                ) : (
                  <button
                    type="button"
                    className="rstep-trigger"
                    onClick={() => stepper.goTo(i)}
                    disabled={step.disabled}
                    aria-current={ctx.isActive ? "step" : undefined}
                  >
                    <span className="rstep-indicator" aria-hidden="true">
                      {step.icon ??
                        (ctx.isCompleted ? (
                          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 6l2.5 2.5L9.5 3.5" />
                          </svg>
                        ) : (
                          i + 1
                        ))}
                    </span>
                    <span className="rstep-label-block">
                      <span className="rstep-label">{step.label}</span>
                      {step.description && <span className="rstep-description">{step.description}</span>}
                    </span>
                  </button>
                )}
                {i < steps.length - 1 && <span className="rstep-connector" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        <div className="rstep-content" role="tabpanel" aria-labelledby={`step-${stepper.activeStepId}`}>
          {(() => {
            const cur = steps[stepper.activeStep];
            if (!cur) return null;
            if (renderContent) return renderContent(visit(stepper.activeStep, cur));
            return content?.[cur.id] ?? null;
          })()}
        </div>

        {stepper.error && (
          <div role="alert" className="rstep-error">
            {stepper.error}
          </div>
        )}

        {showFooter && (
          <div className="rstep-footer">
            <button
              type="button"
              className="rstep-btn rstep-btn--ghost"
              onClick={stepper.goPrev}
              disabled={stepper.isFirst || stepper.isPending}
            >
              {labels?.back ?? "Back"}
            </button>
            {stepper.isLast ? (
              <button
                type="button"
                className="rstep-btn rstep-btn--primary"
                onClick={() => void stepper.finish()}
                disabled={stepper.isPending}
              >
                {labels?.finish ?? "Finish"}
              </button>
            ) : (
              <button
                type="button"
                className="rstep-btn rstep-btn--primary"
                onClick={() => void stepper.goNext()}
                disabled={stepper.isPending}
              >
                {labels?.next ?? "Next"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
