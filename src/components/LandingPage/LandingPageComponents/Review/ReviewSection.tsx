import { useState, useEffect } from "react";
import axios from "axios";
// @ts-ignore
import TestimonialCard from './TestimonialCard';
import illustration from "../../../../assets/MedhVrushti_Landing_Page/illustration.webp";
import reviewMale from "../../../../assets/images/reviewmale.webp";
import femalereview from "../../../../assets/images/femalereview.webp";
import reviewprofile from "../../../../assets/images/reviewprofile.webp";
import { MdOutlineReviews } from "react-icons/md";
import { LandingpageService } from "../../../../services/LandingpageService";

interface UserDto {
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  gender?: string;
}

interface Review {
  user_review_id: string;
  user_dto: UserDto;
  review_message: string;
  rating: number;
}

const ReviewSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_URL}/v1/cil/userReviews/get/all/custom`
        // );
        const response = await LandingpageService.getReviews();
        console.log("Reviews", response);
        if (Array.isArray(response)) {
          setReviews(response);
        } else {
          setError("Invalid data format received");
        }
      } catch (err: any) {
        setError("Failed to load reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getFullName = (userDto: UserDto) => {
    if (!userDto) return "Anonymous Student";
    const fullName = `${userDto.first_name || ""} ${userDto.last_name || ""}`.trim();
    return fullName || "Anonymous Student";
  };

  const getProfileImage = (userDto: UserDto) => {
    if (!userDto) return reviewprofile;
    if (userDto.profile_image_url)
      return `${import.meta.env.VITE_API_URL}/v1/cil/images/${userDto.profile_image_url}`;
    if (userDto.gender) {
      if (userDto.gender.toLowerCase() === "male") return reviewMale;
      if (userDto.gender.toLowerCase() === "female") return femalereview;
    }
    return reviewprofile;
  };

  if (loading) return <section className="py-12 bg-white text-center">Loading reviews...</section>;
  if (error) return <section className="py-12 bg-white text-center text-red-500">{error}</section>;
  if (!reviews.length) return <section className="py-12 bg-white text-center">No reviews yet.</section>;

  return (
    <section className="py-24 px-6 lg:px-12 bg-white">
      <div className=" mx-auto">
        <div className="text-center mb-20">
          <h3 className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold mb-6 text-sm uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">
            <MdOutlineReviews className="text-lg" /> People Love Us!
          </h3>
          <h2 className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight">
            Student's <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">Feedback</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>
            <img src={illustration} alt="Student Review Illustration" className="w-full h-auto drop-shadow-2xl" />
          </div>
          
          <div className="lg:w-1/2 w-full overflow-hidden">
            <div className="flex gap-8 animate-marquee-review hover:[animation-play-state:paused] py-10">
              {reviews.concat(reviews).map((review, index) => (
                <div key={`${review.user_review_id}-${index}`} className="shrink-0">
                  <TestimonialCard
                    name={getFullName(review.user_dto)}
                    course="Student"
                    feedback={review.review_message || "Great experience!"}
                    rating={Math.round(review.rating) || 5}
                    image={getProfileImage(review.user_dto)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
