interface AnalysisResultsProps {
  careerForecast: Record<string, number>;
  primaryArchetype: string;
  archetypePercents: {
    realistic?: number;
    investigative?: number;
    artistic?: number;
    social?: number;
    enterprising?: number;
    conventional?: number;
  };
  existingTranscript: { hasFile: boolean } | null;
}

const AnalysisResults = ({
  careerForecast,
  primaryArchetype,
  archetypePercents,
  existingTranscript
}: AnalysisResultsProps) => {
  const archetypeInfo: Record<string, { title: string; indicators: string; roles: string }> = {
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

  return (
    <>
      {/* Career Forecast */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Career Forecast</h3></div>
        {Object.keys(careerForecast || {}).length === 0 ? (
          <p className="text-sm text-gray-400">
            No forecast yet. Click "Process & Analyze" after providing grades to compute your career success scores.
          </p>
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
                    <div 
                      className="bg-blue-600 h-2 rounded" 
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archetype Summary */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Archetype Summary</h3></div>
        {(primaryArchetype || Object.values(archetypePercents || {}).some(v => typeof v === 'number')) ? (
          <>
            {primaryArchetype && (
              <p className="text-sm text-gray-300 mb-3">
                Primary Archetype: <span className="font-semibold text-white">{primaryArchetype}</span>
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(archetypePercents || {}).map(([k, v]) => {
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
                      <div 
                        className="bg-blue-600 h-2 rounded" 
                        style={{ width: `${Math.min(100, Math.max(0, v))}%` }} 
                      />
                    </div>
                    {info && (
                      <div className="mt-3 text-xs text-gray-300">
                        <div className="mb-1">
                          <span className="text-gray-400">Academic Indicators:</span> {info.indicators}
                        </div>
                        <div>
                          <span className="text-gray-400">Possible Roles:</span> {info.roles}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            No archetype data yet. Click "Analyze" after providing grades to compute your RIASEC archetype.
          </p>
        )}
      </div>
    </>
  );
};

export default AnalysisResults;
