import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTripStore } from '@/store/tripStore';

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

  const handleStepClick = (i: number) => {
    // In preview mode, allow clicking any completed step or current step
    if (previewMode && i <= 5) {
      navigate(STEPS[i].path);
    }
    // In normal mode, allow clicking completed (past) steps for back-navigation
    else if (i < currentStep) {
      navigate(STEPS[i].path);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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

      {/* Step Indicator */}
      <div className="border-b border-border bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
          {STEPS.map((step, i) => {
            const isClickable = previewMode || i < currentStep;
            return (
              <div key={step.path} className="flex items-center gap-2">
                <button
                  onClick={() => handleStepClick(i)}
                  disabled={!isClickable}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-transform duration-200 ${
                    isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                  } ${
                    i === currentStep
                      ? 'bg-primary text-white'
                      : i < currentStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </button>
                <span
                  className={`hidden text-sm sm:inline ${
                    i === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="mx-1 h-px w-4 bg-border sm:w-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
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
              onClick={() => {
                if (currentStep > 0) navigate(STEPS[currentStep - 1].path);
              }}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            {onNext && (
              <Button onClick={onNext} disabled={nextDisabled}>
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
