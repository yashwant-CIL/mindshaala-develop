
import axiosClient, { axiosMindShaalaClient } from '../core/api/AxiosClient';
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



    // getSpeakAlongQuestions: async (payload: any) => {
    //     console.log("SpeakAlong Payload", payload);
    //     try{
    //         const response = await axiosMindShaalaClient.get(API_ENDPOINT.SPEAK_ALONG.GET_RANDOM_QUESTIONS, { params: payload });
    //         console.log("Viva questions", response.data);
    //         return response.data;
    //     }catch(error){
    //         console.error("Failed to fetch the Viva Questions", error);
    //         return null;
    //     }
    // },

    // speechToText : async (payload: any) => {
    //     if (payload instanceof FormData) {
    //         console.log("Speech to Text Payload (FormData):", Array.from(payload.entries()));
    //         for (const [key, value] of payload.entries()) {
    //             console.log(`FormData Field -> ${key}:`, value);
    //         }
    //     } else {
    //         console.log("Speech to Text Payload:", payload);
    //     }
    //     try{
    //         const response = await axiosMindShaalaClient.post(API_ENDPOINT.SPEAK_ALONG.SPEECH_TO_TEXT, payload, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         });
    //         console.log("Speech to Text Response:", response.data);
    //         return response.data;
    //     }catch(error){
    //         console.error("Failed to fetch the Speech to Text", error);
    //         return null;
    //     }
    // },

    START_SPEAK_ALONG_SESSION: async (payload: any) => {
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.SPEAK_ALONG.START_SPEAK_ALONG_SESSION, payload);
            console.log("SpeakAlong start-session", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching Speak Along session:", error);
            throw error;
        }
    },

    SUBMIT_SPEAK_ALONG_AUDIO: async (payload: any) => {
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.SPEAK_ALONG.SUBMIT_SPEAK_ALONG_ANSWER, payload);
            console.log("Submit speak-along audio", response.data);
            return response.data;
        } catch (error) {
            console.error("Error submitting Speak Along answer:", error);
            throw error;
        }
    },

    END_SPEAK_ALONG_SESSION: async (payload: any) => {
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.SPEAK_ALONG.END_SPEAK_ALONG_SESSION, payload);
            console.log("SpeakAlong End-Session", response.data);
            return response.data;
        } catch (error) {
            console.error("Error ending Speak Along session:", error);
            throw error;
        }
    },

    GET_SPEAK_ALONG_NOTES: async (viva_q_id: number | string) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.SPEAK_ALONG.SPEAK_ALONG_NOTES(viva_q_id));
            console.log("SpeakAlong Notes", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching Speak Along notes:", error);
            throw error;
        }
    },

};
