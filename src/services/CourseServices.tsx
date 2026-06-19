// import { API_ENDPOINT } from "../core/api/ApiEndpoint";
// import axiosClient from "../core/api/AxiosClient";

// export interface Course {
//     id: number | string; // Assuming cart_course_id or similar is the ID
//     subscription_id: number | string;
//     package_id: number | string;
//     course_name: string;
//     status: string;
//     user_id: number | string;
//     // Add other fields as per API response
// }

// export const CourseService = {
//     getAllCourses: async (userId: number | string | undefined): Promise<any[]> => {
//         try {
//             console.log("Fetching courses for user:", userId);
//             const response = await axiosClient.get(API_ENDPOINT.COURSE.ALL_COURSES(userId));
//              // Assuming response.data is the array or response.data.data
//              // Based on TestService, it might be response.data directly or mapped.
//              // User said "return raw data" for test service, let's do same here or log it.
//             console.log("Fetched courses:", response.data);
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching courses:", error);
//             throw error;
//         }
//     }
// };
