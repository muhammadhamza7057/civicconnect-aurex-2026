const PRIORITY_MAP = {
  emergency: { hours: 2 },
  critical: { hours: 4 },
  high: { hours: 8 },
  medium: { hours: 24 },
  low: { hours: 72 }
};

function computeSLA(priority) {
  const p = PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
  const now = new Date();
  const slaDeadline = new Date(now.getTime() + p.hours * 60 * 60 * 1000);
  const remainingMs = slaDeadline - now;
  const remainingHours = remainingMs / (1000 * 60 * 60);
  let slaStatus = 'green';
  if (remainingHours <= 2) slaStatus = 'red';
  else if (remainingHours <= 8) slaStatus = 'amber';

  return { slaDeadline, slaStatus, remainingHours };
}

module.exports = { computeSLA };
