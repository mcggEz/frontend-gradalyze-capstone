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

const ITStaticTable = ({ grades, onGradesChange, isProcessing, prefillGrades, onEmitOrder }: Props) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Hardcoded per-row values (no arrays, no mapping)
  const [v_icc0101, set_icc0101] = useState('');
  const [v_icc0101_1, set_icc0101_1] = useState('');
  const [v_icc0102, set_icc0102] = useState('');
  const [v_icc0102_1, set_icc0102_1] = useState('');
  const [v_ipp0010, set_ipp0010] = useState('');
  const [v_mmw0001, set_mmw0001] = useState('');
  const [v_pcm0006, set_pcm0006] = useState('');
  const [v_sts0002, set_sts0002] = useState('');
  const [v_aap0007, set_aap0007] = useState('');
  const [v_ped0001, set_ped0001] = useState('');
  const [v_nstp01, set_nstp01] = useState('');

  const [v_cet0111, set_cet0111] = useState('');
  const [v_cet0114, set_cet0114] = useState('');
  const [v_cet0114_1, set_cet0114_1] = useState('');
  const [v_eit0121, set_eit0121] = useState('');
  const [v_eit0121_1a, set_eit0121_1a] = useState('');
  const [v_eit0122, set_eit0122] = useState('');
  const [v_eit0123, set_eit0123] = useState('');
  const [v_eit0123_1, set_eit0123_1] = useState('');
  const [v_gtb121, set_gtb121] = useState('');
  const [v_icc0103, set_icc0103] = useState('');
  const [v_icc0103_1, set_icc0103_1] = useState('');
  const [v_ped0013, set_ped0013] = useState('');
  const [v_nstp02, set_nstp02] = useState('');

  // Second Year - 1st Semester
  const [v_cet0121, set_cet0121] = useState('');
  const [v_cet0225, set_cet0225] = useState('');
  const [v_cet0225_1, set_cet0225_1] = useState('');
  const [v_eit0211, set_eit0211] = useState('');
  const [v_eit0211_1a, set_eit0211_1a] = useState('');
  const [v_eit_elective1, set_eit_elective1] = useState('');
  const [v_icc0104, set_icc0104] = useState('');
  const [v_icc0104_1, set_icc0104_1] = useState('');
  const [v_ppc122, set_ppc122] = useState('');
  const [v_tcw0005, set_tcw0005] = useState('');
  const [v_ped0054, set_ped0054] = useState('');

  // Second Year - 2nd Semester
  const [v_eit0221, set_eit0221] = useState('');
  const [v_eit0222, set_eit0222] = useState('');
  const [v_eit0222_1, set_eit0222_1] = useState('');
  const [v_ges0013, set_ges0013] = useState('');
  const [v_rph0004, set_rph0004] = useState('');
  const [v_uts0003, set_uts0003] = useState('');
  const [v_ped0074, set_ped0074] = useState('');

  // Third Year - 1st Semester
  const [v_eit0311, set_eit0311] = useState('');
  const [v_eit0311_1, set_eit0311_1] = useState('');
  const [v_eit0312, set_eit0312] = useState('');
  const [v_eit0312_1, set_eit0312_1] = useState('');
  const [v_eit_elective3, set_eit_elective3] = useState('');
  const [v_icc0335, set_icc0335] = useState('');
  const [v_icc0335_1, set_icc0335_1] = useState('');
  const [v_lwr0009, set_lwr0009] = useState('');

  // Third Year - 2nd Semester
  const [v_eit0321, set_eit0321] = useState('');
  const [v_eit0321_1, set_eit0321_1] = useState('');
  const [v_eit0322, set_eit0322] = useState('');
  const [v_eit0322_1, set_eit0322_1] = useState('');
  const [v_eit0323, set_eit0323] = useState('');
  const [v_eit0323_1, set_eit0323_1] = useState('');
  const [v_eth0008, set_eth0008] = useState('');

  // MidYear Term
  const [v_cap0101, set_cap0101] = useState('');
  const [v_eit0331, set_eit0331] = useState('');
  const [v_eit0331_1, set_eit0331_1] = useState('');

  // Fourth Year - 1st Semester
  const [v_cap0102, set_cap0102] = useState('');
  const [v_eit_elective4, set_eit_elective4] = useState('');
  const [v_eit_elective5, set_eit_elective5] = useState('');
  const [v_eit_elective6, set_eit_elective6] = useState('');

  // Fourth Year - 2nd Semester
  const [v_iip0101a, set_iip0101a] = useState('');
  const [v_iip0101_1, set_iip0101_1] = useState('');

  // No hydration from backend list; each select is independent and keyed by explicit id

  const upsert = (row: GradeRow) => {
    const idx = grades.findIndex(g => g.id === row.id);
    if (idx >= 0) { const arr=[...grades]; arr[idx]=row; onGradesChange(arr); }
    else { onGradesChange([...grades, row]); }
  };

  const change = (id: string, subject: string, code: string, units: number, sem: string, val: string, setter: (v:string)=>void) => {
    setter(val);
    if (!val) return;
    const num = parseFloat(val); if (!isFinite(num)) return;
    upsert({ id, subject, courseCode: code, units, grade: parseFloat(num.toFixed(2)), semester: sem });
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
        if (SCALE.includes(val)) {
          s.value = val;
          const evt = new Event('change', { bubbles: true });
          s.dispatchEvent(evt);
        }
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0101</td>
                <td className="px-3 py-2 border-b border-gray-700">Introduction to Computing (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_icc0101" value={v_icc0101} onChange={(e)=>change('it_fy1_icc0101','ICC 0101 Introduction to Computing (Lecture)','ICC 0101',3,'First Year - 1st Semester',e.target.value,set_icc0101)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0101.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Introduction to Computing (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_icc0101_1" value={v_icc0101_1} onChange={(e)=>change('it_fy1_icc0101_1','ICC 0101.1 Introduction to Computing (Laboratory)','ICC 0101.1',1,'First Year - 1st Semester',e.target.value,set_icc0101_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0102</td>
                <td className="px-3 py-2 border-b border-gray-700">Fundamentals of Programming (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_icc0102" value={v_icc0102} onChange={(e)=>change('it_fy1_icc0102','ICC 0102 Fundamentals of Programming (Lecture)','ICC 0102',3,'First Year - 1st Semester',e.target.value,set_icc0102)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0102.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Fundamentals of Programming (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_icc0102_1" value={v_icc0102_1} onChange={(e)=>change('it_fy1_icc0102_1','ICC 0102.1 Fundamentals of Programming (Laboratory)','ICC 0102.1',1,'First Year - 1st Semester',e.target.value,set_icc0102_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">IPP 0010</td>
                <td className="px-3 py-2 border-b border-gray-700">Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_ipp0010" value={v_ipp0010} onChange={(e)=>change('it_fy1_ipp0010','IPP 0010 Interdisiplinaryong Pagbasa at Pagsulat Tungo sa Mabisang Pagpapahayag','IPP 0010',3,'First Year - 1st Semester',e.target.value,set_ipp0010)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">MMW 0001</td>
                <td className="px-3 py-2 border-b border-gray-700">Mathematics in the Modern World</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_mmw0001" value={v_mmw0001} onChange={(e)=>change('it_fy1_mmw0001','MMW 0001 Mathematics in the Modern World','MMW 0001',3,'First Year - 1st Semester',e.target.value,set_mmw0001)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PCM 0006</td>
                <td className="px-3 py-2 border-b border-gray-700">Purposive Communication</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_pcm0006" value={v_pcm0006} onChange={(e)=>change('it_fy1_pcm0006','PCM 0006 Purposive Communication','PCM 0006',3,'First Year - 1st Semester',e.target.value,set_pcm0006)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">STS 0002</td>
                <td className="px-3 py-2 border-b border-gray-700">Science, Technology and Society</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_sts0002" value={v_sts0002} onChange={(e)=>change('it_fy1_sts0002','STS 0002 Science, Technology and Society','STS 0002',3,'First Year - 1st Semester',e.target.value,set_sts0002)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">AAP 0007</td>
                <td className="px-3 py-2 border-b border-gray-700">Art Appreciation</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_aap0007" value={v_aap0007} onChange={(e)=>change('it_fy1_aap0007','AAP 0007 Art Appreciation','AAP 0007',3,'First Year - 1st Semester',e.target.value,set_aap0007)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PED 0001</td>
                <td className="px-3 py-2 border-b border-gray-700">Foundation of Physical Activities</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_ped0001" value={v_ped0001} onChange={(e)=>change('it_fy1_ped0001','PED 0001 Foundation of Physical Activities','PED 0001',1,'First Year - 1st Semester',e.target.value,set_ped0001)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">NSTP 01</td>
                <td className="px-3 py-2 border-b border-gray-700">National Service Training Program 1 (ROTC/CWTS)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.50</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy1_nstp01" value={v_nstp01} onChange={(e)=>change('it_fy1_nstp01','NSTP 01 National Service Training Program 1 (ROTC/CWTS)','NSTP 01',1.5,'First Year - 1st Semester',e.target.value,set_nstp01)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
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
                  <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                  <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
                </tr>
              </thead>
              <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0111</td>
                <td className="px-3 py-2 border-b border-gray-700">Calculus 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_cet0111" value={v_cet0111} onChange={(e)=>change('it_fy2_cet0111','CET 0111 Calculus 1','CET 0111',3,'First Year - 2nd Semester',e.target.value,set_cet0111)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0114</td>
                <td className="px-3 py-2 border-b border-gray-700">General Chemistry (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_cet0114" value={v_cet0114} onChange={(e)=>change('it_fy2_cet0114','CET 0114 General Chemistry (Lecture)','CET 0114',3,'First Year - 2nd Semester',e.target.value,set_cet0114)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0114.1</td>
                <td className="px-3 py-2 border-b border-gray-700">General Chemistry (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_cet0114_1" value={v_cet0114_1} onChange={(e)=>change('it_fy2_cet0114_1','CET 0114.1 General Chemistry (Laboratory)','CET 0114.1',1,'First Year - 2nd Semester',e.target.value,set_cet0114_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0121</td>
                <td className="px-3 py-2 border-b border-gray-700">Introduction to Computer Human Interaction (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_eit0121" value={v_eit0121} onChange={(e)=>change('it_fy2_eit0121','EIT 0121 Introduction to Computer Human Interaction (Lecture)','EIT 0121',2,'First Year - 2nd Semester',e.target.value,set_eit0121)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0121.1A</td>
                <td className="px-3 py-2 border-b border-gray-700">Introduction to Computer Human Interaction (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_eit0121_1a" value={v_eit0121_1a} onChange={(e)=>change('it_fy2_eit0121_1a','EIT 0121.1A Introduction to Computer Human Interaction (Laboratory)','EIT 0121.1A',1,'First Year - 2nd Semester',e.target.value,set_eit0121_1a)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0122</td>
                <td className="px-3 py-2 border-b border-gray-700">Discrete Mathematics</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_eit0122" value={v_eit0122} onChange={(e)=>change('it_fy2_eit0122','EIT 0122 Discrete Mathematics','EIT 0122',3,'First Year - 2nd Semester',e.target.value,set_eit0122)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0123</td>
                <td className="px-3 py-2 border-b border-gray-700">Web Systems Technology (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_eit0123" value={v_eit0123} onChange={(e)=>change('it_fy2_eit0123','EIT 0123 Web Systems Technology (Lecture)','EIT 0123',2,'First Year - 2nd Semester',e.target.value,set_eit0123)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0123.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Web Systems Technology (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_eit0123_1" value={v_eit0123_1} onChange={(e)=>change('it_fy2_eit0123_1','EIT 0123.1 Web Systems Technology (Laboratory)','EIT 0123.1',1,'First Year - 2nd Semester',e.target.value,set_eit0123_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">GTB 121</td>
                <td className="px-3 py-2 border-b border-gray-700">Great Books</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_gtb121" value={v_gtb121} onChange={(e)=>change('it_fy2_gtb121','GTB 121 Great Books','GTB 121',3,'First Year - 2nd Semester',e.target.value,set_gtb121)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0103</td>
                <td className="px-3 py-2 border-b border-gray-700">Intermediate Programming (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_icc0103" value={v_icc0103} onChange={(e)=>change('it_fy2_icc0103','ICC 0103 Intermediate Programming (Lecture)','ICC 0103',3,'First Year - 2nd Semester',e.target.value,set_icc0103)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0103.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Intermediate Programming (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_icc0103_1" value={v_icc0103_1} onChange={(e)=>change('it_fy2_icc0103_1','ICC 0103.1 Intermediate Programming (Laboratory)','ICC 0103.1',1,'First Year - 2nd Semester',e.target.value,set_icc0103_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PED 0013</td>
                <td className="px-3 py-2 border-b border-gray-700">Philippine Folk Dance</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_ped0013" value={v_ped0013} onChange={(e)=>change('it_fy2_ped0013','PED 0013 Philippine Folk Dance','PED 0013',1,'First Year - 2nd Semester',e.target.value,set_ped0013)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">NSTP 02</td>
                <td className="px-3 py-2 border-b border-gray-700">National Service Training Program 2 (ROTC/CWTS)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.50</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy2_nstp02" value={v_nstp02} onChange={(e)=>change('it_fy2_nstp02','NSTP 02 National Service Training Program 2 (ROTC/CWTS)','NSTP 02',1.5,'First Year - 2nd Semester',e.target.value,set_nstp02)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s => <option key={s} value={s}>{s}</option>)}
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0121</td>
                <td className="px-3 py-2 border-b border-gray-700">Calculus 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_cet0121" value={v_cet0121} onChange={(e)=>change('it_sy1_cet0121','CET 0121 Calculus 2','CET 0121',3,'Second Year - 1st Semester',e.target.value,set_cet0121)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0225</td>
                <td className="px-3 py-2 border-b border-gray-700">Physics for IT (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_cet0225" value={v_cet0225} onChange={(e)=>change('it_sy1_cet0225','CET 0225 Physics for IT (Lecture)','CET 0225',3,'Second Year - 1st Semester',e.target.value,set_cet0225)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CET 0225.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Physics for IT (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_cet0225_1" value={v_cet0225_1} onChange={(e)=>change('it_sy1_cet0225_1','CET 0225.1 Physics for IT (Laboratory)','CET 0225.1',1,'Second Year - 1st Semester',e.target.value,set_cet0225_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0211</td>
                <td className="px-3 py-2 border-b border-gray-700">Object Oriented Programming (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_eit0211" value={v_eit0211} onChange={(e)=>change('it_sy1_eit0211','EIT 0211 Object Oriented Programming (Lecture)','EIT 0211',2,'Second Year - 1st Semester',e.target.value,set_eit0211)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0211.1A</td>
                <td className="px-3 py-2 border-b border-gray-700">Object Oriented Programming (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_eit0211_1a" value={v_eit0211_1a} onChange={(e)=>change('it_sy1_eit0211_1a','EIT 0211.1A Object Oriented Programming (Laboratory)','EIT 0211.1A',1,'Second Year - 1st Semester',e.target.value,set_eit0211_1a)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT ELECTIVE 1</td>
                <td className="px-3 py-2 border-b border-gray-700">Professional Elective 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_eit_elective1" value={v_eit_elective1} onChange={(e)=>change('it_sy1_eit_elective1','EIT ELECTIVE 1 Professional Elective 1','EIT ELECTIVE 1',3,'Second Year - 1st Semester',e.target.value,set_eit_elective1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0104</td>
                <td className="px-3 py-2 border-b border-gray-700">Data Structures and Algorithms (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_icc0104" value={v_icc0104} onChange={(e)=>change('it_sy1_icc0104','ICC 0104 Data Structures and Algorithms (Lecture)','ICC 0104',2,'Second Year - 1st Semester',e.target.value,set_icc0104)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0104.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Data Structures and Algorithms (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_icc0104_1" value={v_icc0104_1} onChange={(e)=>change('it_sy1_icc0104_1','ICC 0104.1 Data Structures and Algorithms (Laboratory)','ICC 0104.1',1,'Second Year - 1st Semester',e.target.value,set_icc0104_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PPC 122</td>
                <td className="px-3 py-2 border-b border-gray-700">Philippine Popular Culture</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_ppc122" value={v_ppc122} onChange={(e)=>change('it_sy1_ppc122','PPC 122 Philippine Popular Culture','PPC 122',3,'Second Year - 1st Semester',e.target.value,set_ppc122)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">TCW 0005</td>
                <td className="px-3 py-2 border-b border-gray-700">The Contemporary World</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_tcw0005" value={v_tcw0005} onChange={(e)=>change('it_sy1_tcw0005','TCW 0005 The Contemporary World','TCW 0005',3,'Second Year - 1st Semester',e.target.value,set_tcw0005)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PED 0054</td>
                <td className="px-3 py-2 border-b border-gray-700">PED</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy1_ped0054" value={v_ped0054} onChange={(e)=>change('it_sy1_ped0054','PED 0054 Soccer','PED 0054',1,'Second Year - 1st Semester',e.target.value,set_ped0054)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0221</td>
                <td className="px-3 py-2 border-b border-gray-700">Quantitative Methods</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_eit0221" value={v_eit0221} onChange={(e)=>change('it_sy2_eit0221','EIT 0221 Quantitative Methods','EIT 0221',3,'Second Year - 2nd Semester',e.target.value,set_eit0221)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0222</td>
                <td className="px-3 py-2 border-b border-gray-700">Networking 1 (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_eit0222" value={v_eit0222} onChange={(e)=>change('it_sy2_eit0222','EIT 0222 Networking 1 (Lecture)','EIT 0222',2,'Second Year - 2nd Semester',e.target.value,set_eit0222)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0222.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Networking 1 (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_eit0222_1" value={v_eit0222_1} onChange={(e)=>change('it_sy2_eit0222_1','EIT 0222.1 Networking 1 (Laboratory)','EIT 0222.1',1,'Second Year - 2nd Semester',e.target.value,set_eit0222_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">GES 0013</td>
                <td className="px-3 py-2 border-b border-gray-700">Environmental Science</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_ges0013" value={v_ges0013} onChange={(e)=>change('it_sy2_ges0013','GES 0013 Environmental Science','GES 0013',3,'Second Year - 2nd Semester',e.target.value,set_ges0013)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">RPH 0004</td>
                <td className="px-3 py-2 border-b border-gray-700">Readings in Philippine History</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_rph0004" value={v_rph0004} onChange={(e)=>change('it_sy2_rph0004','RPH 0004 Readings in Philippine History','RPH 0004',3,'Second Year - 2nd Semester',e.target.value,set_rph0004)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">UTS 0003</td>
                <td className="px-3 py-2 border-b border-gray-700">Understanding the Self</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_uts0003" value={v_uts0003} onChange={(e)=>change('it_sy2_uts0003','UTS 0003 Understanding the Self','UTS 0003',3,'Second Year - 2nd Semester',e.target.value,set_uts0003)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">PED 0074</td>
                <td className="px-3 py-2 border-b border-gray-700">Volleyball</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_sy2_ped0074" value={v_ped0074} onChange={(e)=>change('it_sy2_ped0074','PED 0074 Volleyball','PED 0074',1,'Second Year - 2nd Semester',e.target.value,set_ped0074)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0311</td>
                <td className="px-3 py-2 border-b border-gray-700">Advanced Database Systems (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_eit0311" value={v_eit0311} onChange={(e)=>change('it_ty1_eit0311','EIT 0311 Advanced Database Systems (Lecture)','EIT 0311',2,'Third Year - 1st Semester',e.target.value,set_eit0311)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0311.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Advanced Database Systems (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_eit0311_1" value={v_eit0311_1} onChange={(e)=>change('it_ty1_eit0311_1','EIT 0311.1 Advanced Database Systems (Laboratory)','EIT 0311.1',1,'Third Year - 1st Semester',e.target.value,set_eit0311_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0312</td>
                <td className="px-3 py-2 border-b border-gray-700">Networking 2 (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_eit0312" value={v_eit0312} onChange={(e)=>change('it_ty1_eit0312','EIT 0312 Networking 2 (Lecture)','EIT 0312',2,'Third Year - 1st Semester',e.target.value,set_eit0312)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0312.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Networking 2 (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_eit0312_1" value={v_eit0312_1} onChange={(e)=>change('it_ty1_eit0312_1','EIT 0312.1 Networking 2 (Laboratory)','EIT 0312.1',1,'Third Year - 1st Semester',e.target.value,set_eit0312_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT ELECTIVE 3</td>
                <td className="px-3 py-2 border-b border-gray-700">Professional Elective 3</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_eit_elective3" value={v_eit_elective3} onChange={(e)=>change('it_ty1_eit_elective3','EIT ELECTIVE 3 Professional Elective 3','EIT ELECTIVE 3',3,'Third Year - 1st Semester',e.target.value,set_eit_elective3)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0335</td>
                <td className="px-3 py-2 border-b border-gray-700">Application and Emerging Technologies (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_icc0335" value={v_icc0335} onChange={(e)=>change('it_ty1_icc0335','ICC 0335 Application and Emerging Technologies (Lecture)','ICC 0335',2,'Third Year - 1st Semester',e.target.value,set_icc0335)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ICC 0335.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Application and Emerging Technologies (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_icc0335_1" value={v_icc0335_1} onChange={(e)=>change('it_ty1_icc0335_1','ICC 0335.1 Application and Emerging Technologies (Laboratory)','ICC 0335.1',1,'Third Year - 1st Semester',e.target.value,set_icc0335_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">LWR 0009</td>
                <td className="px-3 py-2 border-b border-gray-700">Life and Works of Rizal</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty1_lwr0009" value={v_lwr0009} onChange={(e)=>change('it_ty1_lwr0009','LWR 0009 Life and Works of Rizal','LWR 0009',3,'Third Year - 1st Semester',e.target.value,set_lwr0009)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0321</td>
                <td className="px-3 py-2 border-b border-gray-700">Information Assurance and Security 1 (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0321" value={v_eit0321} onChange={(e)=>change('it_ty2_eit0321','EIT 0321 Information Assurance and Security 1 (Lecture)','EIT 0321',2,'Third Year - 2nd Semester',e.target.value,set_eit0321)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0321.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Information Assurance and Security 1 (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0321_1" value={v_eit0321_1} onChange={(e)=>change('it_ty2_eit0321_1','EIT 0321.1 Information Assurance and Security 1 (Laboratory)','EIT 0321.1',1,'Third Year - 2nd Semester',e.target.value,set_eit0321_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0322</td>
                <td className="px-3 py-2 border-b border-gray-700">System Integration and Architecture 1 (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0322" value={v_eit0322} onChange={(e)=>change('it_ty2_eit0322','EIT 0322 System Integration and Architecture 1 (Lecture)','EIT 0322',2,'Third Year - 2nd Semester',e.target.value,set_eit0322)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0322.1</td>
                <td className="px-3 py-2 border-b border-gray-700">System Integration and Architecture 1 (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0322_1" value={v_eit0322_1} onChange={(e)=>change('it_ty2_eit0322_1','EIT 0322.1 System Integration and Architecture 1 (Laboratory)','EIT 0322.1',1,'Third Year - 2nd Semester',e.target.value,set_eit0322_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0323</td>
                <td className="px-3 py-2 border-b border-gray-700">Integrative Programming and Technologies (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0323" value={v_eit0323} onChange={(e)=>change('it_ty2_eit0323','EIT 0323 Integrative Programming and Technologies (Lecture)','EIT 0323',2,'Third Year - 2nd Semester',e.target.value,set_eit0323)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0323.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Integrative Programming and Technologies (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">1.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eit0323_1" value={v_eit0323_1} onChange={(e)=>change('it_ty2_eit0323_1','EIT 0323.1 Integrative Programming and Technologies (Laboratory)','EIT 0323.1',1,'Third Year - 2nd Semester',e.target.value,set_eit0323_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">ETH 0008</td>
                <td className="px-3 py-2 border-b border-gray-700">Ethics</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_ty2_eth0008" value={v_eth0008} onChange={(e)=>change('it_ty2_eth0008','ETH 0008 Ethics','ETH 0008',3,'Third Year - 2nd Semester',e.target.value,set_eth0008)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MidYear Term */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Third Year - MidYear</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CAP 0101</td>
                <td className="px-3 py-2 border-b border-gray-700">Capstone Project 1</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_my_cap0101" value={v_cap0101} onChange={(e)=>change('it_my_cap0101','CAP 0101 Capstone Project 1','CAP 0101',3,'Third Year - MidYear',e.target.value,set_cap0101)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0331</td>
                <td className="px-3 py-2 border-b border-gray-700">System Integration and Architecture 2 (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.25</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_my_eit0331" value={v_eit0331} onChange={(e)=>change('it_my_eit0331','EIT 0331 System Integration and Architecture 2 (Lecture)','EIT 0331',2.25,'Third Year - MidYear',e.target.value,set_eit0331)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT 0331.1</td>
                <td className="px-3 py-2 border-b border-gray-700">System Integration and Architecture 2 (Laboratory)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.25</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_my_eit0331_1" value={v_eit0331_1} onChange={(e)=>change('it_my_eit0331_1','EIT 0331.1 System Integration and Architecture 2 (Laboratory)','EIT 0331.1',2.25,'Third Year - MidYear',e.target.value,set_eit0331_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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
                <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">CAP 0102</td>
                <td className="px-3 py-2 border-b border-gray-700">Capstone Project 2</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4_cap0102" value={v_cap0102} onChange={(e)=>change('it_fy4_cap0102','CAP 0102 Capstone Project 2','CAP 0102',3,'Fourth Year - 1st Semester',e.target.value,set_cap0102)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT ELECTIVE 4</td>
                <td className="px-3 py-2 border-b border-gray-700">Professional Elective 4</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4_elective4" value={v_eit_elective4} onChange={(e)=>change('it_fy4_elective4','EIT ELECTIVE 4 Professional Elective 4','EIT ELECTIVE 4',3,'Fourth Year - 1st Semester',e.target.value,set_eit_elective4)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT ELECTIVE 5</td>
                <td className="px-3 py-2 border-b border-gray-700">Professional Elective 5</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4_elective5" value={v_eit_elective5} onChange={(e)=>change('it_fy4_elective5','EIT ELECTIVE 5 Professional Elective 5','EIT ELECTIVE 5',3,'Fourth Year - 1st Semester',e.target.value,set_eit_elective5)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">EIT ELECTIVE 6</td>
                <td className="px-3 py-2 border-b border-gray-700">Professional Elective 6</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">3.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4_elective6" value={v_eit_elective6} onChange={(e)=>change('it_fy4_elective6','EIT ELECTIVE 6 Professional Elective 6','EIT ELECTIVE 6',3,'Fourth Year - 1st Semester',e.target.value,set_eit_elective6)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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
                  <th className="px-3 py-2 border-b border-gray-700 w-24">Course No.</th>
                  <th className="px-3 py-2 border-b border-gray-700">Descriptive Title</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-20">Units</th>
                <th className="px-3 py-2 border-b border-gray-700 text-right w-28">Grade</th>
                </tr>
              </thead>
              <tbody>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">IIP 0101A</td>
                <td className="px-3 py-2 border-b border-gray-700">Practicum (Lecture)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">2.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4b_iip0101a" value={v_iip0101a} onChange={(e)=>change('it_fy4b_iip0101a','IIP 0101A Practicum (Lecture)','IIP 0101A',2,'Fourth Year - 2nd Semester',e.target.value,set_iip0101a)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
                    <option value="">--</option>{SCALE.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2 border-b border-gray-700 font-mono text-xs">IIP 0101.1</td>
                <td className="px-3 py-2 border-b border-gray-700">Practicum (Immersion)</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right">4.00</td>
                <td className="px-3 py-2 border-b border-gray-700 text-right min-w-[7rem]">
                  <select id="it_fy4b_iip0101_1" value={v_iip0101_1} onChange={(e)=>change('it_fy4b_iip0101_1','IIP 0101.1 Practicum (Immersion)','IIP 0101.1',4,'Fourth Year - 2nd Semester',e.target.value,set_iip0101_1)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white w-28 font-mono tabular-nums text-right" disabled={isProcessing}>
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

export default ITStaticTable;


