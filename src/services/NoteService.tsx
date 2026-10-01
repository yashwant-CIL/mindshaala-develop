import { API_ENDPOINT } from "../core/api/ApiEndpoint";
import { axiosMindShaalaClient } from "../core/api/AxiosClient";

export const NoteService = {
  GET_NOTES: async (userId: number | string, subjectId: number | string, chapterId: number | string) => {
    try {
      const endpoint = API_ENDPOINT.NOTES.FETCH_NOTES(userId, subjectId, chapterId);
      console.log("Fetching notes from endpoint:", endpoint);

      const response = await axiosMindShaalaClient.get(endpoint, {
        responseType: 'blob'
      });

      const blob = response.data;
      if (blob && blob instanceof Blob) {
        // If content type is JSON, parse and return JSON object
        const contentType = blob.type || '';
        if (contentType.includes('application/json')) {
          const text = await blob.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            return text;
          }
        }

        // Read text snippet to check if response is JSON text
        const textSnippet = await blob.text();
        const trimmed = textSnippet.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            return JSON.parse(trimmed);
          } catch (e) {}
        }

        // Return binary Blob directly for PDF or Image content
        return blob;
      }

      return response.data;
    } catch (error) {
      console.error("Error in NoteService.GET_NOTES:", error);
      throw error;
    }
  },
};