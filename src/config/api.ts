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
    DELETE_CERTIFICATE: '/api/users/delete-certificate',
    EXTRACT_GRADES: '/api/users/extract-grades',
    
    // OCR TOR endpoints (renamed from grades)
    GET_GRADES: '/api/ocr-tor/get',
    UPDATE_GRADES: '/api/ocr-tor/update',
    ADD_GRADE: '/api/ocr-tor/add',
    DELETE_GRADE: '/api/ocr-tor/delete',
    
    // OCR Certificate endpoints (renamed from certificates)
    EXTRACT_CERTIFICATE_TEXT: '/api/ocr-cert/extract-text',
    ANALYZE_CERTIFICATE: '/api/ocr-cert/analyze',
    ENHANCE_ANALYSIS: '/api/ocr-cert/enhance-analysis',
    
    // Objective endpoints
    OBJECTIVE_1_PROCESS: '/api/objective-1/process',
    OBJECTIVE_1_PROCESS_CS: '/api/objective-1-cs/process',
    OBJECTIVE_1_LATEST: '/api/objective-1/latest',
    OBJECTIVE_1_SAVE: '/api/objective-1/save-results',
    OBJECTIVE_1_CLEAR: '/api/objective-1/clear-results',
    OBJECTIVE_1_CLEAR_CS: '/api/objective-1-cs/clear-results',
    
    OBJECTIVE_2_PROCESS: '/api/objective-2/process',
    OBJECTIVE_2_SAVE: '/api/objective-2/save-results',
    OBJECTIVE_2_CLEAR: '/api/objective-2/clear-results',
    
    OBJECTIVE_3_PROCESS: '/api/objective-3/process',
    OBJECTIVE_3_SAVE: '/api/objective-3/save-results',
    OBJECTIVE_3_CLEAR: '/api/objective-3/clear-results',
    OBJECTIVE_3_PING: '/api/objective-3/gemini-ping',
    
    // Legacy endpoints for compatibility
    COMPANY_RECOMMENDATIONS: '/api/objective-3/process',
    COMPLETE_RECOMMENDATIONS: '/api/objective-3/process',
    
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

