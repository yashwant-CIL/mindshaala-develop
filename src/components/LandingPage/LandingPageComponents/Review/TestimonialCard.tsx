import React from "react";

interface TestimonialCardProps {
  name: string;
  course: string;
  feedback: string;
  rating: number;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, course, feedback, rating, image }) => {
  return (
    <div className="bg-[#5D5FEF] text-white p-6 rounded-xl text-center max-w-xs w-full">
      <div className="flex justify-center">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-full border-4 border-white mx-auto mt-0 bg-white object-cover shadow"
        />
      </div>
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-sm font-semibold">{course}</p>
      <p className="text-sm my-3">{feedback}</p>
      <div className="text-orange-400 text-lg">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
        <span className="text-orange-400 ml-1 text-xs">({rating})</span>
      </div>
    </div>
  );
};

export default TestimonialCard;
