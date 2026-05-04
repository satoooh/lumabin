interface UnifiedFilterOption {
  id: string;
  label: string;
  count: number;
  tone?: 'default' | 'kind' | 'smart';
}

interface UnifiedFilterBarProps {
  className?: string;
  options: UnifiedFilterOption[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const UnifiedFilterBar = ({
  className,
  options,
  activeId,
  onSelect,
}: UnifiedFilterBarProps) => {
  return (
    <div className={className ? `filter-rail ${className}` : 'filter-rail'} aria-label="Filters">
      {options.map((option) => {
        const isActive = activeId === option.id;
        const shouldShowCount = isActive || option.id === 'all';
        return (
          <button
            type="button"
            key={option.id}
            className={`filter-rail-chip filter-rail-chip--${option.tone ?? 'default'} ${
              isActive ? 'filter-rail-chip--active' : ''
            }`}
            onClick={() => onSelect(option.id)}
            aria-pressed={isActive}
          >
            <span>{option.label}</span>
            {shouldShowCount ? <strong>{option.count}</strong> : null}
          </button>
        );
      })}
    </div>
  );
};
