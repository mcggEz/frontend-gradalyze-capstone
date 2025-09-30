import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl, API_CONFIG } from '../config/api';

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

type GradeRow = {
  id: string;
  subject: string;
  units: number;
  grade: number;
  semester: string;
};

const AnalysisPage = () => {
  const [user, setUser] = useState({ name: '', email: '', course: '', student_number: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [existingTranscript, setExistingTranscript] = useState<ExistingTranscript | null>(null);
  const [existingCertificates, setExistingCertificates] = useState<ExistingCertificate[]>([]);

  // Editable grades table state
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editing, setEditing] = useState<{ id: string; field: keyof GradeRow } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showGrades, setShowGrades] = useState(false);

  // Track created blob URLs to revoke later
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [tempTranscriptSizeKB, setTempTranscriptSizeKB] = useState<number | null>(null);

  // --- Curriculum (program-specific) helpers ---
  const isCS = (user.course || '').toLowerCase().includes('computer science');
  const isIT = (user.course || '').toLowerCase().includes('information technology');
  const philippineGradeScale = [
    '1.00','1.25','1.50','1.75','2.00','2.25','2.50','2.75','3.00','4.00','5.00'
  ];

  const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const findGradeForTitle = (title: string) => {
    const nt = normalize(title);
    // try best-match by substring overlap
    let best: {score: number; grade: number | null} = {score: 0, grade: null};
    for (const g of grades) {
      const ns = normalize(g.subject);
      if (!ns) continue;
      const overlap = nt.split(' ').filter(w => w.length > 2 && ns.includes(w)).length;
      if (overlap > best.score) {
        best = {score: overlap, grade: typeof g.grade === 'number' ? g.grade : Number(g.grade)};
      }
    }
    return best.grade ?? null;
  };

  const upsertGradeForTitle = (title: string, section: string, gradeValue: number) => {
    const nt = normalize(title);
    let bestIndex = -1; let bestScore = 0;
    grades.forEach((g, idx) => {
      const ns = normalize(g.subject);
      const overlap = nt.split(' ').filter(w => w.length > 2 && ns.includes(w)).length;
      if (overlap > bestScore) { bestScore = overlap; bestIndex = idx; }
    });
    if (bestIndex >= 0 && bestScore > 0) {
      // Update existing grade row
      setGrades(prev => prev.map((r, i) => i === bestIndex ? { ...r, grade: gradeValue } : r));
    } else {
      // Insert new grade row with sensible defaults
      setGrades(prev => [
        ...prev,
        {
          id: `${Date.now()}_${Math.random()}`,
          subject: title,
          units: 3,
          grade: gradeValue,
          semester: section,
        }
      ]);
    }
  };

  // Curriculum map for BS Computer Science: section -> course titles (only title shown)
  const csCurriculum: Record<string, string[]> = {
    'First Year – First Semester': [
      'Introduction to Computing',
      'Fundamentals of Programming',
      'Discrete Structures 1',
      'Science, Technology and Society',
      'Mathematics in the Modern World',
      'Purposive Communication',
      'Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag',
      'Foundation of Physical Activities',
      'National Service Training Program 1',
    ],
    'First Year – Second Semester': [
      'Intermediate Programming',
      'Data Structures and Algorithms',
      'Discrete Structures 2',
      'Human Computer Interaction',
      'The Contemporary World',
      'Readings in Philippine History',
      'Life and Works of Rizal',
      'Group Exercise',
      'National Service Training Program 2',
    ],
    'Second Year – First Semester': [
      'Object Oriented Programming',
      'Logic Design and Digital Computer Circuits',
      'Operation Research',
      'Information Management',
      'Living in the IT Era',
      'Ethics',
      'Understanding the Self',
      'PE Elective',
    ],
    'Second Year – Second Semester': [
      'Algorithm and Complexity',
      'Architecture and Organization',
      'Applications Development and Emerging Technologies',
      'Information Assurance Security',
      'The Entrepreneurial Mind',
      'Environmental Science',
      'Art Appreciation',
      'PE Elective',
    ],
    'Third Year – First Semester': [
      'Automata Theory and Formal Languages',
      'Programming Languages',
      'Software Engineering',
      'Operating System',
      'Intelligent System',
    ],
    'Third Year – Second Semester': [
      'Software Engineering 2',
      'Compiler Design',
      'Computational Science',
      'CS Elective 1',
      'Research Writing',
    ],
    'Third Year – Summer': [
      'Practicum',
    ],
    'Fourth Year – First Semester': [
      'CS Thesis Writing 1',
      'Networks and Communication',
      'CS Elective 2',
      'CS Elective 3',
    ],
    'Fourth Year – Second Semester': [
      'CS Thesis Writing 2',
      'Parallel and Distributing Computing',
      'Social Issues and Professional Practice',
      'Graphics and Visual Computing',
    ],
  };

  // Curriculum map for BS Information Technology
  const itCurriculum: Record<string, string[]> = {
    'First Year – First Semester': [
      'Science, Technology and Society',
      'Art Appreciation',
      'Purposive Communication',
      'Mathematics in the Modern World',
      'Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag',
      'Introduction to Computing',
      'Fundamentals of Programming',
      'Foundation of Physical Activities',
      'National Service Training Program 1',
    ],
    'First Year – Second Semester': [
      'Calculus 1',
      'General Chemistry',
      'Introduction to Computer Human Interaction',
      'Discrete Mathematics',
      'Web Systems Technology',
      'Intermediate Programming',
      'Great Books',
      'PE Elective',
      'National Service Training Program 2',
    ],
    'Second Year – First Semester': [
      'Calculus 2',
      'Physics for IT',
      'The Contemporary World',
      'Data Structures and Algorithms',
      'Object Oriented Programming',
      'Philippine Popular Culture',
      'Professional Elective 1',
      'Soccer',
    ],
    'Second Year – Second Semester': [
      'Understanding the Self',
      'Readings in Philippine History',
      'Platform Technology (Operating System)',
      'Information Management',
      'Quantitative Methods',
      'Networking 1',
      'Environmental Science',
      'Professional Elective 2',
      'PE Elective',
    ],
    'Third Year – First Semester': [
      'Application and Emerging Technologies',
      'Advanced Database Systems',
      'Professional Elective 3',
      'Networking 2',
      'Life and Works of Rizal',
    ],
    'Third Year – Second Semester': [
      'Information Assurance and Security 1',
      'System Integration and Architecture 1',
      'Integrative Programming and Technologies',
      'Ethics',
    ],
    'Third Year – Summer': [
      'System Integration and Architecture 2',
      'Capstone Project 1',
    ],
    'Fourth Year – First Semester': [
      'Professional Elective 4',
      'Professional Elective 5',
      'Professional Elective 6',
      'Capstone Project',
    ],
    'Fourth Year – Second Semester': [
      'Practicum (Lecture)',
      'Practicum (Immersion)',
    ],
  };

  // Archetype summary state
  const [primaryArchetype, setPrimaryArchetype] = useState<string>('');
  const [archetypePercents, setArchetypePercents] = useState<{
    realistic?: number; investigative?: number; artistic?: number; social?: number; enterprising?: number; conventional?: number;
  }>({});
  const [careerForecast, setCareerForecast] = useState<Record<string, number>>({});

  // Static descriptions for each RIASEC type (tailored for IT/CS)
  const archetypeInfo: Record<string, { title: string; indicators: string; roles: string } > = {
    realistic: {
      title: 'Applied Practitioner',
      indicators: 'Strong performance in hardware/networking, systems installation, and applied labs',
      roles: 'Hardware technician, network engineer, systems administrator'
    },
    investigative: {
      title: 'Analytical Thinker',
      indicators: 'High achievement in math, algorithms, data structures, ML/AI, and research projects',
      roles: 'Data scientist, AI/ML engineer, systems analyst, researcher'
    },
    artistic: {
      title: 'Creative Innovator',
      indicators: 'Excellence in UI/UX, multimedia apps, creative coding, and human-computer interaction',
      roles: 'UI/UX designer, game developer, digital media specialist, software engineer'
    },
    social: {
      title: 'Collaborative Supporter',
      indicators: 'Strong performance in communication-intensive subjects, teamwork-driven projects, and IT support',
      roles: 'IT support specialist, systems trainer, academic tutor, community IT facilitator'
    },
    enterprising: {
      title: 'Strategic Leader',
      indicators: 'Success in project management, entrepreneurship subjects, and leadership tasks',
      roles: 'IT project manager, tech entrepreneur, product manager, team lead'
    },
    conventional: {
      title: 'Methodical Organizer',
      indicators: 'High performance in database management, information systems, documentation, and structured coding',
      roles: 'Database administrator, systems auditor, QA tester, technical writer'
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
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
        const grade = Number(g.grade ?? g.final_grade ?? g.rating ?? 0) || 0;
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
          if (Array.isArray(parsed?.grades)) setGrades(normalizeToRows(parsed.grades));
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

  // Upload transcript, then trigger OCR extraction and refresh profile
  const handleUploadTranscript = async (file: File) => {
    if (!user.email) return alert('Please sign in again.');
    
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return alert('Please select a PDF file for transcript upload.');
    }

    // Optimistic preview (Open via blob URL)
    const tempUrl = URL.createObjectURL(file);
    setBlobUrls(prev => [...prev, tempUrl]);
    const prevTranscript = existingTranscript;
    setExistingTranscript({ hasFile: true, fileName: file.name, url: tempUrl, _temp: true });
    setTempTranscriptSizeKB(Math.max(1, Math.round(file.size / 1024)));
    
    try {
                            const stored = localStorage.getItem('user');
      const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
      const userId = typeof parsed?.id === 'number' ? parsed.id : undefined;

      const form = new FormData();
      form.append('email', user.email);
      if (userId !== undefined) form.append('user_id', String(userId));
      form.append('kind', 'tor');
      form.append('file', file, file.name);

      console.log('[TOR_UPLOAD] posting', { name: file.name, type: file.type, size: file.size });
      const up = await fetch(getApiUrl('UPLOAD_TOR'), { method: 'POST', body: form });
      const torText = await up.text();
      let j: any = {}; try { j = torText ? JSON.parse(torText) : {}; } catch {}
      console.log('[TOR_UPLOAD] response', { status: up.status, ok: up.ok, body: j || torText });
      if (!up.ok) throw new Error((j && j.message) || `Upload failed with status ${up.status}`);

      // Run OCR after upload to populate grades, but DO NOT run full analysis here
      if (j.storage_path && user.email) {
        const ocr = await fetch(getApiUrl('EXTRACT_GRADES'), {
                              method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, storage_path: j.storage_path })
        });
        const ocrJson = await ocr.json().catch(() => ({}));
        if (Array.isArray(ocrJson?.grades)) setGrades(normalizeToRows(ocrJson.grades));
      }
      await fetchProfile(user.email);
      setTempTranscriptSizeKB(null);
    } catch (e: any) {
      alert(`❌ Upload failed: ${e.message || 'Unknown error'}`);
      setExistingTranscript(prevTranscript || { hasFile: false });
      setTempTranscriptSizeKB(null);
    }
  };

  const handleDeleteTranscript = async () => {
    if (!user.email) return;
    const prev = existingTranscript;
    // Optimistic UI: hide transcript and clear grades
    setExistingTranscript({ hasFile: false });
    setGrades([]);
    setShowGrades(false);
    try {
      console.log('[DELETE_TOR] starting', { email: user.email });
      const res = await fetch(`${getApiUrl('DELETE_TOR')}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch {}
      console.log('[DELETE_TOR] response', { status: res.status, ok: res.ok, body: json || text });
      if (!res.ok) throw new Error((json && json.message) || `Failed to delete transcript (${res.status})`);
      // Always re-fetch to confirm state; backend returns 500 if not cleared
      await fetchProfile(user.email);
      console.log('[DELETE_TOR] refetched profile');
    } catch (e: any) {
      alert(e.message || 'Failed to delete transcript');
      // Roll back UI
      setExistingTranscript(prev || { hasFile: false });
    }
  };



  const handleAddCertificates = async (files: FileList | null) => {
    if (!user.email || !files || files.length === 0) return;
    
    console.log('[CERT_UPLOAD] starting', { fileCount: files.length, files: Array.from(files).map(f => ({ name: f.name, type: f.type, size: f.size })) });
    
    try {
                            const stored = localStorage.getItem('user');
      const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
      const userId = typeof parsed?.id === 'number' ? parsed.id : undefined;

      const temps: ExistingCertificate[] = Array.from(files).map((file, idx) => {
        const tempUrl = URL.createObjectURL(file);
        setBlobUrls(prev => [...prev, tempUrl]);
        return {
          id: Number(`${Date.now()}${idx}`),
          path: `temp/${file.name}`,
          name: file.name,
          url: tempUrl,
          _temp: true,
        };
      });
      setExistingCertificates(prev => [...temps, ...prev]);

      for (const file of Array.from(files)) {
        console.log('[CERT_UPLOAD] uploading file', { name: file.name, type: file.type, size: file.size });
        
      const form = new FormData();
        form.append('email', user.email);
        if (userId !== undefined) form.append('user_id', String(userId));
      form.append('kind', 'certificate');
      form.append('file', file, file.name);
        
        const up = await fetch(getApiUrl('UPLOAD_TOR'), { method: 'POST', body: form });
        const text = await up.text();
        let j: any = {};
        try { j = text ? JSON.parse(text) : {}; } catch {}
        
        console.log('[CERT_UPLOAD] response', { status: up.status, ok: up.ok, body: j || text });
        
        if (!up.ok) throw new Error((j && j.message) || `Certificate upload failed (${up.status})`);
      }

      console.log('[CERT_UPLOAD] all files uploaded, refreshing profile');
      await fetchProfile(user.email);
    } catch (e: any) {
      console.error('[CERT_UPLOAD] error', e);
      alert(e.message || 'Failed to upload certificates');
      setExistingCertificates(prev => prev.filter(c => !c._temp));
    }
  };

  const handleDeleteCertificate = async (pathOrUrl: string) => {
    if (!user.email) return;
    console.log('[CERT_DELETE] starting', { email: user.email, target: pathOrUrl });
    try {
      const body: any = { email: user.email };
      // Heuristic: if looks like a URL, send as certificate_url; else as path
      if (/^https?:\/\//i.test(pathOrUrl)) body.certificate_url = pathOrUrl; else body.certificate_path = pathOrUrl;

      const res = await fetch(getApiUrl('UPLOAD_TOR'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let j: any = {}; try { j = text ? JSON.parse(text) : {}; } catch {}
      console.log('[CERT_DELETE] response', { status: res.status, ok: res.ok, body: j || text });
      if (!res.ok) throw new Error((j && j.message) || `Failed to delete certificate (${res.status})`);
      await fetchProfile(user.email);
    } catch (e: any) {
      console.error('[CERT_DELETE] error', e);
      alert(e.message || 'Failed to delete certificate');
    }
  };

  // Editable table helpers
  const startEdit = (rowId: string, field: keyof GradeRow, value: any) => {
    setEditing({ id: rowId, field });
    setEditValue(String(value ?? ''));
  };

  const saveEdit = () => {
    if (!editing) return;
    setGrades(prev => prev.map(r => {
      if (r.id !== editing.id) return r;
      let v: any = editValue;
      if (editing.field === 'units' || editing.field === 'grade') {
        const num = Number(v);
        if (isNaN(num)) return r;
        v = num;
      }
      return { ...r, [editing.field]: v } as GradeRow;
    }));
    setEditing(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue('');
  };

  const addRow = () => {
    setGrades(prev => [...prev, { id: `${Date.now()}`, subject: 'NEW - Subject', units: 3, grade: 2.0, semester: 'N/A' }]);
  };

  const deleteRow = (rowId: string) => {
    setGrades(prev => prev.filter(r => r.id !== rowId));
  };

  const validateAndProcess = async () => {
    try {
      setIsProcessing(true);
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
          if (Array.isArray(ocrJson?.grades)) setGrades(normalizeToRows(ocrJson.grades));
        }
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
      await fetchProfile(user.email);
    } catch (e: any) {
      alert(e.message || 'Failed to process analysis');
    } finally {
        setIsProcessing(false);
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
                      <button
              onClick={validateAndProcess}
              disabled={isProcessing || !(existingTranscript?.hasFile || existingCertificates.length > 0) || grades.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
              title={!(existingTranscript?.hasFile || existingCertificates.length > 0) ? 'Upload TOR or certificates first' : (grades.length === 0 ? 'No grades to process' : '')}
            >
              {isProcessing ? 'Processing…' : 'Process & Analyze'}
                      </button>
                    </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-8">
              {/* Transcript (Required) */}
                    <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-gray-300 rounded-sm" />
                  <h3 className="text-lg font-semibold">Transcript of Records (Required)</h3>
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-red-600 text-white">Required</span>
          </div>

                <div className={`rounded-lg border border-gray-700 bg-gray-800 p-4`}> 
                  {existingTranscript?.hasFile ? (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-700 text-xs font-semibold">PDF</span>
                        </div>
          <div>
                          <div className="text-white text-sm font-medium">{existingTranscript.fileName || 'transcript.pdf'}</div>
                          {tempTranscriptSizeKB && <div className="text-gray-300 text-xs">{tempTranscriptSizeKB} KB</div>}
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="reupload-tor" className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm cursor-pointer inline-flex items-center gap-2">
                    <span>Replace File</span>
                  </label>
                        <input id="reupload-tor" type="file" accept=".pdf" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadTranscript(f);
                        }} />
                        <button onClick={handleDeleteTranscript} className="px-2.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-sm">Remove</button>
                </div>
                </div>
              ) : (
                    <div className="">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300">Upload your transcript of records (PDF)</p>
                    <div>
                          <label htmlFor="upload-tor" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm cursor-pointer">Upload Transcript</label>
                          <input id="upload-tor" type="file" accept=".pdf" className="hidden" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadTranscript(f);
                          }} />
                      </div>
                    </div>
                      <p className="text-xs text-gray-500 mt-2">Supported: PDF (max ~10MB)</p>
                  </div>
                  )}
                  {existingTranscript?._temp && (
                    <p className="text-xs text-gray-300 mt-3">Uploading…</p>
                )}
              </div>

          {/* Toggle to show/hide grades table when available */}
                <div className="mt-4">
              <button 
                    onClick={() => setShowGrades(!showGrades)}
                    disabled={isProcessing}
                    className={`px-3 py-2 rounded-md text-sm ${isProcessing ? 'bg-gray-600 text-gray-300' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                  >
                    {showGrades ? 'Hide Program Table' : 'Show Program Table'}
              </button>
                  {/* Info text removed as requested */}
            </div>


   

                {/* Grades Table moved below toggle */}
                {showGrades && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Validated TOR Grades</h3>
                      {!isCS && !isIT && (
                        <p className="text-gray-300 text-sm">Upload a transcript to populate this table. For non-CS/IT programs, mapping will use generic OCR subjects.</p>
                      )}

                      {/* Program-structured tables (CS / IT) */}
                      {isCS || isIT ? (
    <div className="space-y-6">
                          {Object.entries(isCS ? csCurriculum : itCurriculum).map(([section, subjects]) => (
                            <div key={section}>
                              <h4 className="text-white font-semibold mb-2">{section}</h4>
                              <div className="overflow-x-auto pb-24">
                                <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
                                  <thead className="bg-gray-900 text-gray-300">
                                    <tr>
                                      <th className="px-3 py-2 border-b border-gray-700">Course Title</th>
                                      <th className="px-3 py-2 border-b border-gray-700 text-right">Grade</th>
                    </tr>
                  </thead>
                                  <tbody>
                                    {subjects.map((t, idx) => {
                                      const g = findGradeForTitle(t);
                       return (
                                        <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800">
                                          <td className="px-3 py-2 border-b border-gray-700">{t}</td>
                                          <td className="px-3 py-2 border-b border-gray-700 text-right">
                                            <select
                                              value={g != null ? g.toFixed(2) : ''}
                                              onChange={(e) => upsertGradeForTitle(t, section, Number(e.target.value))}
                                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                              <option value="">--</option>
                                              {philippineGradeScale.map((v) => (
                                                <option key={v} value={v}>{v}</option>
                                              ))}
                                            </select>
                           </td>
                         </tr>
                       );
                     })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
                        // Fallback: generic editable table (previous UI)
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
                            <thead className="bg-gray-900 text-gray-300">
                              <tr>
                                <th className="px-3 py-2 border-b border-gray-700">Subject</th>
                                <th className="px-3 py-2 border-b border-gray-700 text-right">Units</th>
                                <th className="px-3 py-2 border-b border-gray-700 text-right">Grade</th>
                                <th className="px-3 py-2 border-b border-gray-700">Semester</th>
                                <th className="px-3 py-2 border-b border-gray-700 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grades.map((row) => (
                                <tr key={row.id} className="odd:bg-gray-900 even:bg-gray-800">
                                  <td className="px-3 py-2 border-b border-gray-700">{row.subject}</td>
                                  <td className="px-3 py-2 border-b border-gray-700 text-right">{row.units}</td>
                                  <td className="px-3 py-2 border-b border-gray-700 text-right">{Number(row.grade).toFixed(2)}</td>
                                  <td className="px-3 py-2 border-b border-gray-700">{row.semester}</td>
                                  <td className="px-3 py-2 border-b border-gray-700 text-right">
                                    <button onClick={() => deleteRow(row.id)} className="text-red-300 hover:text-red-200 text-xs">Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
          </div>
                      )}
        </div>
      )}
            </div>
          
              {/* Certificates (Optional) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-yellow-500 rounded-sm" />
                  <h3 className="text-lg font-semibold">Certificates & Achievements (Optional)</h3>
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-gray-600 text-white">Optional</span>
                  </div>

                <div className={`rounded-lg border border-gray-700 bg-gray-800 p-4`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Add certificates, achievements, or other relevant documents</p>
                  <div>
                      <label htmlFor="upload-certs" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm cursor-pointer">Add Certificates</label>
                      <input id="upload-certs" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleAddCertificates(e.target.files)} />
              </div>
              </div>
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG (max. 5MB each)</p>

                  {existingCertificates.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {existingCertificates.map((c) => (
                        <div key={c.id} className="bg-gray-900 border border-gray-700 rounded-md p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center shrink-0"><span className="text-gray-700 text-[10px] font-bold">{(c.name.split('.').pop() || 'FILE').toUpperCase()}</span></div>
                            <span className="text-sm text-white font-medium truncate" title={c.name}>{c.name}</span>
          </div>
                          {!c._temp && (
                            <button onClick={() => handleDeleteCertificate(c.path || c.url)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-red-700 hover:bg-red-600 text-white border border-red-600">Delete</button>
      )}
          </div>
                ))}
        </div>
      )}
    </div>
      </div>

        </div>
      )}
                  </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Career Forecast</h3>
                  </div>
            {Object.keys(careerForecast || {}).length === 0 ? (
              <p className="text-sm text-gray-400">No forecast yet. Click "Process & Analyze" after providing grades to compute your career success scores.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'data_science',
                  'systems_engineering',
                  'software_engineering',
                  'ui_ux',
                  'product_management',
                  'cybersecurity',
                  'cloud_engineering',
                  'devops',
                  'business_analyst',
                  'project_manager',
                ].map((k) => {
                  const v = (careerForecast as any)[k] ?? 0;
                  const pct = Math.round((Number(v) || 0) * 100);
                  const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={k} className="bg-gray-900 border border-gray-700 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{label}</span>
                        <span className="text-sm text-white font-semibold">{pct}%</span>
                </div>
                      <div className="w-full bg-gray-700 h-2 rounded">
                        <div className="bg-blue-600 h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                </div>
              </div>
                  );
                })}
              </div>
                )}
              </div>
          {existingTranscript?.hasFile && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Archetype Summary</h3>
            </div>
                    {(primaryArchetype || Object.values(archetypePercents).some(v => typeof v === 'number')) ? (
                      <>
                        {primaryArchetype && (
                          <p className="text-sm text-gray-300 mb-3">Primary Archetype: <span className="font-semibold text-white">{primaryArchetype}</span></p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(archetypePercents).map(([k, v]) => {
                            if (typeof v !== 'number') return null;
                            const info = archetypeInfo[k as keyof typeof archetypeInfo];
  return (
                              <div key={k} className="bg-gray-900 border border-gray-700 rounded p-4">
                                <div className="flex items-center justify-between">
          <div>
                                    <div className="text-sm text-gray-300 capitalize">{k}</div>
                                    {info && <div className="text-white font-medium">{info.title}</div>}
          </div>
                                  <span className="text-sm text-white font-semibold">{v.toFixed(1)}%</span>
            </div>
                                <div className="w-full bg-gray-700 h-2 rounded mt-2">
                                  <div className="bg-blue-600 h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, v))}%` }} />
          </div>
                                {info && (
                                  <div className="mt-3 text-xs text-gray-300">
                                    <div className="mb-1"><span className="text-gray-400">Academic Indicators:</span> {info.indicators}</div>
                                    <div><span className="text-gray-400">Possible Roles:</span> {info.roles}</div>
            </div>
          )}
            </div>
                            );
                          })}
              </div>
                        {/* Percentage Details Table */}
                </>
              ) : (
                      <p className="text-sm text-gray-400">No archetype data yet. Click "Process & Analyze" to compute your archetype from the validated grades.</p>
                    )}
            </div>
          )}

      </main>
    </div>
  );
};

export default AnalysisPage;
