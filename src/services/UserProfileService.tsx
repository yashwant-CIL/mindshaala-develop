import axiosClient from "../core/api/AxiosClient";
import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import Cookies from 'js-cookie';


// Helper to recursively convert keys to camelCase
const keysToCamel = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(keysToCamel);
    }
    return Object.keys(obj).reduce((acc: any, key: string) => {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = keysToCamel(obj[key]);
        return acc;
    }, {});
};

export const UserProfileService = {
    getProfile: async (user_id: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.USER_PROFILE.GET_PROFILE(user_id));
            console.log("User profile fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },
    updateProfile: async (user_id: string | number, formData: FormData) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const response = await axiosClient.put(
                API_ENDPOINT.USER_PROFILE.UPDATE_PROFILE(user_id),
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log("User profile updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    addAcademicDetails: async (payload: any) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const response = await axiosClient.post(
                API_ENDPOINT.USER_PROFILE.ADD_ACADEMIC_DETAILS,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("User profile updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    updateAcademicDetails: async (academic_id: string | number, payload: any) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const response = await axiosClient.put(
                API_ENDPOINT.USER_PROFILE.UPDATE_ACADEMIC_DETAILS(academic_id),
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("User profile updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }
}