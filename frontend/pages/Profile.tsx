
import React, { useState, useEffect, useRef } from 'react';
import { profilesApi } from '../features/profiles/api';
import ErrorMessage from '../shared/components/ErrorMessage';
import FormInput from '../shared/components/FormInput';
import { parseApiError } from '../shared/utils';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  
  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const avatarRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const data = await profilesApi.getProfile();
      setProfile(data);
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrors([]);
    setSuccess('');
    
    const formData = new FormData();
    formData.append('user.email', profile.email);
    formData.append('address', profile.address || '');
    formData.append('bio', profile.bio || '');
    formData.append('phone_number', profile.phone_number || '');
    
    if (avatarRef.current?.files?.[0]) {
      formData.append('avatar', avatarRef.current.files[0]);
    }

    try {
      const updated = await profilesApi.updateProfile(formData);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrors([]);
    setSuccess('');
    try {
      await profilesApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Settings</h1>

      {success && (
        <div className="p-4 bg-green-50 text-green-700 border-l-4 border-green-500 rounded-md text-sm animate-in fade-in">
          {success}
        </div>
      )}
      <ErrorMessage messages={errors} />

      {/* Account Section */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
          Account Information
        </h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center gap-6 mb-8">
             <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200">
                   {profile.avatar ? (
                     <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                     </div>
                   )}
                </div>
                <button 
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white shadow-md border border-slate-200 p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
                </button>
                <input type="file" ref={avatarRef} className="hidden" accept="image/*" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">Profile Picture</h3>
               <p className="text-sm text-slate-400">JPG, GIF or PNG. 1MB max.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Email Address" 
              type="email"
              value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})}
            />
            <FormInput 
              label="Phone Number" 
              type="tel"
              value={profile.phone_number || ''}
              onChange={e => setProfile({...profile, phone_number: e.target.value})}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <FormInput 
            label="Short Bio" 
            type="text"
            value={profile.bio || ''}
            onChange={e => setProfile({...profile, bio: e.target.value})}
            placeholder="A quick line about yourself"
          />

          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-slate-700">Home Address</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm"
              value={profile.address || ''}
              onChange={e => setProfile({...profile, address: e.target.value})}
              placeholder="123 Street, City, Country"
            />
          </div>

          <button 
            type="submit" 
            disabled={updating}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
          >
            {updating ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
          Security
        </h2>
        
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Current Password" 
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
            <FormInput 
              label="New Password" 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={updating || !oldPassword || !newPassword}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition-all disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;
