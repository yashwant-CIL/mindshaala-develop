import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { CourseService } from '../services/CourseService';
import Cookies from 'js-cookie';

interface CourseContextType {
    courses: any[];
    selectedCourse: any | null;
    subscriptionId: string | number | null;
    packageId: string | number | null;
    courseId: string | number | null;
    isLoading: boolean;
    error: any;
    selectCourse: (courseId: string | number) => void;
    fetchCourses: (userId: number | string | undefined, silent?: boolean) => Promise<any[]>;
    userAssId: string | number | null;
    setUserAssId: (id: string | number | null) => void;
    wishlistItems: any[];
    cartItems: any[];
    fetchWishlist: (userId: number | string) => Promise<void>;
    fetchCart: (userId: number | string) => Promise<void>;
    toggleWishlist: (course: any) => Promise<void>;
    removeFromWishlist: (course: any) => Promise<void>;
    addToCart: (course: any) => Promise<void>;
    removeFromCart: (cartCourseId: number | string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [userAssId, setUserAssId] = useState<string | number | null>(() => {
        return localStorage.getItem("user_ass_id") || null;
    });
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<any[]>([]);

    const handleSetUserAssId = (id: string | number | null) => {
        setUserAssId(id);
        if (id) {
            localStorage.setItem("user_ass_id", String(id));
        } else {
            localStorage.removeItem("user_ass_id");
        }
    };

    const fetchCourses = useCallback(async (userId: number | string | undefined, silent: boolean = false) => {
        if (!userId) return [];
        if (!silent) setIsLoading(true);
        try {
            const data = await CourseService.getAllCourses(userId);
            const coursesList = data || [];
            setCourses(coursesList);
            
            if (coursesList.length > 0) {
                const purchasedCourses = coursesList.filter((c: any) => c.purchase_status === true || c.purchase_status === 'true');
                const registeredCourses = purchasedCourses.length > 0 ? purchasedCourses : coursesList;

                const storedCourseId = localStorage.getItem("selectedCourseId");

                if (registeredCourses.length === 1) {
                    const singleCourse = registeredCourses[0];
                    const courseIdStr = String(singleCourse.subscription_id || singleCourse.id);
                    setSelectedCourse(singleCourse);
                    localStorage.setItem("selectedCourseId", courseIdStr);
                } else {
                    let courseToSelect = null;
                    if (storedCourseId) {
                        courseToSelect = registeredCourses.find((c: any) => 
                            String(c.subscription_id) === String(storedCourseId) || 
                            String(c.id) === String(storedCourseId)
                        );
                    }

                    if (!courseToSelect) {
                        courseToSelect = registeredCourses[0];
                    }

                    if (courseToSelect) {
                        setSelectedCourse(courseToSelect);
                        localStorage.setItem("selectedCourseId", String(courseToSelect.subscription_id || courseToSelect.id));
                    }
                }
            } else {
                setSelectedCourse(null);
            }
            return coursesList;
        } catch (err) {
            console.error("Error fetching courses", err);
            setError("Failed to load courses");
            return [];
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []); // selectedCourse is actually used here to check if we should auto-select

    const selectCourse = useCallback((courseId: string | number) => {
        // Convert input to string for consistent comparison
        const idStr = String(courseId);
        
        const course = courses.find(c => 
            String(c.subscription_id) === idStr || 
            String(c.id) === idStr
        );
        
        if (course) {
            setSelectedCourse(course);
            localStorage.setItem("selectedCourseId", idStr);
        } else {
             console.warn(`Course with id ${courseId} not found in available courses`, courses);
        }
    }, [courses]);

    // Derived state for easier access
    const subscriptionId = selectedCourse ? (selectedCourse.subscription_id || selectedCourse.id) : null;
    const packageId = selectedCourse ? (selectedCourse.package_id || selectedCourse.subscription_id || selectedCourse.id) : null;
    const courseId = selectedCourse ? (selectedCourse.course_id || selectedCourse.id) : null;

    const fetchWishlist = useCallback(async (userId: number | string) => {
        try {
            const data = await CourseService.getWishlist(userId);
            
            setWishlistItems(data || []);
        } catch (err) {
            console.error("Error fetching wishlist", err);
        }
    }, []);

    const fetchCart = useCallback(async (userId: number | string) => {
        try {
            const data = await CourseService.getCartDetails(userId);
            setCartItems(data || []);
        } catch (err) {
            console.error("Error fetching cart", err);
        }
    }, []);

    const toggleWishlist = useCallback(async (course: any) => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) return;

        try {
            // Check if it's already in wishlist. We assume that if we are calling this from
            // non-wishlist components, the `in_wishlist_status` or presence in `wishlistItems`
            // should determine the action.
            const isInWishlist = course.in_wishlist_status || 
                                wishlistItems.some(item => (item.subscription_id || item.subscription_response?.subscription_id) === (course.subscription_id || course.id));

            if (isInWishlist) {
                const removalId = course.wishlist_id || course.wishlist_course_id || course.id;
                // If it's a wishlist item object, it might have it nested or directly
                await CourseService.removeFromWishlist(removalId);
            } else {
                await CourseService.addToWishlist({
                    user_id: userId,
                    subscription_id: course.subscription_id || course.id
                });
            }
            // Refetch to sync state
            await fetchCourses(userId, true);
            await fetchWishlist(userId);
        } catch (err) {
            console.error("Error toggling wishlist", err);
        }
    }, [wishlistItems, fetchCourses, fetchWishlist]);

    const handleRemoveFromWishlist = useCallback(async (course: any) => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) return;

        try {
            const removalId = course.wishlist_id || course.wishlist_course_id || course.id;
            await CourseService.removeFromWishlist(removalId);
            // Refetch to sync state
            await fetchCourses(userId, true);
            await fetchWishlist(userId);
        } catch (err) {
            console.error("Error removing from wishlist", err);
        }
    }, [fetchCourses, fetchWishlist]);

    const handleAddToCart = useCallback(async (course: any) => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) return;

        try {
            await CourseService.addToCart({
                user_id: userId,
                subscription_id: course.subscription_id || course.id
            });
            await fetchCourses(userId, true);
            await fetchCart(userId);
        } catch (err) {
            console.error("Error adding to cart", err);
        }
    }, [fetchCourses, fetchCart]);

    // Initial data fetch - removed as per user request for strict page-scoped calling
    useEffect(() => {
        // All initial fetches (courses, wishlist, cart) have been moved to page-specific logic
    }, []); 

    const handleRemoveFromCart = useCallback(async (cartCourseId: number | string) => {
        try {
            await CourseService.removeFromCart(cartCourseId);
            const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
            if (userId) {
                await fetchCourses(userId, true);
                await fetchCart(userId);
            }
        } catch (err) {
            console.error("Error removing from cart", err);
        }
    }, [fetchCourses, fetchCart]);

    return (
        <CourseContext.Provider value={{
            courses,
            selectedCourse,
            subscriptionId,
            packageId,
            courseId,
            isLoading,
            error,
            selectCourse,
            fetchCourses,
            userAssId,
            setUserAssId: handleSetUserAssId,
            wishlistItems,
            cartItems,
            fetchWishlist,
            fetchCart,
            toggleWishlist,
            removeFromWishlist: handleRemoveFromWishlist,
            addToCart: handleAddToCart,
            removeFromCart: handleRemoveFromCart
        }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error('useCourse must be used within a CourseProvider');
    }
    return context;
};
