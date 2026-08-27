import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
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
  Maximize2,
  MousePointerClick,
  Edit3,
  UploadCloud,
  HelpCircle,
  Camera,
  QrCode,
  Laptop,
  Smartphone,
  Copy,
  ExternalLink,
  Crop
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { useToast } from "../../../../hooks/use-toast";
import { TestService } from "../../../../services/TestServices";
import { useCourse } from "../../../../context/CourseContext";
import QuestionMathJax from "../../../../shared/mathjaxconfig/QuestionMathJax";
import { getDeterministicShuffle } from "../../../../shared/utils/ShuffleUtils";
import { ImageCropperModal } from "./ImageCropperModal";
import { QRCodeSVG } from "../../../../shared/utils/QRCodeGenerator";

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
    const [effectiveUserAssId, setEffectiveUserAssId] = useState<string | null>(() => {
        const idFromState = (location.state as any)?.user_ass_id;
        const idFromStorage = localStorage.getItem("userAssId");
        const finalId = userAssId || idFromState || idFromStorage;
        return finalId ? finalId.toString() : null;
    });

    useEffect(() => {
        const idFromState = (location.state as any)?.user_ass_id;
        const idFromStorage = localStorage.getItem("userAssId");
        const finalId = userAssId || idFromState || idFromStorage;

        if (finalId) {
            const strId = finalId.toString();
            if (effectiveUserAssId !== strId) {
                setEffectiveUserAssId(strId);
            }
            localStorage.setItem("userAssId", strId);
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

    // Upload Options Modal & QR Code states
    const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
    const [uploadModalContext, setUploadModalContext] = useState<{
        qid: string;
        uaid: string;
        sectionNumber: string;
        sectionName: string;
        questionNumber: string;
    } | null>(null);
    const [activeUploadOption, setActiveUploadOption] = useState<"OPTIONS" | "DEVICE" | "CAMERA" | "QR">("OPTIONS");
    const [croppingImage, setCroppingImage] = useState<File | null>(null);
    const desktopCameraInputRef = useRef<HTMLInputElement>(null);
    const desktopFileInputRef = useRef<HTMLInputElement>(null);

    // Auto-sync polling when QR Modal is active
    useEffect(() => {
        if (uploadModalOpen && activeUploadOption === "QR" && uploadModalContext?.qid) {
            const interval = setInterval(() => {
                fetchData(true);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [uploadModalOpen, activeUploadOption, uploadModalContext]);

    // Close QR modal if answer images are detected via polling
    useEffect(() => {
        if (uploadModalOpen && activeUploadOption === "QR" && uploadModalContext?.qid) {
            const qid = uploadModalContext.qid;
            if (userAnswers[qid]?.user_answer_images || userAnswers[qid]?.user_answer_image) {
                setUploadModalOpen(false);
                toast({ title: "Mobile Upload Detected", description: "Answer sheet uploaded successfully from mobile device!" });
            }
        }
    }, [userAnswers, uploadModalOpen, activeUploadOption, uploadModalContext]);

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

    const fetchData = async (isSilent: boolean = false) => {
        try {
            console.log("TheorySubmissionPage: fetchData START, isSilent:", isSilent);
            if (!isSilent) {
                setLoading(true);
            }
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

                // Collect questions with user_answer_id to check status via TestService.getUserAnswer
                const allQuestionsWithId: any[] = [];
                for (const section of data.section_data) {
                    if (section.question_data) {
                        for (const q of section.question_data) {
                            if (q.user_answer_id) {
                                allQuestionsWithId.push(q);
                            }
                        }
                    }
                }

                const userAnswerResults: Record<string, any> = {};
                await Promise.all(
                    allQuestionsWithId.map(async (q) => {
                        try {
                            const res = await TestService.getUserAnswer(q.user_answer_id);
                            if (res) {
                                userAnswerResults[q.question_id] = res;
                            }
                        } catch (err) {
                            console.warn(`getUserAnswer failed for user_answer_id ${q.user_answer_id}:`, err);
                        }
                    })
                );

                for (const section of data.section_data) {
                    if (!section.question_data) continue;
                    const questions = section.question_data;
                    let i = 0;
                    while(i < questions.length) {
                        const q = questions[i];
                        const qType = q.question_type_name?.toLowerCase().trim() || "";
                        
                        if (q.user_answer_id) {
                            const fetchedAnswerObj = userAnswerResults[q.question_id];
                            
                            const userAnswerVal = fetchedAnswerObj?.user_answer ?? q.user_answer;
                            const userAnswerImg = fetchedAnswerObj?.user_answer_image ?? fetchedAnswerObj?.user_answer_images ?? q.user_answer_image;
                            const attemptStatus = fetchedAnswerObj?.attempt_status ?? q.attempt_status;

                            // Rule: Base submitted state ONLY on attempt_status === "ANSWERED"
                            const isAlreadySubmitted = attemptStatus === "ANSWERED";

                            const latest = {
                                user_answer_id: q.user_answer_id,
                                user_answer: userAnswerVal,
                                user_answer_image: userAnswerImg,
                                user_answer_images: userAnswerImg,
                                attempt_status: attemptStatus,
                                answer_submission_time: fetchedAnswerObj?.answer_submission_time || q.answer_submission_time
                            };
                            newAnswers[q.question_id] = latest;

                            if (isAlreadySubmitted) {
                                newSaved[q.question_id] = true;
                            } else {
                                newSaved[q.question_id] = false;
                            }

                            if (qType === "match the following") {
                                // Match logic handled group-wise below
                            } else if (qType === "theory mcq 1 marks" || qType === "assertion&reasoning") {
                                const alpha = latest.user_answer;
                                if (alpha && alpha.length === 1) {
                                    newMcq[q.question_id] = alpha.toUpperCase().charCodeAt(0) - 65;
                                }
                            } else if (qType === "name the following" || qType === "fill in the blanks") {
                                if (latest.user_answer) {
                                    newText[q.question_id] = latest.user_answer;
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
                                const fetchedAnswerObj = userAnswerResults[mq.question_id];
                                const userAnswerVal = fetchedAnswerObj?.user_answer ?? mq.user_answer;
                                const attemptStatus = fetchedAnswerObj?.attempt_status ?? mq.attempt_status;
                                const isSubmitted = attemptStatus === "ANSWERED";

                                if (userAnswerVal && userAnswerVal.trim() !== "") {
                                    const letterIdx = shuffled.indexOf(userAnswerVal);
                                    if (letterIdx !== -1) {
                                        newMatchMappings[mq.question_id] = String.fromCharCode(65 + letterIdx);
                                    }
                                }
                                if (isSubmitted) {
                                    newSaved[mq.question_id] = true;
                                } else {
                                    newSaved[mq.question_id] = false;
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
                console.log("TheorySubmissionPage: fetchData SUCCESS - Initial states updated with TestService.getUserAnswer status check");
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

    const renderSubmissionUI = (question: any, section: any = {}, questionIndex: number = 0) => {
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
                            <Button
                                onClick={() => {
                                    setUploadModalContext({
                                        qid: qai,
                                        uaid: question.user_answer_id,
                                        sectionNumber: (section.section_number || 1).toString(),
                                        sectionName: section.section_heading || "Theory Section",
                                        questionNumber: (questionIndex + 1).toString(),
                                    });
                                    setActiveUploadOption("OPTIONS");
                                    setUploadModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl cursor-pointer hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest ring-offset-2 focus-within:ring-2 ring-indigo-600"
                            >
                                <Upload className="w-4 h-4" /> Upload Answer Sheets
                            </Button>
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
                                        <div className="w-10 h-10 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                                            <Check className="w-5 h-5 text-emerald-600" />
                                        </div>
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
        const rawApiInstructions = 
            questionPaperData?.instructions || 
            questionPaperData?.instruction_data || 
            questionPaperData?.instructions_data || 
            questionPaperData?.exam_details?.instructions || 
            [];

        const defaultGeneralInstructions = [
            "All questions are mandatory.",
            "Review all questions before submitting.",
            "Keep your handwritten answers ready for upload.",
            "Avoid switching tabs or closing the window."
        ];

        const generalInstructionsList = Array.isArray(rawApiInstructions) && rawApiInstructions.length > 0
            ? rawApiInstructions.map((inst: any) => typeof inst === 'string' ? inst : (inst.instruction_name || inst.instruction_text || inst.description || JSON.stringify(inst)))
            : defaultGeneralInstructions;

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
                    {/* PREVIOUS ORIGINAL INSTRUCTIONS UI (COMMENTED OUT AS REQUESTED) */}
                    {/* 
                    <div className="mb-12 bg-blue-50/50 border border-blue-100/50 p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <AlertCircle className="w-24 h-24" />
                      </div>
                      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" /> General Instructions
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        {[
                          "All questions are mandatory.",
                          "Review all questions before submitting.",
                          "Keep your handwritten answers ready for upload.",
                          "Avoid switching tabs or closing the window."
                        ].map((inst, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                            {inst}
                          </li>
                        ))}
                      </ul>
                    </div>
                    */}

                    {/* System & General Instructions */}
                    <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden space-y-6">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <HelpCircle className="w-28 h-28 text-indigo-900" />
                        </div>
                        <h3 className="font-extrabold text-indigo-950 text-base flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-indigo-600" />
                            <span>System Instructions & Attempt Guidelines</span>
                        </h3>

                        {/* 1. How to Attempt Questions */}
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-900/70 mb-3">How to Attempt Questions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                                        <MousePointerClick className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 mb-1">MCQ, True/False & Choice</h5>
                                        <p className="text-slate-600 leading-relaxed">Select the correct option directly on the screen.</p>
                                    </div>
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0 mt-0.5">
                                        <Edit3 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 mb-1">Fill in the Blanks</h5>
                                        <p className="text-slate-600 leading-relaxed">Write your answer with the complete sentence.</p>
                                    </div>
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
                                        <UploadCloud className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 mb-1">Theory Questions</h5>
                                        <p className="text-slate-600 leading-relaxed">Write your answer on paper and submit/upload a photo of the answer sheet below.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. General Exam Rules / API Instructions */}
                        <div className="pt-4 border-t border-indigo-100/80">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-900/70 mb-3">General Examination Rules</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {generalInstructionsList.map((instText: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-xs text-indigo-950 font-medium">
                                        <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                                        <span>{instText}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

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
                                                                    {renderSubmissionUI(q, section, idx)}
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

                    {/* 3-Option Upload Modal */}
                    {uploadModalOpen && uploadModalContext && (
                        <div className="fixed inset-0 z-[999999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                    <div>
                                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-2">
                                            Question #{uploadModalContext.questionNumber} Upload
                                        </Badge>
                                        <h3 className="text-xl font-black text-slate-900">Choose Upload Method</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Section {uploadModalContext.sectionNumber}: {uploadModalContext.sectionName}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setUploadModalOpen(false)}
                                        className="rounded-full text-slate-400 hover:text-slate-900"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>

                                {/* Hidden Desktop Inputs */}
                                <input
                                    ref={desktopFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                            setCroppingImage(files[0]);
                                        }
                                        e.target.value = "";
                                    }}
                                />
                                <input
                                    ref={desktopCameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                            setCroppingImage(files[0]);
                                        }
                                        e.target.value = "";
                                    }}
                                />

                                {/* 3 Options Grid */}
                                {activeUploadOption === "OPTIONS" && (
                                    <div className="space-y-4">
                                        {/* Option 1: Device Upload */}
                                        <button
                                            onClick={() => desktopFileInputRef.current?.click()}
                                            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left group cursor-pointer"
                                        >
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Laptop className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm mb-0.5">1. Direct Device Upload</h4>
                                                <p className="text-xs text-slate-500">Pick image files from your computer/device. Includes crop & adjust tools.</p>
                                            </div>
                                        </button>

                                        {/* Option 2: Camera Capture */}
                                        <button
                                            onClick={() => desktopCameraInputRef.current?.click()}
                                            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group cursor-pointer"
                                        >
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm mb-0.5">2. Open Camera & Capture</h4>
                                                <p className="text-xs text-slate-500">Take single or multiple photos directly using your webcam/camera with cropping.</p>
                                            </div>
                                        </button>

                                        {/* Option 3: Scan QR Code */}
                                        <button
                                            onClick={() => setActiveUploadOption("QR")}
                                            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer"
                                        >
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <QrCode className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm mb-0.5">3. Scan QR Code (Mobile Upload)</h4>
                                                <p className="text-xs text-slate-500">Scan QR from mobile to open dedicated camera page with instant cropping & auto-sync.</p>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* QR Code Option Detail */}
                                {activeUploadOption === "QR" && (
                                    <div className="text-center space-y-6">
                                        <div className="p-4 bg-slate-50 rounded-3xl inline-block border border-slate-200 shadow-inner">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/theory-mobile-upload?user_ass_id=${effectiveUserAssId}&user_answer_id=${uploadModalContext.uaid}&question_id=${uploadModalContext.qid}&section_number=${uploadModalContext.sectionNumber}&section_name=${encodeURIComponent(uploadModalContext.sectionName)}&question_number=${uploadModalContext.questionNumber}&token=${encodeURIComponent(Cookies.get("token") || localStorage.getItem("token") || localStorage.getItem("accessToken") || "")}`}
                                                size={210}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-center gap-2">
                                                <Smartphone className="w-4 h-4 text-emerald-600" /> Scan with your phone's camera
                                            </h4>
                                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                Scan this QR code to open the authenticated upload portal on your mobile device. Your desktop will sync automatically once submitted.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveUploadOption("OPTIONS")}
                                                className="flex-1 rounded-xl text-slate-600"
                                            >
                                                Back to Options
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    const token = Cookies.get("token") || localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
                                                    const url = `${window.location.origin}/theory-mobile-upload?user_ass_id=${effectiveUserAssId}&user_answer_id=${uploadModalContext.uaid}&question_id=${uploadModalContext.qid}&section_number=${uploadModalContext.sectionNumber}&section_name=${encodeURIComponent(uploadModalContext.sectionName)}&question_number=${uploadModalContext.questionNumber}&token=${encodeURIComponent(token)}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast({ title: "Link Copied", description: "Mobile upload link copied to clipboard!" });
                                                }}
                                                className="rounded-xl flex items-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" /> Copy Link
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Image Cropper Modal */}
                    <ImageCropperModal
                        isOpen={!!croppingImage}
                        imageFile={croppingImage}
                        onClose={() => setCroppingImage(null)}
                        onCropComplete={(croppedFile) => {
                            if (uploadModalContext) {
                                setPendingImages((prev) => ({
                                    ...prev,
                                    [uploadModalContext.qid]: [...(prev[uploadModalContext.qid] || []), croppedFile],
                                }));
                                setUploadModalOpen(false);
                                toast({ title: "Page Cropped", description: "Cropped page added to pending answer sheet." });
                            }
                            setCroppingImage(null);
                        }}
                    />
                </main>
            </div>
        );
    };

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
                    <Button onClick={() => fetchData()} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-900/20">Reconnect Portal</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
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
        </div>
    );
}
