import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parse, setYear, setMonth } from 'date-fns';
import { Database } from '../lib/database.types';

type Case = Database['public']['Tables']['cases']['Row'];
type TimeLog = Database['public']['Tables']['time_logs']['Row'];

interface Attorney {
  id: string;
  name: string;
}

interface ExportSectionProps {
  cases: Case[];
  timeLogs: TimeLog[];
  selectedAttorney: Attorney | null;
}

const ExportSection: React.FC<ExportSectionProps> = ({ cases, timeLogs, selectedAttorney }) => {
  const [exportType, setExportType] = useState<'all' | 'range' | 'month'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth().toString());

  const calculateCaseHours = (caseId: string, filteredLogs: TimeLog[] = timeLogs) => {
    const caseLogs = filteredLogs.filter(log => log.case_id === caseId);
    return caseLogs.reduce((total, log) => {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const filterLogsByDate = (logs: TimeLog[]) => {
    if (exportType === 'all') return logs;

    return logs.filter(log => {
      const logDate = new Date(log.start_time);

      if (exportType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return isWithinInterval(logDate, { start, end });
      }

      if (exportType === 'month' && selectedYear && selectedMonthIndex) {
        const date = new Date();
        date.setFullYear(parseInt(selectedYear));
        date.setMonth(parseInt(selectedMonthIndex));
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        return isWithinInterval(logDate, { start: monthStart, end: monthEnd });
      }

      return true;
    });
  };

  const exportData = () => {
    const filteredLogs = filterLogsByDate(timeLogs);
    
    const casesData = cases.map(case_ => ({
      ...case_,
      totalHours: calculateCaseHours(case_.id, filteredLogs),
    })).filter(case_ => case_.totalHours > 0);

    const caseHeaders = ['Case ID', 'Title', 'Client', 'Status', 'Total Hours', 'Created Date', 'Description'];
    const caseRows = casesData.map(case_ => [
      case_.id,
      case_.title,
      case_.client_name,
      case_.status,
      formatHours(case_.totalHours),
      format(new Date(case_.created_at), 'yyyy-MM-dd'),
      case_.description || ''
    ]);

    const timeLogHeaders = ['Case Title', 'Date', 'Start Time', 'End Time', 'Duration', 'Activity Type', 'Description', 'Notes'];
    const timeLogRows = filteredLogs.map(log => {
      const case_ = cases.find(c => c.id === log.case_id);
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return [
        case_?.title || 'Unknown Case',
        format(start, 'yyyy-MM-dd'),
        format(start, 'HH:mm'),
        format(end, 'HH:mm'),
        formatHours(duration),
        log.activity_type,
        log.description || '',
        log.notes || ''
      ];
    });

    let dateRange = 'all-time';
    let headerDate = 'All Time';
    if (exportType === 'range' && startDate && endDate) {
      dateRange = `${startDate}-to-${endDate}`;
      headerDate = `${format(new Date(startDate), 'MMM d, yyyy')} to ${format(new Date(endDate), 'MMM d, yyyy')}`;
    } else if (exportType === 'month' && selectedYear && selectedMonthIndex) {
      const date = new Date();
      date.setFullYear(parseInt(selectedYear));
      date.setMonth(parseInt(selectedMonthIndex));
      dateRange = format(date, 'yyyy-MM');
      headerDate = format(date, 'MMMM yyyy');
    }

    const csvContent = [
      ['Legal Time Tracking - Complete Export'],
      [`Period: ${headerDate}`],
      [`Attorney: ${selectedAttorney ? selectedAttorney.name : 'All Attorneys'}`],
      ['Generated on:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      [],
      ['SUMMARY'],
      ['Total Cases:', casesData.length],
      ['Total Hours:', formatHours(casesData.reduce((sum, case_) => sum + case_.totalHours, 0))],
      [],
      ['CASES SUMMARY'],
      caseHeaders,
      ...caseRows,
      [],
      ['TIME LOGS DETAIL'],
      timeLogHeaders,
      ...timeLogRows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `legal-time-tracking-${selectedAttorney ? selectedAttorney.name.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${dateRange}-export.csv`;
    link.click();
  };

  const filteredLogs = filterLogsByDate(timeLogs);
  const totalCases = cases.length;
  const activeCases = cases.filter(case_ => case_.status === 'Active').length;
  const closedCases = cases.filter(case_ => case_.status === 'Closed').length;
  const totalHours = cases.reduce((total, case_) => total + calculateCaseHours(case_.id, filteredLogs), 0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 6 }, (_, i) => (2020 + i).toString());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Cases</h3>
          <p className="text-3xl font-bold text-indigo-600">{totalCases}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Active Cases</h3>
          <p className="text-3xl font-bold text-green-600">{activeCases}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Closed Cases</h3>
          <p className="text-3xl font-bold text-red-600">{closedCases}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Hours</h3>
          <p className="text-3xl font-bold text-blue-600">{formatHours(totalHours)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="all"
                checked={exportType === 'all'}
                onChange={(e) => setExportType(e.target.value as 'all')}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">All Time</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="range"
                checked={exportType === 'range'}
                onChange={(e) => setExportType(e.target.value as 'range')}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Date Range</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="month"
                checked={exportType === 'month'}
                onChange={(e) => setExportType(e.target.value as 'month')}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Monthly</span>
            </label>
          </div>

          {exportType === 'range' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {exportType === 'month' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonthIndex}
                  onChange={(e) => setSelectedMonthIndex(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-4 prose max-w-none">
            <p className="text-gray-600">
              Export a comprehensive report containing:
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Complete case information including status and total hours</li>
              <li>Detailed time logs for all cases</li>
              <li>Summary statistics and metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSection;