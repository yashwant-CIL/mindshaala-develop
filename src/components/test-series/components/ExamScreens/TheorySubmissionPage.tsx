import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  ChevronRight,
  ChevronDown,
  FileCheck,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  Send,
  Plus,
  Maximize2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { useToast } from "../../../../hooks/use-toast";
import { TestService } from "../../../../services/TestServices";
import { useCourse } from "../../../../context/CourseContext";
import QuestionMathJax, { QuestionMathJaxConfig } from "../../../../shared/mathjaxconfig/QuestionMathJax";
import { MathJaxContext } from "better-react-mathjax";
import { getDeterministicShuffle } from "../../../../shared/utils/ShuffleUtils";

interface TheorySubmissionPageProps {
    onComplete: () => void;
    onExit?: () => void;
}

const getLocalDateTimeString = (date = new Date()) => {
    const pad = (n: number, z = 2) => String(n).padStart(z, '0');
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds()) +
        '.' +
        pad(date.getMilliseconds(), 3)
    );
};

const compressImage = (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.75): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
};

export function TheorySubmissionPage({ onComplete, onExit }: TheorySubmissionPageProps) {
    // console.log("TheorySubmissionPage: Component Mount/Render");
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { userAssId } = useCourse();
    
    // Recovery Logic: Handle reloads/browser restarts by checking localStorage
    const [effectiveUserAssId, setEffectiveUserAssId] = useState<string | null>(null);

    useEffect(() => {
        const idFromState = (location.state as any)?.user_ass_id;
        const idFromStorage = localStorage.getItem("userAssId");
        const finalId = userAssId || idFromState || idFromStorage;

        if (finalId) {
            setEffectiveUserAssId(finalId.toString());
            // Persist for next reload
            if (finalId) localStorage.setItem("userAssId", finalId.toString());
        } else {
            // Truly lost session: Redirect to home/tests
            toast({
                title: "Session Expired",
                description: "Assessment session not found. Redirecting to course list...",
                variant: "destructive"
            });
            setTimeout(() => navigate("/"), 2000);
        }
    }, [userAssId, location.state]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [questionPaperData, setQuestionPaperData] = useState<any>(null);
    const [isTypeset, setIsTypeset] = useState(false);
    const hiddenContainerRef = useRef<HTMLDivElement>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
    const [savedMcq, setSavedMcq] = useState<Record<string, boolean>>({});
    const [uploadingQid, setUploadingQid] = useState<string | null>(null);
    const [bulkSavingGroupId, setBulkSavingGroupId] = useState<string | null>(null);
    const [matchShuffles, setMatchShuffles] = useState<Record<string, string[]>>({});
    const [matchMappings, setMatchMappings] = useState<Record<string, string>>({});
    const [pendingImages, setPendingImages] = useState<Record<string, File[]>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const sanitizeLatex = (val: string | null | undefined): string => {
        if (!val) return "";
        return val
            .replace(/\\\\n/g, "\n")
            .replace(/\\\\r/g, "\r")
            .replace(/\\\\t/g, "\t")
            .replace(/\\\\\\/g, "\\")
            .trim();
    };

    useEffect(() => {
        if (effectiveUserAssId) {
            fetchData();
        } else {
            setLoading(false);
            setError("Assessment session not found. Please try again from the test list.");
            setIsTypeset(true);
        }
    }, [effectiveUserAssId]);

    const fetchData = async () => {
        try {
            console.log("TheorySubmissionPage: fetchData START");
            setLoading(true);
            const data = await TestService.getTheoryExamQuestions(effectiveUserAssId!.toString());
            console.log("TheorySubmissionPage: fetchData DATA RECEIVED:", !!data);
            if (data && data.section_data) {
                setError(null);
                data.section_data.sort((a: any, b: any) => (a.section_number || 0) - (b.section_number || 0));
                setQuestionPaperData(data);
                
                // Expand the first section by default
                if (data.section_data.length > 0) {
                    setExpandedSections({ [data.section_data[0].assessment_section_id]: true });
                }

                const newAnswers: Record<string, any> = {};
                const newMcq: Record<string, number> = {};
                const newText: Record<string, string> = {};
                const newSaved: Record<string, boolean> = {};
                const newShuffles: Record<string, string[]> = {};
                const newMatchMappings: Record<string, string> = {};

                for (const section of data.section_data) {
                    if (!section.question_data) continue;
                    const questions = section.question_data;
                    let i = 0;
                    while(i < questions.length) {
                        const q = questions[i];
                        const qType = q.question_type_name?.toLowerCase().trim() || "";
                        
                        // Extract answer directly from question data if it exists
                        if (q.user_answer_id) {
                            const hasUserAnswer = q.user_answer !== null && q.user_answer !== undefined && q.user_answer !== "";
                            const hasUserImage = q.user_answer_image !== null && q.user_answer_image !== undefined && q.user_answer_image !== "";
                            const hasAnyContent = hasUserAnswer || hasUserImage;

                            const latest = {
                                user_answer_id: q.user_answer_id,
                                user_answer: q.user_answer,
                                user_answer_image: q.user_answer_image,
                                answer_submission_time: q.answer_submission_time
                            };
                            newAnswers[q.question_id] = latest;

                            if (qType === "match the following") {
                                // Match logic handled group-wise below
                            } else if (qType === "theory mcq 1 marks" || qType === "assertion&reasoning") {
                                const alpha = latest.user_answer;
                                if (alpha && alpha.length === 1 && hasAnyContent) {
                                    newMcq[q.question_id] = alpha.toUpperCase().charCodeAt(0) - 65;
                                    newSaved[q.question_id] = true;
                                }
                            } else if (qType === "name the following" || qType === "fill in the blanks") {
                                if (hasAnyContent) {
                                    newText[q.question_id] = latest.user_answer || "";
                                    newSaved[q.question_id] = true;
                                }
                            } else if (qType === "image question") {
                                if (hasAnyContent) {
                                    newSaved[q.question_id] = true;
                                }
                            }
                        }

                        if (qType === "match the following") {
                            const groupId = q.question_id;
                            const group = [q];
                            let j = i + 1;
                            while(j < questions.length && questions[j].question_type_name?.toLowerCase().trim() === "match the following") {
                                group.push(questions[j]);
                                j++;
                            }
                            const original = group.map(mq => mq.answer_description);
                            const seed = `${effectiveUserAssId}-${groupId}`;
                            const shuffled = getDeterministicShuffle(original, seed);
                            newShuffles[groupId] = shuffled;

                            for (const mq of group) {
                                if (mq.user_answer && mq.user_answer.trim() !== "") {
                                    const letterIdx = shuffled.indexOf(mq.user_answer);
                                    if (letterIdx !== -1) {
                                        newMatchMappings[mq.question_id] = String.fromCharCode(65 + letterIdx);
                                        newSaved[mq.question_id] = true;
                                    }
                                }
                            }
                            i = j;
                        } else {
                            i++;
                        }
                    }
                }
                setUserAnswers(newAnswers);
                setMcqAnswers(newMcq);
                setTextAnswers(newText);
                setSavedMcq(newSaved);
                setMatchShuffles(newShuffles);
                setMatchMappings(newMatchMappings);
                console.log("TheorySubmissionPage: fetchData SUCCESS - Initial states updated");

                // SEPARATE SYNC PHASE: Call getUserAnswer for each question to be 100% sure
                console.log("TheorySubmissionPage: Starting Granular Sync Phase...");
                const allQuestions: any[] = [];
                data.section_data.forEach((s: any) => s.question_data?.forEach((q: any) => allQuestions.push(q)));

                await Promise.all(allQuestions.map(async (q) => {
                    if (q.user_answer_id) {
                        try {
                            const res = await TestService.getUserAnswer(q.user_answer_id);
                            if (res && (res.user_answer || res.user_answer_image)) {
                                const qType = q.question_type_name?.toLowerCase().trim() || "";
                                // Update saved state
                                setSavedMcq(prev => ({ ...prev, [q.question_id]: true }));
                                
                                // Update specific answer state if needed
                                if (qType === "theory mcq 1 marks" || qType === "assertion&reasoning") {
                                    const alpha = res.user_answer;
                                    if (alpha && alpha.length === 1) {
                                        setMcqAnswers(prev => ({ ...prev, [q.question_id]: alpha.toUpperCase().charCodeAt(0) - 65 }));
                                    }
                                } else if (qType === "name the following" || qType === "fill in the blanks") {
                                    setTextAnswers(prev => ({ ...prev, [q.question_id]: res.user_answer || "" }));
                                } else if (qType === "match the following") {
                                    const shuffled = newShuffles[q.question_id] || [];
                                    if (res.user_answer && shuffled.length > 0) {
                                        const letterIdx = shuffled.indexOf(res.user_answer);
                                        if (letterIdx !== -1) {
                                            setMatchMappings(prev => ({ ...prev, [q.question_id]: String.fromCharCode(65 + letterIdx) }));
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn(`Sync failed for question ${q.question_id}`, err);
                        }
                    }
                }));
                console.log("TheorySubmissionPage: Granular Sync Phase COMPLETE");
            } else {
                console.warn("TheorySubmissionPage: fetchData - No section data found in response");
                setError("No assessment content found.");
            }
            setLoading(false);
        } catch (error) {
            console.error("TheorySubmissionPage: fetchData ERROR:", error);
            setError("Failed to load assessment data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && questionPaperData) {
            const typesetContent = async () => {
                // @ts-ignore
                if (window.MathJax && window.MathJax.typesetPromise) {
                    try {
                        const target = hiddenContainerRef.current || document.body;
                        // @ts-ignore
                        await window.MathJax.typesetPromise([target]);
                        setIsTypeset(true);
                        setTimeout(() => {
                            // @ts-ignore
                            window.MathJax.typeset([target]);
                        }, 400);
                    } catch (e) {
                         console.error("MathJax Error:", e);
                         setIsTypeset(true);
                    }
                } else {
                    setIsTypeset(true);
                }
            };
            const timer = setTimeout(typesetContent, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, questionPaperData, expandedSections]);

    const handleMcqChange = (qid: string, value: number) => {
        if (savedMcq[qid]) return;
        setMcqAnswers(prev => ({ ...prev, [qid]: value }));
    };

    const handleSaveMCQ = async (qid: string, uaid: string) => {
        if (!uaid) {
            toast({ title: "Error", description: "Answer tracking ID missing.", variant: "destructive" });
            return;
        }
        const selectedIdx = mcqAnswers[qid];
        if (selectedIdx === undefined) return;
        setUploadingQid(qid);
        try {
            const payload = {
                userAnswerId: uaid,
                userAnswerImages: null,
                userAnswerText: String.fromCharCode(65 + selectedIdx),
                answerUploadType: "ANSWER_TEXT",
                status: "ACTIVE",
                attemptStatus: "ANSWERED",
                answerSubmissionTime: getLocalDateTimeString()
            };

            console.log("Submitting MCQ Payload:", payload);
            const response = await TestService.submitUserAnswer(payload);
            if (response) {
                toast({ title: "Saved", description: "MCQ answer recorded." });
                setSavedMcq(prev => ({ ...prev, [qid]: true }));
                setUserAnswers(prev => ({ ...prev, [qid]: { ...prev[qid], user_answer: String.fromCharCode(65 + selectedIdx) } }));
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to save answer.", variant: "destructive" });
        } finally {
            setUploadingQid(null);
        }
    };

    const handleSaveText = async (qid: string, uaid: string) => {
        if (!uaid) {
            toast({ title: "Error", description: "Answer tracking ID missing.", variant: "destructive" });
            return;
        }
        const text = textAnswers[qid];
        if (!text || !text.trim()) return;
        setUploadingQid(qid);
        try {
            const payload = {
                userAnswerId: uaid,
                userAnswerImages: null,
                userAnswerText: text,
                answerUploadType: "ANSWER_TEXT",
                status: "ACTIVE",
                attemptStatus: "ANSWERED",
                answerSubmissionTime: getLocalDateTimeString()
            };

            console.log("Submitting Text Payload:", payload);
            const response = await TestService.submitUserAnswer(payload);
            if (response) {
                toast({ title: "Saved", description: "Answer recorded." });
                setSavedMcq(prev => ({ ...prev, [qid]: true }));
                setUserAnswers(prev => ({ ...prev, [qid]: { ...prev[qid], user_answer: text } }));
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to save answer.", variant: "destructive" });
        } finally {
            setUploadingQid(null);
        }
    };

    const handleBulkSaveMatch = async (questions: any[], groupId: string) => {
        setBulkSavingGroupId(groupId);
        const shuffled = matchShuffles[groupId];
        if (!shuffled) {
            setBulkSavingGroupId(null);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const q of questions) {
            const letter = matchMappings[q.question_id];
            if (!letter || !letter.trim() || savedMcq[q.question_id]) continue;
            
            const letterIdx = letter.toUpperCase().charCodeAt(0) - 65;
            const actualAnswer = shuffled[letterIdx];
            if (!actualAnswer) continue;

            if (!q.user_answer_id) {
                failCount++;
                continue;
            }

            try {
                const payload = {
                    userAnswerId: q.user_answer_id,
                    userAnswerImages: null,
                    userAnswerText: actualAnswer,
                    answerUploadType: "ANSWER_TEXT",
                    status: "ACTIVE",
                    attemptStatus: "ANSWERED",
                    answerSubmissionTime: getLocalDateTimeString()
                };

                console.log(`Submitting Bulk Match [${q.question_id}] Payload:`, payload);
                const response = await TestService.submitUserAnswer(payload);
                if (response) {
                    setSavedMcq(prev => ({ ...prev, [q.question_id]: true }));
                    setUserAnswers(prev => ({ ...prev, [q.question_id]: { ...prev[q.question_id], user_answer: actualAnswer } }));
                    successCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        if (successCount > 0) toast({ title: "Bulk Save", description: `Successfully saved ${successCount} matches.` });
        if (failCount > 0) toast({ title: "Error", description: `Failed to save ${failCount} matches.`, variant: "destructive" });
        setBulkSavingGroupId(null);
    };

    const handleSaveMatch = async (qid: string, uaid: string, groupId: string) => {
        if (!uaid) {
            toast({ title: "Error", description: "Answer tracking ID missing.", variant: "destructive" });
            return;
        }
        const letter = matchMappings[qid];
        if (!letter || !letter.trim()) return;
        const shuffled = matchShuffles[groupId];
        if (!shuffled) return;
        const letterIdx = letter.toUpperCase().charCodeAt(0) - 65;
        const actualAnswer = shuffled[letterIdx];
        if (!actualAnswer) return;

        setUploadingQid(qid);
        try {
            const payload = {
                userAnswerId: uaid,
                userAnswerImages: null,
                userAnswerText: actualAnswer,
                answerUploadType: "ANSWER_TEXT",
                status: "ACTIVE",
                attemptStatus: "ANSWERED",
                answerSubmissionTime: getLocalDateTimeString()
            };

            console.log("Submitting Match Payload:", payload);
            const response = await TestService.submitUserAnswer(payload);
            if (response) {
                toast({ title: "Saved", description: "Match recorded." });
                setSavedMcq(prev => ({ ...prev, [qid]: true }));
                setUserAnswers(prev => ({ ...prev, [qid]: { ...prev[qid], user_answer: actualAnswer } }));
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to save match.", variant: "destructive" });
        } finally {
            setUploadingQid(null);
        }
    };

    const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>, qid: string) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingQid(qid); 
        try {
            const compressedBatch = await Promise.all(
                files.map(file => compressImage(file))
            );
            setPendingImages(prev => ({
                ...prev,
                [qid]: [...(prev[qid] || []), ...compressedBatch]
            }));
            toast({ title: "Images Added", description: `${files.length} images compressed.` });
        } catch (err) {
            toast({ title: "Error", description: "Failed to process images.", variant: "destructive" });
        } finally {
            setUploadingQid(null);
        }
    };

    const removePendingImage = (qid: string, index: number) => {
        setPendingImages(prev => {
            const updated = [...(prev[qid] || [])];
            updated.splice(index, 1);
            return { ...prev, [qid]: updated };
        });
    };

    const uploadAllImages = async (qid: string, uaid: string) => {
        if (!uaid) {
            toast({ title: "Error", description: "Answer tracking ID missing.", variant: "destructive" });
            return;
        }
        const files = pendingImages[qid];
        if (!files || files.length === 0) return;

        setUploadingQid(qid);
        try {
            const payload = {
                userAnswerId: uaid,
                userAnswerImages: files, // Array of files
                userAnswerText: null,
                answerUploadType: "ANSWER_IMAGE",
                status: "ACTIVE",
                attemptStatus: "ANSWERED",
                answerSubmissionTime: getLocalDateTimeString()
            };

            console.log("Submitting Image Upload Payload:", payload);
            const response = await TestService.submitUserAnswer(payload);
            if (response) {
                toast({ title: "Success", description: "All images uploaded." });
                setPendingImages(prev => { const n = { ...prev }; delete n[qid]; return n; });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
        } finally {
            setUploadingQid(null);
        }
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await TestService.submitTheoryExam({
                assessment_status: "SUBMITTED"
            }, effectiveUserAssId!.toString());
            if (response) {
                toast({ title: "Submitted", description: "Assessment submitted successfully." });
                onComplete();
            }
        } catch (error) {
            toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const getSectionProgress = (section: any) => {
        const questions = section.question_data || [];
        let answered = 0;
        questions.forEach((q: any) => {
            if (savedMcq[q.question_id] || userAnswers[q.question_id]?.user_answer_images) {
                answered++;
            }
        });
        return { answered, total: questions.length };
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const renderSubmissionUI = (question: any) => {
        const currentAnswer = userAnswers[question.question_id];
        const qai = question.question_id;
        const qType = question.question_type_name?.toLowerCase().trim() || "";
        const isMcq = qType === "theory mcq 1 marks" || qType === "assertion&reasoning";
        const isText = qType === "name the following" || qType === "fill in the blanks";

        if (isMcq) {
            const options = [
                question.option1_latex, 
                question.option2_latex, 
                question.option3_latex, 
                question.option4_latex, 
                question.option5_latex
            ].filter(Boolean);

            return (
                <div className="mt-6 space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt, i) => {
                            const isSelected = mcqAnswers[question.question_id] === i;
                            const isSaved = savedMcq[question.question_id];
                            return (
                                <button
                                    key={`opt-${i}`}
                                    onClick={() => !isSaved && handleMcqChange(question.question_id, i)}
                                    disabled={isSaved}
                                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                                        isSelected 
                                            ? "bg-indigo-50 border-indigo-600 shadow-md ring-2 ring-indigo-600/10" 
                                            : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                    } ${isSaved ? "opacity-90 cursor-default" : "cursor-pointer"}`}
                                >
                                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <div className="text-sm font-medium"><QuestionMathJax content={sanitizeLatex(opt)} skipInternalLoading /></div>
                                </button>
                            );
                        })}
                    </div>
                    {!savedMcq[question.question_id] ? (
                        <Button 
                            onClick={() => handleSaveMCQ(question.question_id, question.user_answer_id)}
                            className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                        >
                            Save Selection
                        </Button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            Answer Submitted
                        </div>
                    )}
                </div>
            );
        }

        if (isText) {
            return (
                <div className="mt-6 space-y-4 max-w-2xl">
                    <textarea
                        value={textAnswers[question.question_id] || ""}
                        onChange={(e) => !savedMcq[question.question_id] && setTextAnswers(prev => ({ ...prev, [question.question_id]: e.target.value }))}
                        readOnly={savedMcq[question.question_id]}
                        placeholder="Type your answer here..."
                        className={`w-full h-40 p-6 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none text-slate-700 text-lg leading-relaxed placeholder:text-slate-300 ${savedMcq[question.question_id] ? "bg-slate-50 text-slate-500" : ""}`}
                    />
                    <div className="mt-8 flex justify-start">
                        {!savedMcq[question.question_id] ? (
                            <Button 
                                onClick={() => handleSaveText(question.question_id, question.user_answer_id)}
                                className="bg-indigo-600 text-white h-12 px-8 rounded-2xl font-bold shadow-md hover:bg-indigo-700 transition-all"
                            >
                                Save Text Answer
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 py-3 px-6 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                Answer Submitted
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const pending = pendingImages[qai] || [];
        const uploadedImg = currentAnswer?.user_answer_images;

        return (
            <div className="mt-6 space-y-6">
                {uploadedImg && (
                    <div className="flex flex-wrap gap-4">
                        {uploadedImg.split(',').map((imgUrl: string, idx: number) => (
                            <div key={idx} className="relative w-40 h-52 rounded-2xl overflow-hidden shadow-md group border-2 border-emerald-500">
                                <img src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${imgUrl.trim()}`} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                    <Check className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-4">
                    {pending.length > 0 && (
                        <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-indigo-200 rounded-[2rem] bg-indigo-50/20">
                            {pending.map((file, idx) => (
                                <div key={idx} className="relative w-32 h-44 rounded-xl overflow-hidden shadow-sm border bg-white group animate-in zoom-in duration-300">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                    <button onClick={() => removePendingImage(qai, idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="w-32 h-44 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-indigo-400 hover:text-indigo-500 transition-all text-slate-400">
                                <Plus className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Page</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleImageSelection(e, qai)} />
                            </label>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {!savedMcq[qai] && pending.length === 0 && (
                            <label className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl cursor-pointer hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest ring-offset-2 focus-within:ring-2 ring-indigo-600">
                                <Upload className="w-4 h-4" /> Upload Answer Sheets
                                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleImageSelection(e, qai)} />
                            </label>
                        )}
                        
                        {pending.length > 0 && (
                            <Button 
                                onClick={() => uploadAllImages(qai, question.user_answer_id)} 
                                disabled={uploadingQid === qai}
                                className="bg-indigo-600 text-white rounded-2xl px-8 h-12 shadow-xl shadow-indigo-600/30 font-bold"
                            >
                                {uploadingQid === qai ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Submit {pending.length} Pages</>
                                )}
                            </Button>
                        )}

                        {savedMcq[qai] && (
                           <div className="flex items-center gap-2 py-3 px-6 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-bold text-sm">
                               <CheckCircle2 className="w-5 h-5" />
                               Answer Submitted
                           </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderMatchGroupUI = (questions: any[]) => {
        const groupId = questions[0].question_id;
        const shuffled = matchShuffles[groupId] || [];
        const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
        
        return (
            <div key={`match-group-${groupId}`} className="mb-12 bg-white rounded-[2.5rem] border p-10 shadow-md">
                <div className="mb-8 flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900 leading-none">Match the Following</h3>
                            <Badge variant="outline" className="rounded-lg border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-50/50">{totalMarks} Marks</Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Associate elements from Column I and Column A</p>
                    </div>
                    <Button 
                        onClick={() => handleBulkSaveMatch(questions, groupId)}
                        disabled={bulkSavingGroupId === groupId || questions.every(q => savedMcq[q.question_id])}
                        className={`rounded-2xl px-10 h-14 font-bold shadow-xl transition-all ${
                            questions.every(q => savedMcq[q.question_id])
                                ? "bg-green-50 text-green-700 border border-green-200 shadow-none cursor-default"
                                : "bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700"
                        }`}
                    >
                        {bulkSavingGroupId === groupId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : questions.every(q => savedMcq[q.question_id]) ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> All Matches Submitted</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" /> Submit All Matches</>
                        )}
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">Column I</h4>
                        {questions.map((q, idx) => (
                            <div key={`left-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-5 group/item transition-all hover:border-indigo-200">
                                <span className="bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                                <div className="text-sm font-medium leading-relaxed text-slate-700 pt-0.5"><QuestionMathJax content={sanitizeLatex(q.question_latex)} /></div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">Column A</h4>
                        {shuffled.map((ans, idx) => (
                            <div key={`right-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-5 group/item transition-all hover:border-indigo-200">
                                <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">{String.fromCharCode(65 + idx)}</span>
                                <div className="text-sm font-medium leading-relaxed text-slate-700 pt-0.5"><QuestionMathJax content={sanitizeLatex(ans)} /></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 bg-white p-8 rounded-[2rem] border-2 border-slate-50">
                    {questions.map((q, idx) => {
                        return (
                            <div key={`map-${q.question_id}`} className="flex flex-col gap-3 group/map">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1 group-hover/map:text-indigo-400 transition-colors">Row {idx + 1}</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        maxLength={1}
                                        placeholder="-"
                                        className={`w-14 h-14 bg-slate-50 border-2 rounded-2xl text-center font-black text-lg uppercase transition-all ${
                                            savedMcq[q.question_id] ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white"
                                        }`}
                                        value={matchMappings[q.question_id] || ""}
                                        onChange={(e) => setMatchMappings(prev => ({ ...prev, [q.question_id]: e.target.value.toUpperCase() }))}
                                        disabled={savedMcq[q.question_id]}
                                    />
                                    {!savedMcq[q.question_id] && matchMappings[q.question_id] && (
                                        <Button size="icon" className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20" onClick={() => handleSaveMatch(q.question_id, q.user_answer_id, groupId)}>
                                            <Check className="w-5 h-5 text-white" />
                                        </Button>
                                    )}
                                    {savedMcq[q.question_id] && (
                                        <Button variant="ghost" size="icon" className="w-10 h-10 text-emerald-600 hover:bg-emerald-100 rounded-xl" onClick={() => setSavedMcq(prev => ({ ...prev, [q.question_id]: false }))}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderContentMain = () => {
        // console.log("TheorySubmissionPage: renderContentMain CALLED");
        return (
            <div className="fixed inset-0 z-[99999] bg-slate-50 overflow-y-auto font-outfit">
                <header className="bg-white/95 backdrop-blur-xl border-b sticky top-0 z-[110000] shadow-sm">
                    <div className="mx-auto px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <FileCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none">{questionPaperData?.assessment_name}</h1>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Theory Submission Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button className="bg-indigo-600 rounded-2xl px-12 h-12 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all hover:bg-indigo-700" onClick={handleFinalSubmit} disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Final Submit"}
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-10 pb-40 space-y-8">
                    {questionPaperData?.section_data?.map((section: any, sIdx: number) => {
                        const progress = getSectionProgress(section);
                        const isExpanded = !!expandedSections[section.assessment_section_id];
                        return (
                            <div key={section.assessment_section_id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <button
                                    onClick={() => toggleSection(section.assessment_section_id)}
                                    className={`flex items-center justify-between h-20 px-8 w-full transition-all border-l-8 ${
                                        isExpanded 
                                            ? "bg-white rounded-t-[2rem] border-indigo-600 shadow-md translate-y-2 relative z-10" 
                                            : "bg-white/50 hover:bg-white rounded-[2rem] border-transparent shadow-sm hover:shadow-md mb-4"
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <Badge className="text-xl font-black text-slate-900 truncate bg-transparent hover:bg-transparent px-0 border-none">
                                                Section {section.section_number || sIdx + 1}
                                            </Badge>
                                            <h2 className="text-xl font-bold text-slate-600 truncate max-w-lg">{section.section_heading}</h2>
                                            <Badge variant="outline" className="border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-50/50 rounded-xl shrink-0">
                                                {section.section_total_marks || 0} Marks
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                                <div className="text-sm font-black text-indigo-600 bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                                                    {progress.answered} / {progress.total}
                                                </div>
                                            </div>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${(progress.answered / progress.total) * 100}%` }} />
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-6 h-6 text-slate-300" /> : <ChevronRight className="w-6 h-6 text-slate-300" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="space-y-6 bg-white/30 p-10 rounded-b-[2rem] border-2 border-t-0 border-slate-50">
                                        {(() => {
                                            const rendered = [];
                                            const questions = section.question_data || [];
                                            let i = 0;
                                            while(i < questions.length) {
                                                const q = questions[i];
                                                const qType = q.question_type_name?.toLowerCase().trim() || "";
                                                if (qType === "match the following") {
                                                    const group = [q];
                                                    let j = i + 1;
                                                    while(j < questions.length && questions[j].question_type_name?.toLowerCase().trim() === "match the following") {
                                                        group.push(questions[j]);
                                                        j++;
                                                    }
                                                    rendered.push(renderMatchGroupUI(group));
                                                    i = j;
                                                } else {
                                                    const idx = i;
                                                    rendered.push(
                                                        <div key={q.question_id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group animate-in slide-in-from-top-4 duration-500">
                                                            <div className="flex flex-col gap-8">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-500 group-hover:text-white flex items-center justify-center font-black text-sm transition-all border-none shrink-0 group-hover:scale-110 group-hover:rotate-3 shadow-inner group-hover:shadow-lg group-hover:shadow-slate-900/20">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div className="flex-1 text-xl text-slate-800 font-semibold leading-relaxed pt-1.5">
                                                                        <QuestionMathJax content={sanitizeLatex(q.question_latex)} skipInternalLoading />
                                                                    </div>
                                                                    <Badge variant="secondary" className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase px-4 py-2 group-hover:bg-indigo-600 group-hover:text-white transition-all rounded-xl border border-slate-100 shrink-0 mt-1.5 tracking-widest shadow-sm group-hover:shadow-indigo-600/20">
                                                                        {q.marks || 0} Marks
                                                                    </Badge>
                                                                </div>
                                                                <div className="pl-14">
                                                                    {q.question_diagrams_url?.map((url: string, di: number) => (
                                                                        <img key={di} src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${url}`} className="mb-8 rounded-[2rem] border-4 border-white shadow-xl max-h-96 object-contain" />
                                                                    ))}
                                                                    {renderSubmissionUI(q)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                    i++;
                                                }
                                            }
                                            return rendered;
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="flex justify-center mt-12 pb-8">
                        <Button 
                            onClick={handleFinalSubmit} 
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-16 h-16 font-black uppercase tracking-widest text-lg shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1"
                        >
                            {submitting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <CheckCircle2 className="w-6 h-6 mr-3" />}
                            {submitting ? "Submitting..." : "End Paper"}
                        </Button>
                    </div>
                </main>
            </div>
        );
    };

    // console.log("TheorySubmissionPage: Render Loop - loading:", loading, "isTypeset:", isTypeset, "hasData:", !!questionPaperData, "error:", !!error);

    if (error) {
        return (
            <div className="fixed inset-0 z-[999999] bg-white flex items-center justify-center p-10 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-3xl text-slate-900 uppercase tracking-tight">Access Denied</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{error}</p>
                    </div>
                    <Button onClick={fetchData} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-900/20">Reconnect Portal</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <MathJaxContext config={QuestionMathJaxConfig}>
                {(loading || !isTypeset) && (
                    <div className="fixed inset-0 z-[999999] bg-slate-50 flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-pulse">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px] mb-3 antialiased">Finalizing Portal Environment</p>
                            <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-indigo-600 animate-progress-indefinite" />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* The hidden container for typesetting sync - always present but invisible */}
                <div ref={hiddenContainerRef} className="fixed opacity-0 pointer-events-none -z-10 bg-white">
                    {questionPaperData && renderContentMain()}
                </div>

                {/* The actual visible content */}
                {isTypeset && questionPaperData && renderContentMain()}
            </MathJaxContext>
        </div>
    );
}
