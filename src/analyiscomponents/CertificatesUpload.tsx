import { useState } from 'react';
import { getApiUrl } from '../config/api';

type ExistingCertificate = {
  id: number;
  path?: string;
  name: string;
  url: string;
  _temp?: boolean;
};

interface CertificatesUploadProps {
  existingCertificates: ExistingCertificate[];
  onCertificatesChange: (certificates: ExistingCertificate[]) => void;
  onCertificateAnalysesChange: (analyses: any[]) => void;
  user: { email: string };
  blobUrls: string[];
  onBlobUrlAdd: (url: string) => void;
  onRefreshProfile?: () => void | Promise<void>;
}

const CertificatesUpload = ({
  existingCertificates,
  onCertificatesChange,
  onCertificateAnalysesChange,
  user,
  blobUrls: _blobUrls,
  onBlobUrlAdd,
  onRefreshProfile
}: CertificatesUploadProps) => {
  const [isProcessingCertificates, setIsProcessingCertificates] = useState(false);

  const handleAddCertificates = async (files: FileList | null) => {
    if (!user.email || !files || files.length === 0) return;
    
    console.log('[CERT_UPLOAD] starting', { fileCount: files.length, files: Array.from(files).map(f => ({ name: f.name, type: f.type, size: f.size })) });
    
    try {
      const temps: ExistingCertificate[] = Array.from(files).map((file, idx) => {
        const tempUrl = URL.createObjectURL(file);
        onBlobUrlAdd(tempUrl);
        return {
          id: Number(`${Date.now()}${idx}`),
          path: `temp/${file.name}`,
          name: file.name,
          url: tempUrl,
          _temp: true,
        };
      });
      onCertificatesChange([...temps, ...existingCertificates]);

      // Build a single multipart request with multiple files (files[])
      const form = new FormData();
      form.append('email', user.email);
      Array.from(files).forEach((file) => {
        form.append('files', file, file.name);
      });

      console.log('[CERT_UPLOAD] posting batch', { count: files.length });
      const up = await fetch(getApiUrl('UPLOAD_CERTIFICATES'), { method: 'POST', body: form });
      const text = await up.text();
      let j: any = {};
      try { j = text ? JSON.parse(text) : {}; } catch {}
      console.log('[CERT_UPLOAD] response', { status: up.status, ok: up.ok, body: j || text });
      if (!up.ok) throw new Error((j && j.message) || `Certificate upload failed (${up.status})`);

      console.log('[CERT_UPLOAD] all files uploaded, refreshing profile');
      try { await onRefreshProfile?.(); } catch {}
    } catch (e: any) {
      console.error('[CERT_UPLOAD] error', e);
      alert(e.message || 'Failed to upload certificates');
      onCertificatesChange(existingCertificates.filter(c => !c._temp));
    }
  };

  const handleDeleteCertificate = async (pathOrUrl: string) => {
    if (!user.email) return;
    console.log('[CERT_DELETE] starting', { email: user.email, target: pathOrUrl });
    try {
      const body: any = { email: user.email };
      if (/^https?:\/\//i.test(pathOrUrl)) body.certificate_url = pathOrUrl; else body.certificate_path = pathOrUrl;

      const res = await fetch(getApiUrl('DELETE_CERTIFICATE'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let j: any = {}; try { j = text ? JSON.parse(text) : {}; } catch {}
      console.log('[CERT_DELETE] response', { status: res.status, ok: res.ok, body: j || text });
      if (!res.ok) throw new Error((j && j.message) || `Failed to delete certificate (${res.status})`);
      try { await onRefreshProfile?.(); } catch {}
    } catch (e: any) {
      console.error('[CERT_DELETE] error', e);
      alert(e.message || 'Failed to delete certificate');
    }
  };

  const processCertificates = async () => {
    if (existingCertificates.length === 0) {
      alert('No certificates uploaded to process.');
      return;
    }

    try {
      setIsProcessingCertificates(true);
      const analyses = [];

      for (const cert of existingCertificates) {
        if (cert.path || cert.url) {
          try {
            // Extract text from certificate
            const extractResponse = await fetch(getApiUrl('EXTRACT_CERTIFICATE_TEXT'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user.email, 
                certificate_path: cert.path || cert.url 
              })
            });

            if (extractResponse.ok) {
              const extractData = await extractResponse.json();
              analyses.push(extractData.analysis);
              console.log(`Certificate ${cert.name} processed:`, extractData.analysis);
            } else {
              console.error(`Failed to process certificate ${cert.name}`);
            }
          } catch (error) {
            console.error(`Error processing certificate ${cert.name}:`, error);
          }
        }
      }

      onCertificateAnalysesChange(analyses);
      
      if (analyses.length > 0) {
        // Enhance existing analysis with certificate data
        const enhanceResponse = await fetch(getApiUrl('ENHANCE_ANALYSIS'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            certificate_analyses: analyses 
          })
        });

        if (enhanceResponse.ok) {
          const enhanceData = await enhanceResponse.json();
          console.log('Analysis enhanced with certificates:', enhanceData);
          alert(`Successfully processed ${analyses.length} certificates and enhanced your analysis!`);
        } else {
          console.error('Failed to enhance analysis with certificates');
        }
      }

    } catch (error) {
      console.error('Certificate processing error:', error);
      alert('Failed to process certificates. Please try again.');
    } finally {
      setIsProcessingCertificates(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-4 h-4 bg-yellow-500 rounded-sm" />
        <h3 className="text-lg font-semibold">Certificates & Achievements (Optional)</h3>
        <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-gray-600 text-white">Optional</span>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-300">Add certificates, achievements, or other relevant documents</p>
          <div>
            <label htmlFor="upload-certs" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm cursor-pointer">
              Add Certificates
            </label>
            <input 
              id="upload-certs" 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
              className="hidden" 
              onChange={(e) => handleAddCertificates(e.target.files)} 
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG (max. 5MB each)</p>

        {existingCertificates.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-300">Uploaded certificates ({existingCertificates.length})</p>
              <button
                onClick={processCertificates}
                disabled={isProcessingCertificates}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm"
              >
                {isProcessingCertificates ? 'Processing...' : 'Process Certificates'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingCertificates.map((c) => (
                <div key={c.id} className="relative bg-gray-900 border border-gray-700 rounded-md p-3 flex items-center justify-between">
                  {!c._temp && (
                    <button
                      aria-label="Delete certificate"
                      title="Delete"
                      onClick={() => handleDeleteCertificate(c.path || c.url)}
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white text-xs shadow"
                    >
                      ×
                    </button>
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center shrink-0">
                      <span className="text-gray-700 text-[10px] font-bold">
                        {(c.name.split('.').pop() || 'FILE').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-white font-medium truncate" title={c.name}>
                      {c.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesUpload;
