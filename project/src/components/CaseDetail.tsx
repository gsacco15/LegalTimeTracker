import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { Clock, ArrowLeft, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import toast from 'react-hot-toast';
import CaseForm from './CaseForm';
import TimeLogForm from './TimeLogForm';
import TimeLogTable from './TimeLogTable';

type Case = Database['public']['Tables']['cases']['Row'];
type TimeLog = Database['public']['Tables']['time_logs']['Row'];
type CaseStatus = Database['public']['Tables']['cases']['Row']['status'];

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTimeLogForm, setShowTimeLogForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseData();
      fetchTimeLogs();
    }
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      toast.error('Failed to fetch case details');
      console.error('Error:', error);
      navigate('/');
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('case_id', id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setTimeLogs(data || []);
    } catch (error) {
      toast.error('Failed to fetch time logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Case deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete case');
      console.error('Error:', error);
    }
  };

  const handleDeleteTimeLog = async (timeLogId: string) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('time_logs')
        .delete()
        .eq('id', timeLogId);

      if (error) throw error;
      toast.success('Time log deleted successfully');
      fetchTimeLogs();
    } catch (error) {
      toast.error('Failed to delete time log');
      console.error('Error:', error);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalHours = () => {
    return timeLogs.reduce((total, log) => {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Cases
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
              <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(caseData.status)}`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">Client: {caseData.client_name}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteCase}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {caseData.description && (
          <p className="text-gray-600 mb-4">{caseData.description}</p>
        )}

        <div className="flex items-center text-gray-500">
          <Clock className="h-5 w-5 mr-2" />
          <span>Total Hours: {calculateTotalHours().toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Time Logs</h2>
          <button
            onClick={() => setShowTimeLogForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Time Log
          </button>
        </div>

        <div className="space-y-4">
          {timeLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex justify-between items-start p-4 border rounded-lg"
            >
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  {format(new Date(log.start_time), 'MMM d, yyyy')}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(new Date(log.start_time), 'h:mm a')} - {format(new Date(log.end_time), 'h:mm a')}
                  <span className="ml-2 text-indigo-600">
                    ({calculateDuration(log.start_time, log.end_time)})
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Activity: <span className="font-medium">{log.activity_type}</span>
                </div>
                {log.description && (
                  <p className="text-sm text-gray-600 mb-1">{log.description}</p>
                )}
                {log.notes && (
                  <p className="text-sm text-gray-500 italic">{log.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteTimeLog(log.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {timeLogs.length === 0 && (
            <p className="text-center text-gray-500 py-4">No time logs yet. Add your first time log!</p>
          )}
        </div>
      </div>

      <TimeLogTable timeLogs={timeLogs} caseTitle={caseData.title} />

      {showEditForm && caseData && (
        <CaseForm
          initialData={caseData}
          onClose={() => setShowEditForm(false)}
          onSave={async () => {
            await fetchCaseData();
            setShowEditForm(false);
          }}
        />
      )}

      {showTimeLogForm && (
        <TimeLogForm
          caseId={id!}
          onClose={() => setShowTimeLogForm(false)}
          onSave={async () => {
            await fetchTimeLogs();
            setShowTimeLogForm(false);
          }}
        />
      )}
    </div>
  );
};

export default CaseDetail;