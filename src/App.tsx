import { HashRouter, Routes, Route } from 'react-router';
import { NavBar } from '@/components/shared/NavBar';
import { GanttPage } from '@/pages/GanttPage';
import { TimelinePage } from '@/pages/TimelinePage';

function App() {
  return (
    <HashRouter>
      <div className="flex h-full flex-col">
        <NavBar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<GanttPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
