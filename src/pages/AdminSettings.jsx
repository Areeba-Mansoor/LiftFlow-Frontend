import { useState, useEffect } from 'react';
import API from '../services/api';
import Sidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { User, Lock, Server, Save, Camera } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'A';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function AdminSettings() {
  const [adminUser, setAdminUser] = useState({ name: '', email: '', profileImage: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [systemConfig, setSystemConfig] = useState({ platformName: 'Lift', supportEmail: 'support@lift.com' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me').catch(() => null);
        if (res && res.data) {
          setAdminUser(res.data);
          localStorage.setItem('userInfo', JSON.stringify(res.data));
        } else {
          const stored = JSON.parse(localStorage.getItem('userInfo'));
          if (stored) setAdminUser(stored);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', adminUser.name || '');
      formData.append('email', adminUser.email || '');
      if (imageFile) formData.append('profileImage', imageFile);

      const res = await API.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Profile updated successfully!');
      const updatedInfo = res.data.user || adminUser;
      localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
      setAdminUser(updatedInfo);
      setImageFile(null);
      setPreviewUrl('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New passwords do not match!');
      return;
    }
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setMessage('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const displayImage = previewUrl || adminUser.profileImage;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onSearch={(query) => console.log('Searching in Settings:', query)} />

        <div className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {message && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-medium">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <User size={18} className="text-amber-600" />
                <h2 className="text-sm font-bold text-gray-800">Admin Profile Settings</h2>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
                {/* Profile Image Upload */}
                <div className="flex items-center gap-4 pb-2">
                  <div className="relative">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg border border-gray-200">
                        {getInitials(adminUser.name)}
                      </div>
                    )}
                    <label
                      htmlFor="profileImageInput"
                      className="absolute -bottom-1 -right-1 bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-full cursor-pointer shadow-sm"
                    >
                      <Camera size={12} />
                    </label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-gray-500">
                    <p className="font-medium text-gray-700">Profile photo</p>
                    <p className="text-[11px] mt-0.5">JPG or PNG, up to 5MB.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={adminUser.name || ''}
                    onChange={(e) => setAdminUser({ ...adminUser, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={adminUser.email || ''}
                    onChange={(e) => setAdminUser({ ...adminUser, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500 text-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </form>
            </div>

            {/* Password Change */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Lock size={18} className="text-amber-600" />
                <h2 className="text-sm font-bold text-gray-800">Security & Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-500 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500 text-gray-800"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Save size={14} /> Update Password
                </button>
              </form>
            </div>
          </div>

          {/* General Platform Settings */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Server size={18} className="text-amber-600" />
              <h2 className="text-sm font-bold text-gray-800">System Preferences</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-500 font-medium mb-1">Platform Name</label>
                <input
                  type="text"
                  value={systemConfig.platformName}
                  onChange={(e) => setSystemConfig({ ...systemConfig, platformName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-medium mb-1">Support Email</label>
                <input
                  type="email"
                  value={systemConfig.supportEmail}
                  onChange={(e) => setSystemConfig({ ...systemConfig, supportEmail: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}