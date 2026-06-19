import { User, Bell, Lock, Globe, Palette, Mail, Phone, Calendar, MapPin, Save } from 'lucide-react';
import { useState } from 'react';

interface SettingsPageProps {
  profileData?: any;
}

export function SettingsPage({ profileData }: SettingsPageProps) {
  const [formData, setFormData] = useState({
    firstName: profileData?.firstName || 'Rohan',
    lastName: profileData?.lastName || 'Sharma',
    email: profileData?.email || 'rohan.sharma@email.com',
    phone: profileData?.phone || '+91 9876543210',
    dateOfBirth: profileData?.dateOfBirth || '2008-05-15',
    city: profileData?.city || 'Mumbai',
    state: profileData?.state || 'Maharashtra',
    currentGrade: profileData?.currentGrade || 'Class 10',
    schoolBoard: profileData?.schoolBoard || 'ICSE',
    schoolName: profileData?.schoolName || 'St. Xavier\'s High School'
  });

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main Content - 2 cols */}
        <div className="col-span-2 space-y-5">
          {/* Profile Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">Profile Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Current Grade</label>
                <input
                  type="text"
                  value={formData.currentGrade}
                  onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">Academic Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">School Board</label>
                <select 
                  value={formData.schoolBoard}
                  onChange={(e) => setFormData({ ...formData, schoolBoard: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>ICSE</option>
                  <option>CBSE</option>
                  <option>State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">School Name</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">Notification Preferences</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer">
                <div>
                  <p className="text-sm text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer">
                <div>
                  <p className="text-sm text-gray-900">SMS Alerts</p>
                  <p className="text-xs text-gray-500">Get test reminders via SMS</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer">
                <div>
                  <p className="text-sm text-gray-900">Performance Reports</p>
                  <p className="text-xs text-gray-500">Weekly performance summaries</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer">
                <div>
                  <p className="text-sm text-gray-900">Course Updates</p>
                  <p className="text-xs text-gray-500">New courses and content</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">Security</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                RS
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700">Change Photo</button>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
            <h3 className="text-sm mb-2">Account Status</h3>
            <p className="text-2xl mb-1">Premium</p>
            <p className="text-xs text-green-100">Active until Mar 2025</p>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="text-sm text-red-900 mb-3">Danger Zone</h3>
            <div className="space-y-2">
              <button className="w-full py-2 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                Deactivate Account
              </button>
              <button className="w-full py-2 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
