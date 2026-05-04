import type { ReactNode } from 'react';

interface QuickPreviewActionButtonProps {
  ariaLabel?: string;
  title: string;
  description: string;
  icon: ReactNode;
  emphasis?: 'default' | 'primary' | 'danger';
  badge?: string;
  disabled?: boolean;
  isBusy?: boolean;
  titleAttr?: string;
  onClick: () => void;
}

export const QuickPreviewActionButton = ({
  ariaLabel,
  title,
  description,
  icon,
  emphasis = 'default',
  badge,
  disabled = false,
  isBusy = false,
  titleAttr,
  onClick,
}: QuickPreviewActionButtonProps) => {
  let emphasisClassName = 'quick-preview-action-tile--secondary';
  if (emphasis === 'primary') {
    emphasisClassName = 'primary-action-button';
  } else if (emphasis === 'danger') {
    emphasisClassName = 'danger-action-button';
  }

  const className = ['quick-preview-action-tile', emphasisClassName].join(' ');

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={ariaLabel ?? title}
      aria-description={description}
      aria-busy={isBusy}
      title={titleAttr}
      onClick={onClick}
    >
      <span className="quick-preview-action-tile__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="quick-preview-action-tile__copy">
        <span className="quick-preview-action-tile__title-row">
          <span className="quick-preview-action-tile__title">{title}</span>
          {badge ? <span className="quick-preview-action-tile__badge">{badge}</span> : null}
        </span>
        <span className="quick-preview-action-tile__description">{description}</span>
      </span>
      {isBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
    </button>
  );
};
