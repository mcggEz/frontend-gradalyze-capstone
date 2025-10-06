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
  const [itOrderIds, setItOrderIds] = useState<string[] | null>(null);
  const [savedGradesCache, setSavedGradesCache] = useState<GradeRow[] | null>(null);

  // Track created blob URLs to revoke later
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [tempTranscriptSizeKB, setTempTranscriptSizeKB] = useState<number | null>(null);

  // Archetype summary state
  const [primaryArchetype, setPrimaryArchetype] = useState<string>('');
  const [archetypePercents, setArchetypePercents] = useState<{
    realistic?: number; investigative?: number; artistic?: number; social?: number; enterprising?: number; conventional?: number;
  }>({});
  const [careerForecast, setCareerForecast] = useState<Record<string, number> | string[]>({});

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

  const extractGradeValuesInOrder = (grades: GradeRow[], course: string): number[] => {
    // Prefer runtime-emitted order from table if available (ensures exact length/indexing)
    const runtimeOrder = itOrderIds && itOrderIds.length > 0 ? itOrderIds : null;
    const curriculumOrder = runtimeOrder || getCurriculumOrder(course);
    
    // Create a map of existing grades by unique ID
    const gradesMap = new Map<string, number>();
    grades.forEach(grade => {
      if (grade.id && grade.grade !== undefined) {
        gradesMap.set(grade.id, grade.grade);
      }
    });
    
    // Build fixed-length array with grade values in curriculum order
    const gradeValues: number[] = [];
    
    curriculumOrder.forEach(uniqueId => {
      const grade = gradesMap.get(uniqueId);
      gradeValues.push(grade !== undefined ? grade : 0); // Use 0 for missing grades
    });
    
    return gradeValues;
  };

  const getCurriculumOrder = (course: string): string[] => {
    const courseLower = (course || '').toLowerCase();
    
    if (courseLower.includes('information technology')) {
      return [
        // 1st Year 1st Sem
        'it_fy1_icc0101', 'it_fy1_icc0101_1', 'it_fy1_icc0102', 'it_fy1_icc0102_1', 'it_fy1_ipp0010', 'it_fy1_mmw0001', 'it_fy1_pcm0006', 'it_fy1_sts0002', 'it_fy1_aap0007', 'it_fy1_ped0001', 'it_fy1_nstp01',
        // 1st Year 2nd Sem
        'it_fy2_cet0111', 'it_fy2_cet0114', 'it_fy2_cet0114_1', 'it_fy2_eit0121', 'it_fy2_eit0121_1a', 'it_fy2_eit0122', 'it_fy2_eit0123', 'it_fy2_eit0123_1', 'it_fy2_gtb121', 'it_fy2_icc0103', 'it_fy2_icc0103_1', 'it_fy2_ped0013', 'it_fy2_nstp02',
        // 2nd Year 1st Sem
        'it_sy1_cet0121', 'it_sy1_cet0225', 'it_sy1_cet0225_1', 'it_sy1_eit0221', 'it_sy1_eit0221_1', 'it_sy1_eit0222', 'it_sy1_eit0222_1', 'it_sy1_eit0223', 'it_sy1_eit0223_1', 'it_sy1_eit0224', 'it_sy1_eit0224_1', 'it_sy1_eit0225', 'it_sy1_eit0225_1', 'it_sy1_eit0226', 'it_sy1_eit0226_1', 'it_sy1_eit0227', 'it_sy1_eit0227_1', 'it_sy1_ped0021',
        // 2nd Year 2nd Sem
        'it_sy2_eit0321', 'it_sy2_eit0321_1', 'it_sy2_eit0322', 'it_sy2_eit0322_1', 'it_sy2_eit0323', 'it_sy2_eit0323_1', 'it_sy2_eit0324', 'it_sy2_eit0324_1', 'it_sy2_eit0325', 'it_sy2_eit0325_1', 'it_sy2_eit0326', 'it_sy2_eit0326_1', 'it_sy2_eit0327', 'it_sy2_eit0327_1', 'it_sy2_eit0328', 'it_sy2_eit0328_1', 'it_sy2_ped0031',
        // 3rd Year 1st Sem
        'it_ty1_eit0421', 'it_ty1_eit0421_1', 'it_ty1_eit0422', 'it_ty1_eit0422_1', 'it_ty1_eit0423', 'it_ty1_eit0423_1', 'it_ty1_eit0424', 'it_ty1_eit0424_1', 'it_ty1_eit0425', 'it_ty1_eit0425_1', 'it_ty1_eit0426', 'it_ty1_eit0426_1', 'it_ty1_eit0427', 'it_ty1_eit0427_1', 'it_ty1_eit0428', 'it_ty1_eit0428_1', 'it_ty1_ped0041',
        // 3rd Year 2nd Sem
        'it_ty2_eit0521', 'it_ty2_eit0521_1', 'it_ty2_eit0522', 'it_ty2_eit0522_1', 'it_ty2_eit0523', 'it_ty2_eit0523_1', 'it_ty2_eit0524', 'it_ty2_eit0524_1', 'it_ty2_eit0525', 'it_ty2_eit0525_1', 'it_ty2_eit0526', 'it_ty2_eit0526_1', 'it_ty2_eit0527', 'it_ty2_eit0527_1', 'it_ty2_eit0528', 'it_ty2_eit0528_1', 'it_ty2_ped0051',
        // 4th Year 1st Sem
        'it_fy1_eit0621', 'it_fy1_eit0621_1', 'it_fy1_eit0622', 'it_fy1_eit0622_1', 'it_fy1_eit0623', 'it_fy1_eit0623_1', 'it_fy1_eit0624', 'it_fy1_eit0624_1', 'it_fy1_eit0625', 'it_fy1_eit0625_1', 'it_fy1_eit0626', 'it_fy1_eit0626_1', 'it_fy1_eit0627', 'it_fy1_eit0627_1', 'it_fy1_eit0628', 'it_fy1_eit0628_1', 'it_fy1_ped0061',
        // 4th Year 2nd Sem
        'it_fy2_eit0721', 'it_fy2_eit0721_1', 'it_fy2_eit0722', 'it_fy2_eit0722_1', 'it_fy2_eit0723', 'it_fy2_eit0723_1', 'it_fy2_eit0724', 'it_fy2_eit0724_1', 'it_fy2_eit0725', 'it_fy2_eit0725_1', 'it_fy2_eit0726', 'it_fy2_eit0726_1', 'it_fy2_eit0727', 'it_fy2_eit0727_1', 'it_fy2_eit0728', 'it_fy2_eit0728_1', 'it_fy2_ped0071',
        // 4th Year 2nd Sem (Additional)
        'it_fy2_eit_elective1', 'it_fy2_eit_elective2', 'it_fy2_eit_elective3', 'it_fy2_eit_elective4', 'it_fy2_eit_elective5', 'it_fy2_eit_elective6',
        // 4th Year 2nd Sem (Final)
        'iip0101a', 'iip0101_1'
      ];
    } else if (courseLower.includes('computer science')) {
      return [
        // CS curriculum would go here with similar structure
        // For now, return empty array
      ];
    }
    
    // Return empty array if course not recognized
    return [];
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

      let setForecast = false;
      // Capture career top jobs array if present; if scores exist, build map for percentages
      if (Array.isArray(data.career_top_jobs)) {
        if (Array.isArray(data.career_top_jobs_scores) && data.career_top_jobs_scores.length === data.career_top_jobs.length) {
          const map: Record<string, number> = {};
          data.career_top_jobs.forEach((label: string, i: number) => {
            map[label] = data.career_top_jobs_scores[i];
          });
          setCareerForecast(map);
          setForecast = true;
        } else {
          setCareerForecast(data.career_top_jobs);
          setForecast = true;
        }
      }

      // Fallback: fetch latest Objective 1 if profile does not include forecast
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

  // Fetch saved grades from backend and render to table
  const fetchSavedGrades = async (uid: number, course: string) => {
    try {
      if (!uid) return;
      const saved = await gradesService.getUserGrades(uid);
      if (Array.isArray(saved) && saved.length > 0) {
        setSavedGradesCache(saved);
        // Do not auto-open the table; keep it hidden until the user clicks
      }
    } catch (e) {
      console.warn('Failed to fetch saved grades', e);
    }
  };

  // When user is known, load saved grades
  useEffect(() => {
    if (user?.id) {
      fetchSavedGrades(user.id, user.course);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // When table order is known and we have cached grades, prefill the selects
  useEffect(() => {
    if (!savedGradesCache || !itOrderIds || itOrderIds.length === 0) return;
    const arr = extractGradeValuesInOrder(savedGradesCache, user.course);
    setPrefill(arr.map(n => parseFloat(Number(n).toFixed(2))));
    // Also reflect rows state so analysis/persistence functions have data
    setGrades(savedGradesCache);
    // apply once
    setSavedGradesCache(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itOrderIds, savedGradesCache]);

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

      // Call all three objectives individually
      console.log('Processing all three objectives...');
      
      // Extract just the grade values in curriculum order
      const gradeValuesArray = extractGradeValuesInOrder(grades, user.course);
      
      // Log the grades array being sent to backend
      console.log('=== GRADES ARRAY BEING SENT TO BACKEND ===');
      console.log('Original grades from table:', grades.length);
      console.log('Grade values array length:', gradeValuesArray.length);
      console.log('Grade values array:', gradeValuesArray);
      console.log('=== END GRADES ARRAY ===');

       // Objective 1: Career Forecasting
      const isCS = ((user.course || '').toLowerCase().includes('computer science'));
      const obj1Endpoint = isCS ? 'OBJECTIVE_1_PROCESS_CS' : 'OBJECTIVE_1_PROCESS';
      const obj1Resp = await fetch(getApiUrl(obj1Endpoint as any), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, grades: gradeValuesArray })
      });
      
      if (!obj1Resp.ok) {
        const e = await obj1Resp.json().catch(() => ({}));
        throw new Error(e.message || 'Failed to process career forecasting');
      }
      
      const obj1Result = await obj1Resp.json();
      console.log('Objective 1 (Career Forecasting) result:', obj1Result);
      
      // Update career forecast state with results (supports array or map)
      if (Array.isArray(obj1Result.career_top_jobs)) {
        // If backend also provided scores, build a map for percentage bars
        if (Array.isArray(obj1Result.career_top_jobs_scores) && obj1Result.career_top_jobs_scores.length === obj1Result.career_top_jobs.length) {
          const map: Record<string, number> = {};
          obj1Result.career_top_jobs.forEach((label: string, i: number) => {
            map[label] = obj1Result.career_top_jobs_scores[i];
          });
          setCareerForecast(map);
        } else {
          setCareerForecast(obj1Result.career_top_jobs);
        }
        console.log('Updated top jobs:', obj1Result.career_top_jobs);
      } else if (obj1Result.career_forecast) {
        setCareerForecast(obj1Result.career_forecast);
        console.log('Updated career forecast:', obj1Result.career_forecast);
      }
      
      // Objective 2: RIASEC Archetype Analysis
      const obj2Resp = await fetch(getApiUrl('OBJECTIVE_2_PROCESS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, grades: gradeValuesArray, order_ids: itOrderIds || [] })
      });
      
      if (!obj2Resp.ok) {
        const e = await obj2Resp.json().catch(() => ({}));
        throw new Error(e.message || 'Failed to process archetype analysis');
      }
      
      const obj2Result = await obj2Resp.json();
      console.log('Objective 2 (RIASEC Archetype) result:', obj2Result);
      
      // Update archetype state with results
      if (obj2Result.archetype_analysis) {
        const archetypeData = obj2Result.archetype_analysis;
        if (archetypeData.primary_archetype) {
          setPrimaryArchetype(archetypeData.primary_archetype);
        }
        if (archetypeData.archetype_percentages) {
          setArchetypePercents(archetypeData.archetype_percentages);
        }
        console.log('Updated archetype data:', archetypeData);
      }
      
      // Skip Objective 3 here; Dashboard will trigger recommendations when needed
      
      // Refresh profile to get updated data (including top jobs)
      await fetchProfile(user.email);
      
      // No modal alerts; UI is updated inline via state and profile refresh
      
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
      
      // Clear all three objectives
      console.log('Clearing all three objectives...');
      
      const isCS = ((user.course || '').toLowerCase().includes('computer science'));
      const obj1ClearEndpoint = isCS ? 'OBJECTIVE_1_CLEAR_CS' : 'OBJECTIVE_1_CLEAR';
      const clearPromises = [
        fetch(getApiUrl(obj1ClearEndpoint as any), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        }),
        fetch(getApiUrl('OBJECTIVE_2_CLEAR'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        }),
        fetch(getApiUrl('OBJECTIVE_3_CLEAR'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
      ];
      
      const results = await Promise.all(clearPromises);
      const errors = results.filter(res => !res.ok);
      
      if (errors.length > 0) {
        throw new Error('Failed to clear some analysis results');
      }
      
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
                  <ITStaticTable grades={grades} onGradesChange={setGrades} isProcessing={isProcessing} prefillGrades={prefill} onEmitOrder={setItOrderIds} />
                ) : ((user.course || '').toLowerCase().includes('computer science')) ? (
                  <CStaticTable grades={grades} onGradesChange={setGrades} isProcessing={isProcessing} prefillGrades={prefill} onEmitOrder={setItOrderIds} />
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
                onRefreshProfile={() => fetchProfile(user.email)}
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