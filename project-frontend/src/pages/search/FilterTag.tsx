interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-300 dark:bg-gray-600 rounded-lg text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-500"
        aria-label={`Remove ${label} filter`}
      >
        ✕
      </button>
    </span>
  );
}

export default FilterTag;
