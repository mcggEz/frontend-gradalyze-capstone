import { useState } from 'react';
import { getApiUrl } from '../config/api';

type ExistingTranscript = {
  hasFile: boolean;
  fileName?: string;
  url?: string;
  _temp?: boolean;
  storagePath?: string;
};

interface TranscriptUploadProps {
  existingTranscript: ExistingTranscript | null;
  onTranscriptChange: (transcript: ExistingTranscript | null) => void;
  onGradesExtracted: (grades: any[]) => void;
  user: { email: string };
  blobUrls: string[];
  onBlobUrlAdd: (url: string) => void;
  tempTranscriptSizeKB: number | null;
  onTempSizeChange: (size: number | null) => void;
  // parseOcrText prop removed - just console log
}

const TranscriptUpload = ({
  existingTranscript,
  onTranscriptChange,
  onGradesExtracted,
  user,
  onBlobUrlAdd,
  tempTranscriptSizeKB,
  onTempSizeChange,
  // parseOcrText // Removed
}: TranscriptUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');

  const handleUploadTranscript = async (file: File) => {
    if (!user.email) return alert('Please sign in again.');
    
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return alert('Please select a PDF file for transcript upload.');
    }


    // Optimistic preview (Open via blob URL)
    const tempUrl = URL.createObjectURL(file);
    onBlobUrlAdd(tempUrl);
    const prevTranscript = existingTranscript;
    onTranscriptChange({ hasFile: true, fileName: file.name, url: tempUrl, _temp: true });
    onTempSizeChange(Math.max(1, Math.round(file.size / 1024)));
    
    try {
      setIsUploading(true);
      
      // Stage 1: Uploading file
      setUploadStage('Gradalyze is thinking... Uploading TOR...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const form = new FormData();
      form.append('email', user.email);
      form.append('file', file, file.name);

      console.log('[TOR_UPLOAD] posting', { name: file.name, type: file.type, size: file.size });
      const up = await fetch(getApiUrl('UPLOAD_TOR'), { method: 'POST', body: form });
      let j: any = {}; try { j = await up.json(); } catch { j = {}; }
      console.log('[TOR_UPLOAD] response', { status: up.status, ok: up.ok, body: j });
      if (!up.ok) throw new Error((j && j.error) || (j && j.message) || `Upload failed with status ${up.status}`);

      // Replace temp preview with persisted URL and clear temp flag
      if (j?.url || j?.storage_path) {
        onTranscriptChange({ hasFile: true, fileName: file.name, url: j.url || tempUrl, storagePath: j.storage_path });
      }

      // Stage 2: Processing with OCR
      if (j.storage_path && user.email) {
        setUploadStage('Gradalyze is thinking... Analyzing document structure...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setUploadStage('Gradalyze is thinking... Applying advanced OCR...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setUploadStage('Gradalyze is thinking... Extracting course and grade data...');
        
        // Create a new FormData for the OCR TOR endpoint
        const ocrForm = new FormData();
        ocrForm.append('file', file, file.name);
        
        const ocr = await fetch(getApiUrl('OCR_TOR_PROCESS'), {
          method: 'POST',
          body: ocrForm
        });
        const ocrJson = await ocr.json().catch(() => ({}));
        
        if (Array.isArray(ocrJson?.grade_values)) {
          console.log('[OCR] Grade values array received:', ocrJson.grade_values);
          console.log('[OCR] Grades array:', ocrJson.grade_values);
          onGradesExtracted(ocrJson.grade_values);
        } else {
          console.log('[OCR] No grade values found in response:', ocrJson);
        }
        
        // Log full text for debugging
        if (ocrJson?.full_text) {
          console.log('[OCR] Full text extracted from PDF:');
          console.log('[OCR] Text length:', ocrJson.full_text.length, 'characters');
          console.log('[OCR] Complete text:', ocrJson.full_text);
        }
        
        setUploadStage('Gradalyze is done! Processing complete.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      onTempSizeChange(null);
    } catch (e: any) {
      setUploadStage('Gradalyze encountered an error. Upload failed.');
      alert(`❌ Upload failed: ${e.message || 'Unknown error'}`);
      onTranscriptChange(prevTranscript || { hasFile: false });
      onTempSizeChange(null);
    } finally {
      setIsUploading(false);
      setUploadStage('');
    }
  };

  const handleDeleteTranscript = async () => {
    if (!user.email) return;
    const prev = existingTranscript;
    // Optimistic UI: hide transcript and clear grades
    onTranscriptChange({ hasFile: false });
    try {
      console.log('[DELETE_TOR] starting', { email: user.email });
      const res = await fetch(`${getApiUrl('DELETE_TOR')}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch {}
      console.log('[DELETE_TOR] response', { status: res.status, ok: res.ok, body: json || text });
      if (!res.ok) throw new Error((json && json.message) || `Failed to delete transcript (${res.status})`);
    } catch (e: any) {
      alert(e.message || 'Failed to delete transcript');
      // Roll back UI
      onTranscriptChange(prev || { hasFile: false });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-4 h-4 bg-gray-300 rounded-sm" />
        <h3 className="text-lg font-semibold">Transcript of Records (Required)</h3>
        <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-red-600 text-white">Required</span>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
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
              <button onClick={handleDeleteTranscript} className="px-2.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-sm">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">Upload your transcript of records (PDF)</p>
              <div>
                <label htmlFor="upload-tor" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm cursor-pointer">
                  Upload Transcript
                </label>
                <input 
                  id="upload-tor" 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadTranscript(f);
                  }} 
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Supported: PDF (max ~10MB)</p>
          </div>
        )}
        {(existingTranscript?._temp || isUploading) && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {uploadStage || 'Gradalyze is thinking...'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {uploadStage.includes('Uploading') && 'Please wait while we securely upload your transcript.'}
                  {uploadStage.includes('Analyzing') && 'Examining the document structure and content for processing.'}
                  {uploadStage.includes('OCR') && 'Utilizing AI to read and extract text from your PDF document.'}
                  {uploadStage.includes('Extracting') && 'Parsing through the text to identify course information and grades.'}
                  {uploadStage.includes('complete') && 'All done! Your transcript has been processed.'}
                  {uploadStage.includes('error') && 'Oops! Something went wrong during the process. Please try again.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptUpload;
