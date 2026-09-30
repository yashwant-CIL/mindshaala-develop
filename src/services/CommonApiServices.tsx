import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";

export const CommonApiServices ={
    GET_ALL_COURSES: async() => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_COURSES)
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    GET_ALL_STANDARDS: async(courseId:string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_STANDARDS(courseId))
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    GET_ALL_SUBJECTS: async(standardId:string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_SUBJECTS(standardId))
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    GET_ALL_CHAPTERS: async(subjectId:string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_CHAPTERS(subjectId))
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    GET_ALL_TOPICS: async(chapterId:string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_TOPICS(chapterId))
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID: async(subscriptionId:string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.COMMON_APIS.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID(subscriptionId))
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}