import { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
} from "react-icons/fi";
import { UserContext } from "../../../../App";
import { useContext } from "react";
import { useCourse } from "../../../../context/CourseContext";



const CourseCard = ({
  image,
  category,
  description,
  title,
  onSelect,
}: {
  image: string;
  category?: string;
  description: string;
  title: string;
  onSelect?: () => void;
}) => {
  const { setCurrentStep } = useContext(UserContext);

  const handleGetStarted = () => {
    if (onSelect) onSelect();
    setCurrentStep("main");
  };

  return (
    <div className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4">
          <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            {category || "General"}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="font-black text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={title}>
          {title}
        </h3>
        <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-3 leading-relaxed">
          {description || "No description available."}
        </p>
        <div className="mt-auto">
          <button
            className="w-full py-4 bg-slate-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            onClick={handleGetStarted}
          >
            Continue Learning <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UserCourses = () => {
  const { courses, isLoading: loading, fetchCourses, selectCourse } = useCourse();
  const user_id = localStorage.getItem("user_id");
  const [error, setError] = useState<string | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user_id) {
      fetchCourses(user_id).catch(err => setError(err.message));
    }
  }, [user_id]);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (courses.length > 0) {
      const timer = setTimeout(checkScrollability, 100);
      window.addEventListener('resize', checkScrollability);
      return () => { clearTimeout(timer); window.removeEventListener('resize', checkScrollability); };
    }
  }, [courses, loading]);

  const handlePrev = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (loading && !courses.length) return <section className="py-16 bg-white text-center">Loading...</section>;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className=" mx-auto px-6 lg:px-12 mb-12">
        <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <div>
            <h3 className="text-indigo-600 font-bold mb-2 text-sm uppercase tracking-widest">Welcome Back!</h3>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">My Courses</h2>
          </div>
          {!loading && courses.length > 0 && (
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md disabled:opacity-30" onClick={handlePrev} disabled={!canScrollLeft}><FiChevronLeft className="w-6 h-6" /></button>
              <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md disabled:opacity-30" onClick={handleNext} disabled={!canScrollRight}><FiChevronRight className="w-6 h-6" /></button>
            </div>
          )}
        </div>
      </div>

      <div className=" mx-auto px-6 lg:px-12">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No courses found.</div>
        ) : (
          <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory py-4 scrollbar-hide no-scrollbar" ref={scrollRef} onScroll={checkScrollability}>
            {courses.map((course, idx) => (
              <div key={idx} className="snap-start flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[40vw] lg:w-[31%]">
                <CourseCard
                  image={`${import.meta.env.VITE_API_URL}/v1/cil/images/${course.subscription_img_url}`}
                  title={course.subscription_name}
                  description={course.details}
                  onSelect={() => {
                    selectCourse(course.subscription_id);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserCourses;
