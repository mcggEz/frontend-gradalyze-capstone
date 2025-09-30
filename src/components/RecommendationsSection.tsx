import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

interface Company {
  name: string;
  category: string;
  match_score: number;
  reasoning: string;
  job_roles: string[];
  location: string;
  company_size: string;
  industry: string;
  website: string;
  career_page: string;
  logo_url?: string;
  glassdoor_rating?: number;
  employee_count?: string;
  founded_year?: number;
  headquarters?: string;
  benefits?: string[];
  culture?: string;
}

interface JobOpening {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string[];
  benefits: string[];
  application_url: string;
  posted_date: string;
  match_score: number;
  reasoning: string;
  job_id?: string;
  application_deadline?: string;
  remote_work?: string;
  growth_potential?: string;
  skills_required?: string[];
  interview_process?: string;
}

interface RecommendationsSectionProps {
  userEmail: string;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ userEmail }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'companies' | 'jobs'>('companies');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiUrl('COMPLETE_RECOMMENDATIONS')}/${userEmail}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      console.log('📊 Recommendations data received:', data);
      console.log('📊 Companies:', data.companies);
      console.log('📊 Job openings:', data.job_openings);
      // Handle different possible data structures
      const companiesData = Array.isArray(data.companies) ? data.companies : [];
      const jobsData = Array.isArray(data.job_openings) ? data.job_openings : [];
      
      setCompanies(companiesData);
      setJobOpenings(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchRecommendations();
    }
  }, [userEmail]);

  const formatMatchScore = (score: number) => {
    return `${Math.round(score)}%`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'multinational': 'bg-blue-100 text-blue-800',
      'local_tech': 'bg-green-100 text-green-800',
      'startup': 'bg-purple-100 text-purple-800',
      'outsourcing': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      'Entry-level': 'bg-green-100 text-green-800',
      'Mid-level': 'bg-yellow-100 text-yellow-800',
      'Senior': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">⚠️ Error loading recommendations</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">AI-Powered Recommendations</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Jobs ({jobOpenings.length})
          </button>
        </div>
      </div>

      {activeTab === 'companies' && (
        <div className="space-y-4">
          {companies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No company recommendations available</p>
          ) : (
            companies.map((company, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{company.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(company.category)}`}>
                          {company.category.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">{company.industry}</span>
                        <span className="text-sm text-gray-400">{company.company_size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatMatchScore(company.match_score)}
                    </div>
                    <div className="text-xs text-gray-400">Match Score</div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3">{company.reasoning}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Job Roles</h5>
                    <div className="flex flex-wrap gap-1">
                      {(company.job_roles || []).map((role, roleIndex) => (
                        <span key={roleIndex} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Location</h5>
                    <p className="text-sm text-gray-300">{company.location}</p>
                  </div>
                </div>

                {company.benefits && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Benefits</h5>
                    <div className="flex flex-wrap gap-1">
                      {(company.benefits || []).map((benefit, benefitIndex) => (
                        <span key={benefitIndex} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Website
                    </a>
                    <a
                      href={company.career_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      Careers
                    </a>
                  </div>
                  {company.glassdoor_rating && (
                    <div className="text-sm text-gray-400">
                      ⭐ {company.glassdoor_rating}/5.0
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobOpenings.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No job openings available</p>
          ) : (
            jobOpenings.map((job, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                    <p className="text-gray-300">{job.company}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-400">{job.location}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experience_level)}`}>
                        {job.experience_level}
                      </span>
                      <span className="text-sm text-gray-400">{job.employment_type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatMatchScore(job.match_score)}
                    </div>
                    <div className="text-xs text-gray-400">Match Score</div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Salary Range</h5>
                    <p className="text-sm text-gray-300">{job.salary_range}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Posted Date</h5>
                    <p className="text-sm text-gray-300">{new Date(job.posted_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Requirements</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(job.requirements || []).slice(0, 3).map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Benefits</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(job.benefits || []).slice(0, 3).map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Apply Now
                  </a>
                  <div className="text-sm text-gray-400">
                    {job.remote_work && <span className="mr-3">🏠 {job.remote_work}</span>}
                    {job.application_deadline && <span>📅 Deadline: {job.application_deadline}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
