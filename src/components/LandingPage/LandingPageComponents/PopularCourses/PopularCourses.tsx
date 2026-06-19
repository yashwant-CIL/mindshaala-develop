import { useEffect, useState, useContext } from 'react';
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import { FiBook, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LandingpageService } from '../../../../services/LandingpageService';
import { useMediaQuery } from '../../../../hooks/use-media-query';
import { UserContext } from '../../../../App';

interface Course {
  subscription_id: string;
  course_id?: string;
  subscription_image_url: string;
  subscription_name: string;
  description: string;
  average_ratings: number;
  total_rating_count: number;
  total_enrollments_count: number;
  in_wishlist_status: boolean;
  wishlist_course_id?: string;
}

const PopularCourses = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentStep } = useContext(UserContext);

  const getAllCourses = async () => {
    try {
      const data = await LandingpageService.getPopularCourses();
      if (data && Array.isArray(data)) {
        setAllCourses(data);
      }
    } catch (err: any) {
      setError("Failed to load courses. Please try again later.");
      console.error("Error loading popular courses:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isLargeTablet = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  
  let visibleCount = isDesktop ? 3 : (isLargeTablet ? 3 : (isTablet ? 2 : 1));

  useEffect(() => {
    if (!loading && allCourses.length > 0) {
      const interval = setInterval(() => {
        setLoadedCount(prev => {
          if (prev < allCourses.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loading, allCourses.length]);

  const handleNext = () => {
    if (currentIndex + visibleCount < allCourses.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Removed legacy auto-rotation logic

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        let fillPercent = 0;
        if (rating >= i) fillPercent = 100;
        else if (rating > i - 1) fillPercent = (rating - (i - 1)) * 100;
        
        stars.push(
            <span key={i} className="relative inline-block text-sm mr-1" style={{ width: "1em", height: "1em" }}>
                <span className="absolute top-0 left-0 w-full h-full text-gray-300"><FaStar /></span>
                <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fillPercent}%` }}>
                    <FaStar className="text-yellow-400" />
                </span>
            </span>
        );
    }
    return stars;
  };

  // Removed unused handleWishlistCourse

  if (loading) return <section className="py-10 bg-gray-50 text-center">Loading...</section>;
  if (error) return <section className="py-10 bg-gray-50 text-center text-red-500">{error}</section>;

  return (
    <section className="py-24 px-6 lg:px-12 bg-white">
      <div className=" mx-auto">
        <div className="text-center mb-16">
          <h3 className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold mb-4 text-sm uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">
            <FiBook />
            Popular Courses
          </h3>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">Pick A Course To Get Started</h2>
        </div>

        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="text-slate-900 font-bold text-lg bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 italic">
            {allCourses.length > 0 ? (
              <>
                Showing <span className="text-indigo-600">{currentIndex + 1} - {Math.min(currentIndex + visibleCount, allCourses.length)}</span> of <span className="text-indigo-600">{allCourses.length}</span> Courses
              </>
            ) : "No courses found"}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-2xl shadow-sm border transition-all duration-300 ${
                currentIndex === 0 
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                : 'bg-white text-slate-900 border-slate-100 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200'
              }`}
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex + visibleCount >= allCourses.length}
              className={`p-3 rounded-2xl shadow-sm border transition-all duration-300 ${
                currentIndex + visibleCount >= allCourses.length
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                : 'bg-white text-slate-900 border-slate-100 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200'
              }`}
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {allCourses.slice(currentIndex, currentIndex + visibleCount).map((course, index) => {
            const globalIndex = currentIndex + index;
            return (
              <div 
                key={`${course.subscription_id}-${index}`} 
                className={`group bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 ${
                  globalIndex < loadedCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
              <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
                <img 
                  src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${course.subscription_image_url}`} 
                  alt={course.subscription_name} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                />
                {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm cursor-pointer hover:bg-white transition-colors" onClick={() => handleWishlistCourse(course)}>
                  {course.in_wishlist_status ? <FaHeart className="text-red-500 w-4 h-4" /> : <FaRegHeart className="text-slate-400 w-4 h-4" />}
                </div> */}
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(course.average_ratings || 0)}
                  </div>
                  <span className="text-xs font-bold text-slate-400 capitalize">({course.total_rating_count || 0} Reviews)</span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{course.subscription_name}</h3>
                
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mb-4">
                  <span className="flex items-center gap-1.5"><PiStudent className="w-4 h-4 text-indigo-500" />{course.total_enrollments_count || "0"} Students</span>
                </div>
                
                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                
                <div className="mt-auto">
                  <button 
                    className="w-full py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300" 
                    onClick={() => setCurrentStep("login")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
