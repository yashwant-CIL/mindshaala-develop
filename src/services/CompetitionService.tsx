import React from "react";
import axiosClient, { axiosMindShaalaClient } from "../core/api/AxiosClient";
import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import Cookies from "js-cookie";


export const CompetitionService = {

    /**
     * Dashboard APIS
     * @returns 
     */



    /**
     * Fetch all Upcoming competitions
     * @param user_id
     * @param subscription_id 
     * @param module_type
     */
    GetAllUpcomingCompetitions: async (user_id?: string | number, subscription_id?: string | number, module_type?: string | number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_ALL_UPCOMING_COMPETITIONS(user_id || '', subscription_id, module_type));
            console.log("Fetch all competitions",response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching all competitions",error);
            throw error;
        }
    },

    /**
     * Fetch upcoming competitions by filter
     * @param user_id
     * @param subscription_id
     * @param module_type
     */
    GetUpcomingCompetitionsFiltered: async (
        user_id?: string | number,
        subscription_id?: string | number,
        module_type?: string | number
    ) => {
        try {
            const response = await axiosMindShaalaClient.get(
                API_ENDPOINT.COMPETITIONS.GET_UPCOMING_COMPETITIONS_FILTERED(user_id || '', subscription_id, module_type)
            );
            console.log("Fetch filtered upcoming competitions", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching filtered upcoming competitions", error);
            throw error;
        }
    },

    /**
     *Register for the competitions
     */
    RegisterForCompetitions: async (payload: any) => {
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.COMPETITIONS.REGISTER_FOR_COMPETITION,payload);
            console.log("Register for competition",response.data);
            return response.data;
        } catch (error) {
            console.error("Error registering for competition",error);
            throw error;
        }
    },

    GetAllRegisteredCompetitions: async (userId: string | number | undefined) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_REGISTERED_COMPETITIONS(userId));
            console.log("Fetch registered competitions", response.data);
            return response.data;
        }catch(error){
            console.error("Error fetching the registered competitions",error);
            throw error;
        }
    },

    StartCompetition: async (payload: any) => {
        console.log("Start Competition Payload", payload);
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.COMPETITIONS.START_COMPETITION_ASSESSMENT,payload);
            console.log("Assessment Started", response.data);
            return response.data
        }catch(error){
            console.log("Failed to start the competition", error);
            throw error;
        }
    }, 

    SubmitCompetitionAnswer: async (payload: any) => {
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.COMPETITIONS.SUBMIT_COMPETITION_ANSWERS,payload);
            console.log("Answer submitted successfully", response.data);
            return response.data
        }catch(error){
            console.error("Failed to submit the answer of the competition", error);
            throw error;
        }
    },

    EndCompetition: async (payload: any) => {
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.COMPETITIONS.END_COMPETITION_ASSESSMENT,payload);
            console.log("Competition ended successdully ", response.data);
            return response.data
        }catch(error){
            console.error("Failed to end the competition", error);
            throw error;
        }
    },

    GetCompetitionHistory: async (userId?: string | number, moduleType: string = 'GK', subscriptionId?: string | number) => {
        let activeSubId = subscriptionId;
        const upperMod = moduleType.toUpperCase();
        if ((upperMod === 'VIVA' || upperMod === 'TAM') && !activeSubId) {
            const keys = ['subscription_id', 'subscriptionId', 'selectedCourseId', 'course_id'];
            for (const key of keys) {
                const val = typeof window !== 'undefined' ? (localStorage.getItem(key) || Cookies.get(key)) : null;
                if (val) {
                    activeSubId = val;
                    break;
                }
            }
            if (!activeSubId && typeof window !== 'undefined') {
                const objectKeys = ['selectedCourse', 'course', 'user', 'userData', 'userInfo', 'profile'];
                for (const key of objectKeys) {
                    const raw = localStorage.getItem(key) || Cookies.get(key);
                    if (raw) {
                        try {
                            const parsed = JSON.parse(raw);
                            const idVal = parsed?.subscription_id || parsed?.subscriptionId || parsed?.selectedCourseId || parsed?.id;
                            if (idVal) {
                                activeSubId = idVal;
                                break;
                            }
                        } catch {
                            // ignore parse error
                        }
                    }
                }
            }
        }

        console.log("Competition History", userId, moduleType, activeSubId);
        try {
            const response = await axiosMindShaalaClient.get(
                API_ENDPOINT.COMPETITIONS.GET_LIST_COMPETITION_ASSESSMENT(userId, moduleType, activeSubId)
            );
            console.log("Fetch competition history", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching the competition history", error);
            throw error;
        }
    },

    GetCompetitionResult: async (
        moduleTypeOrId: string | number,
        userId?: string | number,
        sessionId?: string | number,
        gkUserAssId?: string | number
    ) => {
        try {
            let modType = String(moduleTypeOrId);
            let uid = userId;
            let sId: string | number | undefined = undefined;
            let gkId: string | number | undefined = undefined;

            const upperMod = modType.toUpperCase();
            const validModules = ['VIVA', 'TAM', 'GK', 'ALL'];

            if (!validModules.includes(upperMod)) {
                // Fallback for legacy single argument call (e.g. competitionId / gk_user_ass_id)
                gkId = moduleTypeOrId;
                modType = 'GK';
            } else {
                modType = upperMod;
                if (upperMod === 'GK') {
                    gkId = gkUserAssId || sessionId;
                } else if (upperMod === 'VIVA' || upperMod === 'TAM') {
                    sId = sessionId || gkUserAssId;
                }
            }

            const response = await axiosMindShaalaClient.get(
                API_ENDPOINT.COMPETITIONS.GET_RESULT_COMPETITION_ASSESSMENT(modType, uid, sId, gkId)
            );
            console.log("Fetch competition result", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching the competition result", error);
            throw error;
        }
    },



    
}