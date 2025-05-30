// src/components/common/TestimonialCard.jsx
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

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

const TestimonialCard = ({ imgSrc, rating, title, description }) => {
  const validRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="w-72 h-full">
      <div className="bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col overflow-hidden">
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
    </div>
  );
};

export default TestimonialCard;
