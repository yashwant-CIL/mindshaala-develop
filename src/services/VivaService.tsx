
import axiosClient, { axiosMindShaalaClient } from '../core/api/AxiosClient';
import { API_ENDPOINT } from '../core/api/ApiEndpoint';
// import axios from 'axios';
// import toast from 'react-hot-toast';

export const VivaService = {

    /**
     * Fetch all subjects for a subscription
     * @param {string|number} subscriptionId 
     * @returns 
     */
    getAllSubjects: async (subscriptionId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.VIVA.GET_ALL_SUBJECTS(subscriptionId));
            return response.data;
        } catch (error) {
            console.error("Error fetching Viva subjects:", error);
            throw error;
        }
    },

    /**
     * Fetch all chapters for a subject
     * @param {string|number} subjectId 
     * @returns 
     */
    getAllChapters: async (subjectId: string | number) => {
        try {
            const response = await axiosClient.get(API_ENDPOINT.VIVA.GET_ALL_CHAPTERS(subjectId));
            return response.data;
        } catch (error) {
            console.error("Error fetching Viva chapters:", error);
            throw error;
        }
    },

    /**
     * Start a Viva Session
     * @param {Object} payload { user_id, course_id, subject_id, chapter_id }
     * @returns 
     */
    startViva: async (payload: any) => {
        try {
            // Using generic endpoint as per ApiEndpoint definition
            // Note: ApiEndpoint.VIVA.START_VIVA should be defined as '/api/v1/cil/viva/start' or similar relative path
            // The AxiosClient base URL will handle the domain.
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.VIVA.START_VIVA, payload);
            // const response  = await axios.post("http://187.127.141.24:8001/api/v1/viva/start-viva", payload);
            return response;
        } catch (error:any) {
            console.error("Error starting Viva session:", error);
            // toast.error(error.response.data.message);
            throw error;
        }
    },
    /**
     * Submit an answer for a question
     * @param {FormData} formData 
     * @returns 
     */
    submitAnswer: async (formData: FormData) => {
        // Log entries to see content
        console.log("Viva's Form Data:", Array.from(formData.entries()));
        try {
            // Using hardcoded URL as requested/planned for consistency
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.VIVA.SUBMIT_ANSWER,formData,{headers:{'Content-Type': 'multipart/form-data'}})
            // const response = await axios.post("http://187.127.141.24:8001/api/v1/viva/submit_answer", formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // });
            console.log("Viva's Submit Answer Response:", response.data);
            return response;
        } catch (error) {
            console.error("Error submitting answer:", error);
            
            throw error;
        }
    },

    /**
     * End the Viva Session
     * @param {Object} payload { session_id }
     * @returns 
     */
    endViva: async (session_id: any, module_type: string = 'VIVA') => {
        console.log("Viva's End Payload", { module_type: module_type || 'VIVA', session_id });
        try {
            const formattedSessionId = Math.floor(Number(session_id));
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.VIVA.END_VIVA, {
                module_type: module_type || 'VIVA',
                session_id: formattedSessionId
            });
            return response;
        } catch (error) {
            console.error("Error ending Viva session:", error);
            throw error;
        }
    },

    /**
     * Get Viva History for a user
     * @param {string|number} userId 
     * @returns 
     */
    getVivaHistory: async (userId: string | number| undefined,subscription_id: string | number | undefined) => {
        console.log("Viva's User ID", userId);
        try {
            // Placeholder endpoint - replace with actual when available
            // const response = await axiosClient.get(`http://187.127.141.24:8001/api/v1/viva/viva-results?user_id=${userId}`);
            // const response = await axiosClient.get(`http://187.127.141.24:8001/api/v1/viva/viva-results?user_id=${userId}`);
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.VIVA.GET_VIVA_HISTORY(userId, subscription_id));
            console.log("Viva's History Response:", response.data);
            return response.data;
            
            // Mock Data for UI Development until API is ready
            // return [
            //     {
            //         session_id: "sess_001",
            //         exam_name: "Physics - Kinematics",
            //         date: "2024-02-15T10:30:00",
            //         total_marks: 50,
            //         obtained_marks: 42,
            //         percentage: 84,
            //         status: "Completed"
            //     },
            //     {
            //         session_id: "sess_002",
            //         exam_name: "Chemistry - Atomic Structure",
            //         date: "2024-02-14T14:15:00",
            //         total_marks: 40,
            //         obtained_marks: 35,
            //         percentage: 87.5,
            //         status: "Completed"
            //     },
            //      {
            //         session_id: "sess_003",
            //         exam_name: "Computer Fundamentals",
            //         date: "2024-02-10T09:00:00",
            //         total_marks: 30,
            //         obtained_marks: 28,
            //         percentage: 93.3,
            //         status: "Completed"
            //     }
            // ];
        } catch (error) {
            console.error("Error fetching Viva history:", error);
            return [];
        }
    },

    /**
     * Get Detailed Result for a Viva Session
     * @param {string} sessionId 
     * @returns 
     */
    getVivaResult: async (sessionId: string,user_id: string | number | undefined) => {
        console.log("Viva's Session ID", sessionId);
        try {
            // Placeholder endpoint - replace with actual when available
            // const response = await axiosClient.get(`http://187.127.141.24:8001/api/v1/viva/result?session_id=${sessionId}`);
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.VIVA.GET_VIVA_RESULT(sessionId, user_id));
            return response.data;

             // Mock Data for UI Development
            //  return {
            //     session_id: sessionId,
            //     exam_name: "Physics - Kinematics",
            //     date: "2024-02-15T10:30:00",
            //     total_marks: 50,
            //     obtained_marks: 42,
            //     percentage: 84,
            //     student_name: "Rohan Sharma",
            //     questions: [
            //         {
            //             question_id: "q1",
            //             question_text: "Explain Newton's First Law of Motion.",
            //             user_answer: "Newton's first law states that an object will remain at rest or in uniform motion unless acted upon by an external force.",
            //             expected_answer: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
            //             marks_obtained: 9,
            //             total_marks: 10,
            //             feedback: "Excellent explanation. You correctly identified the core concept of inertia.",
            //             status: "Correct"
            //         },
            //         {
            //             question_id: "q2",
            //             question_text: "What is velocity?",
            //             user_answer: "Velocity is speed.",
            //             expected_answer: "Velocity is a vector quantity that refers to the rate at which an object changes its position. It includes both speed and direction.",
            //             marks_obtained: 5,
            //             total_marks: 10,
            //             feedback: "Partially correct. You missed the key distinction that velocity includes direction, making it a vector quantity, whereas speed is scalar.",
            //             status: "Partial"
            //         },
            //         {
            //             question_id: "q3",
            //             question_text: "Define acceleration.",
            //             user_answer: "Acceleration is the rate of change of velocity per unit of time.",
            //             expected_answer: "Acceleration is the rate of change of velocity of an object with respect to time.",
            //             marks_obtained: 10,
            //             total_marks: 10,
            //             feedback: "Perfect definition.",
            //             status: "Correct"
            //         }
            //     ]
            //  };

        } catch (error) {
            console.error("Error fetching Viva result:", error);
            return null;
        }
    },

    /**Dashboard Service */
    getVivaDashboardCards : async (userId: string | number, subscriptionId: number | string) => {
        try{
            // const response = await axiosClient.get(`http://187.127.141.24:8001${API_ENDPOINT.VIVA.VIVA_DASHBOARD_CARDS(userId,subscriptionId)}`);
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.VIVA.VIVA_DASHBOARD_CARDS(userId,subscriptionId));
            console.log("Viva Cards", response.data);
            return response.data

        }catch(error){
            console.error("Error in getting viva cards", error);
            return null;
        }
    },

    //WEAK_AREAS (NEW MINDHSAALA APIS)
    getVivaDashboardSubjectwisePerformance: async (userId: string | number, subscriptionId: string | number) => {
        try{
            // const response = await axiosClient.get(`http://187.127.141.24:8001${API_ENDPOINT.VIVA.VIVA_DASHBOARD_SUBJECTWISE_PERFORMANCE(userId,subscriptionId)}`);
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.VIVA.VIVA_DASHBOARD_SUBJECTWISE_PERFORMANCE(userId,subscriptionId));
            console.log("Subjectwise Performance", response.data);
            return response.data;
        }catch(error){
            console.error("Failed to fetch the Subjectwise Performance", error);
            return null;
        }
    }

};
