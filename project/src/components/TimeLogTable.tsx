import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Database } from '../lib/database.types';

type TimeLog = Database['public']['Tables']['time_logs']['Row'];

interface TimeLogTableProps {
  timeLogs: TimeLog[];
  caseTitle: string;
}

const TimeLogTable: React.FC<TimeLogTableProps> = ({ timeLogs, caseTitle }) => {
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const minutes = Math.round(((end.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Start Time', 'End Time', 'Duration', 'Activity Type', 'Description', 'Notes'];
    const rows = timeLogs.map(log => [
      format(new Date(log.start_time), 'yyyy-MM-dd'),
      format(new Date(log.start_time), 'HH:mm'),
      format(new Date(log.end_time), 'HH:mm'),
      calculateDuration(log.start_time, log.end_time),
      log.activity_type,
      log.description || '',
      log.notes || ''
    ]);

    const csvContent = [
      [`Time Logs for ${caseTitle}`],
      [],
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${caseTitle.toLowerCase().replace(/\s+/g, '-')}-time-logs.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Complete Time Log</h2>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(log.start_time), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(log.start_time), 'h:mm a')} - {format(new Date(log.end_time), 'h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {calculateDuration(log.start_time, log.end_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.activity_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeLogTable;