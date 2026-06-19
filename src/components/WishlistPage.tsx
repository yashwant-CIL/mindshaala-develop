import { ArrowLeft, Heart, ShoppingCart, Play, FileText, UserCheck, Star, BookOpen } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { Button } from './ui/button';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

interface WishlistPageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

export function WishlistPage({ onBack, onNavigate }: WishlistPageProps) {
    const { wishlistItems, fetchWishlist, removeFromWishlist, addToCart, cartItems, fetchCart } = useCourse();

    useEffect(() => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (userId) {
            fetchWishlist(userId);
            fetchCart(userId);
        }
    }, []);

    const handleRemoveFromWishlist = async (item: any) => {
        try {
            await removeFromWishlist(item);
        } catch (error) {
            console.error("Failed to remove from wishlist", error);
        }
    };

    const handleAddToCart = async (item: any) => {
        try {
            await addToCart(item);
        } catch (error) {
            console.error("Failed to add to cart", error);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full font-sans text-[#1E293B]">
            <div className="flex items-center gap-4 mb-8">
                <Button 
                    variant="ghost" 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-bold text-lg">Back</span>
                </Button>
            </div>

            <div className="mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] flex items-center gap-3">
                        <Heart className="h-7 w-7 md:h-8 md:w-8 text-red-600 fill-red-600" />
                        My Wishlist
                    </h1>
                    {wishlistItems.length > 0 && (
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'Course' : 'Courses'}
                        </span>
                    )}
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlistItems.map((item) => {
                            const sub = item.subscription_response;
                            if (!sub) return null;

                            const inCart = cartItems.some(cartItem => 
                                cartItem.cart_course_id === sub.subscription_id ||
                                cartItem.subscription_id === sub.subscription_id ||
                                cartItem.subscription_response?.subscription_id === sub.subscription_id
                            );

                            return (
                                <div key={item.wishlist_course_id || item.id} className="group h-full">
                                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden relative border-b-4 border-b-transparent hover:border-b-indigo-500">
                                        {/* Course Image */}
                                        <div className="relative aspect-[16/9] overflow-hidden">
                                            {sub.subscription_image_url ? (
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${sub.subscription_image_url}`} 
                                                    alt={sub.subscription_name} 
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors duration-500">
                                                    <BookOpen className="h-16 w-16 text-indigo-400/40" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-5 flex flex-col flex-1">
                                            {/* Badge & Rating */}
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100/50">
                                                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{sub.subscription_category || 'COURSE'}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-bold text-gray-700">{sub.average_ratings || 0}</span>
                                                </div>
                                            </div>

                                            {/* Title & Wishlist */}
                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                    {sub.subscription_name}
                                                </h3>
                                                <button 
                                                    onClick={() => handleRemoveFromWishlist(item)}
                                                    className="p-1.5 rounded-full bg-red-50 text-red-500 transition-all duration-300 shadow-sm active:scale-90"
                                                    title="Remove from wishlist"
                                                >
                                                    <Heart className="h-5 w-5 fill-current" />
                                                </button>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed h-[40px]">
                                                {sub.description}
                                            </p>

                                            {/* Course Meta */}
                                            <div className="flex items-center justify-between gap-4 text-xs text-gray-400 pb-4 border-b border-gray-50 mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <Play className="h-3.5 w-3.5" />
                                                        {sub.meta?.videos || 0} Hrs
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        {sub.meta?.tests || 0} Tests
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" /> {sub.total_enrollments_count || 0} Students
                                                </div>
                                            </div>

                                            {/* Price Section */}
                                            <div className="flex items-baseline gap-2 mb-6">
                                                <span className="text-2xl font-bold text-gray-900">₹{sub.subscription_price - sub.default_discount}</span>
                                                <span className="text-sm text-gray-400 line-through">₹{sub.subscription_price}</span>
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                    {Math.round((sub.default_discount / sub.subscription_price) * 100)}% OFF
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <Button 
                                                    variant="outline"
                                                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-11 transition-all duration-300"
                                                    onClick={onBack}
                                                >
                                                    View Courses
                                                </Button>
                                                <Button 
                                                    className={`${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl h-11 shadow-md flex items-center justify-center gap-2 transition-all duration-300 active:scale-95`}
                                                    onClick={() => {
                                                        if (inCart) {
                                                            onNavigate && onNavigate('cart');
                                                        } else {
                                                            handleAddToCart(item);
                                                        }
                                                    }}
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
                    <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">There is no course in your wishlist</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Browse our expert-led courses to find your next learning adventure!</p>
                        <Button 
                            onClick={onBack} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 h-12 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            Browse Courses
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
