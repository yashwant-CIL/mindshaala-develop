import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";


export const  LandingpageService ={

    getCategories: async () =>  {
        try{
            const response = await axiosClient.get(API_ENDPOINT.LANDINGPAGE.CATEGORIES);
            if (!Array.isArray(response.data)) {
                console.warn("Categories API did not return an array:", response.data);
            }
            return Array.isArray(response.data) ? response.data : [];
        }catch(error) {
            console.error("Error fetching categories", error);
            throw error;
        }
    },

    getPopularCourses: async () => {
        try{
            const response  = await axiosClient.get(API_ENDPOINT.LANDINGPAGE.POPULAR_COURSES);
            if (!Array.isArray(response.data)) {
                console.warn("Popular Courses API did not return an array:", response.data);
            }
            return Array.isArray(response.data) ? response.data : [];

        }catch(error){
            console.error("Error fetching popular courses", error);
            throw error;
        }
    },

    getInquiryCourses: async () => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.LANDINGPAGE.INQUIRY_COURSES);
            if (!Array.isArray(response.data)) {
                console.warn("Inquiry Courses API did not return an array:", response.data);
            }
            return Array.isArray(response.data) ? response.data : [];
        }catch(error){
            console.error("Error fetching inquiry courses", error);
            throw error;
        }
    },

    getReviews: async () => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.LANDINGPAGE.REVIEWS);
            if (!Array.isArray(response.data)) {
                console.warn("Reviews API did not return an array:", response.data);
            }
            return Array.isArray(response.data) ? response.data : [];
        }catch(error){
            console.error("Error fetching reviews", error);
            throw error;
        }
    },

}