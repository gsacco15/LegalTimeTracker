import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Attorney {
  id: string;
  name: string;
}

interface NavigationProps {
  selectedAttorney: Attorney | null;
  onAttorneyChange: (attorney: Attorney | null) => void;
}

const Navigation: React.FC<NavigationProps> = ({ selectedAttorney, onAttorneyChange }) => {
  const location = useLocation();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      toast.error('Failed to fetch attorneys');
      console.error('Error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Scale className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <span className="text-lg font-semibold text-gray-900 ml-2 whitespace-nowrap">Legal Time Tracker</span>
            </Link>
          </div>

          <div className="hidden md:block max-w-xs mx-4">
            <select
              value={selectedAttorney?.id || ''}
              onChange={(e) => {
                const attorney = attorneys.find(a => a.id === e.target.value);
                onAttorneyChange(attorney || null);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Attorneys</option>
              {attorneys.map((attorney) => (
                <option key={attorney.id} value={attorney.id}>
                  {attorney.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/attorneys"
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/attorneys')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Users className="h-4 w-4 mr-1.5" />
              Attorneys
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;