export const API_ENDPOINT = {
    AUTH: {
        LOGIN: '/api/v2/cil/auth/login',
        SIGNUP: '/api/v2/cil/auth/verifyAndRegister',
        SEND_OTP: '/api/v2/cil/auth/send/otp',
        VERIFY_OTP: '/api/v2/cil/auth/verify/otp',
    },

    LANDINGPAGE: {
        CATEGORIES: "/api/v1/cil/courses/get/all",
        POPULAR_COURSES: "/api/v1/cil/subscription/get/all",
        POPULAR_COURSES_BY_USER: (userId: number | string) => `/api/v1/cil/subscription/get/all/by/status?user_id=${userId}`,
        // INQUIRY: "/api/v1/cil/courseEnquiry/add",
        INQUIRY_COURSES: "/api/v1/cil/courses/get/all",
        REVIEWS: "/api/v1/cil/userReviews/get/all/custom "
    },
 
    COURSE: {
        ALL_COURSES:(userId: number | string) => `/api/v1/cil/subscription/get/all/by/status?user_id=${userId}`,
        PACKAGES:(subscriptionId: number | string) => `/api/v1/cil/package_access/get/all/by/subscription?subscription_id=${subscriptionId}`,
        ENROLL: '/api/v1/cil/user_subscriptions/add',
        // ENROLLED_COURSES: '/api/v1/cil/subscription/get/enrolled-courses',
        // RECOMMENDED_COURSES: '/api/v1/cil/subscription/get/recommended-courses',

    },

       CART: {
        GET_CART_DETAILS: (userId: number | string) => `/api/v1/cil/cartCourses/get/cartCourses/details/by/userId?user_id=${userId}`,
        ADD: '/api/v1/cil/cartCourses/add',
        REMOVE: (cart_course_id: number | string) => `/api/v1/cil/cartCourses/delete?cart_course_id=${cart_course_id}`,
    },

    WISHLIST: {
        GET_ALL: (userId: number | string) => `/api/v1/cil/wishlistCourses/get/all/custom/by/userId?user_id=${userId}`,
        ADD: '/api/v1/cil/wishlistCourses/add',
        REMOVE: (wishlistId: number | string) => `/api/v1/cil/wishlistCourses/delete?wishlist_course_id=${wishlistId}`,
    },

    AVAILABLE_TESTS: {
        GET_SUBJECTS: ( subscription_id: number | string) => `/api/v1/cil/subscription_subject/get/all/by?subscription_id=${subscription_id}`,
        GET_CHAPTERS: (subject_id: number | string) => `/api/v1/cil/chapter/get/all/by/subject_id?subject_id=${subject_id}`,
        MOCK_TESTS: (user_id: number | string | undefined ,package_id: number | string, subscription_id: number | string) => `/api/v1/cil/assessments/get/all/by?package_id=${package_id}&content_type_id=100003&content_category_id=100018&user_id=${user_id}&entity_id=${subscription_id}`,
        SUBJECT_TESTS: (user_id: number | string | undefined ,package_id: number | string, subject_id: number | string) => `/api/v1/cil/assessments/get/all/by?package_id=${package_id}&content_type_id=100003&content_category_id=100019&user_id=${user_id}&entity_id=${subject_id}`,
        CHAPTER_TESTS: (user_id: number | string | undefined ,package_id: number | string, chapter_id: number | string) => `/api/v1/cil/assessments/get/all/by?package_id=${package_id}&content_type_id=100003&content_category_id=100020&user_id=${user_id}&entity_id=${chapter_id}`,
        PYQ_TESTS: (user_id: number | string | undefined ,package_id: number | string, subject_id: number | string) => `/api/v1/cil/assessments/get/all/by?package_id=${package_id}&content_type_id=100003&content_category_id=100021&user_id=${user_id}&entity_id=${subject_id}`,
        GET_INSTRUCTIONS: ( instructionId?: number | string) => `/api/v1/cil/instructions/get/all/by/instruction_set_id?instruction_set_id=${instructionId}`,
        GET_EXAMDETAILS: (assessmentId: number | string, user_id: number | string | undefined) => `/api/v1/cil/assessment/generate?assessmentId=${assessmentId}&userId=${user_id}`,
        SECTION_DETAILS: (user_ass_id: number | string) => `/api/v1/cil/user_ass_div/get/sections_details?user_ass_id=${user_ass_id}`,
        MCQ_EXAM_SCREEN: (user_ass_id: number | string) => `/api/v1/cil/assessment/fetch?user_ass_id=${user_ass_id}`,
        SUBMIT_EXAM: `/api/v1/cil/assessment/submit`,
        // theory exam screen
        THEORY_EXAM_SCREEN: (user_ass_id: number | string) => `/api/v1/cil/assessment/fetch/theory?user_ass_id=${user_ass_id}`,
        SUBMIT_THEORY_EXAM: (user_ass_id: number | string) => `/api/v1/cil/assessment/submit/theory?user_ass_id=${user_ass_id}`,
        GET_USER_ANSWER: (user_answer_id: number | string) => `/api/v1/cil/user-answer-data/get?user_answer_id=${user_answer_id}`,
        SUBMIT_USER_ANSWER: `/api/v1/cil/user-answer-data/save/theory_answer`,
    },

    TESTRESULT: {
        ALL_RESULTS:(userId: number | string | undefined) => `/api/v1/cil/user_assessments/get/all/by/user_id?user_id=${userId}`,
        NEGATIVE_MARKS_UPDATE:(user_ass_id: number | string) => `/check-competitive-paper`,
        RESULT_DETAILS:(user_ass_id: number | string) => `/api/v1/cil/user_assessments/get?user_ass_id=${user_ass_id}`,
        COMPLEXITY_DETAILS:(user_ass_id: number | string) => `/api/v1/cil/exam_module/dashboard/time_vs_accuracy?user_ass_id=${user_ass_id}`,
        THEORY_RESULT_DETAILS: `/generate-evaluation`,
    },

    SOLUTIONS: {
        GET_SOLUTIONS: (user_ass_id: number | string) => `/api/v1/cil/assessment/solution?user_ass_id=${user_ass_id}`,
        THEORY_SOLUTIONS: (user_ass_id: number | string) => `/api/v1/cil/assessment/solution/theory?user_ass_id=${user_ass_id}`,
    },


    VIVA: {
        VIVA_DASHBOARD_CARDS: (user_id: string | number,subscription_id: number | string) => `/api/v1/viva/performance-indicators?user_id=${user_id}&subscription_id=${subscription_id}`,
        VIVA_DASHBOARD_SUBJECTWISE_PERFORMANCE: (user_id: string | number,subscription_id: number | string) => `/api/v1/viva/subject-wise-performance-indicators?user_id=${user_id}&subscription_id=${subscription_id}`, 
        GET_ALL_SUBJECTS: (subscription_id: number | string) => `/api/v1/cil/subscription_subject/get/all/by?subscription_id=${subscription_id}`,
        GET_ALL_CHAPTERS: (subject_id: number | string) => `/api/v1/cil/chapter/get/all/by/subject_id?subject_id=${subject_id}`,
        START_VIVA: '/api/v1/viva/start-viva',
        SUBMIT_ANSWER: 'api/v1/viva/submit-answer',
        END_VIVA: 'api/v1/viva/end',
    },

    CONCEPTUAL_VIVA: {
        CONCEPTUAL_DASHBOARD_CARDS: (user_id: number | string,subscription_id: number | string) => `/api/v1/topic-assessment/dashboard/cards?user_id=${user_id}&subscription_id=${subscription_id}`,
        CONCEPTUAL_DASHBOARD_WEAK_CHAPTERS:(user_id: number | string,subscription_id: number | string) => `/api/v1/topic-assessment/dashboard/weak-chapters?user_id=${user_id}&subscription_id=${subscription_id}`,
        CONCEPTUAL_DASHBOARD_WEAK_TOPICS:(user_id: number | string,subscription_id: number | string) => `/api/v1/topic-assessment/dashboard/weak-topics?user_id=${user_id}&subscription_id=${subscription_id}`,
        CONCEPTUAL_DASHBOARD_SUBJECT_RADAR:(user_id: number | string,subscription_id: number | string) => `/api/v1/topic-assessment/dashboard/subject-radar?user_id=${user_id}&subscription_id=${subscription_id}`,
        GET_ALL_SUBJECTS: (subscription_id: number | string) => `/api/v1/cil/subscription_subject/get/all/by?subscription_id=${subscription_id}`,
        GET_ALL_CHAPTERS: (subject_id: number | string) => `/api/v1/cil/chapter/get/all/by/subject_id?subject_id=${subject_id}`,
        GET_ALL_TOPICS: (chapter_id: number | string) => `/api/v1/cil/topics/get/by/chapter_id?chapter_id=${chapter_id}`,
        START_CONCEPTUAL_VIVA: '/api/v1/topic-assessment/start',
        SUBMIT_CONCEPTUAL_ANSWER: 'api/v1/topic-assessment/submit-answer',
        END_CONCEPTUAL_VIVA: 'api/v1/topic-assessment/end',
        GET_CONCEPTUAL_VIVA_HISTORY: (user_id: number | string | undefined, subscription_id: string | number | undefined) => `/api/v1/topic-assessment/user-sessions?user_id=${user_id}&subscription_id=${subscription_id}`,
        GET_CONCEPTUAL_VIVA_RESULT: (session_id: number | string, user_id: number | string | undefined) => `/api/v1/topic-assessment/report?session_id=${session_id}&user_id=${user_id}`,
        GET_CONCEPTUAL_VIVA_SOLUTION: (userId: number | string | undefined) => `/api/v1/topic-assessment/user-question-history?user_id=${userId}`,
        START_CONCEPTUAL_VIVA_SESSION: '/api/v1/topic-assessment/start-viva-session',
    },

     GENERAL_KNOWLEDGE: {

        //GK Dashboard ENDPOINTS
        GK_DASHBOARD_CARDS: `/api/v1/gk/dashboard/cards`,
        GK_DASHBOARD_SUBJECTWISE_PERFORMANCE: `/api/v1/gk/dashboard/subject-wise-performance-indicators`,
        GK_DASHBOARD_WEAK_CHAPTERS: `/api/v1/gk/dashboard/weak-chapters`,
        GK_DASHBOARD_WEAK_TOPICS: `/api/v1/gk/dashboard/weak-topics`,
        GK_DASHBOARD_SUBJECT_RADAR: `/api/v1/gk/dashboard/subject-radar`,

        //GK Categories ENDPOINTS
        GK_CATEGORIES: `/api/gk/categories`,

        // GK Profile ENDPOINTS
        FETCH_GK_PROFILE: (user_id: number | string | undefined) => `/api/gk/profiles?user_id=${user_id}`,
        UPDATE_GK_PROFILE: (user_id: number | string| undefined) => `/api/gk/profiles?user_id=${user_id}`,

        //Assessment ENDPOINTS
        START_GK_ASSESSMENT: `/api/gk/assessments/start`,
        END_GK_ASSESSMENT: `/api/gk/assessments/end`,
        GET_LIST_GK_ASSESSMENT : (user_id: number | string | undefined) => `/api/gk/assessments/user?user_id=${user_id}`,
        GET_RESULT_GK_ASSESSMENT: (gk_user_ass_id: number | string | undefined) => `/api/gk/assessments/results?gk_user_ass_id=${gk_user_ass_id}`

    },

    AI_TUTOR: {
        //dummy api endpoints 
        AI_TUTOR_DASHBOARD_CARDS: (user_id: string | number , subscription_id : string | number) => `/api/ai_tutor/dashboard/cards?user_id=${user_id}&subscription_id=${subscription_id}`,
        AI_TUTOR_DASHBOARD_WEAK_CHAPTERS: (user_id: string | number , subscription_id : string | number) => `/api/ai_tutor/dashboard/weak_chapters?user_id=${user_id}&subscription_id=${subscription_id}`,
        AI_TUTOR_DASHBOARD_WEAK_TOPICS: (user_id: string | number , subscription_id : string | number) => `/api/ai_tutor/dashboard/weak_topics?user_id=${user_id}&subscription_id=${subscription_id}`,
        AI_TUTOR_DASHBOARD_SUBJECT_RADAR:  (user_id: string | number , subscription_id : string | number) => `/api/ai_tutor/dashboard/radar?user_id=${user_id}&subscription_id=${subscription_id}`,
        
        //get all subjects , chapters , topics based on the selected subscription
        GET_ALL_SUBJECTS: (subscription_id: number | string) => `/api/v1/cil/subscription_subject/get/all/by?subscription_id=${subscription_id}`,
        GET_ALL_CHAPTERS: (subject_id: number | string) => `/api/v1/cil/chapter/get/all/by/subject_id?subject_id=${subject_id}`,
        GET_ALL_TOPICS: (chapter_id: number | string) => `/api/v1/cil/topics/get/by/chapter_id?chapter_id=${chapter_id}`,
        
        //AI TUTOR ENDPOINTS
        AI_TUTOR_START: '/api/ai_tutor/session/start',
        AI_TUTOR_SUBMIT_ANSWER: '/api/ai_tutor/session/answer',
        AI_TUTOR_END: '/api/ai_tutor/session/end',
        AI_TUTOR_HISTORY: (user_id:string | number | undefined, subscription_id: number | string) => `/api/ai_tutor/sessions?user_id=${user_id}&subscription_id=${subscription_id}`,
        AI_TUTOR_RESULT: (session_id: string | number) => `/api/ai_tutor/result?session_id=${session_id}`,
    },

    COMPETITIONS: {
        //COMPETITION DASHBOARD ENDPOINTS
        COMPETITION_DASHBOARD_CARDS: `/api/competition/dashboard/cards`,
        COMPETITION_DASHBOARD_SUBJECTWISE_PERFORMANCE: `/api/competition/dashboard/subject-wise-performance-indicators`,
        COMPETITION_DASHBOARD_WEAK_CHAPTERS: `/api/competition/dashboard/weak-chapters`,
        COMPETITION_DASHBOARD_WEAK_TOPICS: `/api/competition/dashboard/weak-topics`,
        COMPETITION_DASHBOARD_SUBJECT_RADAR: `/api/competition/dashboard/subject-radar`,

        GET_ALL_UPCOMING_COMPETITIONS: (user_id: string | number, subscription_id?: string | number, module_type?: string | number,) => {
            const params: string[] = [];
            if (subscription_id) params.push(`subscription_id=${subscription_id}`);
            if (module_type && module_type !== 'ALL') params.push(`module_type=${module_type}`);
            return `/api/v3/mindshaala/competitions?user_id=${user_id}${params.length > 0 ? `&${params.join('&')}` : ''}`;
        },
        GET_UPCOMING_COMPETITIONS_FILTERED: (user_id: string | number, subscription_id?: string | number, module_type?: string | number) => {
            const params: string[] = [];
            if (subscription_id) params.push(`subscription_id=${subscription_id}`);
            if (module_type) params.push(`module_type=${module_type}`);
            return `/api/v3/mindshaala/competitions?user_id=${user_id}${params.length > 0 ? `&${params.join('&')}` : ''}`;
        },
        REGISTER_FOR_COMPETITION: `/api/v3/mindshaala/competitions/enroll`,
        GET_REGISTERED_COMPETITIONS: (user_id: string | number | undefined) =>`/api/v3/mindshaala/user/my-competitions?user_id=${user_id}`,
        // GET_REGISTERED_COMPETITIONS_RESULTS: ``,

        //Assessment ENDPOINTS
        START_COMPETITION_ASSESSMENT: `/api/v3/mindshaala/start-assessment`,
        SUBMIT_COMPETITION_ANSWERS: `/api/v3/mindshaala/submit-answer`,
        END_COMPETITION_ASSESSMENT: `/api/v3/mindshaala/end-assessment`,
        // GET_LIST_COMPETITION_ASSESSMENT : (user_id: number | string | undefined , module_type: string ,subscription_id?: number) => `/api?user_id=${user_id}&module_type=${module_type}`,
        // GET_RESULT_COMPETITION_ASSESSMENT: (module_type: string ,user_id: number, session_id?: number ,gk_user_ass_id?: number ) => `/api/competition/assessments/results?competition_user_ass_id=${competition_user_ass_id}`
                GET_LIST_COMPETITION_ASSESSMENT: (user_id: number | string | undefined, module_type: string, subscription_id?: number | string) => {
            const isTamOrViva = module_type === 'TAM' || module_type === 'VIVA';
            const subParam = (isTamOrViva && subscription_id) ? `&subscription_id=${subscription_id}` : '';
            return `/api/v3/mindshaala/user-sessions?user_id=${user_id}&module_type=${module_type}${subParam}`;
        },
        GET_RESULT_COMPETITION_ASSESSMENT: (module_type: string, user_id: number | string | undefined, session_id?: number | string, gk_user_ass_id?: number | string) => {
            const upperMod = (module_type || '').toUpperCase();
            const isTamOrViva = upperMod === 'VIVA' || upperMod === 'TAM';
            let extraParam = '';
            if (isTamOrViva && session_id) {
                extraParam = `&session_id=${session_id}`;
            } else if (upperMod === 'GK' && gk_user_ass_id) {
                extraParam = `&gk_user_ass_id=${gk_user_ass_id}`;
            }
            return `/api/v3/mindshaala/session?module_type=${module_type}&user_id=${user_id}${extraParam}`;
        }


    },



}