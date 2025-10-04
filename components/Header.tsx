import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface HeaderProps {
    session: Session;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-navy-200">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-navy-800 tracking-tight">
            PAO KPI Tracker
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
                Signed in as <span className="font-medium text-navy-800">{session.user.email}</span>
            </div>
            <button
                onClick={handleSignOut}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-usace-red focus:ring-offset-2"
            >
                Sign Out
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;