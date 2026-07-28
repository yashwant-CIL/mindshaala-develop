// import { error } from "console";
// import { error } from "console";
import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient, { axiosMindShaalaClient } from "../core/api/AxiosClient";


export const AITutorService = {
    GetAllSubjects: async (subscriptionId : number | string | null) => {
        try{
            if(!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null'){
                console.error("Invalid subscription received in AI Tutor Service:", subscriptionId);
                throw new Error(`subscription ID not found or invalid: ${subscriptionId}`);
            }
            const response = await axiosClient.get(API_ENDPOINT.AI_TUTOR.GET_ALL_SUBJECTS(subscriptionId));
            console.log("Fetched AI Tutor subjects:", response.data);
            return response.data;
        }catch(error){
            console.error("Error fetching AI Tutor subjects", error);
            throw error;
        }
    },
    GetAllChapters: async (subjectId: string | number) => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.AI_TUTOR.GET_ALL_CHAPTERS(subjectId));
            console.log("Fetched AI Tutor subjects:" ,response.data);
            return response.data
        }catch(error){
            console.error("Failed to fetch the AI Tutor chapter");
            throw error;
        }

    },

    GetAllTopics: async (subjectId: string| number) => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.AI_TUTOR.GET_ALL_TOPICS(subjectId));
            console.log("Fetched AI Tutor topics", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch AI Tutor topics", error);
            throw error;
        }
    },

    DashboardCards: async (userId: string| number , subscriptionId: string | number) => {
        try{
            if(!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null'){
                console.error("Invalid subscription received in AI Tutor Service:", subscriptionId);
                throw new Error(`subscription ID not found or invalid: ${subscriptionId}`);
            }
            if(!userId || userId === 'undefined' || userId === 'null'){
                console.error("Invalid user received in AI Tutor Service:", userId);
                throw new Error(`user ID not found or invalid: ${userId}`);
            }
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_DASHBOARD_CARDS(subscriptionId,userId));
            console.log('Fetched AI Tutor dashboard cards :', response.data);
            return response;
        }catch(error){
            console.error("Failed to fetch the AI Tutor dashboard cards", error);
            throw error;
        }
    },

    DashboardWeakChapters: async (userId: string | number , subscriptionId: string | number) => {
        try{
            if(!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null'){
                console.error("Invalid subscription received in AI Tutor Service:", subscriptionId);
                throw new Error(`subscription ID not found or invalid: ${subscriptionId}`);
            }
            if(!userId || userId === 'undefined' || userId === 'null'){
                console.error("Invalid user received in AI Tutor Service:", userId);
                throw new Error(`user ID not found or invalid: ${userId}`);
            }
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_DASHBOARD_WEAK_CHAPTERS(userId, subscriptionId));
            console.log("Fetched AI Tutor dashboard weak chapters", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch AI Tutor dashboard weak chapters", error);
            throw error;
        }
    },

    DashboardWeakTopics: async (userId: string| number, subscriptionId: string | number) => {
        try{
            if(!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null'){
                console.error("Invalid subscription received in AI Tutor Service:", subscriptionId);
                throw new Error(`subscription ID not found or invalid: ${subscriptionId}`);
            }
            if(!userId || userId === 'undefined' || userId === 'null'){
                console.error("Invalid user received in AI Tutor Service:", userId);
                throw new Error(`user ID not found or invalid: ${userId}`);
            }
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_DASHBOARD_WEAK_TOPICS(userId, subscriptionId));
            console.log("Fetched AI Tutor dashboard weak topics", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch the AI Tutor Dashboard Weak topics", error);
            throw error;
        }
    },

    DashboardSubjectRadar: async (userId: string | number, subscriptionId: string| number) => {
        try{

            if(!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null'){
                console.error("Invalid subscription received in AI tutor Service", subscriptionId);
                throw new Error(`Subscription ID not found or invalid: ${subscriptionId}`);
            }
            if(!userId || userId === 'undefined' || userId === 'null'){
                console.error("Invalid user received in AI Tutor Service", userId);
                throw new Error(`User ID not found or Invalid: ${userId}`);
            }
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_DASHBOARD_SUBJECT_RADAR(userId, subscriptionId));
            console.log("Fetched AI Tutor dashboard subject radar", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch the AI Tutor dashboard subject radar", error);
            throw error;
        }
    },

    StartAITutorSession: async (payload: any) => {
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.AI_TUTOR.AI_TUTOR_START, payload, {
                headers:{
                    'Content-Type': 'application/json',
                }
            });
            console.log("Started AI Tutor Session", response.data);
            return response.data;
        }catch(error: any){
            console.error("Failed to start AI tutor Session", error);
            throw error;
        }
    },

    SubmitAITutorAnswer: async (payload: any) => {
        try{
            let sessionId = '';
            if(payload instanceof FormData){
                sessionId = String(payload.get("session_id") || '');
            } else if (payload && typeof payload === 'object'){
                sessionId = String(payload.session_id || '');
            }
            
             const url = sessionId
                ? `${API_ENDPOINT.AI_TUTOR.AI_TUTOR_SUBMIT_ANSWER}?session_id=${sessionId}`
                : API_ENDPOINT.AI_TUTOR.AI_TUTOR_SUBMIT_ANSWER;

            const response = await axiosMindShaalaClient.post(url, payload);
            // const response = await axiosMindShaalaClient.post(API_ENDPOINT.AI_TUTOR.AI_TUTOR_SUBMIT_ANSWER, payload);
            console.log("AI Tutor question Answer Submitted", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to submit AI Tutor question ",error);
            throw error;
        }
    },

    EndAITutorSession: async (payload: {session_id: string | number}) => {
        try{
            const url = `${API_ENDPOINT.AI_TUTOR.AI_TUTOR_END}?session_id=${payload.session_id}`
            const response = await axiosMindShaalaClient.post(url , {}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("AI Tutor Session Ended ", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to end AI Tutor session", error);
            throw error;
        }
    },
    
    GetAITutorHistory: async (userId: string| number, subscriptionId: string|number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_HISTORY(userId,subscriptionId));
            console.log("Fetch AI Tutor History ",response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch the AI Tutor History",error);
            throw error;
        }
    },

    GetAITutorResult: async (sessionId: string| number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.AI_TUTOR.AI_TUTOR_RESULT(sessionId));
            console.log("Fetch AI Tutor Session Result", response.data);
            return response.data
        }catch(error){
            console.error("Failed to fetch teh AI Tutor Session Result", error);
            throw error;
        }
    }

}
    