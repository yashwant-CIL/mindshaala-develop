
import axiosClient from '../core/api/AxiosClient';
import { API_ENDPOINT } from '../core/api/ApiEndpoint';
import axios from 'axios';

export const SpeakAlongService = {

    /**
     * Fetch all subjects for a subscription
     * @param {string|number} subscriptionId 
     * @returns 
     */
    getAllSubjects: async (subscriptionId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.VIVA.GET_ALL_SUBJECTS(subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Error fetching Viva subjects:", error);
            throw error;
        }
    },

    /**
     * Fetch all chapters for a subject
     * @param {string|number} subjectId 
     * @returns 
     */
    getAllChapters: async (subjectId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.VIVA.GET_ALL_CHAPTERS(subjectId));
            return response.data;
        } catch (error) {
            console.error("Error fetching Viva chapters:", error);
            throw error;
        }
    },



    getSpeakAlongQuestions: async (payload: any) => {
        console.log("SpeakAlong Payload", payload);
        try{
            const response = await axiosClient.get(`http://187.127.141.24:8001/api/v1/viva/questions/fetch`, { params: payload });
            console.log("Viva questions", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch the Viva Questions", error);
            return null;
        }
    }

};
