// src/components/common/TestimonialCard.jsx
import React, { useRef } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const clampedRating = Math.max(0, Math.min(5, rating));
  const displayFullStars = Math.floor(clampedRating);
  const displayHasHalfStar = clampedRating % 1 !== 0;
  const displayEmptyStars = 5 - displayFullStars - (displayHasHalfStar ? 1 : 0);

  for (let i = 0; i < displayFullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-orange-400" />);
  }

  if (displayHasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-orange-400" />);
  }

  for (let i = 0; i < displayEmptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-orange-400" />);
  }

  return stars;
};

const TestimonialCard = ({ imgSrc, rating, title, description, isMobile }) => {
  const validRating = Math.max(0, Math.min(5, rating));

  // Logika untuk efek 3D Tilt
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current || isMobile) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="w-72 h-full"
    >
      <div
        className="bg-white border border-gray-100 rounded-xl shadow-lg transition-shadow duration-300 h-full flex flex-col overflow-hidden"
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="flex-shrink-0 w-full aspect-[2/1]">
          <img
            src={imgSrc}
            alt={`${title}'s testimonial`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow flex flex-col text-start p-5 space-y-2">
          <h3 className="text-md font-medium text-gray-700">{title}</h3>
          <div className="flex justify-start items-center">
            {renderStars(validRating)}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-normal flex-grow">
            "{description}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
