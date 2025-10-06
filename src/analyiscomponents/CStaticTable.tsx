import { useEffect, useRef, useState } from 'react';
import type { GradeRow } from '../pages/AnalysisPage';

interface Props {
  grades: GradeRow[];
  onGradesChange: (grades: GradeRow[]) => void;
  isProcessing: boolean;
  prefillGrades?: number[];
  onEmitOrder?: (ids: string[]) => void;
}

const SCALE = ['1.00','1.25','1.50','1.75','2.00','2.25','2.50','2.75','3.00'];

const CStaticTable = ({ grades, onGradesChange, isProcessing, prefillGrades, onEmitOrder }: Props) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Per-row state (explicit ids; no arrays/maps)
  const [state, setState] = useState<Record<string,string>>({});
  const setVal = (id: string, v: string) => setState(prev => ({ ...prev, [id]: v }));

  const upsert = (row: GradeRow) => {
    const i = grades.findIndex(g => g.id === row.id);
    if (i >= 0) { const arr=[...grades]; arr[i]=row; onGradesChange(arr); } else { onGradesChange([...grades, row]); }
  };
  const change = (id: string, subject: string, units: number, semester: string, v: string) => {
    setVal(id, v);
    if (!v) return; const n = parseFloat(v); if (!isFinite(n)) return;
    upsert({ id, subject, units, grade: parseFloat(n.toFixed(2)), semester });
  };

  // Prefill dropdowns sequentially using provided numeric grades
  useEffect(() => {
    if (!prefillGrades || prefillGrades.length === 0) return;
    const container = rootRef.current;
    if (!container) return;
    const run = () => {
      const selects = Array.from(container.querySelectorAll('select')) as HTMLSelectElement[];
      const toStr = (n: number) => n.toFixed(2);
      for (let i = 0; i < selects.length && i < prefillGrades.length; i++) {
        const s = selects[i];
        const val = toStr(prefillGrades[i]);
        s.value = val;
        const evt = new Event('change', { bubbles: true });
        s.dispatchEvent(evt);
      }
    };
    const id = window.setTimeout(run, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillGrades]);

  // Emit the canonical order of select ids once on mount
  useEffect(() => {
    const container = rootRef.current;
    if (!container || !onEmitOrder) return;
    const selects = Array.from(container.querySelectorAll('select[id]')) as HTMLSelectElement[];
    const ids = selects.map(s => s.id);
    if (ids.length > 0) onEmitOrder(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="space-y-6">
      {/* First Year - 1st Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">First Year - 1st Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Introduction to Computing</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_intro_comp" value={state['cs_fy1_intro_comp'] || ''} onChange={(e)=>change('cs_fy1_intro_comp','Introduction to Computing', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Fundamentals of Programming</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_fund_prog" value={state['cs_fy1_fund_prog'] || ''} onChange={(e)=>change('cs_fy1_fund_prog','Fundamentals of Programming', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Discrete Structures 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_disc_struct1" value={state['cs_fy1_disc_struct1'] || ''} onChange={(e)=>change('cs_fy1_disc_struct1','Discrete Structures 1', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Science, Technology and Society</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_sts" value={state['cs_fy1_sts'] || ''} onChange={(e)=>change('cs_fy1_sts','Science, Technology and Society', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Mathematics in the Modern World</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_mmw" value={state['cs_fy1_mmw'] || ''} onChange={(e)=>change('cs_fy1_mmw','Mathematics in the Modern World', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Purposive Communication</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_pcm" value={state['cs_fy1_pcm'] || ''} onChange={(e)=>change('cs_fy1_pcm','Purposive Communication', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_fil" value={state['cs_fy1_fil'] || ''} onChange={(e)=>change('cs_fy1_fil','Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Foundation of Physical Activities</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_pe1" value={state['cs_fy1_pe1'] || ''} onChange={(e)=>change('cs_fy1_pe1','Foundation of Physical Activities', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">National Service Training Program 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy1_nstp1" value={state['cs_fy1_nstp1'] || ''} onChange={(e)=>change('cs_fy1_nstp1','National Service Training Program 1', 3, 'First Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* First Year - 2nd Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">First Year - 2nd Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Intermediate Programming</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_intermediate_prog" value={state['cs_fy2_intermediate_prog'] || ''} onChange={(e)=>change('cs_fy2_intermediate_prog','Intermediate Programming', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Data Structures and Algorithms</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_dsa" value={state['cs_fy2_dsa'] || ''} onChange={(e)=>change('cs_fy2_dsa','Data Structures and Algorithms', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Discrete Structures 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_discrete2" value={state['cs_fy2_discrete2'] || ''} onChange={(e)=>change('cs_fy2_discrete2','Discrete Structures 2', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Human Computer Interaction</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_hci" value={state['cs_fy2_hci'] || ''} onChange={(e)=>change('cs_fy2_hci','Human Computer Interaction', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">The Contemporary World</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_tcw" value={state['cs_fy2_tcw'] || ''} onChange={(e)=>change('cs_fy2_tcw','The Contemporary World', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Readings in Philippine History</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_rph" value={state['cs_fy2_rph'] || ''} onChange={(e)=>change('cs_fy2_rph','Readings in Philippine History', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Life and Works of Rizal</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_lwr" value={state['cs_fy2_lwr'] || ''} onChange={(e)=>change('cs_fy2_lwr','Life and Works of Rizal', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Group Exercise</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_group_ex" value={state['cs_fy2_group_ex'] || ''} onChange={(e)=>change('cs_fy2_group_ex','Group Exercise', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">National Service Training Program 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy2_nstp2" value={state['cs_fy2_nstp2'] || ''} onChange={(e)=>change('cs_fy2_nstp2','National Service Training Program 2', 3, 'First Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Second Year - 1st Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Second Year - 1st Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Object Oriented Programming</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_oop" value={state['cs_sy1_oop'] || ''} onChange={(e)=>change('cs_sy1_oop','Object Oriented Programming', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Logic Design and Digital Computer Circuits</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_logic_design" value={state['cs_sy1_logic_design'] || ''} onChange={(e)=>change('cs_sy1_logic_design','Logic Design and Digital Computer Circuits', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Operation Research</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_or" value={state['cs_sy1_or'] || ''} onChange={(e)=>change('cs_sy1_or','Operation Research', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Information Management</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_im" value={state['cs_sy1_im'] || ''} onChange={(e)=>change('cs_sy1_im','Information Management', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Living in the IT Era</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_living_it_era" value={state['cs_sy1_living_it_era'] || ''} onChange={(e)=>change('cs_sy1_living_it_era','Living in the IT Era', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Ethics</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_ethics" value={state['cs_sy1_ethics'] || ''} onChange={(e)=>change('cs_sy1_ethics','Ethics', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Understanding the Self</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_uts" value={state['cs_sy1_uts'] || ''} onChange={(e)=>change('cs_sy1_uts','Understanding the Self', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">PE Elective</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy1_pe_elective" value={state['cs_sy1_pe_elective'] || ''} onChange={(e)=>change('cs_sy1_pe_elective','PE Elective', 3, 'Second Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Second Year - 2nd Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Second Year - 2nd Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Algorithm and Complexity</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_algo_complexity" value={state['cs_sy2_algo_complexity'] || ''} onChange={(e)=>change('cs_sy2_algo_complexity','Algorithm and Complexity', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Architecture and Organization</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_arch_org" value={state['cs_sy2_arch_org'] || ''} onChange={(e)=>change('cs_sy2_arch_org','Architecture and Organization', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Applications Development and Emerging Technologies</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_app_dev_emerging" value={state['cs_sy2_app_dev_emerging'] || ''} onChange={(e)=>change('cs_sy2_app_dev_emerging','Applications Development and Emerging Technologies', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Information Assurance Security</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_ias" value={state['cs_sy2_ias'] || ''} onChange={(e)=>change('cs_sy2_ias','Information Assurance Security', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">The Entrepreneurial Mind</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_entre_mind" value={state['cs_sy2_entre_mind'] || ''} onChange={(e)=>change('cs_sy2_entre_mind','The Entrepreneurial Mind', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Environmental Science</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_env_sci" value={state['cs_sy2_env_sci'] || ''} onChange={(e)=>change('cs_sy2_env_sci','Environmental Science', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Art Appreciation</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_art_app" value={state['cs_sy2_art_app'] || ''} onChange={(e)=>change('cs_sy2_art_app','Art Appreciation', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">PE Elective</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_sy2_pe_elective" value={state['cs_sy2_pe_elective'] || ''} onChange={(e)=>change('cs_sy2_pe_elective','PE Elective', 3, 'Second Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Third Year - 1st Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Third Year - 1st Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Automata Theory and Formal Languages</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty1_automata" value={state['cs_ty1_automata'] || ''} onChange={(e)=>change('cs_ty1_automata','Automata Theory and Formal Languages', 3, 'Third Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Programming Languages</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty1_prog_lang" value={state['cs_ty1_prog_lang'] || ''} onChange={(e)=>change('cs_ty1_prog_lang','Programming Languages', 3, 'Third Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Software Engineering</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty1_se1" value={state['cs_ty1_se1'] || ''} onChange={(e)=>change('cs_ty1_se1','Software Engineering', 3, 'Third Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Operating System</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty1_os" value={state['cs_ty1_os'] || ''} onChange={(e)=>change('cs_ty1_os','Operating System', 3, 'Third Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Intelligent System</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty1_intelligent_sys" value={state['cs_ty1_intelligent_sys'] || ''} onChange={(e)=>change('cs_ty1_intelligent_sys','Intelligent System', 3, 'Third Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Third Year - 2nd Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Third Year - 2nd Semester</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Software Engineering 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty2_se2" value={state['cs_ty2_se2'] || ''} onChange={(e)=>change('cs_ty2_se2','Software Engineering 2', 3, 'Third Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Compiler Design</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty2_compiler" value={state['cs_ty2_compiler'] || ''} onChange={(e)=>change('cs_ty2_compiler','Compiler Design', 3, 'Third Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Computational Science</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty2_comp_sci" value={state['cs_ty2_comp_sci'] || ''} onChange={(e)=>change('cs_ty2_comp_sci','Computational Science', 3, 'Third Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">CS Elective 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty2_elective1" value={state['cs_ty2_elective1'] || ''} onChange={(e)=>change('cs_ty2_elective1','CS Elective 1', 3, 'Third Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Research Writing</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty2_research_writing" value={state['cs_ty2_research_writing'] || ''} onChange={(e)=>change('cs_ty2_research_writing','Research Writing', 3, 'Third Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Third Year - Summer */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Third Year - Summer</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Practicum</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_ty_summer_practicum" value={state['cs_ty_summer_practicum'] || ''} onChange={(e)=>change('cs_ty_summer_practicum','Practicum', 3, 'Third Year - Summer', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fourth Year - 1st Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Fourth Year - 1st Semester</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
                </tr>
              </thead>
              <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">CS Thesis Writing 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4_thesis1" value={state['cs_fy4_thesis1'] || ''} onChange={(e)=>change('cs_fy4_thesis1','CS Thesis Writing 1', 3, 'Fourth Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Networks and Communication</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4_networks" value={state['cs_fy4_networks'] || ''} onChange={(e)=>change('cs_fy4_networks','Networks and Communication', 3, 'Fourth Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">CS Elective 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4_elective2" value={state['cs_fy4_elective2'] || ''} onChange={(e)=>change('cs_fy4_elective2','CS Elective 2', 3, 'Fourth Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">CS Elective 3</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4_elective3" value={state['cs_fy4_elective3'] || ''} onChange={(e)=>change('cs_fy4_elective3','CS Elective 3', 3, 'Fourth Year - 1st Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

      {/* Fourth Year - 2nd Semester */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Fourth Year - 2nd Semester</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
                </tr>
              </thead>
              <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">CS Thesis Writing 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4b_thesis2" value={state['cs_fy4b_thesis2'] || ''} onChange={(e)=>change('cs_fy4b_thesis2','CS Thesis Writing 2', 3, 'Fourth Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Parallel and Distributing Computing</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4b_parallel_dist" value={state['cs_fy4b_parallel_dist'] || ''} onChange={(e)=>change('cs_fy4b_parallel_dist','Parallel and Distributing Computing', 3, 'Fourth Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Social Issues and Professional Practice</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4b_social_prof" value={state['cs_fy4b_social_prof'] || ''} onChange={(e)=>change('cs_fy4b_social_prof','Social Issues and Professional Practice', 3, 'Fourth Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700">Graphics and Visual Computing</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="cs_fy4b_graphics_visual" value={state['cs_fy4b_graphics_visual'] || ''} onChange={(e)=>change('cs_fy4b_graphics_visual','Graphics and Visual Computing', 3, 'Fourth Year - 2nd Semester', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default CStaticTable;


