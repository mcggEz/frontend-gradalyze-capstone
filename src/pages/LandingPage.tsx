import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-pink-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Gradalyze
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`py-20 sm:py-32 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
                <span className="block text-gray-900">Transform Your</span>
                <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-pulse">
                  Academic Journey
                </span>
                <span className="block text-gray-900">Into Career Success</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                Discover your unique learning archetype, unlock personalized career insights, 
                and transform your academic record into a roadmap for professional success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/login"
                  className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-pink-500/25"
                >
                  <span className="flex items-center">
                    Start Your Analysis
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                
                <button className="group text-gray-600 hover:text-pink-600 px-6 py-4 rounded-full font-semibold text-lg border border-pink-300 hover:border-pink-400 transition-all duration-300">
                  <span className="flex items-center">
                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Demo
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 sm:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform transforms your academic data into actionable career insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 to-purple-200/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-pink-500/10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Smart Analysis</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Upload your transcript and let our advanced AI analyze your academic strengths, 
                  learning patterns, and performance trends.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-purple-500/10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Archetype Discovery</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Discover your unique learning archetype and understand how your academic 
                  patterns translate to career success and professional strengths.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 to-purple-200/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-pink-500/10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Professional Portfolio</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Generate a comprehensive professional portfolio with personalized 
                  career recommendations and company matches based on your profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Research Information Section */}
        <div className="py-20 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Statement of the Problem */}
            <div className="mb-20">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Research Foundation
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our study addresses critical challenges in academic-to-career transition
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-pink-600">Career Archetype Classification</h3>
                        <p className="text-gray-600 leading-relaxed">
                          How can students be grouped into distinct <strong className="text-pink-600">career archetypes</strong> by analyzing subject-specific academic performance from validated academic records to support more personalized and relevant career guidance?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-purple-600">Data Processing & OCR</h3>
                        <p className="text-gray-600 leading-relaxed">
                          How can uploaded academic records be effectively analyzed and converted into <strong className="text-purple-600">structured, machine-readable data</strong> that accurately captures subject names, grades, and academic indicators for use in intelligent career-support systems?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-pink-600">AI-Powered Guidance</h3>
                        <p className="text-gray-600 leading-relaxed">
                          How can the system provide <strong className="text-pink-600">personalized career guidance</strong> to students by analyzing their academic performance and learning patterns using artificial intelligence?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives Section */}
            <div>
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Study Objectives
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our comprehensive approach to academic career guidance
                </p>
              </div>
              
              {/* General Objective */}
              <div className="mb-16">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                    <h3 className="text-2xl font-bold text-pink-600 mb-6 flex items-center">
                      <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      General Objective
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      To develop a <strong className="text-pink-600">web-based academic profiling and career recommendation system</strong> that processes validated academic records using <strong className="text-purple-600">OCR</strong>, groups students into career archetypes through <strong className="text-pink-600">K-Means Clustering</strong>, predicts job fit scores using <strong className="text-purple-600">Random Forests</strong>, and recommends job-fit companies through an <strong className="text-pink-600">AI-driven matching algorithm</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Specific Objectives */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-purple-600 mb-8 flex items-center">
                  <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15" />
                  </svg>
                  Specific Objectives
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-pink-600 mb-3">K-Means Clustering</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Apply <strong className="text-pink-600">K-Means Clustering</strong> to analyze subject-specific performance from validated academic records, grouping students into career archetypes based on their academic profiles.
                      </p>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-600 mb-3">OCR Technology</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Apply an <strong className="text-purple-600">Optical Character Recognition (OCR)</strong>-based module that analyzes uploaded academic documents by detecting and extracting subject-specific data, grade values, and other key academic details into a structured digital format.
                      </p>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-pink-600 mb-3">AI Recommendations</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Implement an <strong className="text-pink-600">AI-powered recommendation algorithm</strong> that analyzes student academic patterns and learning archetypes to provide personalized career guidance and academic insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-700 mb-8">Key Technologies & Methodologies</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <span className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 px-6 py-3 rounded-full text-sm font-medium border border-pink-300/50 hover:border-pink-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    K-Means Clustering
                  </span>
                  <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-6 py-3 rounded-full text-sm font-medium border border-purple-300/50 hover:border-purple-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    OCR Technology
                  </span>
                  <span className="bg-gradient-to-r from-pink-100 to-purple-200 text-pink-700 px-6 py-3 rounded-full text-sm font-medium border border-pink-300/50 hover:border-pink-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    Random Forest ML
                  </span>
                  <span className="bg-gradient-to-r from-purple-100 to-pink-200 text-purple-700 px-6 py-3 rounded-full text-sm font-medium border border-purple-300/50 hover:border-purple-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    AI Matching Algorithm
                  </span>
                  <span className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 px-6 py-3 rounded-full text-sm font-medium border border-pink-300/50 hover:border-pink-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    Career Profiling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-32 bg-gradient-to-t from-pink-50/80 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-100/60 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                Gradalyze
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Transforming academic records into career success through AI-powered insights and personalized guidance.
              </p>
            </div>
            
            <div className="border-t border-pink-200/50 pt-8">
              <p className="text-gray-600 mb-2">&copy; 2025 Gradalyze. Capstone Project for Pamantasan ng Lungsod ng Maynila.</p>
              <p className="text-sm text-gray-500">Bachelor of Science in Information Technology</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 max-w-4xl mx-auto shadow-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-6">Academic Committee</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="font-medium text-gray-900">Dr. [Thesis Adviser Name]</p>
                  <p className="text-sm text-gray-600">Thesis Adviser</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Prof. [Committee Member 1]</p>
                  <p className="text-sm text-gray-600">Committee Member</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Prof. [Committee Member 2]</p>
                  <p className="text-sm text-gray-600">Committee Member</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Dr. [Department Head]</p>
                  <p className="text-sm text-gray-600">Department Head</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Dean [Dean Name]</p>
                  <p className="text-sm text-gray-600">College Dean</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">[Student Name]</p>
                  <p className="text-sm text-gray-600">Researcher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
