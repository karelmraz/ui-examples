import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import './ProgressCircle.css';

// Progress type options: PERCENTAGE, FRACTION
export enum ProgressType {
  PERCENTAGE,
  FRACTION,
}

// Props for the ProgressCircle component
export interface ProgressCircleI {
  animationIndex?: number;
  title: string;
  icon?: string;
  progressType: ProgressType;
  maxValue?: number;
  value: number;
  size: number;
  strokeWidth: number;
  innerRadiusOffset?: number;
  gradientStart?: string;
  gradientEnd?: string;
  innerCircleColor?: string;
}

const ProgressCircle: React.FunctionComponent<ProgressCircleI> = ({
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
}: ProgressCircleI) => {
  // Circle center coordinate
  const centerXY = size / 2;

  // Outer radius for the progress stroke
  const outerRadius = centerXY - strokeWidth;

  // Inner radius for the filled circle background
  const innerRadius = outerRadius - innerRadiusOffset;

  // Progress ratio (0–1)
  const ratio = value / maxValue;

  // Circle circumference for stroke calculations
  const circumference = 2 * Math.PI * outerRadius;

  // Stroke offset at final value
  const maxStrokeDashoffset = circumference * (1 - ratio);

  // React Spring animation for stroke + number counter
  const { strokeDashoffset, animatedTextValue } = useSpring({
    from: {
      strokeDashoffset: circumference,
      animatedTextValue: 0,
    },
    to: {
      strokeDashoffset: maxStrokeDashoffset,
      animatedTextValue: value,
    },
    config: {
      mass: 2,
      friction: 40 + (animationIndex * 10),
      tension: 140,
    },
  });
  
  return (
    <div
      className="progress-circle"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* SVG container */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-circle__svg"
      >
        {/* Inner filled circle */}
        <circle fill={innerCircleColor} cx={centerXY} cy={centerXY} r={innerRadius} />
        {/* Gradient definition for stroke */}
        <linearGradient
          id="primary-gradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={gradientStart} />
          <stop offset="100%" stopColor={gradientEnd} />
        </linearGradient>
        {/* Background stroke (static) */}
        <circle
          stroke="url(#primary-gradient)"
          opacity="0.3"
          strokeWidth={strokeWidth}
          fill="none"
          cx={centerXY}
          cy={centerXY}
          r={outerRadius}
        />
        {/* Foreground stroke (animated) */}
        <animated.circle
          stroke="url(#primary-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          cx={centerXY}
          cy={centerXY}
          r={outerRadius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Text + icon inside the circle */}
      <div
        className="progress-circle__info-wrapper"
        style={{
          width: `${innerRadius * 2}px`,
          height: `${innerRadius * 2}px`,
          fontSize: `${size * 0.06}px`,
        }}
      >
        {/* Optional icon */}
        {icon && (
          <img
            className="progress-circle__icon"
            src={`${icon}.svg`}
            alt={title}
          />
        )}

        {/* Title label */}
        <span className="progress-circle__title">{title}</span>

        {/* Animated progress value */}
        <span className="progress-circle__percentage">
          <animated.span>
            {animatedTextValue.to((val: number) => Math.floor(val))}
          </animated.span>
          <span>
            {progressType === ProgressType.PERCENTAGE ?
              " %" : `/ ${maxValue}`}
          </span>
        </span>
      </div>
    </div>
  );
};

export default ProgressCircle;
