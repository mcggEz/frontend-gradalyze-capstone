import { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';

type Props = {
  userEmail: string;
};

type Recommendation = {
  id?: string | number;
  title: string;
  description?: string;
  url?: string;
};

const getInitials = (name: string | undefined): string => {
  const s = (name || '').trim();
  if (!s) return '??';
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || '??';
};

const RecommendationsSection = ({ userEmail }: Props) => {
  const [companies, setCompanies] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Gemini ping removed; not used in Objective 3 anymore

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // No ping

        const url = getApiUrl('COMPLETE_RECOMMENDATIONS');
        console.log('[RECS] fetching (mount):', { url, userEmail });
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        console.log('[RECS] response (mount):', res.status, res.ok);
        if (res.ok) {
          const data = await res.json();
          console.log('[RECS] json (mount):', data);
          if (isMounted) {
            const companyRecs = data.job_recommendations?.company_recommendations || [];
            setCompanies(companyRecs);
          }
        } else {
          const txt = await res.text();
          console.warn('[RECS] error body (mount):', txt);
          setError(txt || 'Failed to fetch recommendations');
        }
      } catch (e: any) {
        console.error('[RECS] fetch failed (mount):', e);
        setError(e?.message || 'Failed to fetch recommendations');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (userEmail) load();
    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Company Recommendations</h3>
        <button
          onClick={() => userEmail && (async () => {
            setLoading(true);
            setError(null);
            try {
              const url = getApiUrl('COMPLETE_RECOMMENDATIONS');
              console.log('[RECS] fetching (manual):', { url, userEmail });
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, refresh: true })
              });
              console.log('[RECS] response (manual):', res.status, res.ok);
              const text = await res.text();
              let json: any = {};
              try { json = text ? JSON.parse(text) : {}; } catch {}
              console.log('[RECS] body (manual):', json || text);
              if (!res.ok) throw new Error(json?.message || 'Request failed');
              const companyRecs = json.job_recommendations?.company_recommendations || [];
              setCompanies(companyRecs);
            } catch (e: any) {
              console.error('[RECS] fetch failed (manual):', e);
              setError(e?.message || 'Failed to refresh');
            } finally {
              setLoading(false);
            }
          })()}
          className="px-3 py-1.5 text-sm rounded bg-gray-800 hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : companies.length === 0 ? (
        <div className="text-gray-400 text-sm space-y-2">
          <p>No recommendations yet. Complete your analysis to see personalized insights.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {companies.map((rec: any, idx) => (
            <li key={rec.id ?? idx} className="border border-gray-800 rounded-md p-4 hover:border-gray-700 transition-colors flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                {rec.logo_url ? (
                  <img
                    src={rec.logo_url}
                    alt={rec.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = 'none';
                      const parent = el.parentElement;
                      if (parent) parent.innerHTML = `<span class='text-gray-300 text-xs font-semibold'>${getInitials(rec.title)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-gray-300 text-xs font-semibold">{getInitials(rec.title)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-100">{rec.title}</p>
                  {rec.location && <span className="text-xs text-gray-400">• {rec.location}</span>}
                  {typeof rec.score === 'number' && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300">Score {Number(rec.score).toFixed(2)}</span>
                  )}
                </div>
                {(rec.industry || rec.company_size) && (
                  <p className="text-gray-400 text-xs mt-1">
                    {rec.industry && <span>{rec.industry}</span>}
                    {rec.industry && rec.company_size && <span> • </span>}
                    {rec.company_size && <span>{rec.company_size}</span>}
                  </p>
                )}
                {rec.locations && Array.isArray(rec.locations) && rec.locations.length > 1 && (
                  <p className="text-gray-500 text-xs mt-1">Also hiring in: {rec.locations.slice(1, 4).join(', ')}</p>
                )}
                {rec.roles && Array.isArray(rec.roles) && rec.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rec.roles.slice(0, 4).map((r: string) => (
                      <span key={r} className="text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">{r}</span>
                    ))}
                  </div>
                )}
                {rec.hiring_tags && Array.isArray(rec.hiring_tags) && rec.hiring_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rec.hiring_tags.slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-600/30 text-emerald-300">{t}</span>
                    ))}
                  </div>
                )}
                {rec.description && <p className="text-gray-300 text-sm mt-2 leading-relaxed">{rec.description}</p>}
                {rec.url && (
                  <a href={rec.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm mt-2 inline-block">Visit site</a>
                )}
                {rec.linkedin_url && (
                  <a href={rec.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm mt-2 inline-block ml-3">LinkedIn</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendationsSection;


