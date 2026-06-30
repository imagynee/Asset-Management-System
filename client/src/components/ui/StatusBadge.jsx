import { getStatusStyle } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  const formattedStatus = status
    ? status
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : 'Unknown';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(status)}`}
    >
      {formattedStatus}
    </span>
  );
}
