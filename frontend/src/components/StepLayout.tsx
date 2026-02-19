import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore } from '@/store/tripStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import planeGif from '@/assets/plane.gif';

const STEPS = [
  { path: '/', label: 'Start' },
  { path: '/destinations', label: 'Destinations' },
  { path: '/suggestions', label: 'Suggestions' },
  { path: '/schedule', label: 'Schedule & Flights' },
  { path: '/hotels', label: 'Hotels' },
  { path: '/attractions', label: 'Attractions' },
  { path: '/summary', label: 'Summary' },
];

interface StepLayoutProps {
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideNav?: boolean;
}

export function StepLayout({
  currentStep,
  children,
  onNext,
  nextDisabled = false,
  nextLabel = 'Next',
  hideNav = false,
}: StepLayoutProps) {
  const navigate = useNavigate();
  const previewMode = useTripStore((s) => s.previewMode);
  const resetTrip = useTripStore((s) => s.resetTrip);
  const [transitioning, setTransitioning] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleStepClick = (i: number) => {
    if (previewMode && i < STEPS.length) {
      navigate(STEPS[i].path);
    } else if (i < currentStep) {
      navigate(STEPS[i].path);
    }
  };

  const handleNext = useCallback(() => {
    if (!onNext) return;
    setTransitioning(true);
    setTimeout(() => {
      onNext();
      setTransitioning(false);
    }, 700);
  }, [onNext]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      navigate(STEPS[currentStep - 1].path);
    }
  }, [currentStep, navigate]);

  const handleResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
    resetTrip();
    navigate('/');
  }, [resetTrip, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Plane fly-across transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.img
              src={planeGif}
              alt=""
              className="plane-gif h-20 w-20"
              initial={{ x: '-40vw', opacity: 0, scale: 0.6 }}
              animate={{ x: '40vw', opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-lg font-bold text-foreground">Start over?</h3>
              <p className="mb-5 text-sm text-muted-foreground">
                This will clear all your selections and take you back to the beginning.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleResetConfirm}>
                  Reset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview mode banner */}
      {previewMode && (
        <div className="bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary">
          Preview Mode — Click any step above to review your selections
          <button
            onClick={() => {
              useTripStore.getState().setPreviewMode(false);
              navigate('/summary');
            }}
            className="ml-3 rounded bg-primary px-3 py-0.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105"
          >
            Back to Summary
          </button>
        </div>
      )}

      {/* Step Indicator — flight path style */}
      <div className="relative border-b border-border bg-background px-4 py-4">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          {STEPS.map((step, i) => {
            const isClickable = previewMode || i < currentStep;
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.path} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(i)}
                    disabled={!isClickable}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    } ${
                      isCurrent
                        ? 'bg-primary/10 shadow-lg shadow-primary/20'
                        : isCompleted
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCurrent ? (
                      <motion.img
                        key={`plane-${i}`}
                        src={planeGif}
                        alt=""
                        initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="plane-gif h-7 w-7"
                      />
                    ) : isCompleted ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </button>
                  <span
                    className={`mt-1 hidden text-[10px] sm:block ${
                      isCurrent
                        ? 'font-bold text-primary'
                        : isCompleted
                          ? 'font-medium text-primary/70'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div className="relative mx-1 h-[2px] w-6 sm:mx-2 sm:w-12">
                    <div className="absolute inset-0 border-t-2 border-dashed border-muted" />
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 border-t-2 border-primary"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        style={{ transformOrigin: 'left' }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mx-auto max-w-4xl px-4 py-8 pb-24"
      >
        {children}
      </motion.div>

      {/* Bottom Navigation — visible on all steps except onboarding */}
      {currentStep > 0 && !previewMode && (
        <div className="fixed bottom-0 left-0 right-0 z-[500] border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {!hideNav ? (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 text-muted-foreground hover:text-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-destructive"
              >
                Start Over
              </button>
              {!hideNav && onNext && (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={nextDisabled || transitioning}
                  className="gap-1.5 px-5"
                >
                  {nextLabel}
                  <img src={planeGif} alt="" className="plane-gif h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
