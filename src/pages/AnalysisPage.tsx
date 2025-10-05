import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl, API_CONFIG } from '../config/api';
import { gradesService } from '../services/gradesService';
import TranscriptUpload from '../analyiscomponents/TranscriptUpload';
import CertificatesUpload from '../analyiscomponents/CertificatesUpload';
import AnalysisResults from '../analyiscomponents/AnalysisResults';
import ProcessButton from '../analyiscomponents/ProcessButton';
import ITStaticTable from '../analyiscomponents/ITStaticTable';
import CStaticTable from '../analyiscomponents/CStaticTable';

type ExistingTranscript = {
  hasFile: boolean;
  fileName?: string;
  url?: string;
  _temp?: boolean;
  storagePath?: string;
};

type ExistingCertificate = {
  id: number;
  path?: string;
  name: string;
  url: string;
  _temp?: boolean;
};

export type GradeRow = {
  id: string;
  subject: string;
  courseCode?: string;
  units: number;
  grade: number;
  semester: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  course: string;
  student_number: string;
};

const AnalysisPage = () => {
  const [user, setUser] = useState<User>({ id: 0, name: '', email: '', course: '', student_number: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [existingTranscript, setExistingTranscript] = useState<ExistingTranscript | null>(null);
  const [existingCertificates, setExistingCertificates] = useState<ExistingCertificate[]>([]);
  const [, setCertificateAnalyses] = useState<any[]>([]);

  // Editable grades table state
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrades, setShowGrades] = useState(false);

  // Track created blob URLs to revoke later
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [tempTranscriptSizeKB, setTempTranscriptSizeKB] = useState<number | null>(null);

  // Archetype summary state
  const [primaryArchetype, setPrimaryArchetype] = useState<string>('');
  const [archetypePercents, setArchetypePercents] = useState<{
    realistic?: number; investigative?: number; artistic?: number; social?: number; enterprising?: number; conventional?: number;
  }>({});
  const [careerForecast, setCareerForecast] = useState<Record<string, number>>({});

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
    return () => {
      blobUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  const normalizeToRows = (raw: any[]): GradeRow[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((g, idx) => {
        const subject = g.subject || g.course || g.code || g.name || 'Unknown Subject';
        const units = Number(g.units ?? g.credit_units ?? g.credits ?? 0) || 0;
        const grade = parseFloat((Number(g.grade ?? g.final_grade ?? g.rating ?? 0) || 0).toFixed(2));
        const semester = String(g.semester ?? g.term ?? g.period ?? 'N/A');
        return { id: `${Date.now()}_${idx}`, subject, units, grade, semester } as GradeRow;
      })
      .filter(r => r.subject && r.subject !== 'Unknown Subject');
  };

  const fetchProfile = async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl('PROFILE_BY_EMAIL')}?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();

      // Transcript - only show if we have both URL and storage path (more strict check)
      const hasValidTorUrl = !!(typeof data.tor_url === 'string' && data.tor_url.trim() !== '');
      const hasValidTorPath = !!(typeof data.tor_storage_path === 'string' && data.tor_storage_path.trim() !== '');
      const hasTor = hasValidTorUrl && hasValidTorPath;
      
      if (hasTor) {
        const url: string = data.tor_url.trim();
        setExistingTranscript({
          hasFile: true,
          fileName: data.tor_storage_path.split('/').pop() || 'transcript.pdf',
          url,
          storagePath: data.tor_storage_path,
        });
      } else {
        setExistingTranscript({ hasFile: false });
      }

      // Preload grades from tor_notes if provided
      if (data.tor_notes) {
        try {
          const parsed = JSON.parse(data.tor_notes);
          if (Array.isArray(parsed?.grades)) {
            setGrades(normalizeToRows(parsed.grades));
            // Ensure all grades are properly formatted
            setTimeout(() => formatAllGrades(), 100);
          }
          const cf = parsed?.analysis_results?.career_forecast;
          if (cf && typeof cf === 'object') setCareerForecast(cf);
        } catch {}
      }

      // Certificates - accept paths and/or urls; also accept string/CSV
      const toArray = (v: any): string[] => {
        if (!v) return [];
        if (Array.isArray(v)) return v.filter(Boolean);
        if (typeof v === 'string') {
          try {
            // try json string first
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
          } catch {}
          // fallback: comma-separated
          return v.split(',').map((s) => s.trim()).filter(Boolean);
        }
        return [];
      };

      const bucket = (import.meta.env.VITE_CERT_BUCKET as string) || 'certificates';

      const paths = toArray(data.certificate_paths);
      const urls = toArray(data.certificate_urls);

      type CertItem = { id: number; path?: string; url: string; name: string; _temp?: boolean };
      const items: CertItem[] = [];

      // helper to extract a normalized storage path from a public URL
      const extractPathFromUrl = (u: string): string | undefined => {
        try {
          const marker = `/${bucket}/`;
          const idx = u.indexOf(marker);
          if (idx !== -1) {
            return u.substring(idx + marker.length);
          }
          // fallback: try last two segments
          const urlObj = new URL(u);
          const parts = urlObj.pathname.split('/').filter(Boolean);
          if (parts.length >= 2) {
            return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
          }
        } catch {}
        return undefined;
      };

      const seenKeys = new Set<string>();
      const pushIfNew = (item: CertItem) => {
        const key = item.path || extractPathFromUrl(item.url) || item.url;
        if (!key || seenKeys.has(key)) return;
        seenKeys.add(key);
        items.push({ ...item, id: items.length });
      };

      // from paths
      paths.forEach((p) => {
        if (!p || p.startsWith('temp/')) return;
        const name = p.split('/').pop() || 'Certificate';
        // url is optional for our UI; keep empty to avoid mismatched dedupe keys
        pushIfNew({ id: 0, path: p, url: '', name });
      });

      // from urls
      urls.forEach((u) => {
        if (!u) return;
        const name = u.split('/').pop() || 'Certificate';
        pushIfNew({ id: 0, url: u, name });
      });

      // latest fields
      if (typeof data.latest_certificate_path === 'string' && data.latest_certificate_path.trim() !== '') {
        const p = data.latest_certificate_path as string;
        if (!paths.includes(p)) {
          const name = p.split('/').pop() || 'Certificate';
          pushIfNew({ id: 0, path: p, url: '', name });
        }
      }
      if (typeof data.latest_certificate_url === 'string' && data.latest_certificate_url.trim() !== '') {
        const u = data.latest_certificate_url as string;
        if (!urls.includes(u)) {
          const name = u.split('/').pop() || 'Certificate';
          pushIfNew({ id: 0, url: u, name });
        }
      }

      const deduped = items.map((it, idx) => ({ ...it, id: idx }));

      setExistingCertificates(deduped);

      // Merge profile fields into user state (ensure numeric id is set)
      setUser((prev) => ({
        id: typeof data?.id === 'number' ? data.id : prev.id,
        name: String(data?.name || prev.name || ''),
        email: String(data?.email || prev.email || ''),
        course: String(data?.course || prev.course || ''),
        student_number: String(data?.student_number || prev.student_number || ''),
      }));

      // Capture archetype percentages for summary
      setPrimaryArchetype(String(data.primary_archetype || ''));
      setArchetypePercents({
        realistic: typeof data.archetype_realistic_percentage === 'number' ? data.archetype_realistic_percentage : undefined,
        investigative: typeof data.archetype_investigative_percentage === 'number' ? data.archetype_investigative_percentage : undefined,
        artistic: typeof data.archetype_artistic_percentage === 'number' ? data.archetype_artistic_percentage : undefined,
        social: typeof data.archetype_social_percentage === 'number' ? data.archetype_social_percentage : undefined,
        enterprising: typeof data.archetype_enterprising_percentage === 'number' ? data.archetype_enterprising_percentage : undefined,
        conventional: typeof data.archetype_conventional_percentage === 'number' ? data.archetype_conventional_percentage : undefined,
      });
    } catch (e) {
      console.error(e);
      // Clear UI to reflect unknown/empty state rather than showing stale items
      setExistingTranscript({ hasFile: false });
      setExistingCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to ensure all grades are properly formatted with two decimal places
  const formatAllGrades = () => {
    setGrades(prev => prev.map(grade => ({
      ...grade,
      grade: parseFloat(grade.grade.toFixed(2))
    })));
  };

  const [prefill, setPrefill] = useState<number[]>([]);
  const handleGradesExtracted = (extractedGrades: any[]) => {
    // Expect numeric array; store for table prefill and also build rows for persistence/analysis
    if (Array.isArray(extractedGrades) && extractedGrades.every(g => typeof g === 'number')) {
      console.log('[OCR] handling grades for prefill:', extractedGrades);
      setPrefill(extractedGrades.map(n => parseFloat(Number(n).toFixed(2))));
    }
    setGrades(normalizeToRows([])); // rows will be created by table change handlers upon prefill
    setShowGrades(true);
  };

  const handleBlobUrlAdd = (url: string) => {
    setBlobUrls(prev => [...prev, url]);
  };

  const validateAndProcess = async () => {
    try {
      setIsProcessing(true);
      
      // Validate that we have grades to process
      if (grades.length === 0) {
        alert('Please add at least one grade before processing analysis.');
        return;
      }

      // Validate grades data
      const invalidGrades = grades.filter(grade => 
        !grade.subject || 
        grade.subject.trim() === '' || 
        grade.units <= 0 || 
        grade.grade <= 0 || 
        grade.grade > 5.0
      );

      if (invalidGrades.length > 0) {
        alert(`Please fix the following issues:\n${invalidGrades.map(g => `- ${g.subject}: Invalid data`).join('\n')}`);
        return;
      }

      // If a TOR exists and no grades are present, run OCR first
      if ((existingTranscript?.storagePath || existingTranscript?.url) && grades.length === 0) {
        const sp = existingTranscript?.storagePath;
        if (sp && user.email) {
          const ocr = await fetch(getApiUrl('EXTRACT_GRADES'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, storage_path: sp })
          });
          const ocrJson = await ocr.json().catch(() => ({}));
          if (Array.isArray(ocrJson?.grades)) {
            setGrades(normalizeToRows(ocrJson.grades));
            // Ensure all grades are properly formatted
            setTimeout(() => formatAllGrades(), 100);
          }
        }
      }

      // Persist grades array immediately before analysis
      try {
        if (user.id && grades.length > 0) {
          await gradesService.updateUserGrades(user.id, grades);
        }
      } catch (e) {
        // Non-blocking: proceed with analysis even if persistence fails
        console.warn('Failed to save grades before analysis', e);
      }

      // Send grades to backend to compute Obj1 & Obj2 and persist
      const resp = await fetch(`${API_CONFIG.BASE_URL}/api/analysis/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, grades })
      });
      
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.message || 'Failed to process analysis');
      }
      
      const result = await resp.json();
      console.log('Analysis processing result:', result);
      
      // Refresh profile to get updated data
      await fetchProfile(user.email);
      
      // Show success message
      alert('Analysis completed successfully! You can now view your results in the Dashboard or Dossier page.');
      
    } catch (e: any) {
      console.error('Processing error:', e);
      alert(e.message || 'Failed to process analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAnalysisResults = async () => {
    try {
      if (!user.email) { alert('Missing user email'); return; }
      const res = await fetch(getApiUrl('CLEAR_ANALYSIS_RESULTS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message || 'Failed to clear results');
      // Reset local UI
      setCareerForecast({});
      setPrimaryArchetype('');
      setArchetypePercents({});
      await fetchProfile(user.email);
      alert('Analysis results removed');
    } catch (e: any) {
      alert(e.message || 'Failed to clear results');
    }
  };

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
        {/* Back to Dashboard pill below navbar */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm shadow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </Link>
          </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <h2 className="text-2xl font-bold">Academic Analysis</h2>
                      </div>
            <div className="flex items-center gap-2">
                      <button
                onClick={clearAnalysisResults}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                disabled={isProcessing}
                title="Remove saved career forecast and archetype data"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H3.5a.5.5 0 000 1H4v10a2 2 0 002 2h8a2 2 0 002-2V5h.5a.5.5 0 000-1H15V3a1 1 0 00-1-1H6zm1 2V3h7v1H7zm1 3a.75.75 0 011.5 0v7a.75.75 0 01-1.5 0V7zm4 0a.75.75 0 011.5 0v7a.75.75 0 01-1.5 0V7z"/></svg>
                Remove Analysis
                      </button>
              <ProcessButton
                isProcessing={isProcessing}
                gradesLength={grades.length}
                onProcess={validateAndProcess}
              />
            </div>
                    </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-8">
              {/* Transcript Upload */}
              <TranscriptUpload
                existingTranscript={existingTranscript}
                onTranscriptChange={setExistingTranscript}
                onGradesExtracted={handleGradesExtracted}
                user={user}
                blobUrls={blobUrls}
                onBlobUrlAdd={handleBlobUrlAdd}
                tempTranscriptSizeKB={tempTranscriptSizeKB}
                onTempSizeChange={setTempTranscriptSizeKB}
              />

              {/* Program Table Toggle */}
              <div className="mt-2">
              <button 
                    onClick={() => setShowGrades(!showGrades)}
                    disabled={isProcessing}
                    className={`px-3 py-2 rounded-md text-sm ${isProcessing ? 'bg-gray-600 text-gray-300' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                  >
                    {showGrades ? 'Hide Program Table' : 'Show Program Table'}
              </button>
            </div>

              {/* Grades Table */}
                {showGrades && (
                ((user.course || '').toLowerCase().includes('information technology')) ? (
                  <ITStaticTable grades={grades} onGradesChange={setGrades} isProcessing={isProcessing} prefillGrades={prefill} />
                ) : ((user.course || '').toLowerCase().includes('computer science')) ? (
                  <CStaticTable grades={grades} onGradesChange={setGrades} isProcessing={isProcessing} prefillGrades={prefill} />
                ) : (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center text-gray-400">
                    Program table unavailable. Set your course to Information Technology or Computer Science to view the curriculum table.
                        </div>
                )
              )}

              {/* Temporary: Test rendering table to verify two-decimal grade formatting */}
            

              {/* Certificates Upload */}
              <CertificatesUpload
                existingCertificates={existingCertificates}
                onCertificatesChange={setExistingCertificates}
                onCertificateAnalysesChange={setCertificateAnalyses}
                user={user}
                blobUrls={blobUrls}
                onBlobUrlAdd={handleBlobUrlAdd}
              />

              {/* Analysis Results */}
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

export default AnalysisPage;