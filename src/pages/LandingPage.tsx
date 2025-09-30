import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold">Gradalyze</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
       
              <Link 
                to="/login" 
                className="bg-white text-black px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Academic Record
              </span>{' '}
              Into Career Success
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 leading-relaxed px-4 sm:px-0">
              Upload your transcript, discover your learning archetype, and get personalized 
              career recommendations and academic insights.
            </p>
            <div className="flex justify-center px-4 sm:px-0">
              <Link 
                to="/login"
                className="bg-white text-black px-6 py-3 sm:px-8 sm:py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Start Your Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Smart Grade Analysis</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Upload your transcript and let our AI analyze your academic strengths and learning patterns.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Archetype Discovery</h3>
                <p className="text-gray-400">
                  Discover your unique learning archetype and understand how it translates to career success.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Professional Dossier</h3>
                <p className="text-gray-400">
                  Generate a comprehensive professional portfolio based on your academic analysis and archetype.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Research Information Section */}
        <div className="py-16 sm:py-20 bg-gray-900/50 rounded-2xl mx-4 sm:mx-0 mb-20">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            {/* Statement of the Problem */}
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Statement of the Problem
                </span>
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                This study aims to address the following core problems:
              </p>
              <div className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      How can students be grouped into distinct <strong className="text-blue-300">career archetypes</strong> by analyzing subject-specific academic performance from validated academic records to support more personalized and relevant career guidance?
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      How can uploaded academic records be effectively analyzed and converted into <strong className="text-purple-300">structured, machine-readable data</strong> that accurately captures subject names, grades, and academic indicators for use in intelligent career-support systems?
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      How can the system provide <strong className="text-green-300">personalized career guidance</strong> to students by analyzing their academic performance and learning patterns using artificial intelligence?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Objectives of the Study
                </span>
              </h2>
              
              {/* General Objective */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  General Objective
                </h3>
                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/50 rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed">
                    To develop a <strong className="text-green-300">web-based academic profiling and career recommendation system</strong> that processes validated academic records using <strong className="text-blue-300">OCR</strong>, groups students into career archetypes through <strong className="text-purple-300">K-Means Clustering</strong>, predicts job fit scores using <strong className="text-orange-300">Random Forests</strong>, and recommends job-fit companies through an <strong className="text-pink-300">AI-driven matching algorithm</strong>.
                  </p>
                </div>
              </div>

              {/* Specific Objectives */}
              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15" />
                  </svg>
                  Specific Objectives
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        To apply <strong className="text-blue-300">K-Means Clustering</strong> to analyze subject-specific performance from validated academic records, grouping students into career archetypes based on their academic profiles.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        To apply an <strong className="text-purple-300">Optical Character Recognition (OCR)</strong>-based module that analyzes uploaded academic documents by detecting and extracting subject-specific data, grade values, and other key academic details into a structured digital format suitable for further processing.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        To implement an <strong className="text-green-300">AI-powered recommendation algorithm</strong> that analyzes student academic patterns and learning archetypes to provide personalized career guidance and academic insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="mt-12 text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-6">Key Technologies & Methodologies</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="bg-blue-900/50 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-700">
                    K-Means Clustering
                  </span>
                  <span className="bg-purple-900/50 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-700">
                    OCR Technology
                  </span>
                  <span className="bg-green-900/50 text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-700">
                    Random Forest ML
                  </span>
                  <span className="bg-orange-900/50 text-orange-300 px-4 py-2 rounded-full text-sm font-medium border border-orange-700">
                    AI Matching Algorithm
                  </span>
                  <span className="bg-pink-900/50 text-pink-300 px-4 py-2 rounded-full text-sm font-medium border border-pink-700">
                    Career Profiling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400 space-y-4">
            <p>&copy; 2025 Gradalyze. Capstone Project for Pamantasan ng Lungsod ng Maynila.</p>
            <p className="text-sm text-gray-300">Bachelor of Science in Information Technology</p>
            <div className="text-sm space-y-2">
              <p className="font-medium text-gray-300">Academic Committee</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-4xl mx-auto">
                <p>Dr. [Thesis Adviser Name]<br/><span className="text-xs">Thesis Adviser</span></p>
                <p>Prof. [Committee Member 1]<br/><span className="text-xs">Committee Member</span></p>
                <p>Prof. [Committee Member 2]<br/><span className="text-xs">Committee Member</span></p>
                <p>Dr. [Department Head]<br/><span className="text-xs">Department Head</span></p>
                <p>Dean [Dean Name]<br/><span className="text-xs">College Dean</span></p>
                <p>[Student Name]<br/><span className="text-xs">Researcher</span></p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
