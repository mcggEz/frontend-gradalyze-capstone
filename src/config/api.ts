// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/register',
    PROFILE_BY_EMAIL: '/api/auth/profile-by-email',
    
    // User endpoints
    USERS: '/api/users',
    UPLOAD_TOR: '/api/users/upload-tor',
    DELETE_TOR: '/api/users/delete-tor',
    UPLOAD_CERTIFICATES: '/api/users/upload-certificates',
    EXTRACT_GRADES: '/api/users/extract-grades',
    
    
    // Analysis endpoints
    RECOMMENDED_SKILLS: '/api/analysis/recommended-skills',
    COMPANIES_FOR_USER: '/api/analysis/companies-for-user',
    
    // Recommendation endpoints
    COMPANY_RECOMMENDATIONS: '/api/recommendations/companies',
    JOB_OPENINGS: '/api/recommendations/jobs',
    COMPLETE_RECOMMENDATIONS: '/api/recommendations/complete',
    
    // Dossier endpoints
    DOSSIER_GENERATE: '/api/dossier/generate',
    DOSSIER_PREVIEW: '/api/dossier/preview',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
export const getApiUrl = (endpointKey: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[endpointKey]);
};

