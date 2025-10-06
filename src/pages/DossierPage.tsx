import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
// import { gradesService } from '../services/gradesService';
import AnalysisResults from '../analyiscomponents/AnalysisResults';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export type GradeRow = {
  id: string;
  subject: string;
  courseCode?: string;
  units: number;
  grade: number;
  semester: string;
};

type ExistingTranscript = {
  hasFile: boolean;
  fileName?: string;
  url?: string;
  _temp?: boolean;
  storagePath?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  course: string;
  student_number: string;
};

const DossierPage = () => {
  const [user, setUser] = useState<User>({ id: 0, name: '', email: '', course: '', student_number: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [existingTranscript, setExistingTranscript] = useState<ExistingTranscript | null>(null);

  // const [grades, setGrades] = useState<GradeRow[]>([]);

  const [primaryArchetype, setPrimaryArchetype] = useState<string>('');
  const [archetypePercents, setArchetypePercents] = useState<{
    realistic?: number; investigative?: number; artistic?: number; social?: number; enterprising?: number; conventional?: number;
  }>({});
  const [careerForecast, setCareerForecast] = useState<Record<string, number> | string[]>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
      const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(() => ({
          id: typeof parsed?.id === 'number' ? parsed.id : 0,
          name: String(parsed?.name || ''),
          email: String(parsed?.email || ''),
          course: String(parsed?.course || ''),
          student_number: String(parsed?.student_number || ''),
        }));
        if (parsed?.email) fetchProfile(parsed.email);
      } catch {}
    } else {
      setIsLoading(false);
    }
    return () => {};
  }, []);

  const getProfessionalSummary = (type: string, course: string): { headline: string; details: string } => {
    const courseLabel = course || 'Information Technology';
    const base = `A graduate of ${courseLabel} from Pamantasan ng Lungsod ng Maynila,`;
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'investigative':
        return {
          headline: `${base} with a strong investigative profile focused on analytical thinking and evidence-based problem solving.`,
          details: 'Demonstrates proficiency in research, data interpretation, and systems analysis to build reliable, scalable solutions.'
        };
      case 'artistic':
        return {
          headline: `${base} with an artistic profile centered on creative design and innovative solution building.`,
          details: 'Applies user-centric thinking, visual communication, and imaginative prototyping to craft engaging digital experiences.'
        };
      case 'social':
        return {
          headline: `${base} with a social profile emphasizing collaboration, communication, and stakeholder alignment.`,
          details: 'Excels at facilitation, knowledge sharing, and building empathetic solutions that address real user needs.'
        };
      case 'enterprising':
        return {
          headline: `${base} with an enterprising profile geared toward leadership, product thinking, and delivery.`,
          details: 'Combines strategic planning and business acumen to drive initiatives from concept to measurable outcomes.'
        };
      case 'realistic':
        return {
          headline: `${base} with a realistic profile focused on practical, hands-on engineering.`,
          details: 'Strong in implementation, troubleshooting, and optimizing systems with attention to reliability and performance.'
        };
      case 'conventional':
        return {
          headline: `${base} with a conventional profile prioritizing organization, accuracy, and process excellence.`,
          details: 'Delivers consistent results through documentation, quality controls, and efficient workflows.'
        };
      default:
        return {
          headline: `${base} with a balanced learning profile and growth mindset.`,
          details: 'Committed to continuous learning, disciplined execution, and delivering high-quality outcomes.'
        };
    }
  };

  // const normalizeToRows = (raw: any[]): GradeRow[] => {
  //   if (!Array.isArray(raw)) return [];
  //   return raw
  //     .map((g, idx) => {
  //       const subject = g.subject || g.course || g.code || g.name || 'Unknown Subject';
  //       const units = Number(g.units ?? g.credit_units ?? g.credits ?? 0) || 0;
  //       const grade = parseFloat((Number(g.grade ?? g.final_grade ?? g.rating ?? 0) || 0).toFixed(2));
  //       const semester = String(g.semester ?? g.term ?? g.period ?? 'N/A');
  //       return { id: `${Date.now()}_${idx}`, subject, units, grade, semester } as GradeRow;
  //     })
  //     .filter(r => r.subject && r.subject !== 'Unknown Subject');
  // };

  // Program table logic removed on Dossier view

  // Grade formatting removed

  const fetchProfile = async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();

      const hasValidTorUrl = !!(typeof data.tor_url === 'string' && data.tor_url.trim() !== '');
      const hasValidTorPath = !!(typeof data.tor_storage_path === 'string' && data.tor_storage_path.trim() !== '');
      const hasTor = hasValidTorUrl && hasValidTorPath;
      if (hasTor) {
        const url: string = data.tor_url.trim();
        setExistingTranscript({ hasFile: true, fileName: data.tor_storage_path.split('/').pop() || 'transcript.pdf', url, storagePath: data.tor_storage_path });
      } else {
        setExistingTranscript({ hasFile: false });
      }

      if (data.tor_notes) {
        try {
          const parsed = JSON.parse(data.tor_notes);
          // grades prefill omitted on dossier
          const cf = parsed?.analysis_results?.career_forecast;
          if (cf && typeof cf === 'object') setCareerForecast(cf);
        } catch {}
      }

      setUser((prev) => ({
        id: typeof data?.id === 'number' ? data.id : prev.id,
        name: String(data?.name || prev.name || ''),
        email: String(data?.email || prev.email || ''),
        course: String(data?.course || prev.course || ''),
        student_number: String(data?.student_number || prev.student_number || ''),
      }));

      setPrimaryArchetype(String(data.primary_archetype || ''));
      setArchetypePercents({
        realistic: typeof data.archetype_realistic_percentage === 'number' ? data.archetype_realistic_percentage : undefined,
        investigative: typeof data.archetype_investigative_percentage === 'number' ? data.archetype_investigative_percentage : undefined,
        artistic: typeof data.archetype_artistic_percentage === 'number' ? data.archetype_artistic_percentage : undefined,
        social: typeof data.archetype_social_percentage === 'number' ? data.archetype_social_percentage : undefined,
        enterprising: typeof data.archetype_enterprising_percentage === 'number' ? data.archetype_enterprising_percentage : undefined,
        conventional: typeof data.archetype_conventional_percentage === 'number' ? data.archetype_conventional_percentage : undefined,
      });

      let setForecast = false;
      if (Array.isArray(data.career_top_jobs)) {
        if (Array.isArray(data.career_top_jobs_scores) && data.career_top_jobs_scores.length === data.career_top_jobs.length) {
          const map: Record<string, number> = {};
          data.career_top_jobs.forEach((label: string, i: number) => { map[label] = data.career_top_jobs_scores[i]; });
          setCareerForecast(map);
          setForecast = true;
        } else {
          setCareerForecast(data.career_top_jobs);
          setForecast = true;
        }
      }

      if (!setForecast && typeof data?.email === 'string' && data.email) {
        try {
          const latest = await fetch(`${getApiUrl('OBJECTIVE_1_LATEST')}?email=${encodeURIComponent(data.email)}`);
          if (latest.ok) {
            const latestJson = await latest.json();
            if (Array.isArray(latestJson.career_top_jobs)) {
              if (Array.isArray(latestJson.career_top_jobs_scores) && latestJson.career_top_jobs_scores.length === latestJson.career_top_jobs.length) {
                const map: Record<string, number> = {};
                latestJson.career_top_jobs.forEach((label: string, i: number) => { map[label] = latestJson.career_top_jobs_scores[i]; });
                setCareerForecast(map);
              } else {
                setCareerForecast(latestJson.career_top_jobs);
              }
            }
          }
        } catch {}
      }
    } catch (e) {
      console.error(e);
      setExistingTranscript({ hasFile: false });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed saved grades/prefill logic

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const content = document.getElementById('dossier-content');
      if (!content) return;

      // Build a light (white) theme wrapper for export
      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-light';
      wrapper.style.padding = '6px';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#111827';
      // Set A4-friendly width in CSS pixels (~794px at 96dpi)
      wrapper.style.maxWidth = '794px';
      wrapper.style.width = '794px';
      wrapper.style.fontSize = '10pt';
      wrapper.style.lineHeight = '1.35';

      const style = document.createElement('style');
      style.innerHTML = `
        .pdf-light { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; font-size:10pt; line-height:1.35; }
        .pdf-light * { background: transparent !important; font-size:10pt !important; line-height:1.35 !important; }
        .pdf-light .bg-gray-900, .pdf-light .bg-gray-800, .pdf-light .bg-gray-700, .pdf-light .bg-black { background-color: #ffffff !important; }
        .pdf-light .text-white, .pdf-light .text-gray-200, .pdf-light .text-gray-300, .pdf-light .text-gray-400 { color: #111827 !important; }
        .pdf-light .border-gray-800, .pdf-light .border-gray-700, .pdf-light .border-gray-600 { border-color: #cbd5e1 !important; }
        .pdf-light .rounded-lg, .pdf-light .rounded-md { box-shadow: none; border: 2px solid #cbd5e1; background-color: #ffffff !important; padding: 8px !important; border-radius: 6px !important; }
        .pdf-light .mb-2 { margin-bottom: 6px !important; }
        .pdf-light .mb-3, .pdf-light .mb-4 { margin-bottom: 8px !important; }
        .pdf-light .mb-6, .pdf-light .mb-8 { margin-bottom: 10px !important; }
        .pdf-light .p-6, .pdf-light .p-8 { padding: 8px !important; }
        .pdf-light .px-4, .pdf-light .px-6, .pdf-light .px-8 { padding-left: 8px !important; padding-right: 8px !important; }
        .pdf-light .py-4, .pdf-light .py-6, .pdf-light .py-8 { padding-top: 8px !important; padding-bottom: 8px !important; }
        .pdf-light h1, .pdf-light h2, .pdf-light h3 { color: #111827 !important; margin: 0 0 6px 0; }
        .pdf-light h1 { font-size: 12pt !important; }
        .pdf-light h2 { font-size: 11pt !important; }
        .pdf-light h3 { font-size: 10.5pt !important; }
        .pdf-light .text-green-400, .pdf-light .text-blue-400, .pdf-light .text-purple-400 { color: #0f172a !important; }
        .pdf-light .bg-gradient-to-r, .pdf-light .bg-gradient-to-br { background-image: none !important; background-color: #ffffff !important; }
        .pdf-light .progress-bar { background-color: #2563eb !important; }
        .pdf-light p { font-size: 10pt !important; }
        /* Force Tailwind text-* utilities to 10pt for PDFs */
        .pdf-light .text-xs, .pdf-light .text-sm, .pdf-light .text-base, .pdf-light .text-lg, .pdf-light .text-xl, .pdf-light .text-2xl, .pdf-light .text-3xl, .pdf-light .text-4xl, .pdf-light .text-5xl, .pdf-light .text-6xl { font-size: 10pt !important; }
        /* Shrink progress bars for print */
        .pdf-light .h-2 { height: 4px !important; }
      `;

      const header = document.createElement('div');
      header.style.marginBottom = '12px';
      header.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-end;color:#111827">
        <div>
          <div style="font-size:20px;font-weight:700;">${user.name || 'Student'}</div>
          <div style="font-size:12px;opacity:0.8;">${user.course || ''}</div>
          <div style="font-size:12px;opacity:0.8;">Pamantasan ng Lungsod ng Maynila</div>
        </div>
        <div style="font-size:12px;opacity:0.7;">${new Date().toLocaleDateString()}</div>
      </div>`;

      const cloned = content.cloneNode(true) as HTMLElement;
      wrapper.appendChild(style);
      wrapper.appendChild(header);
      wrapper.appendChild(cloned);
      // Add to DOM offscreen so measurement works reliably
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-10000px';
      wrapper.style.top = '0';
      document.body.appendChild(wrapper);

      // Render to canvas and fit to one A4 page
      const canvas = await html2canvas(wrapper, { background: '#ffffff', useCORS: true, windowWidth: 794 as any } as any);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8; // mm
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;
      const imgW = maxW;
      const imgH = (canvas.height / canvas.width) * imgW;
      const finalH = imgH > maxH ? maxH : imgH;
      const finalW = imgH > maxH ? (canvas.width / canvas.height) * maxH : imgW;
      const offsetX = (pageWidth - finalW) / 2;
      const offsetY = (pageHeight - finalH) / 2;
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalW, finalH);
      pdf.save('Professional_Dossier.pdf');
      // Cleanup appended wrapper
      document.body.removeChild(wrapper);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // No upload handlers on Dossier view

  // analyze/clear actions intentionally omitted on Dossier view

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-30 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center"><Link to="/dashboard" className="text-xl font-bold">Gradalyze</Link></div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm shadow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <h2 className="text-2xl font-bold">Professional Dossier</h2>
            </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Data
              </button>
              <button 
                onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border text-white shadow-sm ${isGeneratingPDF ? 'bg-gray-600 border-gray-600' : 'bg-blue-600 hover:bg-blue-500 border-blue-500'}`}>
                {isGeneratingPDF ? (
                  <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Generating...
                  </>
                ) : (
                  <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : (
            <div id="dossier-content" className="space-y-8">
            {/* Professional Summary */}
              <div className="mb-2">
                <h3 className="text-xl font-bold text-white mb-4">Professional Summary</h3>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-lg border border-gray-600/50">
                  {(() => { 
                    const s = getProfessionalSummary(primaryArchetype || 'Analysis Required', user.course);
                    const entries = Object.entries(archetypePercents || {}).filter(([,v]) => typeof v === 'number') as [string, number][];
                    const secondary = entries
                      .sort((a,b) => b[1] - a[1])
                      .filter(([k]) => (k.toLowerCase() !== (primaryArchetype||'').toLowerCase()))
                      .slice(0, 2)
                      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                      .join(' and ');
                    return (
                      <div className="space-y-3">
                        <p className="text-gray-300 leading-relaxed text-lg">{s.headline}</p>
                        <p className="text-gray-300 leading-relaxed text-lg">{s.details}{secondary ? ` Secondary strengths include ${secondary}, enabling effective cross-functional collaboration.` : ''}</p>
                      </div>
                    ); 
                  })()}
                </div>
              </div>

              {/* Program table removed on Dossier view */}

              <AnalysisResults
                careerForecast={careerForecast}
                primaryArchetype={primaryArchetype}
                archetypePercents={archetypePercents}
                existingTranscript={existingTranscript}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DossierPage;
