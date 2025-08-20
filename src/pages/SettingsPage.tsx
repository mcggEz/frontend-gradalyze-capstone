import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    course: '',
    student_number: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Try to refresh from backend to ensure student_number is present
        if (parsed.email) {
          fetch(`http://localhost:5000/api/auth/profile-by-email?email=${encodeURIComponent(parsed.email)}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.email) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
              }
            })
            .catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold">Gradalyze</Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.course}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg border border-gray-700 shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <Link 
                        to="/analysis"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        📊 Analysis Results
                      </Link>
                      <Link 
                        to="/dossier"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        📋 My Dossier
                      </Link>
                      <Link 
                        to="/settings"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        ⚙️ Settings
                      </Link>
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <Link 
                          to="/" 
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                        >
                          Sign Out
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center space-x-4">
          <Link 
            to="/dashboard"
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-6">⚙️ Settings</h2>
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                  <input 
                    type="text" 
                    value={user.course}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Student Number</label>
                  <input 
                    type="text" 
                    value={user.student_number}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    readOnly
                  />
                </div>
              </div>
            </div>

            

            {/* Account Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
                  📥 Download My Data
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
                  🔄 Reset Recommendations
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-900 hover:bg-red-800 text-red-300 rounded-md transition-colors">
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
