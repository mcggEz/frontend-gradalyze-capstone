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

const RecommendationsSection = ({ userEmail }: Props) => {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${getApiUrl('COMPLETE_RECOMMENDATIONS')}/${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setItems(Array.isArray(data?.recommendations) ? data.recommendations : []);
        }
      } catch {
        // silent fail; show empty state
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
        <h3 className="font-bold">AI-Powered Recommendations</h3>
      </div>
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm">No recommendations yet. Complete your analysis to see personalized insights.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((rec, idx) => (
            <li key={rec.id ?? idx} className="border border-gray-800 rounded-md p-4 hover:border-gray-700 transition-colors">
              <p className="font-medium text-gray-100">{rec.title}</p>
              {rec.description && <p className="text-gray-400 text-sm mt-1">{rec.description}</p>}
              {rec.url && (
                <a href={rec.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm mt-2 inline-block">Learn more</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendationsSection;


