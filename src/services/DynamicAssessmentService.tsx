import { API_ENDPOINT } from "../core/api/ApiEndpoint"
import { axiosMindShaalaClient } from "../core/api/AxiosClient"


export const DynamicAssessmentService = {
    GET_PATTERN: async (subscription_id?: number | string, pattern_id?: number | string, category?: string) => {
        try{
            const response  = await axiosMindShaalaClient.get(API_ENDPOINT.DYNAMIC_ASSESSMENT.GET_PATTERNS(subscription_id, pattern_id, category))
            console.log("response in dynamic assessment : ", response?.data)
            return response?.data
        }catch(error){
            console.log("error in dynamic assessment : ", error)
        }
    },

    GENERATE_DYNAMIC_ASSESSMENT: async (data: any) => {
        try{
            const response  = await axiosMindShaalaClient.post(API_ENDPOINT.DYNAMIC_ASSESSMENT.GENERATE_DYNAMIC_ASSESSMENT, data)
            console.log("response in dynamic assessment : ", response?.data)
            return response?.data
        }catch(error){
            console.log("error in dynamic assessment : ", error)
        }
    },

    GET_ATTEMPTED_ASSESSMENTS: async (user_id: number,subscription_id: number) => {
        try{
            const response  = await axiosMindShaalaClient.get(API_ENDPOINT.DYNAMIC_ASSESSMENT.GET_ATTEMPTED_ASSESSMENTS(user_id,subscription_id))
            console.log("response in dynamic assessment : ", response?.data)
            return response?.data
        }catch(error){
            console.log("error in dynamic assessment : ", error)
        }
    },

    GET_ATTEMPTED_ASSESSMENT_RESULT: async (user_id:number , subscription_id: number, assessment_id:number) => {
        try{
            const response  = await axiosMindShaalaClient.get(API_ENDPOINT.DYNAMIC_ASSESSMENT.GET_ATTEMPTED_ASSESSMENT_RESULT(user_id , subscription_id, assessment_id))
            console.log("response in dynamic assessment : ", response?.data)
            return response?.data
        }catch(error){
            console.log("error in dynamic assessment : ", error)
        }
    },

}

export const DynamicAssessmetService = DynamicAssessmentService
