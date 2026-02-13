import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '@/components/StepLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTripStore } from '@/store/tripStore';
import { motion } from 'framer-motion';
import api from '@/services/api';
import planeGif from '@/assets/plane.gif';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.35, ease: 'easeOut' },
  }),
};

export default function SummaryPage() {
  const navigate = useNavigate();
  const destinations = useTripStore((s) => s.destinations);
  const startDate = useTripStore((s) => s.startDate);
  const durations = useTripStore((s) => s.durations);
  const selectedFlights = useTripStore((s) => s.selectedFlights);
  const selectedHotels = useTripStore((s) => s.selectedHotels);
  const selectedAttractions = useTripStore((s) => s.selectedAttractions);
  const getTotalPrice = useTripStore((s) => s.getTotalPrice);
  const setPreviewMode = useTripStore((s) => s.setPreviewMode);
  const origin = useTripStore((s) => s.origin);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalPrice = getTotalPrice();

  const computeDates = () => {
    if (!startDate) return {};
    const dates: Record<number, { start: string; end: string }> = {};
    let current = new Date(startDate);
    for (const dest of destinations) {
      const start = current.toISOString().split('T')[0];
      const days = durations[dest.id] || 1;
      current = new Date(current.getTime() + days * 86400000);
      const end = current.toISOString().split('T')[0];
      dates[dest.id] = { start, end };
    }
    return dates;
  };

  const dates = computeDates();

  const handleConfirm = async () => {
    setSaving(true);
    await api.post('/trips', { total_price: totalPrice });
    setSaving(false);
    setConfirmed(true);
  };

  const handlePreview = () => {
    setPreviewMode(true);
    navigate('/destinations');
  };

  if (confirmed) {
    return (
      <StepLayout currentStep={5} hideNav>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.img
              src={planeGif}
              alt="Trip Confirmed"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="mb-6 h-24 w-24"
            />
            <h2 className="mb-4 text-3xl font-bold text-primary">Trip Confirmed!</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Your trip has been saved. Total cost: ${totalPrice.toFixed(2)}
            </p>
            <Button variant="outline" onClick={handlePreview} className="gap-2">
              <img src={planeGif} alt="" className="h-5 w-5" />
              Review My Trip
            </Button>
          </motion.div>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout currentStep={5} hideNav>
      {/* Scrollable summary with staggered fade-in */}
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
        <motion.div
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Trip Summary</h2>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                Preview Steps
              </Button>
            </div>
          </motion.div>

          {/* Itinerary */}
          <motion.div variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {destinations.map((dest) => (
                    <div key={dest.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                      <span className="font-medium">{dest.city}</span>
                      <span className="text-muted-foreground">
                        {dates[dest.id]?.start} to {dates[dest.id]?.end} ({durations[dest.id]} days)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Flights */}
          <motion.div variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={planeGif} alt="" className="h-5 w-5" />
                  Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(selectedFlights).map(([key, flight]) => {
                    const idx = parseInt(key.replace('segment-', ''), 10);
                    const allPoints = [origin?.city, ...destinations.map((d) => d.city), origin?.city];
                    return (
                      <div key={key} className="flex justify-between border-b border-border pb-2 last:border-0">
                        <span>
                          {allPoints[idx]} → {allPoints[idx + 1]}
                        </span>
                        <span className="text-muted-foreground">
                          {flight.departure} — ${flight.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hotels */}
          <motion.div variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle>Hotels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {destinations.map((dest) => {
                    const hotel = selectedHotels[dest.id];
                    if (!hotel) return null;
                    const days = durations[dest.id] || 1;
                    return (
                      <div key={dest.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                        <span>
                          {dest.city}: {hotel.name}
                        </span>
                        <span className="text-muted-foreground">
                          ${hotel.price_per_night}/night x {days} = ${(hotel.price_per_night * days).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attractions */}
          <motion.div variants={fadeUp} custom={4}>
            <Card>
              <CardHeader>
                <CardTitle>Attractions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {destinations.map((dest) => {
                    const attraction = selectedAttractions[dest.id];
                    if (!attraction) return null;
                    return (
                      <div key={dest.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                        <span>
                          {dest.city}: {attraction.name}
                        </span>
                        <span className="text-muted-foreground">${attraction.price}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total */}
          <motion.div variants={fadeUp} custom={5}>
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
              <p className="text-lg text-muted-foreground">Total Trip Cost</p>
              <p className="text-4xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="pb-8 text-center">
            <Button size="lg" onClick={handleConfirm} disabled={saving} className="gap-2 text-base">
              {saving ? (
                <>
                  <img src={planeGif} alt="" className="h-5 w-5" />
                  Booking your trip...
                </>
              ) : (
                <>
                  Fly Me A Travel
                  <img src={planeGif} alt="" className="h-6 w-6" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </StepLayout>
  );
}
