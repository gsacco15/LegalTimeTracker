import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Clock, Search, Calendar, LayoutGrid, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import toast from 'react-hot-toast';
import CaseForm from './CaseForm';
import ExportSection from './ExportSection';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseStatus = Database['public']['Tables']['cases']['Row']['status'];
type TimeLog = Database['public']['Tables']['time_logs']['Row'];

interface Attorney {
  id: string;
  name: string;
}

interface CaseWithTime extends Case {
  totalHours: number;
}

interface DashboardProps {
  selectedAttorney: Attorney | null;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedAttorney }) => {
  const [cases, setCases] = useState<CaseWithTime[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'cases' | 'export'>('cases');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAttorney]);

  const fetchData = async () => {
    try {
      let casesQuery = supabase.from('cases').select('*');
      let timeLogsQuery = supabase.from('time_logs').select('*');

      if (selectedAttorney) {
        casesQuery = casesQuery.eq('attorney_id', selectedAttorney.id);
        timeLogsQuery = timeLogsQuery.eq('attorney_id', selectedAttorney.id);
      }

      const [casesResponse, timeLogsResponse] = await Promise.all([
        casesQuery.order('created_at', { ascending: false }),
        timeLogsQuery
      ]);

      if (casesResponse.error) throw casesResponse.error;
      if (timeLogsResponse.error) throw timeLogsResponse.error;

      const casesWithTime = (casesResponse.data || []).map(case_ => {
        const caseLogs = (timeLogsResponse.data || []).filter(log => log.case_id === case_.id);
        const totalHours = caseLogs.reduce((total, log) => {
          const start = new Date(log.start_time);
          const end = new Date(log.end_time);
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);

        return {
          ...case_,
          totalHours,
        };
      });

      setCases(casesWithTime);
      setTimeLogs(timeLogsResponse.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = (cases: CaseWithTime[]) => {
    return cases.filter(case_ => {
      if (statusFilter !== 'All' && case_.status !== statusFilter) {
        return false;
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          case_.title.toLowerCase().includes(searchLower) ||
          case_.client_name.toLowerCase().includes(searchLower) ||
          (case_.description?.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) {
          return false;
        }
      }

      if (dateFilter) {
        const caseDate = startOfDay(new Date(case_.created_at));
        const filterDate = startOfDay(new Date(dateFilter));
        if (!isSameDay(caseDate, filterDate)) {
          return false;
        }
      }

      return true;
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const filteredCases = filterCases(cases);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedAttorney ? `Cases for ${selectedAttorney.name}` : 'All Cases'}
          </h1>
          {activeTab === 'cases' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewCaseForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Case
            </motion.button>
          )}
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('cases')}
              className={`${
                activeTab === 'cases'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200`}
            >
              <LayoutGrid className="h-5 w-5 mr-2" />
              Cases
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('export')}
              className={`${
                activeTab === 'export'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200`}
            >
              <FileText className="h-5 w-5 mr-2" />
              Export & Overview
            </motion.button>
          </nav>
        </div>

        {activeTab === 'cases' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'All')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCases.map((case_) => (
                <motion.div
                  key={case_.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/case/${case_.id}`}
                    className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-900">{case_.title}</h2>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Client: {case_.client_name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatHours(case_.totalHours)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {activeTab === 'export' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ExportSection 
              cases={cases} 
              timeLogs={timeLogs} 
              selectedAttorney={selectedAttorney} 
            />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showNewCaseForm && (
          <CaseForm 
            onClose={() => setShowNewCaseForm(false)} 
            onSave={() => {
              setShowNewCaseForm(false);
              fetchData();
            }}
            selectedAttorney={selectedAttorney}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;