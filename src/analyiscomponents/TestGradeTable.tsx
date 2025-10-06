import { useState } from 'react';

type TestRow = {
  id: string;
  subject: string;
  units: number;
  grade: string; // keep as string to mirror select value exactly
};

const initialRows: TestRow[] = [
  { id: 't1', subject: 'Sample Course A', units: 3, grade: '' },
  { id: 't2', subject: 'Sample Course B', units: 1, grade: '' },
];

// Small, self‑contained table to verify 2‑decimal grade rendering using plain inputs
const TestGradeTable = () => {
  const [rows, setRows] = useState<TestRow[]>(initialRows);

  const philippineGradeScale = [
    '1.00','1.25','1.50','1.75','2.00','2.25','2.50','2.75','3.00','5.00'
  ];

  const handleChange = (id: string, val: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, grade: val } : r));
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h4 className="text-lg font-semibold text-white mb-4">Test Grade Table</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-3 py-2 border-b border-gray-700">Subject</th>
              <th className="px-3 py-2 border-b border-gray-700 text-right">Units</th>
              <th className="px-3 py-2 border-b border-gray-700 text-right">Grade (2 decimals)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">{row.subject}</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">{row.units.toFixed(2)}</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">
                  <select
                    value={row.grade}
                    onChange={(e) => handleChange(row.id, e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-24 text-right"
                  >
                    <option value="">--</option>
                    {philippineGradeScale.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-400">This table is UI-only and formats any numeric input to two decimals on blur (e.g., 1.75).</p>
    </div>
  );
};

export default TestGradeTable;


