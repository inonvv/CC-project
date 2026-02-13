import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore } from '@/store/tripStore';
import planeGif from '@/assets/plane.gif';

const STEPS = [
  { path: '/', label: 'Start' },
  { path: '/destinations', label: 'Destinations' },
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
  const [transitioning, setTransitioning] = useState(false);

  const handleStepClick = (i: number) => {
    if (previewMode && i <= 5) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Plane fly-across transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.img
              src={planeGif}
              alt=""
              className="h-20 w-20"
              initial={{ x: '-40vw', opacity: 0, scale: 0.6 }}
              animate={{ x: '40vw', opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            />
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
      <div className="border-b border-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          {STEPS.map((step, i) => {
            const isClickable = previewMode || i < currentStep;
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.path} className="flex items-center">
                {/* Step node */}
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
                        className="h-7 w-7"
                      />
                    ) : isCompleted ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </button>

                  {/* Step label */}
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

                {/* Connector line (dashed flight path) */}
                {i < STEPS.length - 1 && (
                  <div className="relative mx-1 h-[2px] w-6 sm:mx-2 sm:w-12">
                    {/* Background dashed line */}
                    <div
                      className="absolute inset-0 border-t-2 border-dashed border-muted"
                    />
                    {/* Filled progress line */}
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

      {/* Navigation */}
      {!hideNav && !previewMode && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-4">
          <div className="mx-auto flex max-w-4xl justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            {onNext && (
              <Button
                onClick={handleNext}
                disabled={nextDisabled || transitioning}
                className="gap-2"
              >
                {nextLabel}
                <img src={planeGif} alt="" className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
