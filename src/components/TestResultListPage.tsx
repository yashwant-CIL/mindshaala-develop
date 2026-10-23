import { useState, useEffect } from "react";
import { MCQResultList } from "./test-series/components/MCQResultList";
import { DynamicAssessmentResultList } from "./test-series/components/DynamicAssessmentResultList";

export interface TestResultListPageProps {
    onViewResult: (userAssId: number | string, assessmentMethod?: string) => void;
    onStartTest?: (test: any) => void;
    initialTab?: "available" | "custom";
}

export function TestResultListPage({ onViewResult, onStartTest, initialTab }: TestResultListPageProps) {
    const [activeTab, setActiveTab] = useState<"available" | "custom">(() => {
        if (initialTab) return initialTab;
        const stored = sessionStorage.getItem("test_result_active_tab") || localStorage.getItem("test_result_active_tab");
        if (stored === "custom" || stored === "available") {
            sessionStorage.removeItem("test_result_active_tab");
            localStorage.removeItem("test_result_active_tab");
            return stored;
        }
        return "available";
    });

    useEffect(() => {
        const stored = sessionStorage.getItem("test_result_active_tab") || localStorage.getItem("test_result_active_tab");
        if (stored === "custom" || stored === "available") {
            setActiveTab(stored);
            sessionStorage.removeItem("test_result_active_tab");
            localStorage.removeItem("test_result_active_tab");
        }
    }, [initialTab]);

    return (
        <div className="p-6 mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Results</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Review your performance from past assessments.
                    </p>
                </div>
            </div>

            {/* Modern Segmented Tab Control (Matching Take Test Section) */}
            <div className="bg-white p-1.5 rounded-2xl inline-flex w-auto border border-slate-200 shadow-xs">
                <button 
                    onClick={() => setActiveTab("available")}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer ${
                        activeTab === "available" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${activeTab === "available" ? "bg-green-400" : "bg-slate-300"}`} />
                    Available Assessments Result
                </button>
                <button 
                    onClick={() => setActiveTab("custom")}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer ${
                        activeTab === "custom" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${activeTab === "custom" ? "bg-blue-400" : "bg-slate-300"}`} />
                    Dynamic Assessments Results
                </button>
            </div>

            {/* Tab Views */}
            <div className="outline-none">
                {activeTab === "available" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <MCQResultList 
                            onViewResult={onViewResult} 
                            onStartTest={onStartTest} 
                            hideHeader={true}
                        />
                    </div>
                )}

                {activeTab === "custom" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <DynamicAssessmentResultList 
                            onViewResult={onViewResult} 
                            onStartTest={onStartTest} 
                            hideHeader={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
