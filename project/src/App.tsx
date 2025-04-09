import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import CaseDetail from './components/CaseDetail';
import Navigation from './components/Navigation';
import AttorneyProfile from './components/AttorneyProfile';
import Footer from './components/Footer';

interface Attorney {
  id: string;
  name: string;
}

function App() {
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation selectedAttorney={selectedAttorney} onAttorneyChange={setSelectedAttorney} />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard selectedAttorney={selectedAttorney} />} />
            <Route path="/case/:id" element={<CaseDetail selectedAttorney={selectedAttorney} />} />
            <Route path="/attorneys" element={<AttorneyProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;