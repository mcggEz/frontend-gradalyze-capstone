import { useState } from 'react';
import { Link } from 'react-router-dom';

const DossierPage = () => {
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@plm.edu.ph',
    course: 'Computer Science',
    year: '4th Year'
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Sample data - in real app this would come from analysis results
  const [analysisData] = useState({
    archetype: {
      type: 'Analytical Thinker',
      description: 'Strong in logical reasoning and systematic problem-solving',
      strengths: ['Analytical Skills', 'Problem Solving', 'Technical Excellence'],
      score: 8.5
    },
    grades: {
      gpa: 1.45,
      totalUnits: 150,
      majorSubjects: 15,
      averageGrade: 1.48
    },
    careerPaths: [
      { title: 'Software Engineer', match: 92, demand: 'High', salary: '₱45,000 - ₱80,000' },
      { title: 'Data Scientist', match: 88, demand: 'High', salary: '₱50,000 - ₱90,000' },
      { title: 'System Analyst', match: 85, demand: 'Medium', salary: '₱40,000 - ₱70,000' }
    ],
    skills: [
      { name: 'Programming', level: 90 },
      { name: 'Database Design', level: 85 },
      { name: 'System Analysis', level: 80 },
      { name: 'Problem Solving', level: 95 },
      { name: 'Technical Writing', level: 75 }
    ]
  });

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📋 My Professional Dossier</h2>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Generate PDF
              </button>
              <button className="border border-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:border-gray-500 transition-colors">
                Share Link
              </button>
            </div>
          </div>

          {/* Dossier Preview */}
          <div className="bg-white text-black rounded-lg p-8 mb-6">
            {/* Header */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-lg text-gray-600">{user.course} • {user.year}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>

            {/* Learning Archetype */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Archetype</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-white">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{analysisData.archetype.type}</h3>
                    <p className="text-sm text-blue-600">Archetype Score: {analysisData.archetype.score}/10</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{analysisData.archetype.description}</p>
                <div className="flex flex-wrap gap-2">
                  {analysisData.archetype.strengths.map((strength, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{analysisData.grades.gpa}</p>
                  <p className="text-sm text-gray-600">Cumulative GPA</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{analysisData.grades.totalUnits}</p>
                  <p className="text-sm text-gray-600">Total Units</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{analysisData.grades.majorSubjects}</p>
                  <p className="text-sm text-gray-600">Major Subjects</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{analysisData.grades.averageGrade}</p>
                  <p className="text-sm text-gray-600">Average Grade</p>
                </div>
              </div>
            </div>

            {/* Core Competencies */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Core Competencies</h2>
              <div className="space-y-4">
                {analysisData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <span className="text-sm text-gray-600">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${skill.level}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Recommendations */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Career Paths</h2>
              <div className="space-y-4">
                {analysisData.careerPaths.map((career, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{career.title}</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {career.match}% Match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Market Demand:</strong> {career.demand}</p>
                      <p><strong>Salary Range:</strong> {career.salary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  A dedicated {user.course} student with an <strong>{analysisData.archetype.type}</strong> learning archetype, 
                  demonstrating exceptional analytical and problem-solving capabilities. With a cumulative GPA of <strong>{analysisData.grades.gpa}</strong> 
                  and strong performance in {analysisData.grades.majorSubjects} major subjects, I possess a solid foundation 
                  in technical skills including programming, database design, and system analysis. 
                  My academic journey reflects a consistent pattern of logical reasoning and systematic approach to complex challenges, 
                  making me well-suited for roles in software engineering, data science, and system analysis.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-4 text-center space-y-3">
              <p className="text-sm text-gray-500">Generated by Gradalyze • Capstone Project for Pamantasan ng Lungsod ng Maynila</p>
              <p className="text-xs text-gray-600">Bachelor of Science in Information Technology</p>
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-600 mb-2">Academic Committee</p>
                <div className="grid grid-cols-2 gap-1 text-left max-w-md mx-auto">
                  <p>Dr. [Thesis Adviser] - Adviser</p>
                  <p>Prof. [Committee Member 1]</p>
                  <p>Prof. [Committee Member 2]</p>
                  <p>Dr. [Department Head] - Head</p>
                  <p>Dean [Dean Name] - Dean</p>
                  <p>[Student Name] - Researcher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DossierPage;
