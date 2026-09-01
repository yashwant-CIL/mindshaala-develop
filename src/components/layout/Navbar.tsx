import { Search, Bell, Heart, ShoppingCart } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getInitials } from '../../utils/userUtils';

interface NavbarProps {
    onNavigate: (page: string) => void;
    activePage: string;
}

export function Navbar({ onNavigate, activePage }: NavbarProps) {
    const { 
        courses, 
        selectedCourse, 
        selectCourse, 
        wishlistItems, 
        cartItems, 
        fetchCourses,
        // fetchWishlist,
        // fetchCart,
        isLoading
    } = useCourse();

    const [username, setUsername] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('username') || Cookies.get('username') || 'User';
        setUsername(storedName);
    }, []);

    // Fullscreen detection to hide main Navbar during exam/fullscreen modes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement
            ));
        };

        handleFullscreenChange();

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Page-scoped fetching for Courses, Wishlist and Cart
    useEffect(() => {
        const userId = localStorage.getItem('user_id') || Cookies.get("user_id");
        if (userId) {
            fetchCourses(userId, true);
        }
    }, [activePage, fetchCourses]);

    const isExamPage = [
        'conceptual-tutor-session',
        'conceptual-viva-session',
        'speakalong-session',
        'ai-tutor-session',
        'gk-exam-runner',
        'theorytest'
    ].includes(activePage);

    if (isFullscreen || isExamPage) {
        return null;
    }

    return (
        <div className="bg-white border-b border-gray-200 pl-14 pr-4 py-2.5 md:px-6 md:py-3 sticky top-0 z-10 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <select 
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none cursor-pointer max-w-[200px] truncate focus:ring-1 focus:ring-blue-500"
                        value={selectedCourse?.subscription_id || ""}
                        onChange={(e) => selectCourse(e.target.value)}
                    >
                        {courses && courses.filter((c: any) => c.purchase_status).length > 0 ? (
                            <>
                                <option value="" disabled>Select a Course</option>
                                {courses.filter((c: any) => c.purchase_status).map((c: any) => (
                                    <option key={c.subscription_id || c.id} value={c.subscription_id || c.id}>
                                        {c.subscription_name}
                                    </option>
                                ))}
                            </>
                        ) : (
                            <option value="">{isLoading ? "Loading..." : "No Purchased Courses"}</option>
                        )}
                    </select>

                    <div className="flex-1 max-w-md relative hidden md:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses, tests, topics..."
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Wishlist */}
                    <button 
                        onClick={() => onNavigate('wishlist')}
                        className={`relative p-2 rounded-md transition-colors ${activePage === 'wishlist' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        title="Wishlist"
                    >
                        <Heart className={`w-5 h-5 ${activePage === 'wishlist' ? 'fill-current' : ''}`} />
                        {wishlistItems.length > 0 && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {wishlistItems.length}
                            </div>
                        )}
                    </button>

                    {/* Cart */}
                    <button 
                        onClick={() => onNavigate('cart')}
                        className={`relative p-2 rounded-md transition-colors ${activePage === 'cart' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        title="Cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartItems.length > 0 && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {cartItems.length}
                            </div>
                        )}
                    </button>

                    {/* Notifications */}
                    <button 
                        onClick={() => onNavigate('notifications')}
                        className={`relative p-2 rounded-md transition-colors ${activePage === 'notifications' ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </button>
                    
                    {/* Profile Link */}
                    <button 
                        onClick={() => onNavigate('settings')}
                        className="flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md border-2 border-white cursor-pointer active:scale-95 transition-all ml-1 shrink-0"
                        title="Profile Settings"
                    >
                        <span>{getInitials(username)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
