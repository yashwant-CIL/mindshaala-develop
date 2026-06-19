import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";

export interface Course {
    id: number;
    title: string;
    description: string;
    purchase_status: boolean;
    price: number;
    original_price?: number; // details.price vs original might vary, assuming simple structure for now or mapping later
    category?: string;
    progress?: number;
    total_lessons?: number;
    completed_lessons?: number;
    image?: string;
    rating?: number;
    reviews?: number;
    is_best_seller?: boolean;
    meta?: {
        videos: number;
        tests: number;
        notes: number;
    };
    in_wishlist_status?: boolean;
    wishlist_course_id?: number;
    in_cart_status?: boolean;
    cart_course_id?: number;
    [key: string]: any;
}

export interface Package {
    package_id: number;
    package_name: string;
    package_price: number;
    final_package_price: number;
    validity: string;
    description: string;
    content_type_data?: {
        content_type_id: number;
        content_type_name: string;
        category_data?: {
            package_access_id: number;
            content_category_name: string;
            enabled_flag: boolean;
            content_count: number;
        }[];
    }[];
}

import Cookies from 'js-cookie';


// const token1 ="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MTkxMTI3NjcyNzYiLCJ0b2tlblZlcnNpb24iOjE3NjY0Njk3NTU3MDQ5NjUzLCJpYXQiOjE3NjY2NDY0MjAsImV4cCI6MzUzMzM5ODA4Mn0.yT_TR6HQhAql-8gxLPsazY56TY7r_5AEhsPKqnfDz74";
// const token = Cookies.get('token');
export const CourseService = {
    getAllCourses: async (userId: number | string | undefined): Promise<Course[]> => {
        try {
            if (!userId || userId === "undefined" || userId === "null") {
                console.error("Invalid userId received in CourseService:", userId);
                throw new Error(`User ID not found or invalid: ${userId}`);
            }
            // console.log(`CourseService.getAllCourses called with userId: ${userId} (type: ${typeof userId})`);
            const response = await axiosClient.get<Course[]>(API_ENDPOINT.COURSE.ALL_COURSES(userId));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching courses", error);
            // console.error("API Error details:", (error as any).response?.data || (error as any).message);
            throw error;
        }
    },

    getPackages: async (subscriptionId: number | string): Promise<Package[]> => {
        try {
            const response = await axiosClient.get<{ package_data: Package[] }>(API_ENDPOINT.COURSE.PACKAGES(subscriptionId));
            return response.data.package_data || [];
        } catch (error) {
            console.error("Error fetching packages", error);
            throw error;
        }
    },

    enroll: async (payload: any) => {
        console.log("Course Enroll Payload", payload);
        try {
            const token = Cookies.get('token');
            const response = await axiosClient.post(API_ENDPOINT.COURSE.ENROLL, payload, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });
            return response;
        } catch (error) {
            console.error("Error enrolling in course", error);
            console.error("API Error details:", (error as any).response?.data || (error as any).message);
            throw error;
        }
    },

    addToCart: async (payload: any) => {
        try {
            const token = Cookies.get('token');
            const response = await axiosClient.post(API_ENDPOINT.CART.ADD, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error adding to cart", error);
            throw error;
        }
    },

    getCartDetails: async (userId: number | string) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.CART.GET_CART_DETAILS(userId));
            console.log("Cart details:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error getting cart details", error);
            throw error;
        }
    },

    removeFromCart: async (cartCourseId: number | string) => {
        try {
            const token = Cookies.get('token');
            const response = await axiosClient.delete(API_ENDPOINT.CART.REMOVE(cartCourseId), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error removing from cart", error);
            throw error;
        }
    },

    getWishlist: async (userId: number | string) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.WISHLIST.GET_ALL(userId));
            console.log("Wishlist data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching wishlist", error);
            throw error;
        }
    },

    addToWishlist: async (payload: any) => {
         try {
            const token = Cookies.get('token');
            console.log("add to wishlist",payload);
            console.log("token",token);
            const response = await axiosClient.post(API_ENDPOINT.WISHLIST.ADD, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error adding to wishlist", error);
            throw error;
        }
    },

    removeFromWishlist: async (wishlistId: number | string) => {
        try {
             const token = Cookies.get('token');
             const response = await axiosClient.delete(API_ENDPOINT.WISHLIST.REMOVE(wishlistId), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
             });
             return response;
        } catch (error) {
            console.error("Error removing from wishlist", error);
            throw error;
        }
    }
};
