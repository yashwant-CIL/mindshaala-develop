import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TestService } from "../../../services/TestServices";
import { TestresultService } from "../../../services/TestresultService";
import { Button } from "../../../components/ui/button";

interface ResultCountdownProps {
    userAssId: number | string;
    onResultFetched: (data: any) => void;
    onCancel?: () => void;
}

export function ResultCountdown({ userAssId, onResultFetched, onCancel }: ResultCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isChecking, setIsChecking] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Generating your report...");

    const checkResult = async () => {
        setIsChecking(true);
        try {
            // First update the competitive paper result
            await TestresultService.checkCompetitivePaper(userAssId);
            
            // Then get the exam result status
            const response = await TestService.getExamResult(userAssId);
            
            // Success condition based on user's manual requirement
            if (response && response.attribute2 === "Result generated successfully") {
                setStatusMessage("Result ready!");
                setTimeout(() => {
                    onResultFetched(response.data || response);
                }, 1000);
            }
        } catch (error) {
            console.error("Failed to check result status:", error);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        // Initial check on mount
        checkResult();

        const interval = setInterval(() => {
            if (!isChecking && timeLeft > 0) {
                checkResult();
            }
        }, 20000); // Poll every 20 seconds
        return () => clearInterval(interval);
    }, []); 

    useEffect(() => {
        if (timeLeft === 0) {
            setStatusMessage("Evaluation is taking longer than usual...");
        }
    }, [timeLeft]);

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
                            onClick={() => onResultFetched(null)} // Trigger navigation to result page 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-2xl shadow-lg transition-all"
                        >
                            Go to Test Result Page
                        </Button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            Re-check status manually
                        </button>
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
