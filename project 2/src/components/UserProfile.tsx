import React from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, User } from 'lucide-react';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserProfileProps {
  profile: Profile;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex items-center space-x-4">
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <User className="h-8 w-8 text-gray-400" />
      )}
      <div className="text-sm">
        <p className="font-medium text-gray-700">
          {profile.first_name} {profile.last_name}
        </p>
        <p className="text-gray-500">{profile.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="p-2 text-gray-400 hover:text-gray-500"
        title="Sign out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
};

export default UserProfile;