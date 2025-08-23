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
        
        // Check for existing transcript
        if (userData.tor_url || userData.tor_notes) {
          setExistingTranscript({
            hasFile: !!userData.tor_url,
            hasAnalysis: !!userData.tor_notes,
            uploadedAt: userData.tor_uploaded_at,
            analyzedAt: userData.archetype_analyzed_at,
            primaryArchetype: userData.primary_archetype
          });
        }
        
        // Check for existing certificates
        if (userData.certificate_paths && Array.isArray(userData.certificate_paths) && userData.certificate_paths.length > 0) {
          setExistingCertificates(userData.certificate_paths.map((path: string, index: number) => ({
            id: index,
            path: path,
            name: path.split('/').pop() || `Certificate ${index + 1}`,
            uploadedAt: userData.certificate_uploaded_at || new Date().toISOString()
          })));
        }
      }
    } catch (error) {
      console.error('Error checking existing transcript:', error);
    } finally {
      setIsCheckingTranscript(false);
    }
  };

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validation' | 'processing'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{transcript: File | null, certificates: File[]}>({
    transcript: null,
    certificates: []
  });
  const [extractedGrades, setExtractedGrades] = useState<any[]>([]);

  const [existingTranscript, setExistingTranscript] = useState<any>(null);
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
        
        {/* Progress Indicator */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-400' : currentStep === 'validation' || currentStep === 'processing' ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-500' : currentStep === 'validation' || currentStep === 'processing' ? 'bg-green-500' : 'bg-gray-600'}`}>
                <span className="text-sm font-bold">1</span>
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'validation' ? 'text-blue-400' : currentStep === 'processing' ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'validation' ? 'bg-blue-500' : currentStep === 'processing' ? 'bg-green-500' : 'bg-gray-600'}`}>
                <span className="text-sm font-bold">2</span>
              </div>
              <span className="font-medium">Validate</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'processing' ? 'text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'processing' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="font-medium">Results</span>
            </div>
          </div>
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

          {/* Existing Transcript Found */}
          {!isCheckingTranscript && existingTranscript && (
            <div className="mb-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Existing Analysis Found</h3>
                                    <div className="space-y-2 text-sm text-gray-300">
                    {existingTranscript.hasFile && (
                      <p>📄 <strong>Transcript:</strong> Uploaded on {new Date(existingTranscript.uploadedAt).toLocaleDateString()}</p>
                    )}
                    {existingTranscript.hasAnalysis && (
                      <p>🧠 <strong>Analysis:</strong> Completed on {new Date(existingTranscript.analyzedAt).toLocaleDateString()}</p>
                    )}
                    {existingTranscript.primaryArchetype && (
                      <p>🎭 <strong>Primary Archetype:</strong> {existingTranscript.primaryArchetype.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                    )}
                    {existingCertificates.length > 0 && (
                      <p>🏆 <strong>Certificates:</strong> {existingCertificates.length} certificate(s) uploaded</p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        // Redirect to dossier page to view analysis results
                        navigate('/dossier');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      📊 View Previous Analysis
                    </button>
                    <button
                      onClick={() => {
                        setExistingTranscript(null);
                        setCurrentStep('upload');
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      🔄 Upload New Transcript
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 1: Upload */}
          {!isCheckingTranscript && (!existingTranscript || currentStep === 'upload') && (
            <UploadStep 
              uploadedFiles={uploadedFiles}
              onFilesUploaded={(files) => {
                setUploadedFiles(files);
              }}
              onOcrComplete={(grades) => setExtractedGrades(grades)}
              onProceedToValidation={() => setCurrentStep('validation')}
              existingTranscript={existingTranscript}
              existingCertificates={existingCertificates}
            />
          )}

          {/* Step 2: Validation */}
          {currentStep === 'validation' && (
            <ValidationStep 
              extractedGrades={extractedGrades}
              onValidationConfirmed={(confirmedGrades) => {
                setExtractedGrades(confirmedGrades);
                setCurrentStep('processing');
                // Simulate processing and redirect to dossier
                setTimeout(() => {
                  navigate('/dossier');
                }, 3000);
              }}
            />
          )}

          {/* Step 4: Processing */}
          {currentStep === 'processing' && (
            <ProcessingStep />
          )}


        </div>
      </main>
    </div>
  );
};

// Upload Step Component
const UploadStep = ({ uploadedFiles, onFilesUploaded, onOcrComplete, onProceedToValidation, existingTranscript, existingCertificates }: { 
  uploadedFiles: {transcript: File | null, certificates: File[]}, 
  onFilesUploaded: (files: {transcript: File | null, certificates: File[]}) => void,
  onOcrComplete: (grades: any[]) => void,
  onProceedToValidation: () => void,
  existingTranscript?: any,
  existingCertificates?: any[]
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
    return fetch(getApiUrl('EXTRACT_GRADES'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storage_path: storagePath })
    }).then(async (r) => {
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.message || 'OCR extraction failed');
      return json as { grades?: any[]; text?: string };
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

    // If not yet uploaded, upload first
    if (!torUploaded) {
      setIsProcessing(true);
      try {
        const res = await uploadTranscript(uploadedFiles.transcript, email, userId);
        setTorUploaded(true);
        setTorUrl(res.tor_url || null);
        setTorStoragePath(res.storage_path || null);
        setIsProcessing(false);
          setUploadProgress(0);
        return; // stay on this step until user starts OCR
      } catch (err: any) {
        alert(err.message || 'Upload failed');
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }
    }

    // If already uploaded, trigger OCR extraction on backend
    setIsProcessing(true);
    try {
      if (!torStoragePath) throw new Error('Missing storage path. Please re-upload your transcript.');
      const res = await extractTranscript(email, torStoragePath);
      // Prefer raw text for validation stage
      if (res && typeof res.text === 'string' && res.text.length > 0) {
        onOcrComplete([{ text: res.text }]);
      } else if (Array.isArray(res.grades)) {
        onOcrComplete(res.grades);
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
                    Ready to upload transcript
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
                ) : !torUploaded ? (
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Upload Transcript</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Start OCR Analysis</span>
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

// Validation Step Component (render raw JSON first)
const ValidationStep = ({ extractedGrades, onValidationConfirmed: _onConfirm }: {
  extractedGrades: any[],
  onValidationConfirmed: (grades: any[]) => void
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">📝 Validate (Raw JSON)</h3>
        <p className="text-gray-400">Displaying the raw OCR JSON output for review.</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-200">
{JSON.stringify(extractedGrades, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Admin Review flow removed per product change

// Processing Step Component
const ProcessingStep = () => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
        <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-4">🧠 Computing Your Learning Archetype</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Our AI is analyzing your academic performance patterns to determine your learning archetype and predict suitable career paths.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-300">Analyzing grade patterns...</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <span className="text-gray-300">Computing career matches...</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <span className="text-gray-300">Finding company opportunities...</span>
        </div>
      </div>
    </div>
  );
};



export default AnalysisPage;
