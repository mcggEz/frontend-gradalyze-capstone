interface ProcessButtonProps {
  isProcessing: boolean;
  gradesLength: number;
  onProcess: () => void;
}

const ProcessButton = ({ isProcessing, gradesLength, onProcess }: ProcessButtonProps) => {
  const disabled = isProcessing || gradesLength === 0;
  return (
    <button
      onClick={onProcess}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border shadow-sm focus:outline-none focus:ring-2 ${disabled ? 'bg-gray-600 border-gray-600 text-gray-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-500 text-white focus:ring-blue-400'}`}
      title={gradesLength === 0 ? 'Add grades to analyze' : 'Analyze your grades for career insights'}
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7H7v6h6V7z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2 0h8v10H6V5z" clipRule="evenodd"/></svg>
      {isProcessing ? 'Analyzing…' : 'Analyze'}
    </button>
  );
};

export default ProcessButton;
