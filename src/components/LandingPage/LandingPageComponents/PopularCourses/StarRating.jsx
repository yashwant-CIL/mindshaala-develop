import { Star } from 'lucide-react'; // Optional: replace with any icon lib you use

export const StarRating = ({ rating }) => {
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;

  return (
    <div className="flex space-x-1">
      {[...Array(totalStars)].map((_, i) => {
        if (i < filledStars) {
          return (
            <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.39 7.26H22l-5.67 4.12L17.89 22 12 17.27 6.11 22l1.56-8.62L2 9.26h7.61z" />
            </svg>
          );
        } else if (i === filledStars && hasHalfStar) {
          return (
            <svg key={i} className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <defs>
                <linearGradient id={`halfGrad-${i}`}>
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="50%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path fill={`url(#halfGrad-${i})`} d="M12 2l2.39 7.26H22l-5.67 4.12L17.89 22 12 17.27 6.11 22l1.56-8.62L2 9.26h7.61z" />
            </svg>
          );
        } else {
          return (
            <svg key={i} className="w-4 h-4 text-gray-300 fill-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.39 7.26H22l-5.67 4.12L17.89 22 12 17.27 6.11 22l1.56-8.62L2 9.26h7.61z" />
            </svg>
          );
        }
      })}
    </div>
  );
};
