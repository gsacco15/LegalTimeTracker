import React from 'react';
import { Scale, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-gray-600">Legal Time Tracker</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <a href="mailto:support@legaltimetracker.com" className="text-sm text-gray-500 hover:text-indigo-600">
              support@legaltimetracker.com
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © {currentYear} Legal Time Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;