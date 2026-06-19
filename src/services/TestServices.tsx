import {API_ENDPOINT} from "../core/api/ApiEndpoint";
import axiosClient, { axiosFastApiClient } from "../core/api/AxiosClient";
import Cookies from 'js-cookie';

export interface AvailableTest {
    id: number;
    title: string;
    subject: string;
    topic?: string;
    questionsCount: number;
    duration: number; // mins
    marks: number;
    difficulty: "Easy" | "Medium" | "Hard";

    
    assessment_name?: string;
    assessment_method?: string;
    assessment_level?: string;
    assessment_pattern_id?: number;
    completion_status?: string;
    total_marks?: number;
    total_question?: number;
    total_time?: number;
    instruction_set_id?: number;
    assessment_id?: number;
    // difficulty_level?: string;
}

// Implementation of the service
export const TestService = {
    getMockTests: async (userId: number | string | undefined, subscriptionId: number | string, packageId: number | string): Promise<any[]> => {
        try {
            console.log(`Fetching available tests for user: ${userId}, sub: ${subscriptionId}, pkg: ${packageId}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.MOCK_TESTS(userId, packageId, subscriptionId));
            console.log("Available tests:", response.data);
            return response.data; // Return raw data as requested
        } catch (error) {
            console.error("Error fetching available tests:", error);
            throw error;
        }
    },

    getSubjects: async (subscriptionId: number | string): Promise<any[]> => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.GET_SUBJECTS(subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Error fetching subjects:", error);
            throw error;
        }
    },

    submitUserAnswer: async (payload: any): Promise<any> => {
        try {
            // Replicating ReviewAnswers.jsx behavior: JSON payload with multipart/form-data header
            if (payload.userAnswerImages === null) {
                console.log("Service: Submitting as JSON with Multipart header (ReviewAnswers sync):", payload);
                const response = await axiosClient.post(API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_USER_ANSWER, 
                    payload,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                return response.data;
            }

            // Otherwise use FormData for binary support
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'userAnswerImages' && Array.isArray(value)) {
                        value.forEach(file => formData.append(key, file));
                    } else {
                        formData.append(key, value as any);
                    }
                }
            });

            console.log("Service: Submitting as FormData:", Object.fromEntries(formData.entries()));
            const response = await axiosClient.post(API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_USER_ANSWER, 
                formData
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error("Server Error Details:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                    config: error.config
                });
            } else if (error.request) {
                console.error("No response received from server:", error.request);
            } else {
                console.error("Request setup error:", error.message);
            }
            throw error;
        }
    },

    getChapters: async (subjectId: number | string): Promise<any[]> => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.GET_CHAPTERS(subjectId));
            return response.data;
        } catch (error) {
            console.error("Error fetching chapters:", error);
            throw error;
        }
    },

    getSubjectTests: async (userId: number | string | undefined, packageId: number | string, subjectId: number | string): Promise<any[]> => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.SUBJECT_TESTS(userId, packageId, subjectId));
            console.log("Subject tests:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching subject tests:", error);
            throw error;
        }
    },

    getChapterTests: async (userId: number | string | undefined, packageId: number | string, chapterId: number | string): Promise<any[]> => {
        try {
            // @ts-ignore
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.CHAPTER_TESTS(userId, packageId, chapterId));
            console.log("Chapter tests:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching chapter tests:", error);
            throw error;
        }
    },

    getPyqTests: async (userId: number | string | undefined, packageId: number | string, subjectId: number | string): Promise<any[]> => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.PYQ_TESTS(userId, packageId, subjectId));
            return response.data;
        } catch (error) {
            console.error("Error fetching PYQ tests:", error);
            throw error;
        }
    },


    getTestInstructions: async ( instructionId?: number | string): Promise<any> => {
        try {
            // Mocking the response for now as the endpoint might not exist yet
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.GET_INSTRUCTIONS(instructionId));
            console.log(response.data);
            if(response.data){
                return response.data;
            }
            
            // Simulating API delay and response
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        instructions: [
                            "Ensure you are in a quiet room with good lighting.",
                            "Keep your face visible firmly within the camera frame throughout the session.",
                            "Do not switch tabs or minimize the browser window.",
                            "Use of external devices or headphones is strictly prohibited.",
                            "Stable internet connection is required.",
                            "The session will be auto-submitted if suspicious activity is detected."
                        ],
                        testDetails: {
                            duration: 60,
                            totalQuestions: 30,
                            totalMarks: 100,
                            passingMarks: 40
                        }
                    });
                }, 800);
            });
        } catch (error) {
            console.error("Error fetching instructions:", error);
            throw error;
        }
    },

    getExamDetails: async (assessmentId: number | string, userId: number | string | undefined): Promise<any> => {
        try {
            console.log(`Fetching exam details for assessment: ${assessmentId}, user: ${userId}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.GET_EXAMDETAILS(assessmentId, userId));
            return response.data;
        } catch (error) {
            console.error("Error fetching exam details:", error);
            throw error;
        }
    },

    getSectionDetails: async (userAssId: number | string): Promise<any> => {
        try {
            console.log(`Fetching section details for user assessment: ${userAssId}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.SECTION_DETAILS(userAssId));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching section details:", error);
            throw error;
        }
    },

    getExamQuestions: async (userAssId: number | string): Promise<any> => {
        try {
            console.log(`Fetching exam questions for user assessment: ${userAssId}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.MCQ_EXAM_SCREEN(userAssId));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching exam questions:", error);
            throw error;
        }
    },

    submitExam: async (payload: any): Promise<any> => {
        try {
            console.log(`Submitting section for user assessment`, payload);
            const token = Cookies.get('token') || localStorage.getItem('token');
            console.log(token);
            console.log("Payload", payload);
            // console.log(axiosClient.defaults.baseURL + API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_SECTION);
            const response = await axiosClient.post(API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_EXAM, 
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error submitting section:", error);
            throw error;
        }
    },

    getSubmittedExams: async (userId: number | string | undefined): Promise<any> => {
        try {
            console.log(`Fetching submitted exams for user: ${userId}`);
            const response = await axiosClient.get(API_ENDPOINT.TESTRESULT.ALL_RESULTS(userId));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching submitted exams:", error);
            throw error;
        }
    },

    // Placeholder until real endpoint is available
    getExamResult: async (userAssId: number | string): Promise<any> => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.TESTRESULT.RESULT_DETAILS(userAssId));
            console.log(response.data);
            return response.data;
        }catch(error){
            console.error("Error fetching exam result:", error);
            throw error;
        }
        // return new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve({
        //             status: "success",
        //             data: {
        //                 user_ass_id: userAssId,
        //                 assessment_name: "Mock Assessment Score",
        //                 total_score: 85,
        //                 total_marks: 100,
        //                 accuracy: 85,
        //                 time_taken: 1800, // 30 mins
        //                 total_time: 3600, // 60 mins
        //                 correct_answers: 40,
        //                 incorrect_answers: 5,
        //                 unattempted: 5,
        //                 overall_percentile: 92,
        //                 sections: [
        //                     {
        //                         name: "Physics",
        //                         score: 40,
        //                         total: 50,
        //                         time_taken: 900
        //                     },
        //                     {
        //                         name: "Chemistry",
        //                         score: 45,
        //                         total: 50,
        //                         time_taken: 900
        //                     }
        //                 ]
        //             }
        //         });
        //     }, 1000); // simulate network delay
        // });
    },

    getComplexityDetails: async (userAssId: number | string): Promise<any> => {
        try{
            const response = await axiosClient.get(API_ENDPOINT.TESTRESULT.COMPLEXITY_DETAILS(userAssId));
            console.log(response.data);
            return response.data;
        }catch(error){
            console.error("Error fetching complexity details:", error);
            throw error;
        }
    },

    getTheoryExamQuestions: async (userAssId: number | string): Promise<any> => {
        try {
            console.log(`Fetching exam questions for user assessment: ${userAssId}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.THEORY_EXAM_SCREEN(userAssId));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching exam questions:", error);
            throw error;
        }
    },

    submitTheoryExam: async (payload: any, user_ass_id: number | string): Promise<any> => {
        try {
            console.log(`Submitting section for user assessment`, payload);
            console.log("Payload", payload);
            // console.log(axiosClient.defaults.baseURL + API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_SECTION);
            const response = await axiosClient.post(API_ENDPOINT.AVAILABLE_TESTS.SUBMIT_THEORY_EXAM(user_ass_id), 
                payload
            );
            console.log(response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error("Theory Submission Error Details:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                    config: error.config
                });
            } else if (error.request) {
                console.error("Theory Submission: No response received:", error.request);
            } else {
                console.error("Theory Submission: Request setup error:", error.message);
            }
            throw error;
        }
    },

    getUserAnswer: async (user_answer_id: number | string): Promise<any> => {
        try {
            console.log(`Fetching user answer for user assessment: ${user_answer_id}`);
            const response = await axiosClient.get(API_ENDPOINT.AVAILABLE_TESTS.GET_USER_ANSWER(user_answer_id));
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user answer:", error);
            throw error;
        }
    },

    getTheoryResult: async (user_ass_id: number | string): Promise<any> => {
        try {
            console.log(`Fetching theory result for user assessment: ${user_ass_id}`);
            const response = await axiosFastApiClient.post(API_ENDPOINT.TESTRESULT.THEORY_RESULT_DETAILS, {
                user_ass_id: user_ass_id
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching theory result:", error);
            throw error;
        }
    },
 
};

export interface CustomTest {
    
}