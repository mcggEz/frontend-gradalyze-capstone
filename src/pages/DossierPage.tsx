import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DossierPage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    course: '',
    year: ''
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dossierData, setDossierData] = useState<any>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem('user');
        const u = stored ? JSON.parse(stored) : {};
        const email = (u?.email || '').trim();
        if (!email) return;
        
        // Load user profile (same as Analysis page)
        const res = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
        if (!res.ok) {
          console.error('Failed to fetch profile:', res.status, res.statusText);
          return;
        }
        const p = await res.json();
        console.log('✅ Profile fetched successfully:', p);
        setUser({
          name: p?.name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || email,
          email: p?.email || email,
          course: p?.course || (u?.course || ''),
          year: (u?.year || '').toString(),
        });

        // Extract analysis data from profile (same as Analysis page)
        console.log('Profile data received:', p);
        console.log('TOR notes:', p.tor_notes);
        
        if (p.tor_notes) {
          try {
            const notes = JSON.parse(p.tor_notes);
            console.log('✅ Parsed TOR notes:', notes);
            
            // Extract analysis results from tor_notes (same structure as Analysis page)
            const analysisResults = notes.analysis_results || notes.archetype_analysis || {};
            const careerForecast = analysisResults.career_forecast || notes.career_forecast || {};
            const grades = notes.grades || notes.academic_analysis?.grades || [];
            
            console.log('✅ Analysis results:', analysisResults);
            console.log('✅ Career forecast:', careerForecast);
            console.log('✅ Grades:', grades);
            console.log('✅ Primary archetype:', p.primary_archetype);
            console.log('✅ Archetype analyzed at:', p.archetype_analyzed_at);
            
            // Handle different career forecast structures
            let careerScores = {};
            if (careerForecast.career_scores) {
                // New structure with career_scores wrapper
                careerScores = careerForecast.career_scores;
            } else if (typeof careerForecast === 'object' && careerForecast !== null) {
                // Direct structure (current database format)
                careerScores = careerForecast;
            }
            
            console.log('✅ Career scores extracted:', careerScores);
            
            // Build dossier data from profile data
            const dossierData = {
              personal_info: {
                email: p.email,
                name: p.name,
                course: p.course,
                status: p.archetype_analyzed_at ? 'Generated' : 'Analysis Required'
              },
              archetype: {
                type: p.primary_archetype || 'Unknown',
                percentages: {
                  realistic: p.archetype_realistic_percentage || 0.0,
                  investigative: p.archetype_investigative_percentage || 0.0,
                  artistic: p.archetype_artistic_percentage || 0.0,
                  social: p.archetype_social_percentage || 0.0,
                  enterprising: p.archetype_enterprising_percentage || 0.0,
                  conventional: p.archetype_conventional_percentage || 0.0
                }
              },
              academic_performance: {
                total_subjects: grades.length,
                total_units: Math.round(grades.reduce((sum: number, g: any) => sum + (g.units || 0), 0)),
                average_grade: grades.length > 0 ? Math.round((grades.reduce((sum: number, g: any) => sum + (g.grade || 0), 0) / grades.length) * 100) / 100 : 0
              },
              career_recommendations: Object.keys(careerScores).length > 0 ? 
                Object.entries(careerScores)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([title, score]) => ({
                    title: title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    match: Math.round((score as number) * 100),
                    demand: 'High',
                    salary: 'To be determined'
                  })) : []
            };
            
            console.log('✅ Built dossier data:', dossierData);
            setDossierData(dossierData);
          } catch (error) {
            console.error('❌ Error parsing TOR notes:', error);
            // Set empty dossier data if parsing fails
            setDossierData({
              personal_info: {
                email: p.email,
                name: p.name,
                course: p.course,
                status: 'Analysis Required'
              },
              archetype: {
                type: p.primary_archetype || 'Unknown',
                percentages: {
                  realistic: p.archetype_realistic_percentage || 0.0,
                  investigative: p.archetype_investigative_percentage || 0.0,
                  artistic: p.archetype_artistic_percentage || 0.0,
                  social: p.archetype_social_percentage || 0.0,
                  enterprising: p.archetype_enterprising_percentage || 0.0,
                  conventional: p.archetype_conventional_percentage || 0.0
                }
              },
              academic_performance: {
                total_subjects: 0,
                total_units: 0,
                average_grade: 0
              },
              career_recommendations: []
            });
          }
        } else {
          console.log('⚠️ No TOR notes found, setting empty dossier data');
          // Set empty dossier data if no TOR notes
          setDossierData({
            personal_info: {
              email: p.email,
              name: p.name,
              course: p.course,
              status: 'Analysis Required'
            },
            archetype: {
              type: p.primary_archetype || 'Unknown',
              percentages: {
                realistic: p.archetype_realistic_percentage || 0.0,
                investigative: p.archetype_investigative_percentage || 0.0,
                artistic: p.archetype_artistic_percentage || 0.0,
                social: p.archetype_social_percentage || 0.0,
                enterprising: p.archetype_enterprising_percentage || 0.0,
                conventional: p.archetype_conventional_percentage || 0.0
              }
            },
            academic_performance: {
              total_subjects: 0,
              total_units: 0,
              average_grade: 0
            },
            career_recommendations: []
          });
        }
      } catch (error) {
        console.error('❌ Error loading dossier data:', error);
        // Set fallback data if everything fails
        const stored = localStorage.getItem('user');
        const u = stored ? JSON.parse(stored) : {};
        const email = (u?.email || '').trim();
        
        setDossierData({
          personal_info: {
            email: email,
            name: u?.name || email,
            course: u?.course || 'Unknown',
            status: 'Analysis Required'
          },
          archetype: {
            type: 'Unknown',
            percentages: {
              realistic: 0.0,
              investigative: 0.0,
              artistic: 0.0,
              social: 0.0,
              enterprising: 0.0,
              conventional: 0.0
            }
          },
          academic_performance: {
            total_subjects: 0,
            total_units: 0,
            average_grade: 0
          },
          career_recommendations: []
        });
      } finally {
        setIsLoadingDossier(false);
      }
    };
    load();
  }, []);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Get the dossier content element
      const dossierElement = document.getElementById('dossier-content');
      if (!dossierElement) {
        throw new Error('Dossier content not found');
      }

      // Create canvas from the element
      const canvas = await html2canvas(dossierElement, {
        useCORS: true,
        background: '#1f2937', // gray-800 background
        width: dossierElement.scrollWidth,
        height: dossierElement.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${user.name.replace(/\s+/g, '_')}_Professional_Dossier.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Get real data from API or use fallback
      const getAnalysisData = () => {
        if (!dossierData) {
          console.log('⚠️ No dossier data available, returning fallback data');
          return {
            archetype: {
              type: 'Analysis Required',
              description: 'Please complete the academic analysis first to generate your professional dossier.',
              strengths: ['Analysis Required'],
              score: 0
            },
            grades: {
              gpa: 0,
              totalUnits: 0,
              majorSubjects: 0,
              averageGrade: 0
            },
            careerPaths: []
          };
        }

        console.log('✅ Using dossier data:', dossierData);
        console.log('✅ Archetype data:', dossierData.archetype);
        console.log('✅ Career recommendations:', dossierData.career_recommendations);
        console.log('✅ Academic performance:', dossierData.academic_performance);

    const archetype = dossierData.archetype || {};
    const academic = dossierData.academic_performance || {};
    const careers = dossierData.career_recommendations || [];

    console.log('✅ Processing dossier data:');
    console.log('  - Archetype:', archetype);
    console.log('  - Academic:', academic);
    console.log('  - Careers:', careers);

        const result = {
    archetype: {
            type: archetype.type || 'Unknown',
            description: getArchetypeDescription(archetype.type),
            strengths: getArchetypeStrengths(archetype.type),
            score: getArchetypeScore(archetype.percentages)
    },
    grades: {
            gpa: parseFloat((academic.average_grade || 0).toString()),
            totalUnits: parseInt((academic.total_units || 0).toString()),
            majorSubjects: parseInt((academic.total_subjects || 0).toString()),
            averageGrade: parseFloat((academic.average_grade || 0).toString())
          },
          careerPaths: careers.map((career: any) => ({
            title: career.title,
            match: Math.round(career.match || 0),
            demand: career.demand || 'Medium',
            salary: career.salary || 'To be determined'
          })),
        };
        
        console.log('✅ Final processed data:', result);
        console.log('✅ Grades data:', result.grades);
        console.log('✅ GPA value:', result.grades.gpa, 'Type:', typeof result.grades.gpa);
        console.log('✅ Major subjects:', result.grades.majorSubjects, 'Type:', typeof result.grades.majorSubjects);
        console.log('✅ Total units:', result.grades.totalUnits, 'Type:', typeof result.grades.totalUnits);
        return result;
  };

  const getArchetypeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'investigative': 'Strong analytical and research-oriented thinking with systematic problem-solving approach',
      'artistic': 'Creative and innovative thinking with strong visual and conceptual abilities',
      'social': 'People-oriented with excellent communication and interpersonal skills',
      'enterprising': 'Leadership-oriented with strong business and management capabilities',
      'realistic': 'Practical and hands-on approach with strong technical and mechanical skills',
      'conventional': 'Organized and detail-oriented with strong administrative and procedural skills'
    };
    return descriptions[type] || 'Unique learning style with diverse capabilities';
  };

  const getArchetypeStrengths = (type: string) => {
    const strengths: { [key: string]: string[] } = {
      'investigative': ['Analytical Thinking', 'Research Skills', 'Problem Solving', 'Technical Analysis'],
      'artistic': ['Creative Design', 'Visual Thinking', 'Innovation', 'Aesthetic Sense'],
      'social': ['Communication', 'Teamwork', 'Leadership', 'Interpersonal Skills'],
      'enterprising': ['Leadership', 'Business Acumen', 'Strategic Thinking', 'Management'],
      'realistic': ['Technical Skills', 'Practical Application', 'Hands-on Problem Solving', 'Mechanical Aptitude'],
      'conventional': ['Organization', 'Attention to Detail', 'Administrative Skills', 'Process Management']
    };
    return strengths[type] || ['Adaptability', 'Learning Agility', 'Problem Solving'];
  };

  const getArchetypeScore = (percentages: any) => {
    if (!percentages) return 0;
    const values = Object.values(percentages).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return 0;
    const maxPercentage = Math.max(...values);
    return Math.round((maxPercentage / 100) * 10 * 10) / 10; // Convert to 0-10 scale
  };


  const analysisData = getAnalysisData();

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
                        Analysis Results
                      </Link>
                      <Link 
                        to="/dossier"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        My Dossier
                      </Link>
                      <Link 
                        to="/settings"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        Settings
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
            <h2 className="text-2xl font-bold">My Professional Dossier</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.location.reload()}
                disabled={isLoadingDossier}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </button>
              <button 
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || isLoadingDossier}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoadingDossier ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your professional dossier...</p>
            </div>
          ) : (
            <>
          {/* Dossier Preview */}
              <div id="dossier-content" className="bg-gray-800 text-white rounded-lg p-8 mb-6 border border-gray-700">
            {/* Header */}
            <div className="border-b-2 border-gray-600 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-lg text-gray-300">{user.course} {user.year}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>

            {/* Professional Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Professional Summary</h2>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg border border-gray-600/50">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    A dedicated <strong className="text-blue-400">{user.course}</strong> student with an <strong className="text-purple-400">{analysisData.archetype.type}</strong> learning archetype, 
                    demonstrating exceptional analytical and problem-solving capabilities.
                  </p>
                  
                  <p className="text-gray-300 leading-relaxed text-lg">
                    With a cumulative GPA of <strong className="text-green-400">{Number(analysisData.grades.gpa).toFixed(2)} </strong> 
                    and strong performance in <strong className="text-orange-400">{Number(analysisData.grades.majorSubjects).toLocaleString()}</strong> major subjects 
                    totaling <strong className="text-blue-400">{Number(analysisData.grades.totalUnits).toLocaleString()}</strong> units, 
                    I possess a solid foundation in technical skills including programming, database design, and system analysis.
                  </p>
                  
                  <p className="text-gray-300 leading-relaxed text-lg">
                    My academic journey reflects a consistent pattern of logical reasoning and systematic approach to complex challenges, 
                    making me well-suited for technical roles in software development, data analysis, and system design.
                  </p>
                </div>
              </div>
            </div>

                    {/* Career Path Forecasting */}
                    <div className="mb-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-white">🎯</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">Career Path Forecasting</h2>
                      </div>
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 p-6 rounded-lg border border-green-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-white">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI-Powered Career Forecast</h3>
                    <p className="text-sm text-green-400">Random Forest ML Model Prediction</p>
                  </div>
                </div>
                
                {analysisData.careerPaths.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Top Career Recommendations</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {analysisData.careerPaths.map((career: any, index: number) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-300">{career.title}</span>
                            <span className="text-sm font-bold text-green-400">{career.match}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{width: `${career.match}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-2">
                      {analysisData.archetype.type === 'Analysis Required' 
                        ? 'Analysis Required' 
                        : 'Career forecast in progress'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {analysisData.archetype.type === 'Analysis Required'
                        ? 'Please complete the academic analysis first to generate career recommendations.'
                        : 'Your archetype analysis is complete. Career recommendations are being generated.'
                      }
                    </p>
                    {analysisData.archetype.type !== 'Analysis Required' && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      </div>
                    )}
                    {analysisData.archetype.type === 'Analysis Required' && (
                      <div className="mt-4">
                        <Link 
                          to="/analysis"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Go to Analysis
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Student Archetype Classification */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">🧠</span>
                </div>
                <h2 className="text-xl font-bold text-white">Student Archetype Classification</h2>
              </div>
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-lg border border-purple-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-white">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{analysisData.archetype.type}</h3>
                    <p className="text-sm text-purple-400">RIASEC Archetype Classification</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{analysisData.archetype.description}</p>
                
                {/* RIASEC Percentages */}
                {dossierData?.archetype?.percentages && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-3">RIASEC Archetype Scores</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(dossierData.archetype.percentages).map(([type, percentage]: [string, any]) => (
                        <div key={type} className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-300 capitalize">{type}</span>
                            <span className="text-sm font-bold text-purple-400">{Math.round(percentage || 0)}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{width: `${percentage || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                )}
                
              </div>
            </div>

            {/* Academic Performance */}
            <div className="mb-8">
                      <h2 className="text-xl font-bold text-white mb-4">Academic Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-lg text-center border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
                          <p className="text-2xl font-bold text-blue-300">{analysisData.grades.gpa.toFixed(2)}</p>
                          <p className="text-sm text-blue-200">Cumulative GPA</p>
                </div>
                        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg text-center border border-green-600/30 hover:border-green-500/50 transition-all duration-300">
                          <p className="text-2xl font-bold text-green-300">{analysisData.grades.totalUnits.toLocaleString()}</p>
                          <p className="text-sm text-green-200">Total Units</p>
                </div>
                        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg text-center border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300">
                          <p className="text-2xl font-bold text-purple-300">{analysisData.grades.majorSubjects.toLocaleString()}</p>
                          <p className="text-sm text-purple-200">Major Subjects</p>
                </div>
                        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-4 rounded-lg text-center border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300">
                          <p className="text-2xl font-bold text-orange-300">{analysisData.grades.averageGrade.toFixed(2)}</p>
                          <p className="text-sm text-orange-200">Average Grade</p>
                </div>
              </div>
            </div>




            {/* Footer */}
            <div className="border-t-2 border-gray-600 pt-4 text-center space-y-3">
              <p className="text-sm text-gray-400">Generated by Gradalyze • Capstone Project for Pamantasan ng Lungsod ng Maynila</p>
              <p className="text-xs text-gray-500">Bachelor of Science in Information Technology</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DossierPage;
