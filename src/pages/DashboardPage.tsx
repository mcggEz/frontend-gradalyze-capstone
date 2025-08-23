import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const DashboardPage = () => {
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
        
        // Fetch dynamic data if user has email
        if (parsed.email) {
          fetchHiringCompanies(parsed.email);
          fetchUserArchetype(parsed.email);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const fetchHiringCompanies = async (email: string) => {
    setCompaniesLoading(true);
    try {
      const response = await fetch(`${getApiUrl('COMPANIES_FOR_USER')}?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setHiringCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching hiring companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchUserArchetype = async (email: string) => {
    setArchetypeLoading(true);
    try {
      const response = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.primary_archetype) {
          setUserArchetype({
            primary: data.primary_archetype,
            analyzedAt: data.archetype_analyzed_at,
            hasAnalysis: !!data.tor_notes,
            archetype_realistic_percentage: data.archetype_realistic_percentage || 0,
            archetype_investigative_percentage: data.archetype_investigative_percentage || 0,
            archetype_artistic_percentage: data.archetype_artistic_percentage || 0,
            archetype_social_percentage: data.archetype_social_percentage || 0,
            archetype_enterprising_percentage: data.archetype_enterprising_percentage || 0,
            archetype_conventional_percentage: data.archetype_conventional_percentage || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user archetype:', error);
    } finally {
      setArchetypeLoading(false);
    }
  };

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('feed');
  
  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      navigate('/login');
    }
  };

  // Jobs feed (infinite scroll)
  type Job = {
    id: number;
    title: string;
    company?: string;
    location?: string;
    employment_type?: string;
    remote?: boolean;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    url: string;
    source?: string;
    posted_at?: string;
    tags?: string[];
    description?: string;
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsOffset, setJobsOffset] = useState(0);
  const [jobsHasMore, setJobsHasMore] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [scrapingJobs, setScrapingJobs] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic data states
  const [hiringCompanies, setHiringCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  
  // User archetype data
  const [userArchetype, setUserArchetype] = useState<any>(null);
  const [archetypeLoading, setArchetypeLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (jobsLoading || !jobsHasMore) return;
    setJobsLoading(true);
    try {
      const res = await fetch(`${getApiUrl('JOBS')}?limit=10&offset=${jobsOffset}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load jobs');
      setJobs((prev) => [...prev, ...(data.jobs || [])]);
      setJobsOffset((prev) => prev + (data.limit || 10));
      setJobsHasMore(Boolean(data.has_more));
    } catch (e) {
      // ignore for now
    } finally {
      setJobsLoading(false);
    }
  }, [jobsLoading, jobsHasMore, jobsOffset]);

  const scrapeJobs = async () => {
    setScrapingJobs(true);
    try {
      // Only scrape if user has archetype data
      if (!userArchetype || !userArchetype.hasAnalysis) {
        alert('Please upload your transcript first to get personalized job recommendations.');
        setScrapingJobs(false);
        return;
      }

      const res = await fetch(getApiUrl('SCRAPE_JOBS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          location: 'Philippines',
          sources: ['google', 'linkedin', 'indeed'],
          jobs_per_query: 8,
          archetype_based: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh jobs list
        setJobs([]);
        setJobsOffset(0);
        setJobsHasMore(true);
        await fetchJobs();
      } else {
        console.error('Scraping failed:', data.message);
      }
    } catch (e) {
      console.error('Failed to scrape jobs:', e);
    } finally {
      setScrapingJobs(false);
    }
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const el = observerRef.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) fetchJobs();
      });
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchJobs]);

  const renderJobCard = (job: Job) => {
    return (
      <a key={job.id} href={job.url} target="_blank" rel="noreferrer"
         className="block bg-gray-900 rounded-lg border border-gray-800 p-5 hover:border-gray-700 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-1">{job.title}</h4>
            <p className="text-sm text-gray-300">{job.company || 'Company'} • {job.location || 'Location'}{job.remote ? ' • Remote' : ''}</p>
          </div>
          {job.source && (
            <span className="text-xs text-gray-400">{job.source}</span>
          )}
        </div>
        {job.description && (
          <p className="text-sm text-gray-400 mt-3 line-clamp-3">{job.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{job.employment_type || '—'}</span>
          <span>
            {job.salary_min && job.salary_max ? `${job.currency || ''} ${job.salary_min}–${job.salary_max}` : '—'}
          </span>
        </div>
      </a>
    );
  };

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
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        📊 Analysis Results
                      </Link>
                      <Link 
                        to="/dossier"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        📋 My Dossier
                      </Link>
                      <Link 
                        to="/settings"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                        >
                          Sign Out
                        </button>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSection === 'feed' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden sticky top-24 h-fit">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-16"></div>
              <div className="p-6 -mt-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 border-4 border-gray-900">
                  <span className="text-xl font-bold text-white">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-1">{user.name || 'User'}</h2>
                <p className="text-gray-400 text-sm mb-2">{user.course || 'Course'}{user.student_number ? ` • ${user.student_number}` : ''}</p>
                <p className="text-gray-400 text-sm mb-1">{user.email}</p>
                
                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 text-sm">Archetype</span>
                    {archetypeLoading ? (
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div>
                    ) : userArchetype ? (
                      <span className="font-medium text-green-400">
                        {userArchetype.primary.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    ) : (
                      <span className="font-medium text-yellow-400">Pending</span>
                    )}
                  </div>
                  {userArchetype && userArchetype.analyzedAt && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Analyzed</span>
                      <span className="text-gray-300 text-xs">
                        {new Date(userArchetype.analyzedAt).toLocaleDateString()}
                    </span>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
                        {/* Simple Welcome Card */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
                </div>
             
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, <span className="text-blue-400">{(user.name || 'User').split(' ')[0]}</span>!
              </h2>
             
              <p className="text-gray-300 mb-2">{user.course || 'Course'}{user.student_number ? ` • ${user.student_number}` : ''}</p>
             
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Ready to discover your learning archetype? Upload your transcript to get personalized insights about your academic journey.
              </p>
             
              <Link 
                to="/analysis"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                <span>Get Started</span>
              </Link>
            </div>

            {/* Jobs Feed */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Recommended Jobs</h3>
                <button
                  onClick={scrapeJobs}
                  disabled={scrapingJobs || !userArchetype || !userArchetype.hasAnalysis}
                  title={!userArchetype || !userArchetype.hasAnalysis ? 'Upload your transcript first to enable job scraping' : ''}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    scrapingJobs || !userArchetype || !userArchetype.hasAnalysis
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {scrapingJobs ? 'Scraping...' : 'Get Jobs'}
                </button>
              </div>
              <div className="space-y-3 relative">
                {(!userArchetype || !userArchetype.hasAnalysis) && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                    <div className="text-center px-6">
                      <p className="text-gray-300 mb-2 text-sm">Upload your transcript to unlock personalized job recommendations.</p>
                      <Link to="/analysis" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">Go to Analysis</Link>
                    </div>
                  </div>
                )}
                {jobs.map(renderJobCard)}
                {jobsLoading && (
                  <div className="text-sm text-gray-400">Loading more jobs…</div>
                )}
                {!jobsLoading && jobs.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Jobs Yet</h3>
                    <p className="text-gray-400 mb-4">
                      {userArchetype && userArchetype.hasAnalysis 
                        ? "Click 'Get Jobs' to find personalized job recommendations based on your archetype."
                        : "Upload your transcript first to get personalized job recommendations."
                      }
                    </p>
                    {userArchetype && userArchetype.hasAnalysis && (
                      <button
                        onClick={scrapeJobs}
                        disabled={scrapingJobs}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {scrapingJobs ? 'Finding Jobs...' : 'Find My Jobs'}
                      </button>
                    )}
                  </div>
                )}
                {/* Observer target for infinite scroll */}
                <div ref={observerRef} />
                {!jobsHasMore && jobs.length > 0 && (
                  <div className="text-xs text-gray-500 text-center">You've reached the end.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">

            {/* Your Archetypes */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="font-bold mb-4">Your Archetypes</h3>
              {archetypeLoading ? (
              <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                    </div>
                  ))}
                </div>
              ) : userArchetype ? (
                <div className="space-y-3">
                                     {Object.entries({
                    'Applied Practitioner': userArchetype.archetype_realistic_percentage || 0,
                    'Analytical Thinker': userArchetype.archetype_investigative_percentage || 0,
                    'Creative Innovator': userArchetype.archetype_artistic_percentage || 0,
                    'Collaborative Supporter': userArchetype.archetype_social_percentage || 0,
                    'Strategic Leader': userArchetype.archetype_enterprising_percentage || 0,
                    'Methodical Organizer': userArchetype.archetype_conventional_percentage || 0
                  })
                 .sort(([,a], [,b]) => (b as number) - (a as number))
                 .slice(0, 6)
                 .map(([archetype, percentage]) => (
                   <div key={archetype} className="flex justify-between items-center">
                     <span className="text-gray-300 text-sm">{archetype}</span>
                     <span className={`text-xs ${percentage > 20 ? 'text-green-400' : percentage > 10 ? 'text-yellow-400' : 'text-gray-400'}`}>
                       {percentage}%
                     </span>
               </div>
                 ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">Upload your transcript to see your archetype analysis</p>
                </div>
              )}
            </div>

            {/* Companies Hiring */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="font-bold mb-4">Companies Hiring for You</h3>
              {companiesLoading ? (
              <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-24 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-20"></div>
                  </div>
                </div>
                  ))}
                </div>
              ) : hiringCompanies.length > 0 ? (
                <div className="space-y-3">
                  {hiringCompanies.map((company, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${
                        index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {company.name.split(' ').map((word: string) => word[0]).join('').toUpperCase()}
                        </span>
                  </div>
                  <div>
                        <p className="text-sm font-medium">{company.name}</p>
                        <p className="text-xs text-gray-400">{company.job_count} new position{company.job_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                  ))}
                  </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No relevant companies found. Try refreshing job data.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Analysis Section */}
        {activeSection === 'analysis' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center space-x-4">
              <button 
                onClick={() => setActiveSection('feed')}
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Feed</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
              <h2 className="text-2xl font-bold mb-6">📊 Academic Analysis</h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
                <p className="text-gray-400 mb-6">Upload your transcript to see your learning archetype and academic insights.</p>
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4">Upload Your Documents</h4>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-400 text-sm">PDF, DOC, or DOCX (max. 10MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dossier Section */}
        {activeSection === 'dossier' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center space-x-4">
              <button 
                onClick={() => setActiveSection('feed')}
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Feed</span>
              </button>
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
                  <p className="text-lg text-gray-600">{user.course}</p>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                {/* Academic Profile */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Profile</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Learning Archetype</h3>
                      <p className="text-gray-600">Analysis pending - upload transcript to discover</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Academic Standing</h3>
                      <p className="text-gray-600">GPA analysis pending</p>
                    </div>
                  </div>
                </div>

                {/* Core Competencies */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Core Competencies</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Competencies will be identified based on your academic performance analysis</p>
                  </div>
                </div>

                {/* Career Recommendations */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Career Paths</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Career recommendations will appear after completing your archetype analysis</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-200 pt-4 text-center">
                  <p className="text-sm text-gray-500">Generated by Gradalyze • Professional Academic Portfolio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center space-x-4">
              <button 
                onClick={() => setActiveSection('feed')}
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Feed</span>
              </button>
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Year Level</label>
                      <input 
                        type="text" 
                        value="N/A"
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
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;