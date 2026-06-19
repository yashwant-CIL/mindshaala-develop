import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";

export const AuthService = {
    sendOtp: async (phone: string): Promise<any> => {
        try {
            console.log(`Sending OTP to: ${phone}`);
            // Note: Update payload keys if the API expects `phone_number` or `mobile` instead of `phone`
            const response = await axiosClient.post(API_ENDPOINT.AUTH.SEND_OTP, { mobile_number: phone });
            return response.data;
        } catch (error) {
            console.error("Error sending OTP:", error);
            throw error;
        }
    },

    verifyOtp: async (phone: string, otp: string): Promise<any> => {
        try {
            const numericOtp = parseInt(otp, 10);
            const payload = { "mobile_number": phone, "otp": isNaN(numericOtp) ? otp : numericOtp };
            
            console.log("Verifying OTP with payload:", payload);
            
            const response = await axiosClient.post(API_ENDPOINT.AUTH.VERIFY_OTP, payload);
            console.log("OTP Verification Response:", response.data);
            return response.data;
        } 
        catch (error: any) {
            console.error("Error verifying OTP details:", error.response?.data || error.message);
            throw error;
        }
    },

    registerUser: async (userData: {
        first_name: string,
        last_name: string,
        mobile_number: string,
        email: string,
        role_id: number,
        otp: string | number
    }): Promise<any> => {
        try {
            console.log("Registering user with data:", userData);
            const response = await axiosClient.post(API_ENDPOINT.AUTH.SIGNUP, userData);
            console.log("Registration Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error during registration:", error.response?.data || error.message);
            throw error;
        }
    }
};
