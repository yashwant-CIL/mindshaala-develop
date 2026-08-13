import React from "react";
import axiosClient, { axiosMindShaalaClient } from "../core/api/AxiosClient";
import { API_ENDPOINT } from "../core/api/ApiEndpoint";


export const CompetitionService = {

    /**
     * Dashboard APIS
     * @returns 
     */



    /**
     * Fetch all Upcoming competitions
     * @param subscription_id 
     */

    GetAllUpcomingCompetitions: async (subscription_id: string | number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_ALL_UPCOMING_COMPETITIONS(subscription_id));
            console.log("Fetch all competitions",response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching all competitions",error);
            throw error;
        }
    },

    /**
     * Fetch upcoming competitions by filter
     * @param subscription_id 
     * @param module_type 
     */
    GetUpcomingCompetitionsFiltered: async (subscription_id: string | number, module_type: string | number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_UPCOMING_COMPETITIONS_FILTERED(subscription_id, module_type));
            console.log("Fetch filtered upcoming competitions", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching filtered upcoming competitions",error);
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
            const response = await axiosMindShaalaClient(API_ENDPOINT.COMPETITIONS.END_COMPETITION_ASSESSMENT,payload);
            console.log("Competition ended successdully ", response.data);
            return response.data
        }catch(error){
            console.error("Failed to end the competition", error);
            throw error;
        }
    },

    GetCompetitionHistory: async (userId: string | number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_LIST_COMPETITION_ASSESSMENT(userId));
            console.log("Fetch competition history", response.data);
            return response.data
        }catch(error){
            console.error("Error fetching the competition history",error);
            throw error;
        }
    },

    GetCompetitionResult: async (competitionId: string | number ) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.COMPETITIONS.GET_RESULT_COMPETITION_ASSESSMENT(competitionId));
            console.log("Fetch competition result", response.data);
            return response.data;
        }catch(error){
            console.error("Error fetching the competition result",error);
            throw error;
        }
    },



    
}