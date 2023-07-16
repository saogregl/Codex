import React from 'react';

interface CircularProgressProps {
  size: number;
  color: string;
  percentage: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ size, color, percentage }) => {
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  

  const progressOffset = `${(((100 - percentage) / 100) * circumference).toFixed(3)}px`;
  return (
    <svg
      className="circular-progress"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{transform: "rotate(-90deg)"}}
    >
      <circle
        className="circular-progress__background"
        cx={radius}
        cy={radius}
        r={radius - 2}
        fill="none"
        strokeWidth="2"
        stroke="#f4f4f4"
        // style={{transform: "rotate(-90deg)"}}
      />
      <circle
        className="circular-progress__progress"
        cx={radius}
        cy={radius}
        r={radius - 2}
        fill="none"
        strokeWidth="2"
        stroke={color}
        strokeDasharray={circumference - 12}
        strokeDashoffset={progressOffset}
        // style={{transform: "rotate(-90deg)"}}

      />
    </svg>
  );
};

export default CircularProgress;
