import { API_ENDPOINT } from "../core/api/ApiEndpoint"
import axiosClient, { axiosMindShaalaClient } from "../core/api/AxiosClient"

export const NoteService = {
   GET_NOTES: async (userId: number | string, subjectId: number | string, chapterId: number | string) => {
    const response = await axiosMindShaalaClient.get(API_ENDPOINT.NOTES.FETCH_NOTES(userId,subjectId,chapterId))
    return response.data;
   },

//    ADD_NOTES: async (payload:any) => {
//     const response = await axiosMindShaalaClient.post(API_ENDPOINT.NOTES.ADD_NOTE,payload)
//     return response.data;
//    },

//    DELETE_NOTE: async (noteId:number | string) => {
//     const response = await axiosMindShaalaClient.delete(API_ENDPOINT.NOTES.DELETE_NOTE(noteId))
//     return response.data;
//    }
}