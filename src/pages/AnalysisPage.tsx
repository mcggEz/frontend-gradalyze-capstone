import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const AnalysisPage = () => {
  const navigate = useNavigate();
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
        
        // Check if user already has a transcript
        if (parsed.email) {
          checkExistingTranscript(parsed.email);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const checkExistingTranscript = async (email: string) => {
    try {
      const response = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('Debug - User data from API:', userData);
        
        // Check for existing archetype analysis data (highest priority)
        // Check if any archetype percentage exists, not just primary_archetype
        const hasArchetypeData = userData.archetype_realistic_percentage || 
                                userData.archetype_investigative_percentage || 
                                userData.archetype_artistic_percentage || 
                                userData.archetype_social_percentage || 
                                userData.archetype_enterprising_percentage || 
                                userData.archetype_conventional_percentage;
        
        console.log('Debug - Archetype check:', {
          hasArchetypeData,
          archetype_analyzed_at: userData.archetype_analyzed_at,
          realistic: userData.archetype_realistic_percentage,
          investigative: userData.archetype_investigative_percentage,
          artistic: userData.archetype_artistic_percentage,
          social: userData.archetype_social_percentage,
          enterprising: userData.archetype_enterprising_percentage,
          conventional: userData.archetype_conventional_percentage
        });
        
        if (hasArchetypeData && userData.archetype_analyzed_at) {
          console.log('Found existing archetype analysis, auto-rendering results...');
          
          // Set existing transcript info
          setExistingTranscript({
            hasFile: !!userData.tor_url,
            hasAnalysis: true,
            uploadedAt: userData.tor_uploaded_at,
            analyzedAt: userData.archetype_analyzed_at,
            primaryArchetype: userData.primary_archetype
          });
          
          // Set analysis data from database
          const archetypeData = {
            learning_archetype: {
              archetype_percentages: {
                realistic: userData.archetype_realistic_percentage || 0,
                investigative: userData.archetype_investigative_percentage || 0,
                artistic: userData.archetype_artistic_percentage || 0,
                social: userData.archetype_social_percentage || 0,
                enterprising: userData.archetype_enterprising_percentage || 0,
                conventional: userData.archetype_conventional_percentage || 0
              }
            }
          };
          
          setAnalysisData(archetypeData);
          
          // Also set the archetype percentages directly for easier access
          setAnalysisData({
            ...archetypeData,
            archetype_percentages: {
              realistic: userData.archetype_realistic_percentage || 0,
              investigative: userData.archetype_investigative_percentage || 0,
              artistic: userData.archetype_artistic_percentage || 0,
              social: userData.archetype_social_percentage || 0,
              enterprising: userData.archetype_enterprising_percentage || 0,
              conventional: userData.archetype_conventional_percentage || 0
            }
          });
          
          // Try to parse existing analysis results
          if (userData.tor_notes) {
            try {
              const analysisResults = JSON.parse(userData.tor_notes);
              setAnalysisResults(analysisResults);
            } catch (e) {
              console.error('Error parsing existing analysis results:', e);
            }
          }
          
          // Skip directly to processing step to show results
          setCurrentStep('processing');
        }
        
        // Check for existing transcript but no analysis yet
        if (userData.tor_url || userData.tor_notes) {
          setExistingTranscript({
            hasFile: !!userData.tor_url,
            hasAnalysis: !!userData.tor_notes,
            uploadedAt: userData.tor_uploaded_at,
            analyzedAt: userData.archetype_analyzed_at,
            primaryArchetype: userData.primary_archetype,
            fileName: userData.tor_storage_path ? userData.tor_storage_path.split('/').pop() || 'transcript.pdf' : 'transcript.pdf'
          });
        }
        
                // Check for existing certificates
        if (userData.certificate_paths && Array.isArray(userData.certificate_paths) && userData.certificate_paths.length > 0) {
          console.log('Setting existing certificates:', userData.certificate_paths);
          setExistingCertificates(userData.certificate_paths.map((path: string, index: number) => {
            const fileName = path.split('/').pop() || `Certificate ${index + 1}`;
            console.log(`Certificate ${index}: path=${path}, fileName=${fileName}`);
            return {
              id: index,
              path: path,
              name: fileName,
              uploadedAt: userData.certificate_uploaded_at || new Date().toISOString()
            };
          }));
        }
      }
    } catch (error) {
      console.error('Error checking existing transcript:', error);
    } finally {
      setIsCheckingTranscript(false);
    }
  };

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validation' | 'processing' | 'certificate-upload'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{transcript: File | null, certificates: File[]}>({
    transcript: null,
    certificates: []
  });
  const [extractedGrades, setExtractedGrades] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [existingTranscript, setExistingTranscript] = useState<any>(null);
  const [hasNewFiles, setHasNewFiles] = useState(false);

  // Handler functions for ProcessingStep
  const handleSaveToDatabase = async () => {
    if (!user.email) {
      alert('User email not found');
      return;
    }

    setIsSaving(true);
    try {
      // If we have existing analysis results, just save them directly
      if (analysisResults) {
        const response = await fetch('http://localhost:5000/api/analysis/save-existing-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            analysisResults: analysisResults
          })
        });

        const result = await response.json();
        
        if (result.saved_to_db) {
          alert('✅ Analysis results saved to database successfully!');
        } else {
          alert('⚠️ Failed to save to database. Please try again later.');
        }
      } else {
        // If no existing results, try to compute new ones
        const response = await fetch('http://localhost:5000/api/analysis/compute-archetype', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grades: extractedGrades,
            email: user.email
          })
        });

        const result = await response.json();
        
        if (result.saved_to_db) {
          alert('✅ Analysis results saved to database successfully!');
        } else {
          alert('⚠️ Analysis completed but failed to save to database. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      alert('❌ Failed to save to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCertificates = async () => {
    if (!user.email) {
      alert('User email not found');
      return;
    }

    // Go to certificate upload step without deleting existing TOR
    setCurrentStep('certificate-upload');
    setUploadedFiles({ transcript: null, certificates: [] });
  };

  const uploadCertificate = (file: File, email: string, userId?: number) => {
    return new Promise<{ url: string; storage_path?: string }>((resolve, reject) => {
      const form = new FormData();
      form.append('email', email);
      if (userId !== undefined && userId !== null) form.append('user_id', String(userId));
      form.append('kind', 'certificate');
      form.append('file', file, file.name);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl('UPLOAD_TOR'));
      xhr.withCredentials = false;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve({ url: json.url, storage_path: json.storage_path });
          else reject(new Error(json.message || 'Certificate upload failed'));
        } catch {
          reject(new Error('Invalid server response'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  };

  const deleteCertificate = async (certificatePath: string, email: string) => {
    try {
      const response = await fetch(`${getApiUrl('UPLOAD_TOR')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          certificate_path: certificatePath
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  };

  const refreshCertificates = async (email: string) => {
    try {
      console.log('Refreshing certificates for email:', email);
      const response = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        
        if (userData.certificate_paths && Array.isArray(userData.certificate_paths) && userData.certificate_paths.length > 0) {
          console.log('Setting certificates from refresh:', userData.certificate_paths);
          setExistingCertificates(userData.certificate_paths.map((path: string, index: number) => {
            const fileName = path.split('/').pop() || `Certificate ${index + 1}`;
            console.log(`Certificate ${index}: path=${path}, fileName=${fileName}`);
            return {
              id: index,
              path: path,
              name: fileName,
              uploadedAt: userData.certificate_uploaded_at || new Date().toISOString()
            };
          }));
        } else {
          console.log('No certificates found in user data');
          setExistingCertificates([]);
        }
      } else {
        console.error('Failed to fetch user data for certificate refresh');
      }
    } catch (error) {
      console.error('Error refreshing certificates:', error);
    }
  };

  const handleReanalyzeWithCertificates = async () => {
    if (!user.email) {
      alert('User email not found');
      return;
    }

    try {
      // Trigger re-analysis with new certificates
      const response = await fetch(`${getApiUrl('DEV_COMPUTE_ARCHETYPE')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Re-analysis completed:', result);
        
        // Refresh the user data to get updated archetype
        await checkExistingTranscript(user.email);
      } else {
        alert('❌ Failed to re-analyze with new certificates. Please try again.');
      }
    } catch (error) {
      console.error('Error re-analyzing with certificates:', error);
      alert('❌ Failed to re-analyze with new certificates. Please try again.');
    }
  };

  const handleResendTOR = async () => {
    if (!user.email) {
      alert('User email not found');
      return;
    }

    if (confirm('Are you sure you want to delete your current TOR and start over? This action cannot be undone.')) {
      try {
        // Call backend to delete TOR data
        const response = await fetch(`http://localhost:5000/api/users/delete-tor?email=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Reset state and go back to upload step
          setCurrentStep('upload');
          setUploadedFiles({ transcript: null, certificates: [] });
          setExtractedGrades([]);
          setAnalysisData(null);
          setAnalysisResults(null);
          setExistingTranscript(null);
          alert('✅ TOR data deleted successfully. You can now upload a new transcript.');
        } else {
          alert('❌ Failed to delete TOR data. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting TOR:', error);
        alert('❌ Failed to delete TOR data. Please try again.');
      }
    }
  };
  const [existingCertificates, setExistingCertificates] = useState<any[]>([]);
  const [isCheckingTranscript, setIsCheckingTranscript] = useState(true);

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

        {/* Main Content Area */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-6">📊 Academic Analysis</h2>
          
          {/* Loading State */}
          {isCheckingTranscript && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Checking existing analysis...</h3>
              <p className="text-gray-400">Looking for your previous transcript and analysis results.</p>
            </div>
          )}

          {/* Uploaded Files Section - hide during upload step to avoid duplicates */}
          {!isCheckingTranscript && currentStep !== 'upload' && (
            <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">📁 Uploaded Files</h3>
              
              <div className="space-y-4">
                {/* Transcript */}
                {existingTranscript?.hasFile ? (
                  <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                        <div>
                          <h4 className="font-semibold text-white">Transcript of Records</h4>
                          <p className="text-sm text-gray-300">Uploaded on {new Date(existingTranscript.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-900 text-green-200 text-xs font-medium rounded-full">
                          ✅ Uploaded
                        </span>
                    {existingTranscript.hasAnalysis && (
                          <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs font-medium rounded-full">
                            🧠 Analyzed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Transcript File Name */}
                    <div className="flex items-center justify-between p-2 bg-gray-600 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-white font-medium">
                          {existingTranscript.fileName || 'transcript.pdf'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-300">Transcript of Records</h4>
                        <p className="text-sm text-gray-400">No transcript uploaded yet</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificates */}
                <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${existingCertificates.length > 0 ? 'bg-green-500' : 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                        <svg className={`w-6 h-6 ${existingCertificates.length > 0 ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className={`font-semibold ${existingCertificates.length > 0 ? 'text-white' : 'text-gray-300'}`}>Certificates</h4>
                        <p className="text-sm text-gray-300">
                          {existingCertificates.length > 0 
                            ? `${existingCertificates.length} certificate(s) uploaded`
                            : 'No certificates uploaded yet'
                          }
                        </p>
                      </div>
                    </div>
                    {existingCertificates.length > 0 && (
                      <span className="px-2 py-1 bg-green-900 text-green-200 text-xs font-medium rounded-full">
                        ✅ {existingCertificates.length} Uploaded
                      </span>
                    )}
                  </div>
                   
                  {/* Certificate File Names */}
                  {existingCertificates.length > 0 && (
                    <div className="mt-3 space-y-2">
                                            {existingCertificates.map((cert: any, index: number) => {
                        console.log('Rendering certificate:', cert);
                        return (
                          <div key={cert.id || index} className="flex items-center justify-between p-2 bg-gray-600 rounded-md">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-white font-medium">{cert.name}</span>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete "${cert.name}"?`)) {
                                  try {
                                                                      await deleteCertificate(cert.path, user.email);
                                  // Refresh certificate data without page reload
                                  await refreshCertificates(user.email);
                                  } catch (error) {
                                    console.error('Error deleting certificate:', error);
                                    alert('❌ Failed to delete certificate. Please try again.');
                                  }
                                }
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                                                 );
                       })}
                    </div>
          )}
          
                                    {/* Certificate Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => refreshCertificates(user.email)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      🔄 Refresh
                    </button>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          try {
                            console.log('Uploading certificates:', files);
                            // Get user ID from localStorage
                            const stored = localStorage.getItem('user');
                            const parsedUser = stored ? (() => { try { return JSON.parse(stored) as any; } catch { return null; } })() : null;
                            const userId = typeof parsedUser?.id === 'number' ? parsedUser.id : undefined;
                            
                            // Upload each certificate
                            for (const file of files) {
                              console.log('Uploading file:', file.name);
                              const result = await uploadCertificate(file, user.email, userId);
                              console.log('Upload result:', result);
                            }
                            // Set flag that new files were uploaded
                            setHasNewFiles(true);
                            // Refresh certificate data without page reload
                            console.log('Refreshing certificates after upload...');
                            await refreshCertificates(user.email);
                            console.log('Certificate refresh completed');
                          } catch (error) {
                            console.error('Error uploading certificates:', error);
                            alert('❌ Failed to upload certificates. Please try again.');
                          }
                        }
                      }}
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                      <span>Add Certificate</span>
                    </label>
                    {existingCertificates.length > 0 && (
                  <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete all certificates? This action cannot be undone.')) {
                            try {
                              // Delete all certificates one by one
                              for (const cert of existingCertificates) {
                                await deleteCertificate(cert.path, user.email);
                              }
                              // Refresh certificate data without page reload
                              await refreshCertificates(user.email);
                            } catch (error) {
                              console.error('Error deleting certificates:', error);
                              alert('❌ Failed to delete some certificates. Please try again.');
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete All</span>
                  </button>
                    )}
                  </div>
                    
                  {/* Get Archetype Button - Show when new files are uploaded */}
                  {hasNewFiles && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                  <button
                        onClick={async () => {
                          try {
                            // Trigger archetype computation
                            const response = await fetch(`${getApiUrl('DEV_COMPUTE_ARCHETYPE')}`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ email: user.email }),
                            });

                                                          if (response.ok) {
                                const result = await response.json();
                                console.log('Archetype computation completed:', result);
                                alert('✅ Archetype analysis completed! Your results have been updated.');
                                // Reset the new files flag since archetype has been computed
                                setHasNewFiles(false);
                                // Refresh the page to show updated archetype
                                window.location.reload();
                              } else {
                                alert('❌ Failed to compute archetype. Please try again.');
                              }
                          } catch (error) {
                            console.error('Error computing archetype:', error);
                            alert('❌ Failed to compute archetype. Please try again.');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                                                  <span>Recalculate Archetype</span>
                  </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content based on state */}
          {!isCheckingTranscript && (
            <>
              {/* Validation Step */}
          {currentStep === 'validation' && (
            <ValidationStep 
              extractedGrades={extractedGrades}
              onValidationConfirmed={(confirmedGrades) => {
                setExtractedGrades(confirmedGrades);
                setCurrentStep('processing');
              }}
              setAnalysisResults={setAnalysisResults}
            />
          )}

              {/* Results Step */}
                  {currentStep === 'processing' && (
          <ProcessingStep 
            analysisData={analysisData} 
            analysisResults={analysisResults}
            onSaveToDatabase={handleSaveToDatabase}
                  onResendTOR={handleAddCertificates}
            isSaving={isSaving}
          />
        )}

              {/* Certificate Upload Step */}
              {currentStep === 'certificate-upload' && (
                <CertificateUploadStep 
                  user={user}
                  onCertificatesUploaded={() => {
                    alert('✅ Certificates uploaded successfully! Your archetype analysis will be updated to include the new certificates.');
                    setCurrentStep('processing');
                    handleReanalyzeWithCertificates();
                  }}
                />
              )}

              {/* Upload Step - Only if no existing analysis */}
              {currentStep === 'upload' && !existingTranscript?.hasAnalysis && (
                <UploadStep 
                  uploadedFiles={uploadedFiles}
                  onFilesUploaded={(files) => {
                    setUploadedFiles(files);
                  }}
                  onOcrComplete={(grades) => setExtractedGrades(grades)}
                  onProceedToValidation={() => setCurrentStep('validation')}
                  existingTranscript={existingTranscript}
                  existingCertificates={existingCertificates}
                  setAnalysisData={setAnalysisData}
                  setHasNewFiles={setHasNewFiles}
                />
              )}

              {/* Show existing analysis message */}
              {currentStep === 'upload' && existingTranscript?.hasAnalysis && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analysis Already Complete!</h3>
                  <p className="text-gray-400 mb-4">
                    Your primary archetype is: <strong className="text-blue-300">{existingTranscript.primaryArchetype}</strong>
                  </p>
                  <button
                    onClick={() => setCurrentStep('processing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📊 View Analysis Results
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Upload Step Component
const UploadStep = ({ uploadedFiles, onFilesUploaded, onOcrComplete, onProceedToValidation, existingTranscript, existingCertificates, setAnalysisData, setHasNewFiles }: { 
  uploadedFiles: {transcript: File | null, certificates: File[]}, 
  onFilesUploaded: (files: {transcript: File | null, certificates: File[]}) => void,
  onOcrComplete: (grades: any[]) => void,
  onProceedToValidation: () => void,
  existingTranscript?: any,
  existingCertificates?: any[],
  setAnalysisData: (data: any) => void,
  setHasNewFiles: (hasNew: boolean) => void
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState<'transcript' | 'certificates' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [torUploaded, setTorUploaded] = useState(false);
  const [torUrl, setTorUrl] = useState<string | null>(null);
  const [torStoragePath, setTorStoragePath] = useState<string | null>(null);

  // File validation
  const validateFile = (file: File, type: 'transcript' | 'certificates'): boolean => {
    const maxSize = type === 'transcript' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for transcript, 5MB for certificates
    // Restrict transcript to PDF as requested
    const allowedTypes = type === 'transcript' 
      ? ['application/pdf']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert(type === 'transcript' ? 'Please upload a PDF transcript (PDF only)' : 'Please upload PDF, DOC, DOCX, or image files only');
      return false;
    }
    
    return true;
  };

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'transcript')) {
      onFilesUploaded({ ...uploadedFiles, transcript: file });
    }
  };

  const uploadCertificate = (file: File, email: string, userId?: number) => {
    return new Promise<{ url: string; storage_path?: string }>((resolve, reject) => {
      const form = new FormData();
      form.append('email', email);
      if (userId !== undefined && userId !== null) form.append('user_id', String(userId));
      form.append('kind', 'certificate');
      form.append('file', file, file.name);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl('UPLOAD_TOR'));
      xhr.withCredentials = false;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve({ url: json.url, storage_path: json.storage_path });
          else reject(new Error(json.message || 'Certificate upload failed'));
        } catch {
          reject(new Error('Invalid server response'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  };

  const handleCertificatesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => validateFile(file, 'certificates'));
    if (validFiles.length > 0) {
      onFilesUploaded({ ...uploadedFiles, certificates: [...uploadedFiles.certificates, ...validFiles] });

      // Immediately upload each certificate
      const stored = localStorage.getItem('user');
      const parsedUser = stored ? (() => { try { return JSON.parse(stored) as any; } catch { return null; } })() : null;
      const email = parsedUser?.email || '';
      const userId = typeof parsedUser?.id === 'number' ? parsedUser.id : undefined;
      if (!email) return;
      try {
        await Promise.all(validFiles.map(f => uploadCertificate(f, email, userId)));
      } catch (err) {
        alert((err as Error).message || 'Certificate upload failed');
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'transcript' | 'certificates') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'transcript' | 'certificates') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (type === 'transcript' && files.length > 0) {
      const file = files[0];
      if (validateFile(file, 'transcript')) {
        onFilesUploaded({ ...uploadedFiles, transcript: file });
      }
    } else if (type === 'certificates') {
      const validFiles = files.filter(file => validateFile(file, 'certificates'));
      if (validFiles.length > 0) {
        onFilesUploaded({ ...uploadedFiles, certificates: [...uploadedFiles.certificates, ...validFiles] });
      }
    }
  };

  const removeFile = (type: 'transcript' | 'certificates', index?: number) => {
    if (type === 'transcript') {
      onFilesUploaded({ ...uploadedFiles, transcript: null });
    } else if (type === 'certificates' && index !== undefined) {
      const newCertificates = uploadedFiles.certificates.filter((_, i) => i !== index);
      onFilesUploaded({ ...uploadedFiles, certificates: newCertificates });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File): string => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('image')) return '🖼️';
    if (file.type.includes('word')) return '📝';
    return '📁';
  };

  const uploadTranscript = (file: File, email: string, userId?: number) => {
    return new Promise<{ tor_url: string; storage_path?: string }>((resolve, reject) => {
      const form = new FormData();
      form.append('email', email);
      form.append('file', file, file.name);
      if (userId !== undefined && userId !== null) {
        form.append('user_id', String(userId));
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl('UPLOAD_TOR'));
      xhr.withCredentials = false;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        }
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ tor_url: json.tor_url, storage_path: json.storage_path });
          } else {
            reject(new Error(json.message || 'Upload failed'));
          }
        } catch (err) {
          reject(new Error('Invalid server response'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  };

  const extractTranscript = (email: string, storagePath: string) => {
    return fetch('http://localhost:5000/api/users/extract-grades', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, storage_path: storagePath })
    }).then(async (r) => {
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.message || 'OCR extraction failed');
      console.log('Raw OCR Response:', json); // Debug log
      return json as { grades?: any[]; text?: string; analysis?: any; debug_info?: any };
    });
  };

  const handleAnalyze = async () => {
    if (!uploadedFiles.transcript) return;
    const stored = localStorage.getItem('user');
    const parsedUser = stored ? (() => { try { return JSON.parse(stored) as any; } catch { return null; } })() : null;
    const email = parsedUser?.email || '';
    const userId = typeof parsedUser?.id === 'number' ? parsedUser.id : undefined;
    if (!email) {
      alert('Please log in again to upload your transcript.');
      return;
    }

    // Upload transcript first
    if (!torUploaded) {
      setIsProcessing(true);
      try {
        const res = await uploadTranscript(uploadedFiles.transcript, email, userId);
        setTorUploaded(true);
        setTorUrl(res.tor_url || null);
        setTorStoragePath(res.storage_path || null);
        setUploadProgress(0);
        setHasNewFiles(true);
        
        // Automatically start OCR after successful upload
        if (res.storage_path) {
          await performOcrAnalysis(email, res.storage_path);
        }
      } catch (err: any) {
        alert(err.message || 'Upload failed');
        setIsProcessing(false);
        setUploadProgress(0);
      }
    }
  };

  const performOcrAnalysis = async (email: string, storagePath: string) => {
    setIsProcessing(true);
    try {
      const res = await extractTranscript(email, storagePath);
      console.log('OCR Response:', res); // Debug log
      
      // Use grades if available, otherwise fall back to text
      if (Array.isArray(res.grades) && res.grades.length > 0) {
        onOcrComplete(res.grades);
        // Store the full analysis data for the processing step
        if (res.analysis) {
          setAnalysisData(res.analysis);
        }
      } else if (res && typeof res.text === 'string' && res.text.length > 0) {
        // If no grades but we have text, create a single item for display
        onOcrComplete([{ text: res.text }]);
      } else {
        // Fallback to empty array
        onOcrComplete([]);
      }
      setIsProcessing(false);
      // Move to validation step now that grades are present
      onProceedToValidation();
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || 'OCR extraction failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Existing Data Warning */}
      {(existingTranscript || (existingCertificates && existingCertificates.length > 0)) && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-yellow-300 font-medium">Replacing Existing Data</p>
              <p className="text-yellow-200 text-sm">
                {existingTranscript && "Uploading a new transcript will replace your previous analysis. "}
                {existingCertificates && existingCertificates.length > 0 && "Uploading new certificates will add to your existing collection."}
              </p>
            </div>
          </div>
        </div>
      )}

      {isProcessing ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Processing Documents...</h3>
          <p className="text-gray-400 mb-4">Extracting grade data using OCR technology.</p>
          
          {uploadProgress > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{width: `${uploadProgress}%`}}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Transcript Upload */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              📄 Transcript of Records
              <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">Required</span>
            </h4>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragOver === 'transcript' 
                  ? 'border-blue-500 bg-blue-50/5' 
                  : uploadedFiles.transcript 
                    ? 'border-green-500 bg-green-50/5' 
                    : 'border-gray-700 hover:border-gray-600'
              }`}
              onDragOver={(e) => handleDragOver(e, 'transcript')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'transcript')}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleTranscriptUpload}
                className="hidden"
                id="transcript-upload"
              />
              
              {uploadedFiles.transcript ? (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(uploadedFiles.transcript)}</span>
                        <div className="text-left">
                          <p className="font-medium text-green-300">{uploadedFiles.transcript.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(uploadedFiles.transcript.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('transcript')}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Remove file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <label htmlFor="transcript-upload" className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Replace File</span>
                  </label>
                </div>
              ) : (
                <label htmlFor="transcript-upload" className="cursor-pointer block">
                  <div className="space-y-4">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-300 mb-2">
                        {dragOver === 'transcript' ? 'Drop your transcript here' : 'Upload Transcript'}
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Drag and drop your file here, or click to browse
                      </p>
                      <div className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Choose File</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Supported: PDF, DOC, DOCX, JPG, PNG (max. 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Certificates Upload */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              🏆 Certificates & Achievements
              <span className="ml-2 text-xs bg-gray-600 text-white px-2 py-1 rounded">Optional</span>
            </h4>
            
            {/* Existing Certificates Display */}
            {existingCertificates && existingCertificates.length > 0 && (
              <div className="mb-4 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-300 mb-3">Existing Certificates ({existingCertificates.length})</h5>
                <div className="space-y-2">
                  {existingCertificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between bg-blue-800/20 rounded p-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-300">📄</span>
                        <span className="text-sm text-blue-200">{cert.name}</span>
                      </div>
                      <span className="text-xs text-blue-300">
                        {new Date(cert.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-300 mt-2">
                  New certificates will be added to your existing collection.
                </p>
              </div>
            )}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragOver === 'certificates' 
                  ? 'border-blue-500 bg-blue-50/5' 
                  : uploadedFiles.certificates.length > 0 
                    ? 'border-green-500 bg-green-50/5' 
                    : 'border-gray-700 hover:border-gray-600'
              }`}
              onDragOver={(e) => handleDragOver(e, 'certificates')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'certificates')}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                onChange={handleCertificatesUpload}
                className="hidden"
                id="certificates-upload"
              />
              
              {uploadedFiles.certificates.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {uploadedFiles.certificates.map((file, index) => (
                      <div key={index} className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getFileIcon(file)}</span>
                            <div className="text-left">
                              <p className="font-medium text-green-300 text-sm">{file.name}</p>
                              <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile('certificates', index)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remove file"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label htmlFor="certificates-upload" className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add More Files</span>
                  </label>
                </div>
              ) : (
                <label htmlFor="certificates-upload" className="cursor-pointer block">
                  <div className="space-y-4">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-300 mb-2">
                        {dragOver === 'certificates' ? 'Drop your certificates here' : 'Upload Certificates'}
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Add certificates, achievements, or other relevant documents
                      </p>
                      <div className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Choose Files</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Supported: PDF, DOC, DOCX, JPG, PNG (max. 5MB each)
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-400">
                {!uploadedFiles.transcript && (
                  <span className="flex items-center text-red-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Choose a transcript PDF to enable upload
                  </span>
                )}
                {uploadedFiles.transcript && !torUploaded && (
                  <span className="flex items-center text-yellow-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Ready to upload and analyze transcript
                  </span>
                )}
                {torUploaded && (
                  <span className="flex items-center text-green-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Transcript uploaded successfully{torUrl ? `: ${torUrl}` : ''}
                  </span>
                )}
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={!uploadedFiles.transcript}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {!uploadedFiles.transcript ? (
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Choose Transcript First</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Upload & Analyze Transcript</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Validation Step Component (display as structured table grouped by semester)
const ValidationStep = ({ extractedGrades, onValidationConfirmed: _onConfirm, setAnalysisResults }: {
  extractedGrades: any[],
  onValidationConfirmed: (grades: any[]) => void,
  setAnalysisResults: (results: any) => void
}) => {
  const [editableData, setEditableData] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{rowIndex: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse the extracted grades to display in table format
  const parseGradesForTable = (grades: any[]) => {
    if (!Array.isArray(grades)) return [];
    
    console.log('Raw grades data:', grades); // Debug log
    
    return grades.map((grade, index) => {
      // Clean and validate the data
      const subject = grade.subject || grade.name || 'Unknown Subject';
      const units = grade.units || grade.credit_units || 3;
      const gradeValue = grade.grade || grade.score || 'N/A';
      const semester = grade.semester || 'N/A';
      const category = grade.category || grade.type || 'General';
      
      // Skip invalid entries
      if (subject === 'Unknown Subject' || units > 10 || 
          (typeof gradeValue === 'number' && (gradeValue > 5.0 || gradeValue < 0))) {
        console.log('Skipping invalid grade:', grade);
        return null;
      }
      
      // Parse course code and title from subject
      const subjectParts = subject.split(' - ');
      const courseCode = subjectParts[0] || subject;
      const courseTitle = subjectParts[1] || subject;
      
      return {
        id: index + 1,
        subject,
        courseCode,
        courseTitle,
        units,
        grade: gradeValue,
        semester,
        category
      };
    }).filter(Boolean); // Remove null entries
  };

  const tableData = parseGradesForTable(extractedGrades);

  // Initialize editable data only once
  useEffect(() => {
    if (editableData.length === 0 && tableData.length > 0) {
      setEditableData([...tableData]);
    }
  }, [extractedGrades]); // Only depend on the original data, not the processed data

  // Handle cell editing
  const handleCellClick = (rowIndex: number, field: string, value: any) => {
    if (rowIndex >= 0) {
      setEditingCell({ rowIndex, field });
      setEditValue(String(value));
    }
  };

  const handleCellEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellSave = () => {
    if (editingCell && editingCell.rowIndex >= 0) {
      const { rowIndex, field } = editingCell;
      const newData = [...editableData];
      
      if (rowIndex < newData.length) {
              // Validate and convert the value
      let newValue: any = editValue;
        if (field === 'units') {
          const unitsNum = parseInt(editValue);
          if (isNaN(unitsNum) || unitsNum < 0 || unitsNum > 10) {
            alert('Units must be a number between 0 and 10');
            return;
          }
          newValue = unitsNum;
        } else if (field === 'grade') {
          const gradeNum = parseFloat(editValue);
          if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 5.0) {
            alert('Grade must be a number between 0 and 5.0');
            return;
          }
          newValue = gradeNum;
        } else if (field === 'courseCode') {
          // Update course code and rebuild subject
          const courseTitle = newData[rowIndex].courseTitle || '';
          const newSubject = `${editValue} - ${courseTitle}`;
          newData[rowIndex] = { 
            ...newData[rowIndex], 
            subject: newSubject,
            courseCode: editValue
          };
          setEditableData(newData);
          setEditingCell(null);
          setEditValue('');
          return;
        } else if (field === 'courseTitle') {
          // Update course title and rebuild subject
          const courseCode = newData[rowIndex].courseCode || '';
          const newSubject = `${courseCode} - ${editValue}`;
          newData[rowIndex] = { 
            ...newData[rowIndex], 
            subject: newSubject,
            courseTitle: editValue
          };
          setEditableData(newData);
          setEditingCell(null);
          setEditValue('');
          return;
        }
        
        newData[rowIndex] = { ...newData[rowIndex], [field]: newValue };
        setEditableData(newData);
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  // Add new row
  const addNewRow = (semester: string) => {
    const newRow = {
      id: String(Date.now()), // Use timestamp as unique ID
      subject: 'NEW - New Subject',
      courseCode: 'NEW',
      courseTitle: 'New Subject',
      units: 3,
      grade: 2.0,
      semester: semester,
      category: 'General'
    };
    setEditableData([...editableData, newRow]);
  };

  // Delete row
  const deleteRow = (rowIndex: number) => {
    console.log('Deleting row at index:', rowIndex);
    console.log('Current editableData length:', editableData.length);
    
    if (rowIndex >= 0 && rowIndex < editableData.length) {
      const newData = editableData.filter((_, index) => index !== rowIndex);
      console.log('New data length:', newData.length);
      setEditableData(newData);
    } else {
      console.error('Invalid row index for deletion:', rowIndex);
    }
  };

  // Handle validate and process
  const handleValidateAndProcess = async () => {
    try {
      setIsProcessing(true);
      
      // Get user data from localStorage
      const stored = localStorage.getItem('user');
      const parsedUser = stored ? (() => { try { return JSON.parse(stored) as any; } catch { return null; } })() : null;
      const email = parsedUser?.email || '';
      
      if (!email) {
        alert('Please log in again to process your analysis.');
        setIsProcessing(false);
        return;
      }

      // Prepare the data to send
      const analysisData = {
        email: email,
        grades: editableData,
        total_subjects: editableData.length,
        total_units: editableData.reduce((sum, row) => sum + (typeof row.units === 'number' ? row.units : 0), 0),
        overall_gpa: (() => {
          const numericGrades = editableData
            .map(row => typeof row.grade === 'number' ? row.grade : null)
            .filter(grade => grade !== null);
          if (numericGrades.length === 0) return 0;
          return numericGrades.reduce((sum, grade) => sum + grade!, 0) / numericGrades.length;
        })(),
        semester_breakdown: Object.entries(semesterGroups).map(([semester, grades]) => ({
          semester,
          subject_count: grades.length,
          total_units: grades.reduce((sum, grade) => sum + (typeof grade.units === 'number' ? grade.units : 0), 0),
          semester_gpa: (() => {
            const numericGrades = grades
              .map(row => typeof row.grade === 'number' ? row.grade : null)
              .filter(grade => grade !== null);
            if (numericGrades.length === 0) return 0;
            return numericGrades.reduce((sum, grade) => sum + grade!, 0) / numericGrades.length;
          })()
        }))
      };

      console.log('Sending analysis data:', analysisData);

      // Debug data
      console.log('Debug - Processing grades data:', editableData.length, 'items');

        // First, validate the grades
        const validateResponse = await fetch('http://localhost:5000/api/analysis/validate-grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grades: editableData
          })
        });

        if (!validateResponse.ok) {
          throw new Error('Failed to validate grades');
        }

        // Then compute archetype
        const response = await fetch('http://localhost:5000/api/analysis/compute-archetype', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grades: editableData,
            email: email
          })
        });

      if (!response.ok) {
        throw new Error('Failed to process analysis');
      }

      const result = await response.json();
      console.log('Analysis processing result:', result);

      // Store results for later use
      if (result.results) {
        setAnalysisResults(result.results);
      }

      // Show feedback about database save
      if (result.saved_to_db) {
        console.log('✅ Analysis results saved to database successfully');
      } else {
        console.log('⚠️ Analysis completed but database save failed:', result.db_error || 'Unknown error');
        // Still proceed even if database save failed
      }

      // Move to processing step
      _onConfirm(editableData);
      
    } catch (error) {
      console.error('Error processing analysis:', error);
      alert('Failed to process analysis. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Group grades by semester
  const groupGradesBySemester = (grades: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    grades.forEach(grade => {
      const semester = grade.semester || 'Unknown Semester';
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(grade);
    });
    
    return grouped;
  };

  const semesterGroups = groupGradesBySemester(editableData);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">📊 Extracted Grades Table</h3>
        <p className="text-gray-400">Review and validate the extracted academic data from your transcript.</p>
      </div>

      {/* Debug Information */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-white mb-2">Debug Info:</h4>
        <p className="text-xs text-gray-300">Raw grades count: {extractedGrades.length}</p>
        <p className="text-xs text-gray-300">Processed grades count: {tableData.length}</p>
        <p className="text-xs text-gray-300">Editable data count: {editableData.length}</p>
        <details className="mt-2">
          <summary className="text-xs text-blue-400 cursor-pointer">Show Raw JSON</summary>
          <pre className="text-xs text-gray-400 mt-2 bg-gray-900 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(extractedGrades, null, 2)}
          </pre>
        </details>
        <details className="mt-2">
          <summary className="text-xs text-green-400 cursor-pointer">Show Editable Data</summary>
          <pre className="text-xs text-gray-400 mt-2 bg-gray-900 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(editableData, null, 2)}
          </pre>
        </details>
      </div>



      {editableData.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(semesterGroups).map(([semester, grades], semesterIndex) => (
            <div key={semester} className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Semester Header */}
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex justify-between items-center">
                <h4 className="text-xl font-bold text-white">
                  {semester}
                </h4>
                <button
                  onClick={() => addNewRow(semester)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  + Add Row
                </button>
              </div>
              
              {/* Semester Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700 border-b-2 border-gray-600">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider border-r border-gray-600">
                        COURSE CODE
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider border-r border-gray-600">
                        COURSE TITLE
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-200 uppercase tracking-wider border-r border-gray-600">
                        UNITS
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-200 uppercase tracking-wider">
                        GRADE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                                         {grades.filter(row => row !== null).map((row, index) => {
                       // Parse course code and title from subject
                       const subjectParts = row.subject.split(' - ');
                       const courseCode = subjectParts[0] || row.subject;
                       const courseTitle = subjectParts[1] || row.subject;
                       
                       // Validate data before rendering
                       const units = typeof row.units === 'number' ? row.units : parseInt(row.units) || 3;
                       const grade = typeof row.grade === 'number' ? row.grade : parseFloat(row.grade) || 0;
                       
                       // Skip invalid data
                       if (units > 10 || grade > 5.0 || grade < 0) {
                         return null;
                       }
                       
                       const globalIndex = editableData.findIndex(item => item.id === row.id);
                       
                       return (
                         <tr key={`${semester}-${index}`} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300">
                             {editingCell?.rowIndex === globalIndex && editingCell?.field === 'courseCode' ? (
                               <input
                                 type="text"
                                 value={editValue}
                                 onChange={handleCellEdit}
                                 onKeyDown={handleKeyPress}
                                 onBlur={handleCellSave}
                                 className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                                 autoFocus
                               />
                             ) : (
                               <div 
                                 onClick={() => handleCellClick(globalIndex, 'courseCode', courseCode)}
                                 className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                               >
                                 {courseCode}
                               </div>
                             )}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                             {editingCell?.rowIndex === globalIndex && editingCell?.field === 'courseTitle' ? (
                               <input
                                 type="text"
                                 value={editValue}
                                 onChange={handleCellEdit}
                                 onKeyDown={handleKeyPress}
                                 onBlur={handleCellSave}
                                 className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                                 autoFocus
                               />
                             ) : (
                               <div 
                                 onClick={() => handleCellClick(globalIndex, 'courseTitle', courseTitle)}
                                 className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                               >
                                 {courseTitle}
                               </div>
                             )}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-600 text-right border-r border-gray-300">
                             {editingCell?.rowIndex === globalIndex && editingCell?.field === 'units' ? (
                               <input
                                 type="number"
                                 min="0"
                                 max="10"
                                 value={editValue}
                                 onChange={handleCellEdit}
                                 onKeyDown={handleKeyPress}
                                 onBlur={handleCellSave}
                                 className="w-full px-2 py-1 border border-blue-300 rounded text-sm text-right"
                                 autoFocus
                               />
                             ) : (
                               <div 
                                 onClick={() => handleCellClick(globalIndex, 'units', units)}
                                 className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-right"
                               >
                                 {units}
                               </div>
                             )}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-600 text-right">
                             {editingCell?.rowIndex === globalIndex && editingCell?.field === 'grade' ? (
                               <input
                                 type="number"
                                 step="0.01"
                                 min="0"
                                 max="5"
                                 value={editValue}
                                 onChange={handleCellEdit}
                                 onKeyDown={handleKeyPress}
                                 onBlur={handleCellSave}
                                 className="w-full px-2 py-1 border border-blue-300 rounded text-sm text-right"
                                 autoFocus
                               />
                             ) : (
                               <div className="flex items-center justify-between">
                                 <div 
                                   onClick={() => handleCellClick(globalIndex, 'grade', grade)}
                                   className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-right flex-1"
                                 >
                                   <span className={`px-3 py-1 rounded text-xs font-medium ${
                                     grade <= 1.5 
                                       ? 'bg-green-100 text-green-800' 
                                       : grade <= 2.5 
                                         ? 'bg-yellow-100 text-yellow-800' 
                                         : 'bg-red-100 text-red-800'
                                   }`}>
                                     {grade.toFixed(2)}
                                   </span>
                                 </div>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     
                                       deleteRow(globalIndex);
                                     
                                   }}
                                   className="ml-2 text-red-600 hover:text-red-800 text-xs font-bold bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                                   title="Delete row"
                                 >
                                   ×
                                 </button>
                               </div>
                             )}
                           </td>
                         </tr>
                       );
                     })}
                    {/* Total Row */}
                    <tr className="bg-gray-100 border-t-2 border-gray-400 font-bold">
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-400">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-400">
                        
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right border-r border-gray-400">
                        {grades.reduce((sum, grade) => sum + (typeof grade.units === 'number' ? grade.units : 0), 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Semester Summary */}
              <div className="bg-gray-750 px-6 py-3 border-t border-gray-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">
                    Semester GPA: <span className="font-medium text-white">
                      {(() => {
                        const numericGrades = grades
                          .map(row => typeof row.grade === 'number' ? row.grade : null)
                          .filter(grade => grade !== null);
                        if (numericGrades.length === 0) return 'N/A';
                        const avg = numericGrades.reduce((sum, grade) => sum + grade!, 0) / numericGrades.length;
                        return avg.toFixed(2);
                      })()}
                    </span>
                  </span>
                  <span className="text-gray-300">
                    Excellent Grades (≤1.5): <span className="font-medium text-green-400">
                      {grades.filter(row => typeof row.grade === 'number' && row.grade <= 1.5).length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Grades Extracted</h3>
          <p className="text-gray-400">The OCR analysis didn't find any structured grade data in your transcript.</p>
        </div>
      )}

      {/* Overall Summary Statistics */}
      {editableData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overall Academic Summary
          </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{editableData.length}</div>
                <div className="text-sm text-gray-400">Total Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {editableData.filter(row => row !== null).reduce((sum, row) => sum + (typeof row.units === 'number' ? row.units : 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    const numericGrades = editableData
                      .filter(row => row !== null)
                      .map(row => typeof row.grade === 'number' ? row.grade : null)
                      .filter(grade => grade !== null);
                    if (numericGrades.length === 0) return 'N/A';
                    const avg = numericGrades.reduce((sum, grade) => sum + grade!, 0) / numericGrades.length;
                    return avg.toFixed(2);
                  })()}
                </div>
                <div className="text-sm text-gray-400">Overall GPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {editableData.filter(row => row !== null && typeof row.grade === 'number' && row.grade <= 1.5).length}
                </div>
                <div className="text-sm text-gray-400">Excellent Grades (≤1.5)</div>
              </div>
            </div>
          
          {/* Semester Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h5 className="text-md font-medium text-gray-300 mb-3">Semester Breakdown</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(semesterGroups).map(([semester, grades]) => (
                <div key={semester} className="bg-gray-750 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-1">{semester}</div>
                  <div className="text-xs text-gray-400">
                    {grades.length} subjects • {grades.reduce((sum, grade) => sum + (typeof grade.units === 'number' ? grade.units : 0), 0)} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Validate & Process Button */}
      {editableData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ready to Process Analysis
            </h4>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Your transcript data has been validated. Click below to process your academic analysis using advanced AI algorithms including:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h5 className="text-blue-300 font-semibold mb-2">🎯 SoP 1 / Obj 1: Career Path Forecasting</h5>
                <p className="text-sm text-gray-300 mb-2"><strong>Theory:</strong> Predictive analytics in career guidance</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Method:</strong> Linear Regression applied to academic subject grades</p>
                <p className="text-sm text-gray-300"><strong>Tool:</strong> Scikit-learn regression models</p>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                <h5 className="text-purple-300 font-semibold mb-2">🧠 SoP 2 / Obj 2: Student Archetype Classification</h5>
                <p className="text-sm text-gray-300 mb-2"><strong>Theory:</strong> Educational psychology and career archetypes</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Method:</strong> K-Means Clustering based on subject-specific grades</p>
                <p className="text-sm text-gray-300"><strong>Tool:</strong> Scikit-learn clustering module</p>
              </div>
            </div>

            <button
              onClick={() => handleValidateAndProcess()}
              disabled={isProcessing}
              className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Analysis...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Validate & Process Analysis
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-3">
              This will save your data to the database and generate comprehensive career insights
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Review flow removed per product change

// Processing Step Component - Archetype Results
const ProcessingStep = ({ 
  analysisData, 
  analysisResults, 
  onSaveToDatabase, 
  onResendTOR, 
  isSaving 
}: { 
  analysisData?: any;
  analysisResults?: any;
  onSaveToDatabase: () => void;
  onResendTOR: () => void;
  isSaving: boolean;
}) => {
  // Archetype definitions with colors and descriptions
  const archetypes = {
    realistic: {
      name: 'Applied Practitioner',
      color: 'bg-blue-500',
      description: 'Practical and hands-on approach to technology. Excels in hardware, networking, and systems.',
      icon: '🔧'
    },
    investigative: {
      name: 'Analytical Thinker',
      color: 'bg-purple-500',
      description: 'Analytical and research-focused. Excels in mathematics, algorithms, and complex problem-solving.',
      icon: '🧮'
    },
    artistic: {
      name: 'Creative Innovator',
      color: 'bg-pink-500',
      description: 'Creative and innovative approach to technology. Excels in design, multimedia, and creative coding.',
      icon: '🎨'
    },
    social: {
      name: 'Collaborative Supporter',
      color: 'bg-green-500',
      description: 'Collaborative and supportive approach. Excels in communication, training, and helping others.',
      icon: '🤝'
    },
    enterprising: {
      name: 'Strategic Leader',
      color: 'bg-yellow-500',
      description: 'Strategic and leadership-oriented. Excels in project management, entrepreneurship, and business planning.',
      icon: '💼'
    },
    conventional: {
      name: 'Methodical Organizer',
      color: 'bg-gray-500',
      description: 'Methodical and organized approach. Excels in database management, documentation, and structured processes.',
      icon: '📋'
    }
  };

  // Get archetype percentages from analysis data or use sample data
  const archetypePercentages = analysisData?.learning_archetype?.archetype_percentages || analysisData?.archetype_percentages || {
    realistic: 25,
    investigative: 30,
    artistic: 15,
    social: 10,
    enterprising: 12,
    conventional: 8
  };

  // Sort archetypes by percentage (highest first)
  const sortedArchetypes = Object.entries(archetypePercentages)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([key, percentage]) => ({
      key,
      percentage: percentage as number,
      ...archetypes[key as keyof typeof archetypes]
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold mb-4">🧠 Your Learning Archetype Analysis</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Based on your academic performance patterns, here's your personalized learning archetype breakdown.
        </p>
      </div>

      {/* Primary Archetype */}
      {sortedArchetypes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{sortedArchetypes[0].icon}</div>
            <h4 className="text-xl font-bold text-white mb-2">Primary Archetype</h4>
            <h5 className="text-lg font-semibold text-blue-300">{sortedArchetypes[0].name}</h5>
            <div className="text-3xl font-bold text-white mt-2">{sortedArchetypes[0].percentage}%</div>
          </div>
          <p className="text-gray-300 text-center text-sm">{sortedArchetypes[0].description}</p>
        </div>
      )}

      {/* All Archetypes Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white text-center">Complete Archetype Breakdown</h4>
        <div className="grid gap-4">
          {sortedArchetypes.map((archetype, index) => (
            <div key={archetype.key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${archetype.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {archetype.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{archetype.name}</h5>
                    <p className="text-sm text-gray-400">{archetype.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{archetype.percentage}%</div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`${archetype.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${archetype.percentage}%` }}
                ></div>
              </div>
              
              {/* Rank Badge */}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Rank #{index + 1} of {sortedArchetypes.length}
                </span>
                {index === 0 && (
                  <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs font-medium rounded-full">
                    Primary
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onSaveToDatabase}
          disabled={isSaving}
          className={`px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving to Database...
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </>
          )}
        </button>
        

      </div>


            </div>
  );
};



// Certificate Upload Step Component
const CertificateUploadStep = ({ user, onCertificatesUploaded }: { 
  user: any, 
  onCertificatesUploaded: () => void 
}) => {
  const [certificates, setCertificates] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadCertificate = (file: File, email: string, userId?: number) => {
    return new Promise<{ url: string; storage_path?: string }>((resolve, reject) => {
      const form = new FormData();
      form.append('email', email);
      if (userId !== undefined && userId !== null) form.append('user_id', String(userId));
      form.append('kind', 'certificate');
      form.append('file', file, file.name);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl('UPLOAD_TOR'));
      xhr.withCredentials = false;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve({ url: json.url, storage_path: json.storage_path });
          else reject(new Error(json.message || 'Certificate upload failed'));
        } catch {
          reject(new Error('Invalid server response'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  };

  const handleCertificatesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertificates(files);
  };

  const handleUpload = async () => {
    if (certificates.length === 0) {
      alert('Please select at least one certificate to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < certificates.length; i++) {
        const file = certificates[i];
        await uploadCertificate(file, user.email, user.id);
        setUploadProgress(((i + 1) / certificates.length) * 100);
      }
      
      onCertificatesUploaded();
    } catch (error) {
      console.error('Error uploading certificates:', error);
      alert('❌ Failed to upload certificates. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📜</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Add Certificates</h2>
          <p className="text-gray-400">
            Upload additional certificates to enhance your archetype analysis. 
            Certificates will be included in the calculation of your learning archetype.
          </p>
        </div>

        <div className="space-y-6">
          {/* Certificate Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Certificates
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleCertificatesUpload}
              disabled={isUploading}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
            </p>
          </div>

          {/* Selected Files */}
          {certificates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Files:</h4>
          <div className="space-y-2">
                {certificates.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
                      <span className="text-sm text-white">{file.name}</span>
            </div>
                    <span className="text-xs text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
          </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
          <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Uploading certificates...</span>
                <span className="text-gray-400">{Math.round(uploadProgress)}%</span>
            </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || certificates.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload Certificates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
