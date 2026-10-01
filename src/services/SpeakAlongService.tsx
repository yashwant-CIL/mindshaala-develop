
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

    END_SPEAK_ALONG_SESSION: async (session_id: number) => {
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.SPEAK_ALONG.END_SPEAK_ALONG_SESSION(session_id));
            console.log("SpeakAlong End-Session", response.data);
            return response.data;
        } catch (error) {
            console.error("Error ending Speak Along session:", error);
            throw error;
        }
    },

    GET_SPEAK_ALONG_NOTES: async (viva_q_id: number | string) => {
        try {
            const endpoint = API_ENDPOINT.SPEAK_ALONG.SPEAK_ALONG_NOTES(viva_q_id);
            console.log("Fetching Speak Along notes from endpoint:", endpoint);

            const response = await axiosMindShaalaClient.get(endpoint, {
                responseType: 'blob'
            });

            const blob = response.data;
            if (blob && blob instanceof Blob) {
                // If content type is JSON, parse and return JSON object
                const contentType = blob.type || '';
                if (contentType.includes('application/json')) {
                    const text = await blob.text();
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        return text;
                    }
                }

                // Read text snippet to check if response is JSON text
                const textSnippet = await blob.text();
                const trimmed = textSnippet.trim();
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    try {
                        return JSON.parse(trimmed);
                    } catch (e) {}
                }

                // Return binary Blob directly for PDF or Image content
                return blob;
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching Speak Along notes:", error);
            throw error;
        }
    },

};
