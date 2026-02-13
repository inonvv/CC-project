import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion, AnimatePresence } from 'framer-motion';
import planeGif from '@/assets/plane.gif';

const SLIDES = [
  {
    number: 1,
    title: 'Choose Destinations',
    description:
      'Search or click the map to pick European capitals. Build your dream multi-city route across Europe.',
    icon: (
      <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Schedule & Flights',
    description:
      'Set your travel dates and how many days per city. Pick a flight for every leg of the route.',
    icon: (
      <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Pick Hotels',
    description:
      'Select a hotel in every destination — from budget-friendly to premium suites, with room options.',
    icon: (
      <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Choose Attractions',
    description:
      'Add one must-see attraction per city to your itinerary — with travel time estimates from your hotel.',
    icon: (
      <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'Review & Confirm',
    description:
      'See the full summary with dates, prices, and total cost — then book your trip in one click.',
    icon: (
      <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  useGeolocation();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = currentSlide === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      navigate('/destinations');
    } else {
      setDirection(1);
      setCurrentSlide((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((s) => s - 1);
    }
  };

  const goToSlide = (i: number) => {
    setDirection(i > currentSlide ? 1 : -1);
    setCurrentSlide(i);
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/* Backdrop overlay for modal feel */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 to-white" />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
      >
        {/* Header with plane logo */}
        <div className="flex flex-col items-center border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-6 pb-4 pt-6">
          <motion.img
            src={planeGif}
            alt="Fly & Travel"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-3 h-16 w-16"

          />
          <h1 className="text-2xl font-bold text-foreground">Fly & Travel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your multi-destination trip planner
          </p>
        </div>

        {/* Slide content */}
        <div className="relative h-[220px] overflow-hidden px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-x-6 flex h-full flex-col items-center justify-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {slide.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {slide.number}
                </span>
                <h2 className="text-lg font-bold text-foreground">{slide.title}</h2>
              </div>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted hover:bg-primary/30'
              }`}
            />
          ))}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="text-muted-foreground"
          >
            Back
          </Button>

          <button
            onClick={() => navigate('/destinations')}
            className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            Skip
          </button>

          <Button onClick={goNext} className="gap-2">
            {isLast ? "Let's Go" : 'Next'}
            <img
              src={planeGif}
              alt=""
              className="h-5 w-5"
  
            />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
