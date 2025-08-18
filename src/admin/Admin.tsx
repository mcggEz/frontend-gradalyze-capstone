import { useState } from 'react';
import { Link } from 'react-router-dom';

// Type definitions
interface Submission {
  id: number;
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  year: string;
  dateSubmitted: string;
  status: 'pending' | 'approved' | 'rejected';
  transcriptFile: string;
  certificatesCount: number;
  extractedGPA: number | null;
  extractedSubjects: number | null;
  adminNotes: string;
}

// Mock data for demonstration
const mockSubmissions: Submission[] = [
  {
    id: 1,
    studentId: '2021-00123',
    studentName: 'Juan Dela Cruz',
    email: 'juan.delacruz@plm.edu.ph',
    course: 'BS Information Technology',
    year: '4th Year',
    dateSubmitted: '2025-01-15 10:30 AM',
    status: 'pending',
    transcriptFile: 'TOR_Juan_DelaCruz.pdf',
    certificatesCount: 3,
    extractedGPA: null,
    extractedSubjects: null,
    adminNotes: ''
  },
  {
    id: 2,
    studentId: '2021-00456',
    studentName: 'Maria Santos',
    email: 'maria.santos@plm.edu.ph',
    course: 'BS Information Technology',
    year: '4th Year',
    dateSubmitted: '2025-01-15 09:15 AM',
    status: 'approved',
    transcriptFile: 'TOR_Maria_Santos.pdf',
    certificatesCount: 5,
    extractedGPA: 3.75,
    extractedSubjects: 42,
    adminNotes: 'Complete and validated. GPA matches requirements.'
  },
  {
    id: 3,
    studentId: '2021-00789',
    studentName: 'Jose Garcia',
    email: 'jose.garcia@plm.edu.ph',
    course: 'BS Information Technology',
    year: '3rd Year',
    dateSubmitted: '2025-01-14 02:45 PM',
    status: 'rejected',
    transcriptFile: 'TOR_Jose_Garcia.pdf',
    certificatesCount: 1,
    extractedGPA: null,
    extractedSubjects: null,
    adminNotes: 'Transcript image quality too poor for OCR processing. Please resubmit with higher quality scan.'
  }
];

const Admin = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' || submission.status === filterStatus
  );

  const getStatusColor = (status: Submission['status']): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Submission['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const handleApprove = (id: number): void => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'approved', adminNotes } : sub
    ));
    setSelectedSubmission(null);
    setAdminNotes('');
  };

  const handleReject = (id: number): void => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'rejected', adminNotes } : sub
    ));
    setSelectedSubmission(null);
    setAdminNotes('');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-lg sm:text-xl font-bold text-blue-400">
                Gradalyze
              </Link>
              <span className="text-sm bg-red-600 px-2 py-1 rounded">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Admin User</span>
              <Link 
                to="/login" 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📋 Document Validation Center</h1>
          <p className="text-gray-400">Review and validate student transcript submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-gray-400">Total Submissions</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'pending').length}</p>
                <p className="text-sm text-gray-400">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'approved').length}</p>
                <p className="text-sm text-gray-400">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">❌</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'rejected').length}</p>
                <p className="text-sm text-gray-400">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as 'all' | 'pending' | 'approved' | 'rejected')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded">
                  {status === 'all' ? submissions.length : submissions.filter(s => s.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course & Year</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submission Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">OCR Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{submission.studentName}</div>
                        <div className="text-sm text-gray-400">{submission.studentId}</div>
                        <div className="text-xs text-gray-500">{submission.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{submission.course}</div>
                        <div className="text-gray-400">{submission.year}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {submission.dateSubmitted}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <span>📄</span>
                          <span>{submission.transcriptFile}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          + {submission.certificatesCount} certificates
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {submission.extractedGPA ? (
                        <div className="text-sm">
                          <div className="text-green-400">✓ Processed</div>
                          <div className="text-xs text-gray-400">
                            GPA: {submission.extractedGPA} | Subjects: {submission.extractedSubjects}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          {submission.status === 'pending' ? '⏳ Processing...' : '❌ Failed'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        <span className="mr-1">{getStatusIcon(submission.status)}</span>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No submissions found</div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold">Document Review</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student Info */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span> {selectedSubmission.studentName}
                  </div>
                  <div>
                    <span className="text-gray-400">Student ID:</span> {selectedSubmission.studentId}
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span> {selectedSubmission.email}
                  </div>
                  <div>
                    <span className="text-gray-400">Course:</span> {selectedSubmission.course}
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Document Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>📄</span>
                    <span>{selectedSubmission.transcriptFile}</span>
                  </div>
                  <div className="text-gray-400">
                    {selectedSubmission.certificatesCount} additional certificates uploaded
                  </div>
                  {selectedSubmission.extractedGPA && (
                    <div className="mt-3 p-3 bg-green-900/20 border border-green-700 rounded">
                      <div className="text-green-300 font-medium">OCR Extraction Results:</div>
                      <div className="text-sm mt-1">
                        <div>GPA: {selectedSubmission.extractedGPA}</div>
                        <div>Subjects Processed: {selectedSubmission.extractedSubjects}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about validation status, issues found, or next steps..."
                  className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedSubmission.adminNotes && (
                  <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                    <div className="text-gray-400 mb-1">Previous Notes:</div>
                    <div>{selectedSubmission.adminNotes}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    ✅ Approve Transcript
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    ❌ Reject Transcript
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;