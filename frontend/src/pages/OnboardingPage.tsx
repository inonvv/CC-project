import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import planeGif from '@/assets/plane.gif';
import mapPinAnim from '@/assets/lottie/map-pin.json';
import airplaneAnim from '@/assets/lottie/airplane.json';
import hotelAnim from '@/assets/lottie/hotel.json';
import attractionsAnim from '@/assets/lottie/attractions.json';
import confirmAnim from '@/assets/lottie/confirm.json';

const SLIDES = [
  {
    number: 1,
    title: 'Choose Destinations',
    description:
      'Search or click the map to pick European capitals. Build your dream multi-city route across Europe.',
    animation: mapPinAnim,
  },
  {
    number: 2,
    title: 'Schedule & Flights',
    description:
      'Set your travel dates and how many days per city. Pick a flight for every leg of the route.',
    animation: airplaneAnim,
  },
  {
    number: 3,
    title: 'Pick Hotels',
    description:
      'Select a hotel in every destination — from budget-friendly to premium suites, with room options.',
    animation: hotelAnim,
  },
  {
    number: 4,
    title: 'Choose Attractions',
    description:
      'Add one must-see attraction per city to your itinerary — with travel time estimates from your hotel.',
    animation: attractionsAnim,
    animSize: 'h-24 w-24',
  },
  {
    number: 5,
    title: 'Review & Confirm',
    description:
      'See the full summary with dates, prices, and total cost — then book your trip in one click.',
    animation: confirmAnim,
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Backdrop overlay for modal feel */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 to-background" />

      {/* Theme toggle — top right */}
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        {/* Header with plane logo */}
        <div className="flex flex-col items-center border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-6 pb-4 pt-6">
          <motion.img
            src={planeGif}
            alt="Fly & Travel"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="plane-gif mb-3 h-16 w-16"

          />
          <h1 className="text-2xl font-bold text-foreground">Fly & Travel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your multi-destination trip planner
          </p>
        </div>

        {/* Slide content */}
        <div className="relative h-[260px] overflow-hidden px-6">
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
              <div className={`mb-4 ${slide.animSize ?? 'h-32 w-32'}`}>
                <Lottie
                  animationData={slide.animation}
                  loop
                  autoplay
                  style={{ overflow: 'visible' }}
                />
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
          {currentSlide > 0 ? (
            <Button
              variant="ghost"
              onClick={goPrev}
              className="text-muted-foreground"
            >
              Back
            </Button>
          ) : (
            <div className="w-16" />
          )}

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
              className="plane-gif h-5 w-5"

            />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
