import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient, { axiosVoiceClient } from "../core/api/AxiosClient";
import Cookies from "js-cookie";

export const ConceptualVivaService = {
    getAllSubjects: async (subscriptionId: number | string | undefined) => {
        try {
            if (!subscriptionId || subscriptionId === "undefined" || subscriptionId === "null") {
                console.error("Invalid subscriptionId received in the CourseService:", subscriptionId);
                throw new Error(`subscriptionId ID not found or Invalid: ${subscriptionId}`);
                //console.log(`ConceptualVivaService.getAllCourses called with userId:${userId} type: ${typeof userId}`);
            }
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_SUBJECTS(subscriptionId));
            console.log("Fetched subjects:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching subjects:", error);
            throw error;
        }
    },

    getAllChapters: async (subjectId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_CHAPTERS(subjectId));
            console.log("Fetched chapters:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch chapters", error);
            throw error;
        }
    },

    getAllTopics: async (chapterId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_ALL_TOPICS(chapterId));
            console.log("Fetched topics:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch topics", error);
            throw error;
        }
    },

    startConceptualViva: async (payload: any) => {
        try {
            const response = await axiosVoiceClient.post(API_ENDPOINT.CONCEPTUAL_VIVA.START_CONCEPTUAL_VIVA, payload);
            console.log("Started Conceptual Viva:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Failed to start Conceptual Viva", error);
            console.log("Error details:", error.response?.data || error.message);
            throw error;
        }
    },

    submitConceptualAnswer: async (payload: any) => {
        if (payload instanceof FormData) {
            console.log("Conceptual Viva Answer Payload (FormData):", Array.from(payload.entries()));
        } else {
            console.log("Conceptual Viva Answer Payload:", payload);
        }
        try {
            const response = await axiosVoiceClient.post(API_ENDPOINT.CONCEPTUAL_VIVA.SUBMIT_CONCEPTUAL_ANSWER, payload);
            console.log("Conceptual Viva Answer Submitted", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to Submt the Answer", error);
            throw error;
        }
    },

    endConceptualViva: async (payload: { session_id: string | number }) => {
        console.log("Conceptual Viva End Payload", payload);
        try {
            const response = await axiosVoiceClient.post(API_ENDPOINT.CONCEPTUAL_VIVA.END_CONCEPTUAL_VIVA, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("Conceptual Viva Ended", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to end the conceptual viva session", error);
            throw error;
        }
    },

    getConceptualVivaResult: async (sessionId: string | number, userId: string | number | undefined) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_CONCEPTUAL_VIVA_RESULT(sessionId, userId));
            console.log(`Conceptual Viva Result for session ${sessionId}`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch the result for sessionid ${sessionId}`, error);
            throw error;
        }
    },

    getConceptualVivaHistory: async (userId: string | number | undefined, subscription_id: number | string ) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_CONCEPTUAL_VIVA_HISTORY(userId, subscription_id));
            console.log("Conceptual Viva History", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva history", error);
            throw error;
        }
    },

    getConceptualVivaSolution: async (userId: string | number | undefined) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.GET_CONCEPTUAL_VIVA_SOLUTION(userId));
            console.log("Conceptual Viva Solution", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva solution", error);
            throw error;
        }
    },

    startConceptualVivaSession: async (payload: any) => {
        if (payload instanceof FormData) {
            console.log("Conceptual Viva Session Start Payload (FormData):", Array.from(payload.entries()));
        } else {
            console.log("Conceptual Viva Session Start Payload:", payload);
        }
        try {
            const response = await axiosVoiceClient.post(API_ENDPOINT.CONCEPTUAL_VIVA.START_CONCEPTUAL_VIVA_SESSION, payload);
            console.log("Conceptual Viva Session Started", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to start the conceptual viva session", error);
            throw error;
        }
    },


    /*Dashboard Services*/

    getConceptualDashboardCards: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_CARDS(userId, subscriptionId));
            console.log("Conceptual Viva Dashboard Cards", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva dashboard cards", error);
            throw error;
        }
    },
    getConceptualDashboardWeakChapters: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_WEAK_CHAPTERS(userId, subscriptionId));
            console.log("Conceptual Viva Dashboard Weak Chapters", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva dashboard weak chapters", error);
            throw error;
        }
    },

    getConceptualDashboardWeakTopics: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_WEAK_TOPICS(userId, subscriptionId));
            console.log("Conceptual Viva Dashboard Weak Topics", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva dashboard weak topics", error);
            throw error;
        }
    },
    getConceptualDashboardSubjectRadar: async (userId: string | number, subscriptionId: string | number) => {
        try {
            const response = await axiosVoiceClient.get(API_ENDPOINT.CONCEPTUAL_VIVA.CONCEPTUAL_DASHBOARD_SUBJECT_RADAR(userId, subscriptionId));
            console.log("Conceptual Viva Dashboard Subject Radar", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch the conceptual viva dashboard weak topics", error);
            throw error;
        }
    },

}