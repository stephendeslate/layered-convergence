'use client';

interface DisputeGaugeProps {
  rate: number; // 0-100 percent
}

export function DisputeGauge({ rate }: DisputeGaugeProps) {
  const clampedRate = Math.min(100, Math.max(0, rate));
  const color =
    clampedRate < 5
      ? '#22c55e' // green
      : clampedRate < 15
        ? '#eab308' // yellow
        : '#ef4444'; // red

  // SVG arc for gauge
  const radius = 60;
  const circumference = Math.PI * radius;
  const progress = (clampedRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Background arc */}
        <path
          d="M 10 80 A 60 60 0 0 1 150 80"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 10 80 A 60 60 0 0 1 150 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
        {/* Value text */}
        <text
          x="80"
          y="70"
          textAnchor="middle"
          className="text-2xl font-bold"
          fill={color}
        >
          {clampedRate.toFixed(1)}%
        </text>
      </svg>
      <p className="mt-1 text-sm text-gray-500">Dispute Rate</p>
    </div>
  );
}
