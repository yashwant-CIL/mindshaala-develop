import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import axiosClient from "../core/api/AxiosClient";

export interface TestResult {
 user_ass_id: number | string;
 user_id: number | string;
 ass_set_id: number | string;
 total_questions: number | string;
 attempted_questions: number | string;
 un_attempted_questions: number | string;
 correct_questions: number | string;
 incorrect_questions: number | string;
 assessment_status: string;
 assessment_name: string;
 obtained_marks: number | string;
 total_marks: number | string;
 percentage: number | string;
 assessment_start_time: string;
 assessment_end_time: string;
 result_status: string;
 total_time: string | number;
 time_taken: string | number;
 assessment_method: string;

}

export interface TestDetails{
    user_ass_id: number | string;
    user_id: number | string;
    ass_set_id: number | string;
    total_questions: number | string;
    attempted_question: number | string;
    un_attempted_question: number | string;
    correct_count: number | string;
    incorrect_count: number | string;
    assessment_status: string;
    assessment_name: string;
    obtained_marks: number | string;
    total_marks: number | string;
    obtained_percentage: number | string;
    assessment_start_time: string;
    assessment_end_time: string;
    result_status: string;
    total_time: string | number;
    time_taken: string | number;
    assessment_method: string;
}


export const TestresultService = {
    getAllTestresults: async (userId: number | string): Promise<TestResult[]> => {
        try{
            if(!userId){
                throw new Error("User ID not found in Cookies");
            }
            const response = await axiosClient.get<TestResult[]>(API_ENDPOINT.TESTRESULT.ALL_RESULTS(userId));
            console.log(response.data);
            return response.data;
        }catch(error){
            console.log(error);
            throw error;
        }
    },

    getTestDetails: async (user_ass_id: number | string): Promise<TestDetails[]> => {
        try{
            if(!user_ass_id){
                throw new Error("User ID not found in Cookies");
            }
            const response = await axiosClient.get<TestDetails[]>(API_ENDPOINT.TESTRESULT.RESULT_DETAILS(user_ass_id));
            console.log(response.data);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    checkCompetitivePaper: async (user_ass_id: number | string) => {
        console.log("user assessment id",user_ass_id);
        try{
            if(!user_ass_id){
                throw new Error("User ID not found in Cookies");
            }
            const response = await axiosClient.post(`http://187.127.141.24:8008/check-competitive-paper?user_ass_id=${user_ass_id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response.data);
            return response.data;
        }catch(error){
            throw error;
        }
    }
}