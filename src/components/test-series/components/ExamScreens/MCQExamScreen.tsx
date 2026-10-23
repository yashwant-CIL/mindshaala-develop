import { useState, useEffect, useRef, useMemo } from "react";
import { QuestionMathJax, latexToText } from "../../../../shared/mathjaxconfig/QuestionMathJax";
import { useToast } from "../../../../hooks/use-toast";
import Cookies from 'js-cookie';
import Swal from "sweetalert2";
import { TestService } from "../../../../services/TestServices";
import { DynamicAssessmentService } from "../../../../services/DynamicAssessmentService";
import { useCourse } from "../../../../context/CourseContext";

interface Question {
    id: number;
    type: string;
    marks: number;
    que: string;
    que_diag: string[];
    options: string[];
    options_diag: string[];
}

interface Section {
    id: number;
    name: string;
    totalMarks: number;
    totalTime: number;
    questions: Question[];
}

interface MCQExamScreenProps {
    userAssessmentId?: number | string;
    user_ass_id?: number | string;
    sectionId: number;
    user_ass_div_id?: number | string;
    sectionName: string;
    allSections: any; // For tab generation if needed
    onSectionSubmit: (success: boolean) => void;
    onCompleteExam?: (userAssId: number | string) => void;
    isDynamic?: boolean;
    source?: string;
    userId?: number | string | null;
    user_id?: number | string | null;
    subscriptionId?: number | string | null;
    subscription_id?: number | string | null;
    onNavigate?: (page: string, params?: any) => void;
}

export function MCQExamScreen({ 
    userAssessmentId, 
    user_ass_id,
    sectionId, 
    user_ass_div_id,
    sectionName, 
    allSections, 
    onSectionSubmit, 
    onCompleteExam, 
    isDynamic, 
    source,
    userId,
    user_id,
    subscriptionId,
    subscription_id,
    onNavigate
}: MCQExamScreenProps) {
    const effectiveUserAssId = user_ass_id || userAssessmentId || allSections?.user_ass_id;
    const effectiveDivId = user_ass_div_id || sectionId || allSections?.user_ass_div_id || allSections?.sub_div_id;
    const { toast } = useToast();
    const { userAssId: contextUserAssId, subscriptionId: contextSubscriptionId } = useCourse();
    const username = Cookies.get("username") || localStorage.getItem('username') || "Student";

    const isFromDynamic = useMemo(() => {
        return Boolean(
            isDynamic || 
            allSections?.isDynamic ||
            allSections?.source === "dynamic" ||
            source === "dynamic" ||
            (typeof window !== "undefined" && localStorage.getItem("is_dynamic_assessment") === "true")
        );
    }, [isDynamic, allSections?.isDynamic, allSections?.source, source]);

    const effectiveUserId = useMemo(() => {
        if (userId) return Number(userId);
        if (user_id) return Number(user_id);
        if (allSections?.user_id) return Number(allSections.user_id);
        if (typeof window !== "undefined") {
            const stored =
                localStorage.getItem("user_id") ||
                localStorage.getItem("userId") ||
                Cookies.get("user_id") ||
                Cookies.get("userId");
            if (stored) return Number(stored);
        }
        return 0;
    }, [userId, user_id, allSections?.user_id]);

    const effectiveSubscriptionId = useMemo(() => {
        if (subscriptionId) return Number(subscriptionId);
        if (subscription_id) return Number(subscription_id);
        if (allSections?.subscription_id) return Number(allSections.subscription_id);
        if (contextSubscriptionId) return Number(contextSubscriptionId);
        if (typeof window !== "undefined") {
            const stored =
                localStorage.getItem("subscription_id") ||
                localStorage.getItem("subscriptionId") ||
                Cookies.get("subscription_id") ||
                Cookies.get("subscriptionId");
            if (stored) return Number(stored);
        }
        return 0;
    }, [subscriptionId, subscription_id, allSections?.subscription_id, contextSubscriptionId]);
    
    // Log the entire exam payload
    // console.log("Exam Payload Data (allSections):", allSections);
    
    // Core State
    const [sections, setSections] = useState<Section[]>([]);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isDataFetching, setIsDataFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastViewedQuestionIndex, setLastViewedQuestionIndex] = useState<Record<number, number>>({});
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(3600); // Default 1 hr, overridden by API

    // Tracking
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [questionStatus, setQuestionStatus] = useState<Record<number, 'answered' | 'unanswered' | 'review' | 'review_answered'>>({});
    const [reviewStatus, setReviewStatus] = useState<Record<number, boolean>>({});
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
    const [visitedUnansweredQuestions, setVisitedUnansweredQuestions] = useState<Set<number>>(new Set());

    const [questionDurations, setQuestionDurations] = useState<Record<number, number>>({});
    const [examStartTime] = useState<number>(Date.now());
    const currentQuestionIdRef = useRef<number | null>(null);
    const questionStartTimeRef = useRef<number>(Date.now());
    const hasAutoSubmittedRef = useRef<boolean>(false);
    const [visitedCounts, setVisitedCounts] = useState<Record<number, number>>({});
    const [attemptedTimestamps, setAttemptedTimestamps] = useState<Record<number, string>>({});

    // Analytics Counts
    const [sectionCounts, setSectionCounts] = useState<Record<number, any>>({});
    const [answeredCount, setAnsweredCount] = useState(0);
    const [unansweredCount, setUnansweredCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [notvisitedCount, setNotVisitedCount] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Camera/Proctoring
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const mapQuestion = (question: any) => ({
        id: question.question_id || question.id,
        type: question.question_type || question.type || "MCQ",
        marks: question.marks !== undefined ? question.marks : 1,
        que: question.question_latex || question.question_text || question.que || question.question || "",
        que_diag: question.question_diagrams_url ? question.question_diagrams_url.filter((url: string) => url && url.length > 0) : (question.que_diag || []),
        options: [
            question.option1_latex !== undefined ? question.option1_latex : (question.options ? question.options[0] : question.option1),
            question.option2_latex !== undefined ? question.option2_latex : (question.options ? question.options[1] : question.option2),
            question.option3_latex !== undefined ? question.option3_latex : (question.options ? question.options[2] : question.option3),
            question.option4_latex !== undefined ? question.option4_latex : (question.options ? question.options[3] : question.option4)
        ].filter(opt => opt !== undefined),
        options_diag: [
            question.option1_img || question.options_diag?.[0],
            question.option2_img || question.options_diag?.[1],
            question.option3_img || question.options_diag?.[2],
            question.option4_img || question.options_diag?.[3]
        ]
    });

    const checkTokenAvailability = (): boolean => {
        const token = Cookies.get("token") || localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token || !token.trim() || token === "undefined" || token === "null") {
            toast({
                variant: "destructive",
                title: "Session Expired",
                description: "Session expired please login again.",
            });
            localStorage.clear();
            Cookies.remove("token");
            Cookies.remove("user_id");
            Cookies.remove("username");
            localStorage.setItem("currentStep", JSON.stringify("login"));
            setTimeout(() => {
                window.location.href = "/";
            }, 300);
            return false;
        }
        return true;
    };

    // Check token on mount before exam initializes
    useEffect(() => {
        checkTokenAvailability();
    }, []);

    // Direct Question Fetching for STANDARD exams
    useEffect(() => {
        const fetchQuestionsDirectly = async () => {
            if (!checkTokenAvailability()) {
                setIsDataFetching(false);
                setIsLoading(false);
                return;
            }
            const rawType = (allSections?.assessment_type || allSections?.assessmentType || "").toUpperCase();
            const isSectionWise = rawType === "SECTION_WISE" || rawType === "SECTIONWISE" || rawType.includes("SECTION");
            const isStandard = rawType === "STANDARD" || rawType === "MOCK" || !isSectionWise;
            const isFromDynamic = Boolean(
                isDynamic || 
                allSections?.isDynamic ||
                allSections?.source === "dynamic" ||
                source === "dynamic" ||
                (typeof window !== "undefined" && localStorage.getItem("is_dynamic_assessment") === "true")
            );

            // Fetch questions directly with user_ass_id ONLY for STANDARD assessments
            if (isStandard && !isSectionWise && effectiveUserAssId) {
                console.log(`Standard assessment detected. isFromDynamic: ${isFromDynamic}. Fetching questions with user_ass_id: ${effectiveUserAssId}...`);
                setIsDataFetching(true);
                try {
                    let directData: any = null;
                    if (isFromDynamic) {
                        const requestParams = {
                            user_id: Number(effectiveUserId),
                            subscription_id: Number(effectiveSubscriptionId),
                            user_ass_id: Number(effectiveUserAssId)
                        };
                        console.log("Calling DynamicAssessmentService.GENERATE_DYNAMIC_ASSESSMENT for STANDARD assessment with request params:", requestParams);
                        directData = await DynamicAssessmentService.GENERATE_DYNAMIC_ASSESSMENT({}, requestParams);
                    } else {
                        directData = await TestService.getExamQuestions(effectiveUserAssId);
                    }

                    if (directData) {
                        console.log("Direct question data received for STANDARD:", directData);
                        
                        let mappedSections = [];
                        const rawPayload = directData.data || directData;

                        // Check if it has sub_division_data (even if STANDARD, it might have 1 or more sections)
                        if (rawPayload.sub_division_data && Array.isArray(rawPayload.sub_division_data) && rawPayload.sub_division_data.length > 0) {
                            mappedSections = rawPayload.sub_division_data.map((section: any) => ({
                                id: section.sub_div_id || section.ass_div_id || 0,
                                name: section.sub_div_name || section.ass_div_name || "Section",
                                totalMarks: section.total_marks,
                                totalTime: section.total_time,
                                questions: (section.question_data || section.question_bank_response_list || section.questions || section.assessment_questions || []).map((q: any) => mapQuestion(q))
                            }));
                        } else if (rawPayload.section_details && Array.isArray(rawPayload.section_details) && rawPayload.section_details.length > 0 && (rawPayload.section_details[0]?.question_data || rawPayload.section_details[0]?.questions || rawPayload.section_details[0]?.question_bank_response_list)) {
                            mappedSections = rawPayload.section_details.map((section: any) => ({
                                id: section.ass_div_id || section.sub_div_id || 0,
                                name: section.ass_div_name || section.sub_div_name || "Section",
                                totalMarks: section.total_marks,
                                totalTime: section.total_time,
                                questions: (section.question_data || section.question_bank_response_list || section.questions || section.assessment_questions || []).map((q: any) => mapQuestion(q))
                            }));
                        } else {
                            // Fallback to root level question data
                            const questions = 
                                rawPayload.question_bank_response_list || 
                                rawPayload.question_data || 
                                rawPayload.questions || 
                                rawPayload.assessment_questions ||
                                rawPayload.assessment_question_list ||
                                (Array.isArray(rawPayload) ? rawPayload : []);

                            if (questions.length > 0) {
                                mappedSections = [{
                                    id: rawPayload.user_ass_div_id || rawPayload.sub_div_id || 0,
                                    name: rawPayload.assessment_name || "Assessment",
                                    totalMarks: rawPayload.total_marks || 0,
                                    totalTime: rawPayload.total_time || 0,
                                    questions: questions.map((q: any) => mapQuestion(q))
                                }];
                            }
                        }

                        if (mappedSections.length > 0) {
                            setSections(mappedSections);
                            setTotalQuestions(mappedSections[0].questions.length);
                            setNotVisitedCount(mappedSections[0].questions.length);
                            
                            // Only set time if not already set or specifically needed
                            if (timeLeft === 0 || timeLeft === 3600) {
                                const sectionMinutesSum = mappedSections.reduce((acc: number, sec: any) => acc + (parseInt(sec.totalTime) || 0), 0);
                                const rootMinutes = parseInt(rawPayload.total_time) || 0;
                                setTimeLeft((sectionMinutesSum > 0 ? sectionMinutesSum : rootMinutes) * 60 || 3600);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error in direct question fetch:", error);
                    // Fallback to prefetched data (if any) is already handled by loadSectionData
                } finally {
                    setIsDataFetching(false);
                }
            }
        };

        fetchQuestionsDirectly();
    }, [effectiveUserAssId, effectiveUserId, effectiveSubscriptionId, allSections?.assessment_type, isDynamic, source]);


    // Initial Data Load (from Prefetched Props)
    useEffect(() => {
        const loadSectionData = async () => {
             if (!checkTokenAvailability()) {
                 setIsLoading(false);
                 return;
             }
             setIsLoading(true);
             try {
                if (!allSections) {
                    throw new Error("No prefetched data available.");
                }
                
                // The 'allSections' prop holds the API response payload from upstream
                console.log("Exam Screen processing prefetched API data:", allSections);
                
                const rawPayload = allSections.data || allSections;
                let mappedSections = [];

                if (rawPayload.sub_division_data && Array.isArray(rawPayload.sub_division_data) && rawPayload.sub_division_data.length > 0) {
                    // Mapping for SECTION_WISE assessments with sub_division_data
                    mappedSections = rawPayload.sub_division_data.map((section: any) => ({
                        id: section.sub_div_id || section.ass_div_id || 0,
                        name: section.sub_div_name || section.ass_div_name || "Section",
                        totalMarks: section.total_marks,
                        totalTime: section.total_time,
                        questions: (section.question_data || section.question_bank_response_list || section.questions || section.assessment_questions || []).map((q: any) => mapQuestion(q))
                    }));
                } else if (rawPayload.section_details && Array.isArray(rawPayload.section_details) && rawPayload.section_details.length > 0 && (rawPayload.section_details[0]?.question_data || rawPayload.section_details[0]?.questions || rawPayload.section_details[0]?.question_bank_response_list)) {
                    mappedSections = rawPayload.section_details.map((section: any) => ({
                        id: section.ass_div_id || section.sub_div_id || 0,
                        name: section.ass_div_name || section.sub_div_name || "Section",
                        totalMarks: section.total_marks,
                        totalTime: section.total_time,
                        questions: (section.question_data || section.question_bank_response_list || section.questions || section.assessment_questions || []).map((q: any) => mapQuestion(q))
                    }));
                } else {
                    // Mapping for STANDARD assessments or single-section MCQ (root questions)
                    const questions = 
                        rawPayload.question_bank_response_list || 
                        rawPayload.question_data || 
                        rawPayload.questions || 
                        rawPayload.assessment_questions ||
                        rawPayload.assessment_question_list ||
                        (Array.isArray(rawPayload) ? rawPayload : []);

                    if (questions.length > 0) {
                        mappedSections = [{
                            id: rawPayload.user_ass_div_id || rawPayload.sub_div_id || effectiveDivId || 0,
                            name: rawPayload.sub_div_name || rawPayload.ass_div_name || rawPayload.assessment_name || sectionName || "Assessment",
                            totalMarks: rawPayload.total_marks || 0,
                            totalTime: rawPayload.total_time || 0,
                            questions: questions.map((q: any) => mapQuestion(q))
                        }];
                    }
                }

                // If no questions found in prefetched payload and this is from dynamic screen with sectionId (user_ass_div_id), fetch it!
                const isFromDynamic = Boolean(
                    isDynamic || 
                    allSections?.isDynamic ||
                    allSections?.source === "dynamic" ||
                    source === "dynamic" ||
                    (typeof window !== "undefined" && localStorage.getItem("is_dynamic_assessment") === "true")
                );

                if (mappedSections.length === 0 && isFromDynamic && effectiveDivId) {
                    const requestParams = {
                        user_id: Number(effectiveUserId),
                        subscription_id: Number(effectiveSubscriptionId),
                        user_ass_id: Number(effectiveUserAssId),
                        user_ass_div_id: Number(effectiveDivId)
                    };
                    console.log("No prefetched questions found. Calling GENERATE_DYNAMIC_ASSESSMENT for SECTION_WISE assessment with request params:", requestParams);
                    const fetchedData = await DynamicAssessmentService.GENERATE_DYNAMIC_ASSESSMENT({}, requestParams);
                    if (fetchedData) {
                        const payloadData = fetchedData.data || fetchedData;
                        const questions = 
                            payloadData.question_bank_response_list || 
                            payloadData.question_data || 
                            payloadData.questions || 
                            payloadData.assessment_questions ||
                            payloadData.assessment_question_list ||
                            (Array.isArray(payloadData) ? payloadData : []);

                        if (questions.length > 0) {
                            mappedSections = [{
                                id: payloadData.user_ass_div_id || effectiveDivId || 0,
                                name: payloadData.sub_div_name || payloadData.assessment_name || sectionName || "Section",
                                totalMarks: payloadData.total_marks || 0,
                                totalTime: payloadData.total_time || 0,
                                questions: questions.map((q: any) => mapQuestion(q))
                            }];
                        }
                    }
                }

                if (mappedSections.length > 0) {
                    setSections(mappedSections);
                    
                    const sectionMinutesSum = mappedSections.reduce((acc: number, sec: any) => acc + (parseInt(sec.totalTime) || 0), 0);
                    const rootMinutes = parseInt(rawPayload.total_time) || 0;
                    const finalMinutes = sectionMinutesSum > 0 ? sectionMinutesSum : rootMinutes;
                    
                    const totalSecs = finalMinutes > 0 ? finalMinutes * 60 : 3600;
                    
                    setTimeLeft(totalSecs);
                    setTotalQuestions(mappedSections[0].questions.length);
                    setNotVisitedCount(mappedSections[0].questions.length);
                } else {
                    // If it's a STANDARD assessment or dynamic assessment, questions will come from direct fetch
                    const isStandard = allSections?.assessment_type?.toUpperCase() === "STANDARD";
                    if (!isStandard && !isFromDynamic) {
                        throw new Error("No questions found in the assessment data.");
                    }
                }
             } catch (error) {
                 console.log("Error loading assessment data:", error);
                 if (allSections?.assessment_type?.toUpperCase() !== "STANDARD") {
                    toast({ title: "Load Error", description: "No questions found in this assessment.", variant: "destructive" });
                 }
             } finally {
                 setIsLoading(false);
             }
        };

        loadSectionData();
    }, [allSections, sectionId, sectionName, effectiveDivId, effectiveUserId, effectiveSubscriptionId, isDynamic, source]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) {
            if (!hasAutoSubmittedRef.current) {
                hasAutoSubmittedRef.current = true;
                onTimeSubmit();
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Anti-Cheat (Visibility & FullScreen)
    useEffect(() => {
        const enterFullScreen = () => {
             const elem = document.documentElement;
             if (elem.requestFullscreen) {
                 elem.requestFullscreen().catch((err) => console.log(err));
             }
        };
        enterFullScreen();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast({
                    title: "Warning!",
                    description: "You navigated away from the exam window. This is recorded.",
                    variant: "destructive"
                });
            }
        };
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault(); 
        };

        const disablerightclick = (e: MouseEvent) => {
          e.preventDefault();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
          if(e.key === 'Escape') {
             e.preventDefault();
          }
        };

        const handleBlur = (e: FocusEvent) => {
            e.preventDefault();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("contextmenu", disablerightclick);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);

        // Webcam initialization
        const initCamera = async () => {
             try {
                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                 streamRef.current = stream;
                 if (videoRef.current) {
                     videoRef.current.srcObject = stream;
                     videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(e => console.error(e));
                     }
                 }
             } catch(e) {
                 console.error("Camera access denied", e);
             }
        }
        initCamera();

        return () => {
             document.removeEventListener("visibilitychange", handleVisibilityChange);
             document.removeEventListener("contextmenu", handleContextMenu);
             window.removeEventListener("contextmenu", disablerightclick);
             window.removeEventListener('keydown', handleKeyDown);
             window.removeEventListener('blur', handleBlur);
             if (streamRef.current) {
                 streamRef.current.getTracks().forEach(track => track.stop());
             }
        };
    }, []);

    const formatDateTime = () => {
        const now = new Date();
        const [year, month, day, hours, minutes, seconds, milliseconds] = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
            String(now.getHours()).padStart(2, "0"),
            String(now.getMinutes()).padStart(2, "0"),
            String(now.getSeconds()).padStart(2, "0"),
            String(now.getMilliseconds()).padStart(3, "0")
        ];
        const microseconds = milliseconds + "000"; //padding for microseconds
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
    };

    const submitResponses = async (): Promise<boolean> => {
        if (isSubmitting) return false;

        const totalTimeTaken = Math.round((Date.now() - examStartTime) / 1000);

        // Update the current question's duration before submitting
        let finalDurations = { ...questionDurations };
        if (currentQuestionIdRef.current !== null) {
            const duration = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
            const currId = currentQuestionIdRef.current;
            finalDurations[currId] = (finalDurations[currId] || 0) + duration; // Accumulate time spent across all visits
        }

        const allQuestionsWithAnswers = sections.flatMap(section => {
            return section.questions.map(question => {
                const questionId = question.id;
                const answer = responses[questionId];
                
                let attemptStatus;
                const isVisited = visitedQuestions.has(questionId);
                const isAnswered = answer !== undefined && answer !== null;
                if (!isVisited) {
                    attemptStatus = "NOT_VISITED";
                } else if (isAnswered) {
                    attemptStatus = "ANSWERED";
                } else {
                    attemptStatus = "UN_ANSWERED";
                }

                return {
                    question_id: questionId,
                    user_answer: isAnswered ? String.fromCharCode(65 + answer) : null, // 0 -> A, 1 -> B, etc.
                    answer_format: "Latex",
                    time_taken: finalDurations[questionId] !== undefined ? finalDurations[questionId] : 0,
                    status: "ACTIVE",
                    attempt_status: attemptStatus,
                    book_mark_status: Boolean(reviewStatus[questionId]),
                    answer_submission_time: attemptedTimestamps[questionId] || null, // Timestamp when the question was answered
                    visit_count: visitedCounts[questionId] || 0, // Count of times the question was visited
                };
            });
        });

        // Resolve user_ass_id properly from props, allSections, context, or localStorage
        const localUserAssId = typeof window !== "undefined" ? localStorage.getItem("user_ass_id") : null;
        const resolvedUserAssId = effectiveUserAssId || localUserAssId || contextUserAssId;

        // Resolve assessment_type
        const rawType = (allSections?.assessment_type || allSections?.assessmentType || "").toUpperCase();
        const isSectionWise = rawType === "SECTION_WISE" || rawType === "SECTIONWISE" || rawType.includes("SECTION");
        const resolvedAssessmentType = allSections?.assessment_type ? allSections.assessment_type.toString() : (isSectionWise ? "SECTION_WISE" : "STANDARD");

        // Resolve user_ass_div_id
        const resolvedDivId = !isSectionWise 
            ? null 
            : (allSections?.user_ass_div_id ? Number(allSections.user_ass_div_id) : (effectiveDivId && Number(effectiveDivId) !== 0 ? Number(effectiveDivId) : null));
        
        const formattedPayload = {
            user_ass_id: resolvedUserAssId ? Number(resolvedUserAssId) : 0,
            assessment_type: resolvedAssessmentType,
            user_ass_div_id: resolvedDivId,
            time_taken: totalTimeTaken,
            attempt_status: "SUBMITTED",
            end_time: formatDateTime(),
            sub_division_data: allQuestionsWithAnswers
        };

        console.log("Formatted Payload (Deep):", JSON.stringify(formattedPayload, null, 2));

        try {
            setIsSubmitting(true);
            let response: any = null;
            if (isFromDynamic) {
                console.log("Submitting Dynamic Assessment using DynamicAssessmentService.SUBMIT_DYNAMIC_ASSESSMENT:", formattedPayload);
                response = await DynamicAssessmentService.SUBMIT_DYNAMIC_ASSESSMENT(formattedPayload);
            } else {
                console.log("Submitting Available Test using TestService.submitExam:", formattedPayload);
                response = await TestService.submitExam(formattedPayload);
            }
            console.log("Response Data:", response);
            console.log("Submit Data", formattedPayload);
            
            // Handle Routing based on API flag
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.warn("Error exiting full screen:", err));
            }

            // -----------------------------------------------------------------------------------
            // DYNAMIC ASSESSMENT SPECIFIC FLOW (SECTION_WISE vs STANDARD)
            // -----------------------------------------------------------------------------------
            if (isFromDynamic) {
                const isDynamicSectionWise = Boolean(
                    resolvedAssessmentType === "SECTION_WISE" ||
                    isSectionWise ||
                    (effectiveDivId && Number(effectiveDivId) !== 0) ||
                    allSections?.user_ass_div_id ||
                    allSections?.sub_div_id
                );

                if (isDynamicSectionWise) {
                    // Check next_div_flag from API response (defensively supports boolean, string, or number)
                    const isNextDiv = Boolean(
                        response?.next_div_flag === true ||
                        response?.next_div_flag === "true" ||
                        response?.next_div_flag === 1 ||
                        response?.next_div_flag === "1" ||
                        response?.data?.next_div_flag === true ||
                        response?.data?.next_div_flag === "true" ||
                        response?.data?.next_div_flag === 1 ||
                        response?.data?.next_div_flag === "1"
                    );

                    console.log(`[MCQExamScreen] Dynamic SECTION_WISE submission finished. next_div_flag: ${isNextDiv}`, response);

                    if (isNextDiv) {
                        toast({ 
                            title: "Section Submitted", 
                            description: "Section submitted successfully! Please proceed to the next section.", 
                            variant: "default" 
                        });

                        // Navigate user back to the section details page so they can view details and start next section
                        onSectionSubmit(true);
                        return true;
                    } else {
                        // next_div_flag is false: All sections completed, navigate to result page with Dynamic Assessment Result active
                        toast({ 
                            title: "Exam Completed", 
                            description: "Dynamic Assessment Completed Successfully!", 
                            variant: "default" 
                        });

                        // Mark Dynamic Assessments Results tab as active for TestResultListPage
                        sessionStorage.setItem("test_result_active_tab", "custom");
                        localStorage.setItem("test_result_active_tab", "custom");

                        // Clear any cached takeTest states
                        localStorage.removeItem("takeTest_testMode");
                        localStorage.removeItem("takeTest_activeTestConfig");
                        localStorage.removeItem("takeTest_selectedTestForInstructions");

                        // Dispatch global event for App.tsx navigation to scorecard / test-history
                        window.dispatchEvent(
                            new CustomEvent("app:navigate", {
                                detail: { page: "test-history", params: { tab: "custom" } }
                            })
                        );

                        // Navigate directly to result list page if onNavigate is provided
                        if (onNavigate) {
                            onNavigate("test-history", { tab: "custom" });
                        }

                        // Complete exam callback to close modal in parents
                        if (onCompleteExam && formattedPayload.user_ass_id) {
                            onCompleteExam(formattedPayload.user_ass_id);
                        } else {
                            onSectionSubmit(false);
                        }
                        return true;
                    }
                } else {
                    // Dynamic Standard assessment (single exam) completed
                    toast({ 
                        title: "Exam Completed", 
                        description: "Dynamic Assessment Completed Successfully!", 
                        variant: "default" 
                    });

                    sessionStorage.setItem("test_result_active_tab", "custom");
                    localStorage.setItem("test_result_active_tab", "custom");

                    localStorage.removeItem("takeTest_testMode");
                    localStorage.removeItem("takeTest_activeTestConfig");
                    localStorage.removeItem("takeTest_selectedTestForInstructions");

                    window.dispatchEvent(
                        new CustomEvent("app:navigate", {
                            detail: { page: "test-history", params: { tab: "custom" } }
                        })
                    );

                    if (onNavigate) {
                        onNavigate("test-history", { tab: "custom" });
                    }

                    if (onCompleteExam && formattedPayload.user_ass_id) {
                        onCompleteExam(formattedPayload.user_ass_id);
                    } else {
                        onSectionSubmit(false);
                    }
                    return true;
                }
            }

            // -----------------------------------------------------------------------------------
            // ORIGINAL OLD FLOW FOR NON-DYNAMIC / AVAILABLE ASSESSMENTS (COMPLETELY UNDISTURBED)
            // -----------------------------------------------------------------------------------
            const isNextDiv = response?.next_div_flag === true || response?.data?.next_div_flag === true;
            if (isNextDiv) {
                toast({ title: "Success", description: "Section Submitted Successfully!", variant: "default" });
                // We let the parent component (TakeTest) handle the visual transition back to details page
                onSectionSubmit(true);
                return true;
            } else {
                toast({ title: "Completed", description: "Exam Completed Successfully!", variant: "default" });

                if (onCompleteExam && formattedPayload.user_ass_id) {
                    onCompleteExam(formattedPayload.user_ass_id);
                } else {
                    onSectionSubmit(false);
                }
                return true;
            }

        } catch (error) {
            console.error('Submission error details:', error);
            toast({ title: "Error", description: "Error submitting responses. Please try again", variant: "destructive" });
            setIsSubmitting(false); // Only disable loading if it failed so user remains on screen
            return false;
        }
    };

    const onTimeSubmit = async () => {
        const sectionsHtml = sections.map(sec => {
            const counts = sectionCounts[sec.id] || { notVisited: sec.questions.length, answered: 0, unanswered: 0, review: 0 };
            return `
                <div class="mb-4 text-left">
                    <h3 class="font-bold text-lg text-[#0079D1] mb-2 border-b-2 border-slate-100 pb-1">${sec.name}</h3>
                    <div class="flex flex-col flex-wrap h-[130px] text-base text-black justify-between content-between gap-2">
                        <div class="flex items-center m-1 w-[48%]">
                            <span class="h-10 w-10 bg-[#D6D6D6] flex items-center justify-center text-center mr-1.5 rounded text-black">${counts.notVisited}</span>
                            <p class="text-base m-0">Not Visited</p>
                        </div>
                        <div class="flex items-center m-1 w-[48%]">
                            <span class="h-10 w-10 bg-[#17ab07] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.answered}</span>
                            <p class="text-base m-0">Answered</p>
                        </div>
                        <div class="flex items-center m-1 w-[48%]">
                            <span class="h-10 w-10 bg-[#eb0a0a] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.unanswered}</span>
                            <p class="text-base m-0">Not Answered</p>
                        </div>
                        <div class="flex items-center m-1 w-[48%]">
                            <span class="h-10 w-10 bg-[#77549A] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.review}</span>
                            <p class="text-base m-0">Marked for Review</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const htmlContent = `
            <div class="max-h-[350px] overflow-y-auto overflow-x-hidden pr-2">
                ${sectionsHtml}
            </div>
        `;

        await Swal.fire({
          title: "Sorry, Time is Up",
          icon: "warning",
          html: htmlContent,
          confirmButtonText: "Submit",
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            container: "!z-[99999]",
            popup: "!z-[99999]",
            confirmButton: "text-sm p-2.5 bg-blue-600 text-white rounded",
            cancelButton: "text-sm p-2.5 bg-gray-500 text-white rounded ml-2"
          }
        });
        await submitResponses();
    };

    const handleSubmitConfirm = async () => {
        try {
            console.log("=== SUBMIT EXAM BUTTON CLICKED ===");
            console.log("Current Metrics:", { notvisitedCount, answeredCount, unansweredCount, reviewCount });
            
            const sectionsHtml = sections.map(sec => {
                const counts = sectionCounts[sec.id] || { notVisited: sec.questions.length, answered: 0, unanswered: 0, review: 0 };
                return `
                    <div class="mb-4 text-left">
                        <h3 class="font-bold text-lg text-[#0079D1] mb-2 border-b-2 border-slate-100 pb-1">${sec.name}</h3>
                        <div class="flex flex-col flex-wrap h-[130px] text-base text-black justify-between content-between gap-2">
                            <div class="flex items-center m-1 w-[48%]">
                                <span class="h-10 w-10 bg-[#D6D6D6] flex items-center justify-center text-center mr-1.5 rounded text-black">${counts.notVisited}</span>
                                <p class="text-base m-0">Not Visited</p>
                            </div>
                            <div class="flex items-center m-1 w-[48%]">
                                <span class="h-10 w-10 bg-[#17ab07] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.answered}</span>
                                <p class="text-base m-0">Answered</p>
                            </div>
                            <div class="flex items-center m-1 w-[48%]">
                                <span class="h-10 w-10 bg-[#eb0a0a] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.unanswered}</span>
                                <p class="text-base m-0">Not Answered</p>
                            </div>
                            <div class="flex items-center m-1 w-[48%]">
                                <span class="h-10 w-10 bg-[#77549A] flex items-center justify-center text-center mr-1.5 rounded text-white">${counts.review}</span>
                                <p class="text-base m-0">Marked for Review</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            const htmlContent = `
                <div class="max-h-[350px] overflow-y-auto overflow-x-hidden pr-2">
                    ${sectionsHtml}
                </div>
            `;
            
            console.log("Launching SweetAlert Dialog...");
            const result = await Swal.fire({
              title: "Are you sure you want to submit the exam?",
              icon: "warning",
              html: htmlContent,
              showCancelButton: true,
              confirmButtonText: "Submit",
              cancelButtonText: "Cancel",
              customClass: {
                container: "!z-[99999]",
                popup: "!z-[99999]",
                confirmButton: "text-sm p-2.5 bg-blue-600 text-white rounded",
                cancelButton: "text-sm p-2.5 bg-gray-500 text-white rounded ml-2"
              }
            });
        
            if (result.isConfirmed) {
                console.log("=== EXAM SUBMITTED ===");
                console.log("Original Exam Payload:", allSections);
                console.log("User Responses (Question ID -> Option Index):", responses);
                console.log("Section Analytics:", sectionCounts);
                
                hasAutoSubmittedRef.current = true;
                await submitResponses();
                // onSectionSubmit is securely handled conditionally inside submitResponses upon API success
            }
        } catch (error) {
            console.error("Error inside handleSubmitConfirm:", error);
            setIsSubmitting(false);
        }
    };

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const activeSection = sections[activeSectionIndex];
    const mathsque = activeSection?.questions || [];

    // Maintaining the counts
    useEffect(() => {
        setAnsweredCount(Object.keys(responses).length);
        setUnansweredCount(visitedUnansweredQuestions.size);
        setReviewCount(Object.keys(reviewStatus).filter(id => reviewStatus[Number(id)]).length);
        setNotVisitedCount(totalQuestions - visitedQuestions.size);
    }, [responses, reviewStatus, visitedQuestions, totalQuestions, visitedUnansweredQuestions]);

    useEffect(() => {
        if (!activeSection) return;
        const currentSectionQuestions = activeSection.questions || [];
        const secId = activeSection.id;
    
        let sectionAnswered = 0;
        let sectionUnanswered = 0;
        let sectionReview = 0;
        let sectionNotVisited = currentSectionQuestions.length;
        let sectionVisitedUnanswered = new Set();
    
        currentSectionQuestions.forEach(question => {
          const questionId = question.id;
    
          if (visitedQuestions.has(questionId)) {
            sectionNotVisited--;
    
            if (responses[questionId] !== undefined) {
              sectionAnswered++;
            } else {
              sectionUnanswered++;
              sectionVisitedUnanswered.add(questionId);
            }
    
            if (reviewStatus[questionId]) {
              sectionReview++;
            }
          }
        });
    
        setSectionCounts(prev => ({
          ...prev,
          [secId]: {
            answered: sectionAnswered,
            unanswered: sectionUnanswered,
            review: sectionReview,
            notVisited: sectionNotVisited,
            visitedUnanswered: sectionVisitedUnanswered
          }
        }));
    }, [responses, reviewStatus, visitedQuestions, sections, activeSectionIndex]);

    useEffect(() => {
        if (mathsque.length > 0) {
            const currentQuestionId = mathsque[currentQuestionIndex].id;
            
            if (currentQuestionIdRef.current !== null && currentQuestionIdRef.current !== currentQuestionId) {
                 const duration = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
                 const prevQuestionId = currentQuestionIdRef.current;
                 setQuestionDurations(prev => ({
                     ...prev,
                     [prevQuestionId]: (prev[prevQuestionId] || 0) + duration // Accumulate time for returning visits
                 }));
            }
            
            if (currentQuestionIdRef.current !== currentQuestionId) {
                currentQuestionIdRef.current = currentQuestionId;
                questionStartTimeRef.current = Date.now();
                
                // Track question visits every time the question changes (mount, next, prev, jump)
                setVisitedCounts(prev => ({
                    ...prev,
                    [currentQuestionId]: (prev[currentQuestionId] || 0) + 1
                }));
            }

            setVisitedQuestions(prev => new Set(prev).add(currentQuestionId));
        }
    }, [currentQuestionIndex, mathsque, activeSectionIndex]);

    const handleSectionChange = (index: number) => {
        setLastViewedQuestionIndex(prev => ({
          ...prev,
          [activeSectionIndex]: currentQuestionIndex
        }));
    
        setActiveSectionIndex(index);
        const newSectionQuestions = sections[index]?.questions || [];
        setTotalQuestions(newSectionQuestions.length);
        setCurrentQuestionIndex(lastViewedQuestionIndex[index] || 0);
    };

    const handleResponseChange = (id: number, optionIndex: number) => {
        setResponses(prev => ({
          ...prev,
          [id]: optionIndex
        }));
    
        setQuestionStatus(prevStatus => ({
          ...prevStatus,
          [id]: 'answered'
        }));
        
        setAttemptedTimestamps(prev => {
            const now = new Date();
            const iso = now.toISOString();
            const [datePart, msPart] = iso.split(".");
            const ms = msPart.slice(0, 3);
            const micro = ms.padEnd(6, "0");
            const formatted = `${datePart}.${micro}`;
            return {
                ...prev,
                [id]: formatted
            };
        });
    
        if (visitedUnansweredQuestions.has(id)) {
          setVisitedUnansweredQuestions(prev => {
            const updated = new Set(prev);
            updated.delete(id);
            return updated;
          });
        }
    };

    const handleClearResponse = (questionId: number) => {
        setResponses(prev => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        setQuestionStatus(prevStatus => ({
          ...prevStatus,
          [questionId]: 'unanswered'
        }));
        setVisitedUnansweredQuestions(prev => new Set(prev).add(questionId));
        setAttemptedTimestamps(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    };

    const handleReview = (id: number) => {
        setReviewStatus(prevStatus => ({
          ...prevStatus,
          [id]: !prevStatus[id]
        }));
    
        setQuestionStatus(prevStatus => {
          const isAnswered = responses[id] !== undefined;
          return {
            ...prevStatus,
            [id]: prevStatus[id] === 'review'
              ? (isAnswered ? 'review_answered' : 'unanswered')
              : 'review'
          };
        });
    };

    const handleRemoveFromReview = (id: number) => {
        setReviewStatus(prevStatus => ({
          ...prevStatus,
          [id]: false
        }));
        setQuestionStatus(prevStatus => {
          const isAttempted = responses[id] !== undefined;
          return {
            ...prevStatus,
            [id]: isAttempted ? 'answered' : 'unanswered'
          };
        });
    };

    const handleNext = () => {
        const currentQuestionId = mathsque[currentQuestionIndex].id;
        if (responses[currentQuestionId] === undefined) {
          setQuestionStatus(prevStatus => ({
            ...prevStatus,
            [currentQuestionId]: 'unanswered'
          }));
          setVisitedUnansweredQuestions(prev => new Set(prev).add(currentQuestionId));
        } else {
          if (visitedUnansweredQuestions.has(currentQuestionId)) {
            setVisitedUnansweredQuestions(prev => {
              const updated = new Set(prev);
              updated.delete(currentQuestionId);
              return updated;
            });
          }
        }
    
        setVisitedQuestions(prev => new Set(prev).add(currentQuestionId));
    
        if (reviewStatus[currentQuestionId]) {
          setQuestionStatus(prevStatus => ({
            ...prevStatus,
            [currentQuestionId]: 'review'
          }));
        }
    
        setCurrentQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
    };

    const handlePrev = () => {
        const currentQuestionId = mathsque[currentQuestionIndex].id;
        if (responses[currentQuestionId] === undefined) {
          setVisitedUnansweredQuestions(prev => new Set(prev).add(currentQuestionId));
          setQuestionStatus(prevStatus => ({
            ...prevStatus,
            [currentQuestionId]: 'unanswered'
          }));
        }
    
        setVisitedQuestions(prev => new Set(prev).add(currentQuestionId));
    
        if (reviewStatus[currentQuestionId]) {
          setQuestionStatus(prevStatus => ({
            ...prevStatus,
            [currentQuestionId]: 'review'
          }));
        }
    
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    };

    const handleQuestionClick = (questionId: number) => {
        if (responses[questionId] === undefined) {
          setVisitedUnansweredQuestions(prev => new Set(prev).add(questionId));
          setQuestionStatus(prevStatus => ({
            ...prevStatus,
            [questionId]: 'unanswered'
          }));
        }
    
        setVisitedQuestions(prev => new Set(prev).add(questionId));
        // visit count is now handled entirely inside the useEffect tracking currentQuestionIndex!
        setCurrentQuestionIndex(mathsque.findIndex(q => q.id === questionId));
    };

    if (isLoading || sections.length === 0 || isDataFetching) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium">{isDataFetching ? "Fetching Latest Exam Questions..." : "Loading Secure Exam Environment..."}</p>
            </div>
        );
    }

    return (
        <>
        {isSubmitting && (
            <div className="fixed inset-0 z-[99999] backdrop-blur-md bg-black/40 flex flex-col items-center justify-center pointer-events-auto">
                <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-[90%] mx-auto transform animate-in fade-in zoom-in duration-300">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-blue-100 border-solid rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-[#0079D1] border-solid rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#0079D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Submitting Exam</h3>
                    <p className="text-slate-500 text-center font-medium">Please wait while we process your responses securely...</p>
                </div>
            </div>
        )}
        <div className={`font-[Arial,sans-serif] w-full h-screen bg-white text-black flex flex-col overflow-hidden relative ${isSubmitting ? 'pointer-events-none' : ''}`}>
            {/* Top Black Bar */}
            <div className="shrink-0 w-full bg-black text-white px-4 py-3 text-base flex justify-between items-center z-[1100] max-md:p-2 max-md:text-sm max-sm:text-xs">
                <div className="flex items-center gap-4">
                    <button onClick={toggleMenu} className="hidden max-md:flex items-center justify-center text-2xl bg-transparent border-none text-white cursor-pointer leading-none relative">
                        ☰ 
                    </button>
                    <span className="font-semibold text-lg max-md:text-base">Question Paper</span>
                </div>
                <span className="text-right font-medium max-md:mr-2">{username}</span>
            </div>
            
            <div className="flex flex-1 w-full overflow-hidden select-none relative">
                {/* Left Hand Section */}
                <div className="flex flex-1 flex-col overflow-hidden text-sm max-md:overflow-y-auto w-full">
                    {/* Title and Time */}
                    <div className="shrink-0 flex justify-between items-center px-4 py-2 sm:px-6 sm:py-4 border-b border-slate-200 bg-white shadow-sm z-10 w-full gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5">Exam Name</span>
                            <span className="text-sm sm:text-lg md:text-2xl font-extrabold text-slate-800 m-0 tracking-tight truncate"><QuestionMathJax content={(allSections?.assessment_name || sectionName)} /></span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pr-0.5">Time Remaining</span>
                            <div className={`
                                flex justify-center items-center px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-base md:text-xl font-bold transition-all duration-300
                                ${timeLeft <= 60 
                                    ? 'bg-red-50 text-red-700 border border-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                                    : timeLeft <= 300 
                                        ? 'bg-orange-50 text-orange-600 border border-orange-400' 
                                        : 'bg-slate-50 text-slate-700 border border-slate-200'}
                            `}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-6 sm:w-6 mr-1.5 sm:mr-2.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="tracking-wider">{hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
                            </div>
                        </div>
                    </div>

                    {/* Exam Type and Mark */}
                    <div className="shrink-0 text-xs sm:text-base text-[#e07a05] px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 bg-white flex justify-between items-center gap-2 w-full">
                        <div className="flex-1 overflow-hidden max-w-[65%] sm:max-w-full">
                            {sections.length > 0 && (
                            <div className="flex overflow-x-auto gap-2 pb-1 pt-0.5 px-0.5 scrollbar-thin">
                                {sections.map((section, index) => {
                                    const isActive = index === activeSectionIndex;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionChange(index)}
                                            className={`
                                                px-3 py-1 sm:px-6 sm:py-2 rounded-full cursor-pointer whitespace-nowrap text-[10px] sm:text-sm font-semibold transition-all duration-200 border
                                                ${isActive 
                                                    ? 'bg-[#0079D1] text-white border-[#0079D1] shadow-sm transform -translate-y-0.5' 
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-[#0079D1] hover:text-[#0079D1] hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <QuestionMathJax content={section.name} />
                                        </button>
                                    );
                                })}
                            </div>
                            )}
                        </div>
                        <div className="shrink-0 text-[10px] sm:text-sm text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            Type: {mathsque[currentQuestionIndex]?.type} | Marks: {mathsque[currentQuestionIndex]?.marks}
                        </div>
                    </div>

                    {/* Mobile Navigation Bar */}
                    <div className="shrink-0 hidden max-md:flex justify-between items-center border-b border-slate-200 p-2 bg-slate-50 w-full gap-2">
                        <button 
                            className="cursor-pointer px-2.5 py-2 rounded-lg bg-[#77549A] text-white border-none text-xs font-bold transition-all hover:bg-[#4c3463] hover:scale-[1.02] active:scale-95 flex-1 max-w-[150px]"
                            onClick={() => {
                                if (reviewStatus[mathsque[currentQuestionIndex]?.id]) {
                                    handleRemoveFromReview(mathsque[currentQuestionIndex].id);
                                } else {
                                    handleReview(mathsque[currentQuestionIndex].id);
                                }
                            }}>
                            {reviewStatus[mathsque[currentQuestionIndex]?.id] ? "Remove Review" : "Mark Review"}
                        </button>
                        <div className="flex items-center gap-2">
                            {currentQuestionIndex > 0 && (
                                <button className="cursor-pointer px-4 py-2 rounded-lg bg-[#0079D1] text-white border-none text-xs font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 min-w-[70px]" onClick={handlePrev}>Prev</button>
                            )}
                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <button className="cursor-pointer px-4 py-2 rounded-lg bg-[#0079D1] text-white border-none text-xs font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 min-w-[70px]" onClick={handleNext}>Next</button>
                            ) : (
                                <button disabled={isSubmitting} className="cursor-pointer px-4 py-2 rounded-lg bg-[#17ab07] text-white border-none text-xs font-bold transition-all hover:bg-[#0f7204] hover:scale-[1.02] active:scale-95 min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmitConfirm}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                            )}
                        </div>
                    </div>

                    {/* Question Viewer */}
                    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 sm:p-6 w-full text-base sm:text-xl">
                        <div className="w-full">
                                {mathsque.length > 0 && currentQuestionIndex < mathsque.length ? (
                                <div key={mathsque[currentQuestionIndex].id}>
                                    <div className="text-sm sm:text-lg md:text-xl font-bold m-1 mb-4 sm:m-2.5 sm:mb-6 leading-relaxed flex flex-wrap items-start gap-x-2 gap-y-1 relative">
                                        <span className="mr-2 whitespace-nowrap text-blue-800">Question {currentQuestionIndex + 1}:</span> 
                                        
                                        <div className="flex-1 min-w-[200px] inline-block whitespace-pre-wrap [&_p]:!m-0 [&_p]:whitespace-normal [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_span]:!inline [&_br]:hidden">
                                            <QuestionMathJax content={mathsque[currentQuestionIndex].que} />
                                        </div>
                                    </div>

                                    {mathsque[currentQuestionIndex].que_diag && mathsque[currentQuestionIndex].que_diag.length > 0 && (
                                    mathsque[currentQuestionIndex].que_diag.map((url, index) => (
                                        url &&
                                        <img key={index} 
                                        src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${url}`} 
                                        alt={`Question Diagram ${index + 1}`} className="max-w-full mx-auto my-2.5" />
                                    )))}

                                    {mathsque[currentQuestionIndex].options && mathsque[currentQuestionIndex].options.length > 0 ? (
                                    mathsque[currentQuestionIndex].options.map((option, index) => {
                                        const optionImage = mathsque[currentQuestionIndex].options_diag[index];
                                        return (                                         <div className="py-2 px-2 sm:py-3 sm:px-3 flex flex-row items-start gap-3 w-full hover:bg-slate-50 rounded-xl transition-colors" key={index}>
                                            <input type="radio"
                                                id={`option-${index}`}
                                                className="shrink-0 cursor-pointer w-4 h-4 mt-[6px]"
                                                name={mathsque[currentQuestionIndex].id.toString()}
                                                value={option}
                                                checked={responses[mathsque[currentQuestionIndex].id] === index}
                                                onChange={() => handleResponseChange(mathsque[currentQuestionIndex].id, index)} 
                                            />
                                            <label htmlFor={`option-${index}`} className="cursor-pointer flex-1 flex flex-row items-start gap-1 break-words leading-relaxed text-sm sm:text-lg [&_p]:!m-0 [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_mjx-container]:!align-middle [&_span]:!inline [&_br]:hidden">
                                                <span className="font-semibold mr-1 shrink-0 min-w-[1.25rem] sm:min-w-[1.5rem]">
                                                    {String.fromCharCode(65 + index)}.
                                                </span>
                                                <span className="inline-block whitespace-pre-wrap">
                                                    <QuestionMathJax content={option} />
                                                </span>
                                            </label>
                                            {optionImage && 
                                            <img 
                                            src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${optionImage}`} 
                                            alt={`Option ${index + 1}`} className="ml-2 max-h-12 sm:max-h-20 object-contain self-start" />}
                                        </div>

                                        );
                                    })
                                    ) : (<p>No options available for this question.</p>)}
                                    {responses[mathsque[currentQuestionIndex].id] !== undefined && (
                                    <button
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 mt-2.5 bg-[#ff1e1e] text-white border-none rounded-lg sm:rounded-[10px] cursor-pointer text-xs sm:text-sm transition-colors hover:bg-[#870505]"
                                        onClick={() => handleClearResponse(mathsque[currentQuestionIndex].id)}>
                                        Clear Response
                                    </button>
                                    )}

                                </div>
                                ) : (
                                <p>Loading questions.....</p>
                                )}
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="shrink-0 flex justify-end items-center border-t border-slate-200 p-3 sm:p-4 bg-slate-50 w-full max-md:hidden">
                         <div className="flex justify-end items-center w-full gap-2 sm:gap-4">
                            <button 
                                className="cursor-pointer px-2 py-2.5 sm:py-3 rounded-lg sm:rounded-[10px] bg-[#77549A] text-white border-none text-xs sm:text-base md:text-lg font-bold transition-all hover:bg-[#4c3463] hover:scale-[1.02] active:scale-95 flex-1 max-w-[180px] sm:max-w-[220px]"
                                onClick={() => {
                                    if (reviewStatus[mathsque[currentQuestionIndex]?.id]) {
                                        handleRemoveFromReview(mathsque[currentQuestionIndex].id);
                                    } else {
                                        handleReview(mathsque[currentQuestionIndex].id);
                                    }
                                }}>
                                {reviewStatus[mathsque[currentQuestionIndex]?.id] ? "Remove Review" : "Mark Review"}
                            </button>
                            {currentQuestionIndex > 0 && (
                                <button className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-[10px] bg-[#0079D1] text-white border-none text-xs sm:text-base md:text-lg font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 flex-1 max-w-[100px] sm:max-w-[150px]" onClick={handlePrev}>Prev</button>
                            )}
                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <button className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-[10px] bg-[#0079D1] text-white border-none text-xs sm:text-base md:text-lg font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 flex-1 max-w-[100px] sm:max-w-[150px]" onClick={handleNext}>Next</button>
                            ) : (
                                <button disabled={isSubmitting} className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-[10px] bg-[#17ab07] text-white border-none text-xs sm:text-base md:text-lg font-bold transition-all hover:bg-[#0f7204] hover:scale-[1.02] active:scale-95 flex-1 max-w-[120px] sm:max-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmitConfirm}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                            )}
                         </div>
                    </div>
                </div>
                
                {/* Right Hand Section */}
                <div className={`w-[25%] min-w-[300px] max-w-[380px] shrink-0 border-l border-black shadow-sm flex flex-col bg-white text-lg max-md:w-full max-md:border-none ${isMenuOpen ? 'max-md:flex max-md:absolute max-md:inset-0 max-md:z-[1050] max-md:h-full max-md:border-none' : 'max-md:hidden'}`}>
                    <div className="w-full aspect-video border-b border-black text-center bg-black shrink-0 relative max-md:max-h-[180px]">
                        {isMenuOpen && (
                            <button onClick={toggleMenu} className="hidden max-md:block absolute top-[10px] right-[10px] bg-white text-black text-2xl w-10 h-10 rounded-full z-10 font-bold border-0 cursor-pointer shadow-lg leading-none">
                                ×
                            </button>
                        )}
                        <video ref={videoRef}
                            className="w-full h-full object-cover transform scale-x-[-1]"
                            autoPlay
                            playsInline>
                        </video>
                    </div>
                        <div className="grid grid-cols-2 gap-x-1 gap-y-3 w-full p-2 mt-1 mb-2 max-md:gap-2 max-md:my-2">
                             <div className="flex items-center">
                                <span className="h-10 w-10 bg-[#D6D6D6] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-black shrink-0">{sectionCounts[sections[activeSectionIndex]?.id]?.notVisited || 0}</span>
                                <p className="text-[13px] xl:text-sm m-0 leading-tight">Not Visited</p>
                             </div>
                             <div className="flex items-center">
                                <span className="h-10 w-10 bg-[#17ab07] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0">{sectionCounts[sections[activeSectionIndex]?.id]?.answered || 0}</span>
                                <p className="text-[13px] xl:text-sm m-0 leading-tight">Answered</p>
                             </div>
                             <div className="flex items-center">
                                <span className="h-10 w-10 bg-[#eb0a0a] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0">{sectionCounts[sections[activeSectionIndex]?.id]?.unanswered || 0}</span>
                                <p className="text-[13px] xl:text-sm m-0 leading-tight">Not Answered</p>
                             </div>
                             <div className="flex items-center">
                                <span className="h-10 w-10 bg-[#77549A] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0">{sectionCounts[sections[activeSectionIndex]?.id]?.review || 0}</span>
                                <p className="text-[13px] xl:text-sm m-0 leading-tight">Marked for Review</p>
                             </div>
                        </div>

                    <div className="shrink-0 bg-[#0079D1] w-full p-2.5 flex items-center justify-center text-white border-y border-[#005e8e] font-bold">
                        <div className="m-0 text-lg"><QuestionMathJax content={sections[activeSectionIndex]?.name || "Loading..."} /></div>
                    </div>
                    
                    <div className="flex flex-col flex-1 overflow-hidden bg-[#E5F6FD] w-full border-b border-transparent">
                        <div className="flex-1 overflow-y-auto w-full p-4">
                            <div className="flex flex-col gap-4 max-md:items-center">
                                {Array.from({ length: Math.ceil(totalQuestions / 5) }, (_, rowIndex) => (
                                <div className="flex flex-wrap w-full justify-start max-md:justify-center flex-row gap-3 xl:gap-4" key={rowIndex}>
                                    {Array.from({ length: 5 }, (_, index) => {
                                    const questionNumber = rowIndex * 5 + index + 1;
                                    const questionId = mathsque[questionNumber - 1]?.id;
                                    const status = questionStatus[questionId];
                                    const isCurrent = currentQuestionIndex === questionNumber - 1;
                                    const isVisited = visitedQuestions.has(questionId) && responses[questionId] === undefined;
                                    
                                    let bgClass = '';
                                    if (status === 'answered') bgClass = 'bg-[#17ab07]';
                                    else if (status === 'review' || status === 'review_answered') bgClass = 'bg-[#77549A]';
                                    else if (status === 'unanswered') bgClass = 'bg-[#eb0a0a]';
                                    else if (isVisited && !isCurrent) bgClass = 'bg-[#eb0a0a]';
                                    else bgClass = 'bg-[#D6D6D6]';
                                    
                                    const borderClass = isCurrent ? 'ring-2 ring-black ring-offset-2' : '';
                                    const textClass = (status === 'answered' || status === 'review' || status === 'review_answered' || status === 'unanswered' || (isVisited && !isCurrent)) ? 'text-white' : 'text-black';

                                    return questionNumber <= totalQuestions ? (
                                        <div className="flex justify-center shrink-0 w-9 sm:w-[45px]" key={questionNumber}>
                                            <button
                                              className={`w-9 h-9 sm:w-[45px] sm:h-[45px] flex items-center justify-center rounded-[8px] font-semibold text-sm sm:text-lg hover:opacity-80 transition-opacity border-none cursor-pointer ${bgClass} ${borderClass} ${textClass}`}
                                              onClick={() => {
                                                  handleQuestionClick(questionId);
                                                  if (window.innerWidth < 768) {
                                                      setIsMenuOpen(false); // Close menu overlay on mobile
                                                  }
                                              }}
                                            >
                                            {questionNumber}
                                            </button>
                                        </div>
                                    ) : null;
                                    })}
                                </div>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0 text-xl bg-[#E5F6FD] flex justify-center items-center w-full p-4 border-t border-black">
                            <button disabled={isSubmitting} className="cursor-pointer px-6 py-3 rounded-[10px] bg-[#0079D1] text-white border-none font-bold text-lg w-full max-w-[200px] transition-all hover:bg-[#034d82] hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmitConfirm}>{isSubmitting ? "Submitting..." : "Submit Exam"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
} 
