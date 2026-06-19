import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { Button } from './ui/button';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

interface CartPageProps {
    onBack: () => void;
}

export function CartPage({ onBack }: CartPageProps) {
    const { cartItems, fetchCart, removeFromCart } = useCourse();

    useEffect(() => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (userId) {
            fetchCart(userId);
        }
    }, []);

    const handleRemove = async (cartId: string | number) => {
        try {
            await removeFromCart(cartId);
        } catch (error) {
            console.error("Failed to remove from cart", error);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full font-sans">
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingCart className="h-7 w-7 md:h-8 md:w-8 text-indigo-600" />
                        My Cart
                    </h1>
                    {cartItems.length > 0 && (
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                        </span>
                    )}
                </div>

                {cartItems.length > 0 ? (
                    <div className="space-y-4 md:max-w-[90%] mx-auto">
                        {cartItems.map((item) => (
                            <div key={item.cart_course_id} className="bg-white p-4 md:p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                                <div className="h-32 w-full sm:w-48 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${item.subscription_response?.subscription_image_url}`} 
                                        alt={item.subscription_response?.subscription_name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{item.subscription_response?.subscription_name}</h3>
                                    <p className="text-gray-500 text-sm mb-3">{item.subscription_response?.description}</p>
                                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                        <span className="text-xl font-black text-indigo-600">₹{item.subscription_response?.subscription_price - item.subscription_response?.default_discount}</span>
                                        <span className="text-sm text-gray-400 line-through">₹{item.subscription_response?.subscription_price}</span>
                                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                            {Math.round((item.subscription_response?.default_discount / item.subscription_response?.subscription_price) * 100)}% OFF
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto flex justify-center">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleRemove(item.cart_course_id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                        title="Remove from cart"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span className="sm:hidden ml-2 font-bold">Remove</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Summary Section Placeholder */}
                        <div className="mt-8 bg-indigo-600 rounded-[28px] p-6 md:p-8 text-white shadow-xl shadow-indigo-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium mb-1">Total Amount</p>
                                    <h2 className="text-3xl md:text-4xl font-black">
                                        ₹{cartItems.reduce((acc, item) => acc + (item.subscription_response?.subscription_price - item.subscription_response?.default_discount), 0)}
                                    </h2>
                                </div>
                                <Button className="w-full md:w-auto bg-white text-indigo-600 hover:bg-indigo-50 font-black px-12 h-14 rounded-2xl text-lg shadow-lg transition-transform active:scale-95">
                                    Checkout Now
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Looks like you haven't added anything to your cart yet. Explore our top courses!</p>
                        <Button 
                            onClick={onBack} 
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold px-10 h-12 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-white"
                        >
                            Browse Courses
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
