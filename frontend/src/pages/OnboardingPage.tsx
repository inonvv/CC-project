import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StepLayout } from '@/components/StepLayout';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion } from 'framer-motion';

const STEPS_INFO = [
  {
    number: 1,
    title: 'Choose Destinations',
    description: 'Search or click the map to pick European capitals for your trip.',
  },
  {
    number: 2,
    title: 'Schedule & Flights',
    description: 'Set dates, days per city, and pick a flight for every leg of the route.',
  },
  {
    number: 3,
    title: 'Pick Hotels',
    description: 'Select a hotel in every destination — from budget to premium.',
  },
  {
    number: 4,
    title: 'Choose Attractions',
    description: 'Add one must-see attraction per city to your itinerary.',
  },
  {
    number: 5,
    title: 'Review & Confirm',
    description: 'See the full summary with dates, prices, and total cost — then book it.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  useGeolocation();

  return (
    <StepLayout currentStep={0} hideNav>
      <div className="flex flex-col items-center pb-12 pt-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-2 text-4xl font-bold text-foreground"
        >
          Fly & Travel
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mb-10 max-w-md text-lg text-muted-foreground"
        >
          Plan your perfect multi-destination trip across European capitals in 5 simple steps.
        </motion.p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2"
        >
          {STEPS_INFO.map((step) => (
            <motion.div
              key={step.number}
              variants={item}
              className="flex gap-3 rounded-lg border border-border bg-white p-4 text-left shadow-sm transition-transform duration-200 hover:scale-[1.02]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {step.number}
              </span>
              <div>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button size="lg" onClick={() => navigate('/destinations')}>
            Start Planning
          </Button>
        </motion.div>
      </div>
    </StepLayout>
  );
}
