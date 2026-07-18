type TagPillProps = {
  label: string;
};

export default function TagPill({ label }: TagPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
