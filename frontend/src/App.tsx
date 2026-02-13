import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from '@/pages/OnboardingPage';
import DestinationPage from '@/pages/DestinationPage';
import SchedulePage from '@/pages/SchedulePage';
import HotelsPage from '@/pages/HotelsPage';
import AttractionsPage from '@/pages/AttractionsPage';
import SummaryPage from '@/pages/SummaryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/destinations" element={<DestinationPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/attractions" element={<AttractionsPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
