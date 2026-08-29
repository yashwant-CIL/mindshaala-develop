import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import { axiosMindShaalaClient } from "../core/api/AxiosClient";



export const GKService = {

    /**
     * Fetch GK profile data for a user
     * @param user_id 
     * @returns fetchGKProfile 
     */
    fetchGKProfile: async (user_id: number | string | undefined) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.GENERAL_KNOWLEDGE.FETCH_GK_PROFILE(user_id));
            console.log("GK Profile", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching GK Profile:", error);
            throw error;
        }
    },

    /**
     * Update GK profile data for a user
     * @param user_id 
     * @returns updateGKProfile 
     */
    updateGKProfile: async (user_id: number | string | undefined, payload: any) => {
        console.log("payload from service to update the GK Profie", payload);
        
        try {
            const response = await axiosMindShaalaClient.put(API_ENDPOINT.GENERAL_KNOWLEDGE.UPDATE_GK_PROFILE(user_id), payload);
            console.log("GK Profile Updated", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating GK Profile:", error);
            throw error;
        }
    },




    /**
     * Fetch all categories for a GK
     */
    getGKCategories: async () => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.GENERAL_KNOWLEDGE.GK_CATEGORIES);
            console.log("GK ALL Categories", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching GK categories:", error);
            throw error;
        }
    },

    /**
     * Start the GK Assessment
     */
    startGKAssessment: async (payload: any) => {
        // Ensure user_id is passed as a number if it is a numeric string
        const formattedPayload = {
            ...payload,
            user_id: payload.user_id ? Number(payload.user_id) : payload.user_id
        };
        console.log("GK start assessment payload (formatted):", formattedPayload);
        try {
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.GENERAL_KNOWLEDGE.START_GK_ASSESSMENT, formattedPayload);
            console.log("GK Assessment Started", response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error("GK Start Assessment Server Error Details:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            console.error("Error starting GK Assessment:", error);
            throw error;
        }
    },

    endGKAssessment: async (payloadOrAssId: any, payloadObj?: any) => {
        try {
            const body = payloadObj ? payloadObj : payloadOrAssId;
            console.log("GK end assessment payload ", body);
            const response = await axiosMindShaalaClient.post(
                API_ENDPOINT.GENERAL_KNOWLEDGE.END_GK_ASSESSMENT, 
                body
            );
            console.log("GK Assessment Ended", response.data);
            return response.data;
        } catch (error) {
            console.error("Error ending GK Assessment:", error);
            throw error;
        }
    },

    /**
     * Get List of GK Assessments for a user
     * @param user_id
     */
    getListGKAssessment: async (user_id: number | string | undefined) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.GENERAL_KNOWLEDGE.GET_LIST_GK_ASSESSMENT(user_id));
            console.log("List of GK Assessments", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching List of GK Assessments:", error);
            throw error;
        }
    },

    /**
     * Get Result of a GK Assessment
     * @param user_id
     * @param gk_user_ass_id 
     */
    getResultGKAssessment: async (user_id: number | string | undefined , gk_user_ass_id: number | string | undefined) => {
        try {
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.GENERAL_KNOWLEDGE.GET_RESULT_GK_ASSESSMENT(user_id, gk_user_ass_id));
            console.log("Result of GK Assessment", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching Result of GK Assessment:", error);
            throw error;
        }
    },


}