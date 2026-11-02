import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TestService } from "../../../services/TestServices";
import { TestresultService } from "../../../services/TestresultService";
import { DynamicAssessmentService } from "../../../services/DynamicAssessmentService";
import { Button } from "../../../components/ui/button";
import Cookies from "js-cookie";

interface ResultCountdownProps {
    userAssId: number | string;
    assessmentType?: string;
    assessmentMethod?: string;
    onResultFetched: (data: any) => void;
    onCancel?: () => void;
    isDynamic?: boolean;
    source?: string;
    userId?: number | string | null;
    subscriptionId?: number | string | null;
}

export function ResultCountdown({ 
    userAssId, 
    assessmentType,
    assessmentMethod,
    onResultFetched, 
    onCancel,
    isDynamic,
    source,
    userId,
    subscriptionId,
}: ResultCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isChecking, setIsChecking] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Generating your report...");

    const timeLeftRef = useRef(60);
    const isCheckingRef = useRef(false);
    const isResultReadyRef = useRef(false);
    const isMountedRef = useRef(true);

    // Synchronize timeLeft in ref so interval and async callbacks never suffer from stale closures
    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const isDynamicAssessment = Boolean(
        isDynamic ||
        source === "dynamic" ||
        (assessmentType && (assessmentType.toUpperCase() === "DYNAMIC" || assessmentType.toUpperCase() === "CUSTOM")) ||
        (typeof window !== "undefined" && (
            localStorage.getItem("is_dynamic_assessment") === "true" ||
            sessionStorage.getItem("is_dynamic_assessment") === "true" ||
            localStorage.getItem("test_result_active_tab") === "custom" ||
            sessionStorage.getItem("test_result_active_tab") === "custom" ||
            localStorage.getItem("takeTest_activeTab") === '"custom"'
        ))
    );

    const isTheoryAssessment = () => {
        const method = (assessmentMethod || assessmentType || "").toUpperCase();
        if (method === "TH" || method === "THEORY") return true;

        try {
            const savedMethod = localStorage.getItem("selectedAssessmentMethod");
            if (savedMethod) {
                const parsed = JSON.parse(savedMethod);
                if (typeof parsed === "string" && (parsed.toUpperCase() === "TH" || parsed.toUpperCase() === "THEORY")) {
                    return true;
                }
            }
        } catch (e) {
            // ignore
        }

        try {
            const savedConfig = localStorage.getItem("takeTest_activeTestConfig");
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                const configMethod = (parsed?.assessmentMethod || parsed?.assessmentType || parsed?.testType || "").toUpperCase();
                if (configMethod === "TH" || configMethod === "THEORY") {
                    return true;
                }
            }
        } catch (e) {
            // ignore
        }

        return false;
    };

    const checkResult = async () => {
        // If countdown reached 0 or result is already ready or already in-flight, DO NOT call methods in background!
        if (timeLeftRef.current <= 0 || isResultReadyRef.current || isCheckingRef.current || !isMountedRef.current) {
            console.log("[ResultCountdown] Countdown reached 0 or result already ready; skipping API check.");
            return;
        }

        isCheckingRef.current = true;
        setIsChecking(true);

        try {
            if (isDynamicAssessment) {
                const effectiveUserId = userId || (typeof window !== "undefined"
                    ? localStorage.getItem("user_id") || localStorage.getItem("userId") || Cookies.get("user_id") || Cookies.get("userId")
                    : null);
                const effectiveSubId = subscriptionId || (typeof window !== "undefined"
                    ? localStorage.getItem("subscription_id") || localStorage.getItem("subscriptionId") || Cookies.get("subscription_id") || Cookies.get("subscriptionId")
                    : null) || 100018;

                console.log("[ResultCountdown] Checking dynamic assessment result:", {
                    userId: effectiveUserId,
                    subscriptionId: effectiveSubId,
                    assessmentId: userAssId
                });

                const response = await DynamicAssessmentService.GET_ATTEMPTED_ASSESSMENT_RESULT(
                    Number(effectiveUserId),
                    Number(effectiveSubId),
                    Number(userAssId)
                );

                console.log("[ResultCountdown] Dynamic result check response:", response);

                // If countdown expired while waiting for response, abort immediately
                if (timeLeftRef.current <= 0 || !isMountedRef.current) {
                    console.log("[ResultCountdown] Countdown hit 0; dropping dynamic result response.");
                    return;
                }

                const resultData = response?.data || response?.result || response;
                const isSuccess = Boolean(
                    resultData && (
                        resultData.assessment_id ||
                        resultData.user_ass_id ||
                        resultData.id ||
                        resultData.score !== undefined ||
                        resultData.obtained_marks !== undefined ||
                        resultData.questions ||
                        resultData.question_data ||
                        resultData.sections ||
                        resultData.sub_division_data ||
                        resultData.status === "COMPLETED" ||
                        resultData.assessment_status === "COMPLETED" ||
                        resultData.status === "SUBMITTED" ||
                        resultData.completion_status === "COMPLETED" ||
                        resultData.completion_status === "SUBMITTED" ||
                        response?.status === 200 ||
                        response?.status === "SUCCESS"
                    )
                );

                if (isSuccess) {
                    isResultReadyRef.current = true;
                    setStatusMessage("Result ready!");
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            onResultFetched(resultData);
                        }
                    }, 1000);
                }
            } else {
                console.log("[ResultCountdown] Checking available assessment result for userAssId:", userAssId);

                // First update the competitive paper result
                // await TestresultService.checkCompetitivePaper(userAssId);

                if (timeLeftRef.current <= 0 || !isMountedRef.current) {
                    return;
                }

                // Then get the exam result status
                const response = await TestService.getExamResult(userAssId);

                if (timeLeftRef.current <= 0 || !isMountedRef.current) {
                    return;
                }

                // Success condition based on user's manual requirement
                if (response && response.attribute2 === "Result generated successfully") {
                    isResultReadyRef.current = true;
                    setStatusMessage("Result ready!");
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            onResultFetched(response.data || response);
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Failed to check result status:", error);
        } finally {
            isCheckingRef.current = false;
            if (isMountedRef.current) {
                setIsChecking(false);
            }
        }
    };

    // Countdown timer: decrements every second, stops strictly at 0
    useEffect(() => {
        if (timeLeft <= 0) {
            setStatusMessage("Evaluation is taking longer than usual...");
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                timeLeftRef.current = next;
                if (next <= 0) {
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Polling effect: only polls while countdown is active (timeLeft > 0). If count reaches 0, stops completely!
    useEffect(() => {
        // Initial check on mount
        checkResult();

        const interval = setInterval(() => {
            // When countdown reaches 0 or result is ready, CLEAR interval and NEVER call methods in background
            if (timeLeftRef.current <= 0 || isResultReadyRef.current) {
                console.log("[ResultCountdown] Countdown reached 0 or result ready; stopping background poll interval.");
                clearInterval(interval);
                return;
            }

            if (!isCheckingRef.current) {
                checkResult();
            }
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(interval);
    }, []); 

    const progress = ((60 - timeLeft) / 60) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-12">
                {/* Simplified Timer Area */}
                <div className="relative flex items-center justify-center">
                    <svg width="240" height="240" className="transform -rotate-90">
                        <circle
                            cx="120" cy="120" r="110"
                            stroke="#f1f5f9" strokeWidth="8" fill="transparent"
                        />
                        <motion.circle
                            cx="120" cy="120" r="110"
                            stroke={timeLeft === 0 ? "#f59e0b" : "#4f46e5"}
                            strokeWidth="12" fill="transparent"
                            strokeDasharray={2 * Math.PI * 110}
                            initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                            animate={{ strokeDashoffset: (2 * Math.PI * 110) * (1 - progress / 100) }}
                            transition={{ duration: 1, ease: "linear" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-7xl font-black tracking-tighter ${timeLeft === 0 ? "text-amber-500" : "text-slate-900"}`}>
                            {timeLeft}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Seconds</span>
                    </div>
                </div>

                {/* Status Message */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        {timeLeft > 0 ? (
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        )}
                        <h2 className={`text-2xl font-bold ${timeLeft === 0 ? "text-amber-600" : "text-slate-900"}`}>{statusMessage}</h2>
                    </div>
                    {timeLeft === 0 ? (
                        <p className="text-slate-500 text-sm font-medium px-8 leading-relaxed italic">
                            It takes longer time than usual you can check after some time.
                        </p>
                    ) : (
                        <p className="text-slate-500 text-sm font-medium px-8 leading-relaxed">
                            Please wait while your assessment is processed. This page will update automatically.
                        </p>
                    )}
                </div>

                {/* Return Button (Only if taking too long) */}
                {timeLeft === 0 && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-700">
                        <Button 
                            onClick={() => {
                                sessionStorage.setItem("test_result_active_tab", isDynamicAssessment ? "custom" : "available");
                                localStorage.setItem("test_result_active_tab", isDynamicAssessment ? "custom" : "available");
                                if (isDynamicAssessment) {
                                    window.dispatchEvent(
                                        new CustomEvent("app:navigate", {
                                            detail: { page: "test-history", params: { tab: "custom" } }
                                        })
                                    );
                                    window.dispatchEvent(
                                        new CustomEvent("test_result_tab_change", { detail: { tab: "custom" } })
                                    );
                                }
                                onResultFetched(null);
                            }} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-2xl shadow-lg transition-all cursor-pointer"
                        >
                            Go to Test Result Page
                        </Button>
                        {/* <button 
                            onClick={() => window.location.reload()}
                            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            Re-check status manually
                        </button> */}
                    </div>
                )}
                
                {onCancel && timeLeft > 0 && (
                    <button 
                        onClick={onCancel}
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        Cancel & Return
                    </button>
                )}
            </div>
        </div>
    );
}
