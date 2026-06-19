import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Play, Clock, BookOpen, Star, Search, CheckCircleIcon, Video, FileText, PlayCircle, LucideIcon, UserCheck, Heart, ShoppingCart } from 'lucide-react';
import Cookies from 'js-cookie';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { CourseDetailView } from './CourseDetails';
import { useCourse } from '../context/CourseContext';
import { toast } from 'react-hot-toast';

// Helper to map icon names to components
const getCourseIcon = (iconName: string | undefined): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'video': Video,
    'file-text': FileText,
    'book-open': BookOpen,
    'play': Play,
    'clock': Clock,
    // Add default mapping or fallback
  };
  
  if (iconName && iconMap[iconName.toLowerCase()]) {
    return iconMap[iconName.toLowerCase()];
  }
  
  return BookOpen; // Default icon
};

interface MyCoursesProps {
  onNavigate?: (page: string) => void;
}

export function MyCourses({ onNavigate }: MyCoursesProps) {
  const { 
    courses, 
    fetchCourses: contextFetchCourses, 
    isLoading: loading, 
    toggleWishlist, 
    addToCart, 
    cartItems, 
    fetchCart 
  } = useCourse();

  const [filter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleWishlist = async (course: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(course);
      // Context will handle the silent re-fetch or we can call it
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
      if (userId) await contextFetchCourses(userId, true);
      toast.success(course.in_wishlist_status ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async (course: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check both backend status and local context sync status
    const inCart = course.in_cart_status || cartItems.some(cartItem => 
      cartItem.cart_course_id === (course.subscription_id || course.id) ||
      cartItem.subscription_id === (course.subscription_id || course.id) ||
      cartItem.subscription_response?.subscription_id === (course.subscription_id || course.id)
    );

    if (inCart) {
      if (onNavigate) {
        onNavigate('cart');
      } else {
        navigate('/cart');
      }
      return;
    }

    try {
      await addToCart(course);
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
      if (userId) await contextFetchCourses(userId, true);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
    if (userId) {
      contextFetchCourses(userId);
      fetchCart(userId);
    }
  }, []);

  const purchasedCourses = courses.filter(c => c.purchase_status === true);
  const availableCourses = courses.filter(c => c.purchase_status !== true);

  const getFilteredPurchasedCourses = () => {
    if (filter === 'all') return purchasedCourses;
    // Mock logic for progress status since it's not strictly in the interface yet or might vary
    if (filter === 'in-progress') return purchasedCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
    if (filter === 'completed') return purchasedCourses.filter(c => (c.progress || 0) === 100);
    return purchasedCourses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
        <p className="text-gray-600">Track your progress and discover new courses to upgrade your skills.</p>
      </div>

      {/* My Courses Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            My Courses
          </h2>
          
          {/* <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            {['all', 'in-progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div> */}
        </div>

        {getFilteredPurchasedCourses().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredPurchasedCourses().map(course => {
              const CourseIcon = getCourseIcon(course.icon);
              return (
                <div key={course.subscription_id} className="group h-full">
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden relative border-b-4 border-b-transparent hover:border-b-indigo-500">
                    {/* Course Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {course.subscription_image_url ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${course.subscription_image_url}`} 
                          alt={course.subscription_name} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors duration-500">
                          <CourseIcon className="h-16 w-16 text-indigo-400/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md uppercase tracking-wide flex items-center gap-1">
                          <CheckCircleIcon className="h-3 w-3" /> Enrolled
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      {/* Badge & Rating */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                          <CourseIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{course.subscription_category || 'COURSE'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-700">{course.average_ratings || 0}</span>
                        </div>
                      </div>

                      {/* Title & Wishlist */}
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {course.subscription_name}
                        </h3>
                        <button 
                          onClick={(e) => handleToggleWishlist(course, e)}
                          className={`p-1.5 rounded-full transition-all duration-300 ${
                            course.in_wishlist_status 
                              ? 'bg-red-50 text-red-500' 
                              : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${course.in_wishlist_status ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed h-[40px]">
                        {course.description}
                      </p>

                      {/* Course Meta */}
                      <div className="flex items-center justify-between gap-4 text-xs text-gray-400 pb-4 mb-2 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Play className="h-3.5 w-3.5" />
                          {course.meta?.videos || 0} Hrs
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          {course.meta?.tests || 0} Tests
                        </div>
                        </div>
                         <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> {course.total_enrollments_count || 0} Students
                        </div>
                      </div>

                      {/* Progress and Stats */}
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <span>{course.progress || 0}% Complete</span>
                          <span>{course.completedLessons || 0}/{course.totalLessons || 0} Chpts</span>
                        </div>
                        <Progress value={course.progress || 0} className="h-2 bg-gray-50 overflow-hidden rounded-full" />
                      </div>

                      {/* Actions */}
                      <Link to={`/learning/${course.id}`} className="w-full">
                        <Button 
                          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 shadow-md shadow-indigo-100 transition-all duration-300 active:scale-95"
                        >
                          <PlayCircle className="h-5 w-5" /> 
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <BookOpen className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Purchased Yet</h3>
             <p className="text-gray-500 max-w-md mx-auto mb-6">Explore our wide range of courses below and start your learning journey today!</p>
             {/* <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
               Browse Courses
             </button> */}
           </div>
        )}
      </div>

      {/* Available Courses Section */}
      {/* Recommended Courses Section */}
      <div className=" mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B] flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-[#4F46E5]" />
            Recommended for You
          </h2>
        </div>

        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableCourses.map(course => {
              const CourseIcon = getCourseIcon(course.icon);
              
              const inCart = course.in_cart_status || cartItems.some(cartItem => 
                cartItem.subscription_id === (course.subscription_id || course.id) || 
                cartItem.cart_course_id === (course.subscription_id || course.id) ||
                cartItem.subscription_response?.subscription_id === (course.subscription_id || course.id)
              );

              return (
                <div key={course.subscription_id || course.id} className="group h-full">
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden relative border-b-4 border-b-transparent hover:border-b-indigo-500">
                    {/* Course Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {course.subscription_image_url ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${course.subscription_image_url}`} 
                          alt={course.subscription_name} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors duration-500">
                          <CourseIcon className="h-16 w-16 text-indigo-400/40" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      {/* Badge & Rating */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100/50">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{course.subscription_category || 'TEST_SERIES'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-700">{course.average_ratings || 0}</span>
                        </div>
                      </div>

                      {/* Title & Wishlist */}
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {course.subscription_name || course.title}
                        </h3>
                        <button 
                          onClick={(e) => handleToggleWishlist(course, e)}
                          className={`p-1.5 rounded-full transition-all duration-300 ${
                            course.in_wishlist_status 
                              ? 'bg-red-50 text-red-500' 
                              : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${course.in_wishlist_status ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed h-[40px]">
                        {course.description}
                      </p>

                      {/* Course Meta */}
                      <div className="flex items-center justify-between gap-4 text-xs text-gray-400 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Play className="h-3.5 w-3.5" />
                          {course.meta?.videos || 0} Hrs
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          {course.meta?.tests || 0} Tests
                        </div>
                        </div>
                         <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> {course.total_enrollments_count || 0} Students
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mt-4">
                             <span className="text-2xl font-bold">₹{(course.subscription_price - course.default_discount)}</span>
                             <span className="text-sm text-muted-foreground line-through">₹{course.subscription_price}</span>
                             <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                 {Math.round((course.default_discount / course.subscription_price) * 100)}% OFF
                             </span>
                         </div>
                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <Button 
                          variant="outline"
                          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-11 transition-all duration-300"
                          onClick={() => {
                            setSelectedCourseForModal(course.subscription_id || course.id);
                            setIsModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          className={`${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl h-11 shadow-md flex items-center justify-center gap-2 transition-all duration-300 active:scale-95`}
                          onClick={(e) => handleAddToCart(course, e)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {inCart ? 'Go to Cart' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No More Courses Available</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">We're constantly adding new content. Check back soon for more exciting courses!</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
          {selectedCourseForModal && (
            <CourseDetailView 
              courseId={selectedCourseForModal} 
              userId={localStorage.getItem('user_id') || Cookies.get('user_id') || '100113'} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
