import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import { axiosMindShaalaClient } from "../core/api/AxiosClient";

const getActiveSubscriptionId = (subId?: string | number) => {
  if (subId !== undefined && subId !== null && subId !== '') return subId;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedCourseId') || 
      localStorage.getItem('subscription_id') || 
      undefined;
  }
  return undefined;
};

export const MapPracticeService = {

    getMasterTools: async () => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.MAP_PRACTICE.GET_MASTER_TOOL);
            console.log("The master tools:",response.data);
            return response.data;
        }catch(error){
            console.log("Error fetching the masters tools", error);
            throw error
        }
    },

        getMapImage: async (imageurl: string) => {
        console.log(' Image URL', imageurl);
        console.log(" API URL", API_ENDPOINT.MAP_PRACTICE.GET_MAP_IMAGE_URL(imageurl));
        try {
            const response = await axiosMindShaalaClient.get(
                API_ENDPOINT.MAP_PRACTICE.GET_MAP_IMAGE_URL(imageurl),
                { responseType: 'blob' }
            );
            // console.log("Fetch Image Url", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching map image URL", error);
            throw error;
        }
    },


    getMapAssessments: async (subscription_id?: string | number) => {
    try {
      const activeSubId = getActiveSubscriptionId(subscription_id);
      const endpoint = typeof API_ENDPOINT.MAP_PRACTICE.GET_ALL_ASSESSMENTS === 'function'
        ? API_ENDPOINT.MAP_PRACTICE.GET_ALL_ASSESSMENTS(activeSubId)
        : (activeSubId 
            ? `${API_ENDPOINT.MAP_PRACTICE.GET_ALL_ASSESSMENTS}?subscription_id=${activeSubId}`
            : API_ENDPOINT.MAP_PRACTICE.GET_ALL_ASSESSMENTS);

      console.log("Fetching map assessments for subscription_id:", activeSubId);
      const response = await axiosMindShaalaClient.get(endpoint);
      console.log("Fetched Assessments: ", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching map assessments:', error);
      throw error;
    }
  },

    startMapAssessment: async (payload: any) => {
    try {
      const activeSubId = getActiveSubscriptionId(payload?.subscription_id);
      const formattedPayload = {
        ...payload,
        ...(activeSubId ? { subscription_id: isNaN(Number(activeSubId)) ? activeSubId : Number(activeSubId) } : {})
      };
      console.log("Starting map assessment with payload:", formattedPayload);
      const response = await axiosMindShaalaClient.post(API_ENDPOINT.MAP_PRACTICE.START_MAP_ASSESSMENT, formattedPayload);
      console.log("Started the assessment:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting map assessment:', error);
      throw error;
    }
  },

    submitUserAnswer: async ( payload: any) => {
    try {
      const response = await axiosMindShaalaClient.post(API_ENDPOINT.MAP_PRACTICE.SUBMIT_USER_ANSWER, payload);
      console.log("The answer is submitted:",response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting user answer:', error);
      throw error;
    }
  },

    endMapAssessment: async (payload: any) => {
    try {
      const response = await axiosMindShaalaClient.post(API_ENDPOINT.MAP_PRACTICE.END_MAP_ASSESSMENT, payload);
      console.log("Ended the assessment:",response.data);
      return response.data;
    } catch (error) {
      console.error('Error ending map assessment:', error);
      throw error;
    }
  },

    getListAttempts: async (user_id: string | number) => {
    try {
      const response = await axiosMindShaalaClient.get(API_ENDPOINT.MAP_PRACTICE.GET_LIST_ATTEMPTS(user_id));
      console.log("List of attempts:",response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting list attempts:', error);
      throw error;
    }
  },

  //   getResultMapAssessment: async (attempt_id: number) => {
  //   try {
  //     const response = await axiosMindShaalaClient.get(API_ENDPOINT.MAP_PRACTICE.GET_RESULT_MAP_ASSESSMENT(attempt_id));
  //     console.log("Result of map assessment:",response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error getting result map assessment:', error);
  //     throw error;
  //   }
  // },

    getAttemptedQuestionsByAttemptId: async (attempt_id: number) => {
    try {
      const response = await axiosMindShaalaClient.get(API_ENDPOINT.MAP_PRACTICE.GET_ATTEMPTED_QUESTIONS_BY_ATTEMPTE_ID(attempt_id));
      console.log("Attempted questions:",response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting attempted questions:', error);
      throw error;
    }
  },
    
}