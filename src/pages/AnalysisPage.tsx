import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl, API_CONFIG } from '../config/api';

type ExistingTranscript = {
  hasFile: boolean;
  fileName?: string;
  url?: string;
  _temp?: boolean;
};

type ExistingCertificate = {
  id: number;
  path: string;
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

  const buildPublicUrl = (bucketEnvKey: string, fallbackBucket: string, path: string | undefined | null) => {
    if (!path) return undefined;
    const bucket = (import.meta.env[bucketEnvKey] as string) || fallbackBucket;
    return `${API_CONFIG.BASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  };

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

      // Transcript (treat empty strings/null as no file)
      const hasTor = !!(typeof data.tor_url === 'string' && data.tor_url.trim() !== '') || !!(typeof data.tor_storage_path === 'string' && data.tor_storage_path.trim() !== '');
      if (hasTor) {
        const url: string | undefined = (data.tor_url && data.tor_url.trim()) || buildPublicUrl('VITE_TOR_BUCKET', 'transcripts', data.tor_storage_path);
        setExistingTranscript({
          hasFile: true,
          fileName: data.tor_storage_path ? (data.tor_storage_path.split('/').pop() || 'transcript.pdf') : 'transcript.pdf',
          url,
        });
      } else {
        setExistingTranscript({ hasFile: false });
      }

      // Preload grades from tor_notes if provided
      if (data.tor_notes) {
        try {
          const parsed = JSON.parse(data.tor_notes);
          if (Array.isArray(parsed?.grades)) setGrades(normalizeToRows(parsed.grades));
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
      const pathToUrl = (p: string) => `${API_CONFIG.BASE_URL}/storage/v1/object/public/${bucket}/${p}`;

      const paths = toArray(data.certificate_paths);
      const urls = toArray(data.certificate_urls);

      const items: { id: number; path?: string; url: string; name: string; _temp?: boolean }[] = [];

      // from paths
      paths.forEach((p) => {
        if (!p || p.startsWith('temp/')) return;
        const url = pathToUrl(p);
        const name = p.split('/').pop() || 'Certificate';
        items.push({ id: items.length, path: p, url, name });
      });

      // from urls
      urls.forEach((u) => {
        if (!u) return;
        const name = u.split('/').pop() || 'Certificate';
        items.push({ id: items.length, url: u, name });
      });

      // latest fields
      if (typeof data.latest_certificate_path === 'string' && data.latest_certificate_path.trim() !== '') {
        const p = data.latest_certificate_path as string;
        if (!paths.includes(p)) {
          const url = pathToUrl(p);
          const name = p.split('/').pop() || 'Certificate';
          items.push({ id: items.length, path: p, url, name });
        }
      }
      if (typeof data.latest_certificate_url === 'string' && data.latest_certificate_url.trim() !== '') {
        const u = data.latest_certificate_url as string;
        if (!urls.includes(u)) {
          const name = u.split('/').pop() || 'Certificate';
          items.push({ id: items.length, url: u, name });
        }
      }

      // dedupe by url
      const seen = new Set<string>();
      const deduped = items.filter((it) => {
        const key = it.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map((it, idx) => ({ ...it, id: idx }));

      setExistingCertificates(deduped);
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

      const up = await fetch(getApiUrl('UPLOAD_TOR'), { method: 'POST', body: form });
      const j = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(j.message || `Upload failed with status ${up.status}`);

      // Trigger OCR and capture any returned grades
      if (j.storage_path) {
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
      const res = await fetch(`${getApiUrl('DELETE_TOR')}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'Failed to delete transcript');
      // Always re-fetch to confirm state; backend returns 500 if not cleared
      await fetchProfile(user.email);
    } catch (e: any) {
      alert(e.message || 'Failed to delete transcript');
      // Roll back UI
      setExistingTranscript(prev || { hasFile: false });
    }
  };

  const handleAddCertificates = async (files: FileList | null) => {
    if (!user.email || !files || files.length === 0) return;
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
      const form = new FormData();
        form.append('email', user.email);
        if (userId !== undefined) form.append('user_id', String(userId));
      form.append('kind', 'certificate');
      form.append('file', file, file.name);
        const up = await fetch(getApiUrl('UPLOAD_TOR'), { method: 'POST', body: form });
        const j = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(j.message || 'Certificate upload failed');
      }

      await fetchProfile(user.email);
    } catch (e: any) {
      alert(e.message || 'Failed to upload certificates');
      setExistingCertificates(prev => prev.filter(c => !c._temp));
    }
  };

  const handleDeleteCertificate = async (path: string) => {
    if (!user.email) return;
    try {
      const res = await fetch(getApiUrl('UPLOAD_TOR'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, certificate_path: path })
      });
      if (!res.ok) throw new Error('Failed to delete certificate');
      await fetchProfile(user.email);
    } catch (e: any) {
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
      await fetch(`${API_CONFIG.BASE_URL}/api/analysis/validate-grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades })
      });
      const resp = await fetch(getApiUrl('DEV_COMPUTE_ARCHETYPE'), {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (!resp.ok) throw new Error('Failed to process analysis');
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
          {/* Header styled like screenshot */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <h2 className="text-2xl font-bold">Academic Analysis</h2>
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

                <div className={`rounded-lg border ${existingTranscript?.hasFile ? 'border-green-700 bg-green-900/10' : 'border-gray-700 bg-gray-800'} p-4`}> 
                  {existingTranscript?.hasFile ? (
                    <div className="flex items-center justify-between bg-green-900/20 border border-green-700 rounded px-4 py-3">
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
                {existingTranscript?.hasFile && (
                  <div className="mt-4">
              <button 
                      onClick={() => setShowGrades(!showGrades)}
                      disabled={isProcessing}
                      className={`px-3 py-2 rounded-md text-sm ${isProcessing ? 'bg-gray-600 text-gray-300' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      {showGrades ? 'Hide Grades Table' : 'Show Grades Table'}
              </button>
                    {grades.length === 0 && (
                      <p className="text-xs text-gray-400 mt-2">No grades extracted yet. Upload a transcript to populate this table, or add rows manually.</p>
      )}
    </div>
                )}

                {/* Grades Table moved below toggle */}
                {showGrades && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Validated TOR Grades</h3>
                      <div className="flex gap-2">
                        <button onClick={addRow} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm">Add Row</button>
                        <button onClick={validateAndProcess} disabled={isProcessing || grades.length === 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-md text-sm">{isProcessing ? 'Processing…' : 'Validate & Process'}</button>
      </div>
      </div>
                    {grades.length === 0 ? (
                      <p className="text-gray-300 text-sm">No grades extracted yet. Upload a transcript to populate this table, or add rows manually.</p>
                    ) : (
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
                                <td className="px-3 py-2 border-b border-gray-700">
                                  {editing?.id === row.id && editing.field === 'subject' ? (
                                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded" autoFocus />
                                  ) : (
                                    <div onClick={() => startEdit(row.id, 'subject', row.subject)} className="cursor-text">{row.subject}</div>
                             )}
                           </td>
                                <td className="px-3 py-2 border-b border-gray-700 text-right">
                                  {editing?.id === row.id && editing.field === 'units' ? (
                                    <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right" autoFocus />
                                  ) : (
                                    <div onClick={() => startEdit(row.id, 'units', row.units)} className="cursor-text">{row.units}</div>
                             )}
                           </td>
                                <td className="px-3 py-2 border-b border-gray-700 text-right">
                                  {editing?.id === row.id && editing.field === 'grade' ? (
                                    <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right" autoFocus />
                                  ) : (
                                    <div onClick={() => startEdit(row.id, 'grade', row.grade)} className="cursor-text">{row.grade.toFixed(2)}</div>
                             )}
                           </td>
                                <td className="px-3 py-2 border-b border-gray-700">
                                  {editing?.id === row.id && editing.field === 'semester' ? (
                                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded" autoFocus />
                                  ) : (
                                    <div onClick={() => startEdit(row.id, 'semester', row.semester)} className="cursor-text">{row.semester}</div>
                             )}
                           </td>
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

                <div className={`rounded-lg border ${existingCertificates.length > 0 ? 'border-green-700 bg-green-900/10' : 'border-gray-700 bg-gray-800'} p-4`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Add certificates, achievements, or other relevant documents</p>
                  <div>
                      <label htmlFor="upload-certs" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm cursor-pointer">Add Certificates</label>
                      <input id="upload-certs" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleAddCertificates(e.target.files)} />
                  </div>
                </div>
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG (max. 5MB each)</p>

                  {existingCertificates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {existingCertificates.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                          <span className="text-sm text-white font-medium truncate mr-2">{c.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            {!c._temp && (
                              <button onClick={() => handleDeleteCertificate(c.path || c.url)} className="text-red-300 hover:text-red-200 text-xs">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
                  )}
      </div>
            </div>

            </div>
          )}
            </div>
      </main>
    </div>
  );
};

export default AnalysisPage;
