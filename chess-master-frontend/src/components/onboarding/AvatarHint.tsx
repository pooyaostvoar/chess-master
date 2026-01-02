const AvatarHint: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center text-xs text-slate-800 animate-in fade-in slide-in-from-top-1">
      <span className="text-base leading-none">👆</span>
      <span className="bg-white border shadow-sm rounded px-2 py-1 whitespace-nowrap">
        {text}
      </span>
    </div>
  );
};

export default AvatarHint;
