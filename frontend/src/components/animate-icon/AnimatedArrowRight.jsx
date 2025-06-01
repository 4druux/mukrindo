// components/animate-icon/AnimatedArrowRight.jsx

const AnimatedArrowRight = ({
  className,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
      <style jsx>{`
        svg {
          animation: nudge-right 1.5s ease-in-out infinite;
        }

        @keyframes nudge-right {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(8px);
          }
        }
      `}</style>
    </svg>
  );
};

export default AnimatedArrowRight;
