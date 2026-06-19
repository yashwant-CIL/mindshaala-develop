import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";
import Cookies from "js-cookie";

export interface SolutionQuestion {
    id: string | number;
    que: string;
    que_diag: string[];
    options: string[];
    options_diag: (string | null)[];
    user_answer: string | null;
    answer_remark: string | null;
    correct_option: string;
    answer_description: string;
    marks: number;
    attempt_status: string;
}

export interface SectionSolutions {
    id: string | number;
    name: string;
    questions: SolutionQuestion[];
}

export interface AssessmentSolution {
    assessment_name: string;
    sub_division_details: any[]; // Raw data from API
    sections: SectionSolutions[]; // Mapped data
    total_marks?: number;
    obtained_marks?: number;
    accuracy?: number;
    correct_count?: number;
    incorrect_count?: number;
    unattempted_count?: number;
    time_taken?: number;
}


export const SolutionService = {
    getSolutions: async (user_ass_id: number | string) => {
        try {
            // const token = Cookies.get('token') || localStorage.getItem('token');
            // Use GET request with the ID in the URL as per API_ENDPOINT definition
            const response = await axiosClient.get(API_ENDPOINT.SOLUTIONS.GET_SOLUTIONS(user_ass_id), {
                // headers: {
                //     Authorization: `Bearer ${token}`
                // }
            });
            console.log("SolutionService.getSolutions:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error in SolutionService.getSolutions:", error);
            throw error;
        }
    },

    getTheorySolutions: async (user_ass_id: number | string) => {
        try {
            // const token = Cookies.get('token') || localStorage.getItem('token');
            // Use GET request with the ID in the URL as per API_ENDPOINT definition
            const response = await axiosClient.get(API_ENDPOINT.SOLUTIONS.THEORY_SOLUTIONS(user_ass_id), {
                // headers: {
                //     Authorization: `Bearer ${token}`
                // }
            });
            console.log("SolutionService.getTheorySolutions:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error in SolutionService.getTheorySolutions:", error);
            throw error;
        }
    }
};