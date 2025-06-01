// components/animate-icon/AnimatedBell.jsx

const AnimatedBell = ({ className, size = 20, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ originX: "50%", originY: "0%" }}
    >
      <path
        d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
        fill={color}
      />
      <style jsx>{`
        svg {
          animation: ring 1.5s ease-in-out infinite;
          transform-origin: 50% 4px; // Adjust based on your bell's top point
        }

        @keyframes ring {
          0% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(25deg);
          }
          20% {
            transform: rotate(-20deg);
          }
          30% {
            transform: rotate(15deg);
          }
          40% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(5deg);
          }
          60% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </svg>
  );
};

export default AnimatedBell;
