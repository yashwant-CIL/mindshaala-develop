import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient, { axiosMindShaalaClient } from "../core/api/AxiosClient";
// import Cookies from "js-cookie";

export const AITutorService = {
    getAllSubjects: async (subscriptionId: number | string | undefined) => {
        try {
            if (!subscriptionId || subscriptionId === "undefined" || subscriptionId === "null") {
                console.error("Invalid subscriptionId received in AITutorService:", subscriptionId);
                throw new Error(`subscriptionId ID not found or Invalid: ${subscriptionId}`);
            }
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_SUBJECTS(subscriptionId));
            console.log("Fetched AI Tutor subjects:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching AI Tutor subjects:", error);
            throw error;
        }
    },

    getAllChapters: async (subjectId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_CHAPTERS(subjectId));
            console.log("Fetched AI Tutor chapters:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch AI Tutor chapters", error);
            throw error;
        }
    },

    getAllTopics: async (chapterId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_TOPICS(chapterId));
            console.log("Fetched AI Tutor topics:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch AI Tutor topics", error);
            throw error;
        }
    },

    startAITutorSession: async (payload: any) => {
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.AI_TUTOR.AI_TUTOR_START, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("Started AI Tutor Viva:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Failed to start AI Tutor Viva", error);
            throw error;
        }
    },

    submitAITutorAnswer: async (payload: any) => {
        try {
            let sessionId = '';
            if (payload instanceof FormData) {
                sessionId = String(payload.get('session_id') || '');
            } else if (payload && typeof payload === 'object') {
                sessionId = String(payload.session_id || '');
            }

            const url = sessionId
                ? `${API_ENDPOINT.AI_TUTOR.AI_TUTOR_SUBMIT_ANSWER}?session_id=${sessionId}`
                : API_ENDPOINT.AI_TUTOR.AI_TUTOR_SUBMIT_ANSWER;

            const response = await axiosMindShaalaClient.post(url, payload);
            console.log("AI Tutor Viva Answer Submitted", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to submit AI Tutor Answer", error);
            throw error;
        }
    },

    endAITutorSession: async (payload: { session_id: string | number }) => {
        try {
            const url = `${API_ENDPOINT.AI_TUTOR.AI_TUTOR_END}?session_id=${payload.session_id}`;
            const response = await axiosMindShaalaClient.post(url, {}, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("AI Tutor Viva Ended", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to end the AI Tutor viva session", error);
            throw error;
        }
    },

    getAITutorResult: async (sessionId: string | number) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_RESULT(sessionId));
            console.log(`AI Tutor Viva Result for session ${sessionId}`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch the AI Tutor result for sessionid ${sessionId}`, error);
            throw error;
        }
    },

    getAITutorHistory: async (userId: string | number | undefined, subscription_id: number | string ) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_HISTORY(userId, subscription_id));
            console.log("AI Tutor Viva History", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor viva history", error);
            throw error;
        }
    },

    getAITutorSolutions: async (userId: string | number | undefined) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_CONCEPTUAL_VIVA_SOLUTION(userId));
            console.log("AI Tutor Viva Solution", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor viva solution", error);
            throw error;
        }
    },

    // startConceptualVivaSession: async (payload: any) => {
    //     try {
    //         const response = await axiosMindShaalaClient.post(API_ENDPOINT.CONCEPTUAL_VIVA.START_CONCEPTUAL_VIVA_SESSION, payload);
    //         console.log("AI Tutor Viva Session Started", response.data);
    //         return response.data;
    //     } catch (error) {
    //         console.error("Failed to start the AI Tutor viva session", error);
    //         throw error;
    //     }
    // },

    getAITutorDashboardCards: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_CARDS(userId, subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor dashboard cards", error);
            throw error;
        }
    },

    getAITutorDashboardWeakChapters: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_WEAK_CHAPTERS(userId, subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor dashboard weak chapters", error);
            throw error;
        }
    },

    getAITutorDashboardWeakTopics: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_WEAK_TOPICS(userId, subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor dashboard weak topics", error);
            throw error;
        }
    },

    getAITutorDashboardSubjectRadar: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_SUBJECT_RADAR(userId, subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the AI Tutor dashboard subject radar", error);
            throw error;
        }
    },
}
