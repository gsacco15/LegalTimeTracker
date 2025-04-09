import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Attorney {
  id: string;
  name: string;
  email: string;
  title: string;
  is_active: boolean;
}

const AttorneyProfile = () => {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
  });

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      toast.error('Failed to fetch attorneys');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAttorney) {
        const { error } = await supabase
          .from('attorneys')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAttorney.id);
        
        if (error) throw error;
        toast.success('Attorney updated successfully');
      } else {
        const { error } = await supabase
          .from('attorneys')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          }]);
        
        if (error) throw error;
        toast.success('Attorney added successfully');
      }
      
      setShowForm(false);
      setSelectedAttorney(null);
      setFormData({ name: '', email: '', title: '' });
      fetchAttorneys();
    } catch (error) {
      toast.error(selectedAttorney ? 'Failed to update attorney' : 'Failed to add attorney');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attorney? This will affect all associated cases and time logs.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('attorneys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Attorney deleted successfully');
      fetchAttorneys();
    } catch (error) {
      toast.error('Failed to delete attorney');
      console.error('Error:', error);
    }
  };

  const handleEdit = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setFormData({
      name: attorney.name,
      email: attorney.email || '',
      title: attorney.title || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Attorney Profiles</h2>
        <button
          onClick={() => {
            setSelectedAttorney(null);
            setFormData({ name: '', email: '', title: '' });
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Attorney
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {attorneys.map((attorney) => (
          <div
            key={attorney.id}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{attorney.name}</h3>
                <p className="text-sm text-gray-500">{attorney.title}</p>
                <p className="text-sm text-gray-500">{attorney.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(attorney)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(attorney.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedAttorney ? 'Edit Attorney' : 'Add Attorney'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedAttorney(null);
                  setFormData({ name: '', email: '', title: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedAttorney(null);
                    setFormData({ name: '', email: '', title: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedAttorney ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttorneyProfile;