import { useEffect, useState } from 'react';
import { FiBookOpen, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useMediaQuery } from '../../../../hooks/use-media-query';
import { LandingpageService } from '../../../../services/LandingpageService';

interface Category {
  course_name: string;
  course_img_url: string;
  description: string;
}

const TopCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const handleError = (err: any) => {
    console.error('API Error:', err);
    if (!navigator.onLine) {
      setError('No internet connection detected');
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      setError('Request timed out');
    } else if (err.response) {
      const status = err.response.status;
      if (status >= 500) { setError('Server is currently down'); }
      else if (status === 404) { setError('Categories not found'); }
      else { setError(`Request failed with status ${status}`); }
    } else { setError('An unexpected error occurred'); }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/v1/cil/courses/get/all`, { timeout: 10000 });
      const response = await LandingpageService.getCategories();
      setCategories(response);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isLargeTablet = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  
  let visibleCount = isDesktop ? 4 : (isLargeTablet ? 3 : (isTablet ? 2 : 1));

  useEffect(() => {
    if (!loading && categories.length > 0) {
      const interval = setInterval(() => {
        setLoadedCount(prev => {
          if (prev < categories.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loading, categories.length]);

  const handleNext = () => {
    if (currentIndex + visibleCount < categories.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="text-center py-12">Loading categories...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error} <button onClick={fetchCategories} className="ml-2 underline">Retry</button></div>;

  return (
    <section className="py-24 px-6 lg:px-12 bg-slate-50">
      <div className=" mx-auto">
        <div className="text-center mb-16">
          <h3 className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold mb-4 text-sm uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
            <FiBookOpen /> Top Categories
          </h3>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4">Elevate Your Learning Experience</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Our Platform is Built on the Principles of Innovation, Quality, and Inclusivity.</p>
        </div>

        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="text-slate-900 font-bold text-lg bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 italic">
            {Array.isArray(categories) && categories.length > 0 ? (
              <>
                Showing <span className="text-indigo-600">{currentIndex + 1} - {Math.min(currentIndex + visibleCount, categories.length)}</span> of <span className="text-indigo-600">{categories.length}</span> Categories
              </>
            ) : "No categories found"}
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
              disabled={currentIndex + visibleCount >= categories.length}
              className={`p-3 rounded-2xl shadow-sm border transition-all duration-300 ${
                currentIndex + visibleCount >= categories.length
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                : 'bg-white text-slate-900 border-slate-100 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200'
              }`}
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.isArray(categories) && categories.slice(currentIndex, currentIndex + visibleCount).map((item, idx) => {
              const globalIndex = currentIndex + idx;
              return (
                <div 
                  key={idx} 
                  className={`group bg-white rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 h-[420px] ${
                    globalIndex < loadedCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="w-full h-48 bg-slate-50 rounded-[1.5rem] mb-6 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${item.course_img_url}`} 
                      alt={item.course_name} 
                      className="h-32 w-full object-contain group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <h4 className="font-black text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 w-full truncate">{item.course_name}</h4>
                  <p className="text-slate-500 font-medium line-clamp-3 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopCategories;
