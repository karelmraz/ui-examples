import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';
import './ProgressCircle.css';

// FIX: Use a Union Type instead of an Enum
export type ProgressType = 'PERCENTAGE' | 'FRACTION';

export interface ProgressCircleI {
  animationIndex?: number;
  title: string;
  icon?: string;
  progressType: ProgressType; // This now uses the union type
  maxValue?: number;
  value: number;
  size: number;
  strokeWidth: number;
  innerRadiusOffset?: number;
  gradientStart?: string;
  gradientEnd?: string;
  innerCircleColor?: string;
}

const ProgressCircle: React.FC<ProgressCircleI> = ({
  animationIndex = 0,
  title,
  icon,
  progressType,
  maxValue = 100,
  value,
  size,
  innerCircleColor = "#E5F1FF",
  innerRadiusOffset = 20,
  strokeWidth,
  gradientStart = "#AD63F6",
  gradientEnd = "#5DA8FF",
}) => {
  const centerXY = size / 2;
  const outerRadius = centerXY - strokeWidth;
  const innerRadius = outerRadius - innerRadiusOffset;
  const ratio = value / maxValue;
  const circumference = 2 * Math.PI * outerRadius;
  const maxStrokeDashoffset = circumference * (1 - ratio);

  const gradId = useMemo(() => `grad-${animationIndex}`, [animationIndex]);

  const spring = useSpring({
    from: { strokeDashoffset: circumference, animatedTextValue: 0 },
    to: { strokeDashoffset: maxStrokeDashoffset, animatedTextValue: value },
    config: { mass: 2, friction: 40 + (animationIndex * 10), tension: 140 },
  });

  // Safe access
  const strokeDashoffset = spring.strokeDashoffset;
  const animatedTextValue = spring.animatedTextValue;

  return (
    <div className="progress-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        <circle fill={innerCircleColor} cx={centerXY} cy={centerXY} r={innerRadius} />
        <circle
          stroke={`url(#${gradId})`}
          opacity="0.3"
          strokeWidth={strokeWidth}
          fill="none"
          cx={centerXY}
          cy={centerXY}
          r={outerRadius}
        />
        <animated.circle
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          fill="none"
          cx={centerXY}
          cy={centerXY}
          r={outerRadius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>

      <div className="progress-circle__info-wrapper" style={{ fontSize: `${size * 0.06}px` }}>
        {icon && <img className="progress-circle__icon" src={`${icon}.svg`} alt={title} />}
        <span className="progress-circle__title">{title}</span>
        <span className="progress-circle__percentage">
          <animated.span>
            {animatedTextValue?.to((val) => Math.floor(val))}
          </animated.span>
          <span>{progressType === 'PERCENTAGE' ? " %" : `/ ${maxValue}`}</span>
        </span>
      </div>
    </div>
  );
};

export default ProgressCircle;
