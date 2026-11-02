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

    GET_GENERATED_DYNAMIC_ASSESSMENT : async (user_id: number , subscription_id: number) => {
        try{
            const response = await axiosMindShaalaClient.get(API_ENDPOINT.DYNAMIC_ASSESSMENT.GET_GENERATED_DYNAMIC_ASSESSMENTS(user_id,subscription_id));
            console.log("Already generated dynamic assessments", response.data);
            return response.data;
        }catch(error){
            console.log('error in fetching the generated dynamic assessments', error);
            throw error;
        }

    },

    GENERATE_DYNAMIC_ASSESSMENT: async (data: any = {}, queryParams?: any) => {
        try {
            let params = queryParams;
            let body = data;

            // If queryParams is not passed explicitly, but data contains assessment start parameters
            if (!params && data && (data.user_ass_id !== undefined || data.user_ass_div_id !== undefined)) {
                params = { ...data };
                body = {};
            }

            // Build clean request query parameters
            const cleanParams: Record<string, any> = {};
            if (params && typeof params === 'object') {
                Object.entries(params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null && val !== '') {
                        cleanParams[key] = val;
                    }
                });
            }

            const config = Object.keys(cleanParams).length > 0 ? { params: cleanParams } : undefined;
            const response = await axiosMindShaalaClient.post(
                API_ENDPOINT.DYNAMIC_ASSESSMENT.GENERATE_DYNAMIC_ASSESSMENT,
                body || {},
                config
            );
            console.log("response in dynamic assessment : ", response?.data);
            return response?.data;
        } catch (error) {
            console.log("error in dynamic assessment : ", error);
            throw error;
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

    GET_DYNAMIC_ASSESSMENT_SECTION_DETAILS : async (
        user_ass_id?: number | string | { user_ass_id?: number | string; user_ass_div_id?: number | string },
        user_ass_div_id?: number | string
    ) => {
        try{
            let assId: number | string | undefined = undefined;
            let divId: number | string | undefined = undefined;

            if (typeof user_ass_id === 'object' && user_ass_id !== null) {
                assId = user_ass_id.user_ass_id;
                divId = user_ass_id.user_ass_div_id;
            } else {
                assId = user_ass_id;
                divId = user_ass_div_id;
            }

            const endpoint = API_ENDPOINT.DYNAMIC_ASSESSMENT.DYNAMIC_SECTION_DETAILS(assId, divId);
            const response = await axiosMindShaalaClient.get(endpoint);
            console.log("Get the dynamic assessment section details", response.data);
            return response.data;
        }catch(error){
            console.error("Error in fetch assessment section details",error);
             throw error;
        }
    },


    SUBMIT_DYNAMIC_ASSESSMENT: async (payload : any) => {
        console.group("🚀 [DynamicAssessmentService] SUBMIT_DYNAMIC_ASSESSMENT");
        console.log("Submit dynamic assessment payload (Object):", payload);
        try {
            console.log("Submit dynamic assessment payload (JSON):", JSON.stringify(payload, null, 2));
        } catch (e) {
            console.log("Could not stringify payload:", e);
        }
        console.groupEnd();
        try{
            const response = await axiosMindShaalaClient.post(API_ENDPOINT.DYNAMIC_ASSESSMENT.SUBMIT_DYNAMIC_ASSESSMENT,payload);
            console.log("Dynamic Assessment submitted successfully", response.data);
            return response.data
        }catch(error){
            console.error("Fail to submit the dynamic assessment",error);
            throw error;
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
