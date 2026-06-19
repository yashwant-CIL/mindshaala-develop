import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { TestService, AvailableTest } from "../../../services/TestServices";
import { TestConfig } from "./CustomTestGenerator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { 
    Camera, 
    Clock, 
    FileText, 
    Trophy, 
    ShieldCheck, 
    Loader2,
    Video,
    VideoOff,
    Globe,
    Layout,
    Zap
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import * as faceapi from 'face-api.js';
import { useCourse } from "../../../context/CourseContext";
import Cookies from 'js-cookie';

interface TestInstructionPageProps {
    test: AvailableTest;
    onStartTest: (config: TestConfig) => void;
    onBack: () => void;
}

export function TestInstructionPage({ test, onStartTest, onBack }: TestInstructionPageProps) {
    const { toast } = useToast();
    const { setUserAssId } = useCourse();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [instructions, setInstructions] = useState<any[]>([]);
    const [agreed, setAgreed] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [examDetails, setExamDetails] = useState<any>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Fetch Instructions & Exam Details
    useEffect(() => {
        const userId = localStorage.getItem('user_id') || Cookies.get("user_id"); 
        const loadData = async () => {
            try {
                // Fetch Instructions
                // @ts-ignore
                if(test.instruction_set_id){
                    const instructionsData = await TestService.getTestInstructions(test.instruction_set_id);
                //   const instructionsData = await TestService.getTestInstructions(test.instruction_set_id);
                  setInstructions(instructionsData || []);
                }
                
                // Fetch Exam Details
                // @ts-ignore
                if(test.assessment_id){
                    // const uId = 100087; // Hardcoded per user flow for now
                    const details = await TestService.getExamDetails(test.assessment_id, userId);
                    console.log("Exam Details:", details);
                    
                    if (details && details.user_ass_id) {
                        setUserAssId(details.user_ass_id.toString());
                    }
                    
                    setExamDetails(details);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load data", error);
                toast({
                    title: "Error",
                    description: "Failed to load test details.",
                    variant: "destructive"
                });
                setIsLoading(false);
            }
        };
        loadData();
    }, [test]);

    // Face Detection State
    const [faceDetected, setFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const detectionInterval = useRef<NodeJS.Timeout | null>(null);

    // Load Face API Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Ensure models are in public/models
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                console.log("FaceAPI Models Loaded");
                setModelsLoaded(true);
            } catch (e) {
                console.error("Error loading FaceAPI models:", e);
                // Fallback: allow without detection if models fail? Or block?
                // For now, simple logging.
            }
        };
        loadModels();
    }, []);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Start/Stop Detection Loop based on Camera and Models
    useEffect(() => {
        if (cameraActive && modelsLoaded) {
            startFaceDetection();
        } else {
            // Clear interval if camera stops or models aren't ready
            if (detectionInterval.current) clearInterval(detectionInterval.current);
            setFaceDetected(false);
        }
        
        return () => {
            if (detectionInterval.current) clearInterval(detectionInterval.current);
        };
    }, [cameraActive, modelsLoaded]);

    const startCamera = async () => {
        setCameraError(null);
        setCapturedImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
               // Wait for video to be ready to play
               videoRef.current.onloadedmetadata = () => {
                   videoRef.current?.play().catch(e => console.error("Play error:", e));
               };
            }
            setCameraActive(true);
            setPermissionStatus('granted');
        } catch (err: any) {
            console.error("Camera Error:", err);
            setCameraActive(false);
            setPermissionStatus('denied');
            
            if (err.name === 'NotAllowedError') { 
                setCameraError("Camera access denied. Please allow camera permissions in your browser settings.");
            } else if (err.name === 'NotFoundError') {
                setCameraError("No camera found. Please connect a camera to proceed.");
            } else {
                setCameraError("Could not access camera. Please check your device settings.");
            }
        }
    };

    const startFaceDetection = () => {
        if (detectionInterval.current) clearInterval(detectionInterval.current);

        detectionInterval.current = setInterval(async () => {
             // Basic checks
             if (!videoRef.current || !cameraActive || capturedImage || videoRef.current.paused || videoRef.current.ended) {
                 return;
             }

             // Check dimensions
             if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                 return;
             }

             try {
                 const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
                 const detections = await faceapi.detectAllFaces(videoRef.current, options);
                 // Check if any detection has high enough score? (TinyFaceDetectorOptions handles threshold)
                 const isFace = detections.length > 0;
                 
                 // Update state only if changed to prevent re-renders? 
                 // React handles value equality check usually, but good to know.
                 setFaceDetected(isFace);
            } catch (error) {
                console.error("Face detection error:", error);
            }
        }, 500); // Check every 500ms
    };

    const stopCamera = () => {
        if (detectionInterval.current) clearInterval(detectionInterval.current);
        
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
            setFaceDetected(false);
        }
    };

    const capturePhoto = () => {
        if (!faceDetected) {
             toast({ title: "No Face Detected", description: "Please align your face within the frame.", variant: "destructive" });
             return;
        }

        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Do NOT flip the canvas context here. 
                // We want the raw image data to be consistent with the video source (unflipped).
                // We will flip the PREVIEW image via CSS to match the video element's CSS flip.
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg");
                setCapturedImage(dataUrl);
            }
        }
    };

    const handleStartClick = () => {
        if (!agreed) {
            toast({ title: "Action Required", description: "Please agree to the instructions first.", variant: "destructive" });
            return;
        }
        if (!cameraActive && !capturedImage) {
            toast({ title: "Camera Required", description: "Please enable your camera and capture a photo to start.", variant: "destructive" });
            return;
        }

        // Interpret test type
        let derivedTestType = "mcq"; // fallback
        const rawType = examDetails?.assessment_type || "";
        if (rawType.toUpperCase() === "SECTION_WISE") {
             derivedTestType = "SECTION_WISE";
        } else if (rawType.toUpperCase() === "TH") {
             derivedTestType = "theory";
        }

        // Construct Config
        const config: TestConfig = {
            testType: derivedTestType as any, 
            selectedSubject: test.subject?.toString(),
            selectedChapters: test.topic ? [test.topic] : [],
            difficultyDistribution: { 
                 easy: test.difficulty === 'Easy' ? 60 : 30, 
                 medium: test.difficulty === 'Medium' ? 60 : 50, 
                 hard: test.difficulty === 'Hard' ? 60 : 20 
            },
            totalMarks: examDetails?.total_marks || test.marks || test.total_marks || 0,
            duration: examDetails?.duration || test.duration || test.total_time || 0,
            includePreviousWrong: false,
            randomizeOrder: true,
            userAssessmentId: examDetails?.user_ass_id,
            assessmentType: examDetails?.assessment_type,
            assessmentMethod: examDetails?.assessment_method,
            userImage: capturedImage,
            fullExamDetails: examDetails
        };

        stopCamera(); // Clean up this page's camera instance
        onStartTest(config);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 animate-in fade-in duration-500">
            <div className="mx-auto space-y-8">
                
                {/* 1. Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-slate-500" onClick={onBack}>
                                ← Back to Tests
                        </Button>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
                        {examDetails?.assessment_name || test.assessment_name || test.title}
                    </h1>
                </div>

                {/* 2. Details & Camera Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Exam Details Stats */}
                    <div className="lg:col-span-2 h-full">
                           <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl h-full flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                        Assessment Details
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Type */}
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 hover:border-blue-200 transition-colors group">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">TYPE</span>
                                            <Layout className="h-4 w-4 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base truncate" title={examDetails?.assessment_type}>
                                            {examDetails?.assessment_type || "Standard"}
                                        </div>
                                    </div>

                                    {/* Mode */}
                                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors group">
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">MODE</span>
                                            <Zap className="h-4 w-4 text-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base truncate">
                                            {examDetails?.assessment_method || "Online"}
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors group">
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">LANGUAGE</span>
                                            <Globe className="h-4 w-4 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base truncate">
                                            {examDetails?.assessment_language || "English"}
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 hover:border-orange-200 transition-colors group">
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">DURATION</span>
                                            <Clock className="h-4 w-4 text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base">
                                            {examDetails?.total_time || 0} <span className="text-xs font-medium text-slate-500">mins</span>
                                        </div>
                                    </div>

                                    {/* Marks */}
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 hover:border-amber-200 transition-colors group">
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">MARKS</span>
                                            <Trophy className="h-4 w-4 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base">
                                            {examDetails?.total_marks || 0}
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-colors group">
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">QUESTIONS</span>
                                            <FileText className="h-4 w-4 text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm md:text-base">
                                            {examDetails?.total_question || test.total_question || "N/A"}
                                        </div>
                                    </div>
                                </div>
                           </div>
                    </div>

                    {/* Right: Camera Section */}
                    <div className="h-full">
                        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-slate-100 h-full flex flex-col">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b py-3 px-4">
                                <CardTitle className="text-base flex items-center justify-between text-slate-800">
                                    Proctoring System
                                    {cameraActive ? (
                                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-sm">Camera Active</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-red-100 text-red-600 border border-red-200 px-3 py-1 text-xs font-medium">Camera Inactive</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 relative bg-slate-900 flex-grow flex items-center justify-center min-h-[250px] overflow-hidden group">
                                {/* Video Element */}
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${!cameraActive || capturedImage ? 'opacity-0 absolute' : 'opacity-100'}`} 
                                />

                                {/* Visual Alignment Guide Overlay */}
                                {cameraActive && !capturedImage && (
                                   <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-colors duration-300`}>
                                        <div className={`border-2 border-dashed rounded-full w-48 h-64 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-500 ${faceDetected ? 'border-emerald-400/50' : 'border-yellow-400/50 animate-pulse'}`} />
                                        
                                        {/* Status Text - Centered if detecting, Top if detected */}
                                        {faceDetected ? (
                                            <div className="absolute top-6 left-0 right-0 flex justify-center z-[60] animate-in slide-in-from-top-4">
                                                <div className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg border border-emerald-400/30 flex items-center gap-2">
                                                    {/* <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> */}
                                                    Face Detected
                                                </div>
                                            </div>
                                        ) : (
                                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-200 text-xs font-bold bg-yellow-900/60 px-3 py-1 rounded-full backdrop-blur-sm mt-36 z-[60]">
                                                Detecting Face...
                                            </div>
                                        )}
                                   </div>
                                )}
                                
                                {/* Capture Button */}
                                 {cameraActive && !capturedImage && (
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                        <Button 
                                            onClick={capturePhoto} 
                                            disabled={!faceDetected}
                                            size="icon" 
                                            className={`h-15 w-15 rounded-full text-white border-4 shadow-xl transition-all active:scale-95 duration-300 ${faceDetected 
                                                ? 'bg-emerald-500 hover:bg-emerald-600 border-white ring-4 ring-emerald-500 group-hover/btn:scale-105' 
                                                : 'bg-slate-600 border-slate-500/30 opacity-50 cursor-not-allowed'}`}
                                        >
                                            <Camera className="h-12 w-12" />
                                        </Button>
                                    </div>
                                )}

                                {/* Captured Image Preview */}
                                {capturedImage && (
                                    <div className="relative w-full h-full animate-in fade-in zoom-in duration-300">
                                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button onClick={() => setCapturedImage(null)} variant="secondary" className="gap-2 shadow-lg font-semibold transform hover:scale-105 transition-all text-white">
                                                <Video className="h-4 w-4 text-white" /> Retake Photo
                                            </Button>
                                        </div>
                                        <div className="absolute top-3 right-3 animate-in slide-in-from-top-2">
                                             <Badge className="bg-emerald-500 text-white border-0 shadow-md px-3 py-1">Photo Captured</Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Fallback / Enable Camera State */}
                                {!cameraActive && !capturedImage && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 bg-slate-900 z-10 transition-all">
                                        {/* <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-800/50 shadow-inner">
                                            <Camera className="h-8 w-8 text-slate-400" />
                                        </div> */}
                                        {/* <h4 className="text-white font-semibold mb-1 text-lg">Camera Required</h4> */}
                                        {/* <p className="text-slate-400 text-sm text-center mb-6 max-w-[240px] leading-relaxed">
                                            Please enable your camera to verify your identity before starting.
                                        </p> */}
                                        <Button onClick={startCamera} variant="secondary" size="default" className="gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-5 shadow-lg shadow-white/10 rounded-xl transition-all hover:scale-105 active:scale-95">
                                            <Video className="h-5 w-5" /> Enable Camera
                                        </Button>
                                    </div>
                                )}

                                {/* Permission Denied UI */}
                                {permissionStatus === 'denied' && (
                                    <div className="absolute inset-0 bg-red-950/95 backdrop-blur flex flex-col items-center justify-center text-center p-4 z-20 animate-in fade-in">
                                        <VideoOff className="h-10 w-10 text-red-500 mb-3" />
                                        <p className="text-white font-bold text-base mb-1">Access Denied</p>
                                        <p className="text-red-200 text-xs mb-4 max-w-[200px] leading-relaxed">{cameraError}</p>
                                        <Button size="sm" variant="secondary" onClick={startCamera} className="hover:bg-white/90">
                                            Try Again
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter className="bg-slate-50 border-t py-3 px-4 flex justify-between text-[11px] font-medium text-slate-500">
                                <span className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    Video Feed
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${capturedImage ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    Identity Verified
                                </span>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* 3. Instructions (Full Width) */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            Examination Instructions
                        </CardTitle>
                        <CardDescription className="text-slate-500">Please read the following rules carefully before proceeding.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[95%]" />
                            </div>
                        ) : (
                                <ScrollArea className="h-[250px] pr-4"> 
                                    <ul className="space-y-3">
                                        {instructions.map((inst, index) => (
                                            <li key={index} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-slate-700 text-sm leading-relaxed font-medium">
                                                    {inst.instruction_name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Footer Actions */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl p-6 -mx-6 -mb-6 md:-mx-8 md:-mb-8 border-t border-slate-200 mt-8 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-10 transition-all">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4 group cursor-pointer" onClick={() => !agreed && setAgreed(true)}>
                            <div className="relative flex items-center">
                                <Checkbox 
                                    id="terms" 
                                    checked={agreed} 
                                    onCheckedChange={(checked: boolean | "indeterminate") => setAgreed(checked === true)}
                                    className="h-5 w-5 border-2 border-slate-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded mt-0.5 transition-all group-hover:border-indigo-500 text-white"
                                />
                            </div>
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="terms"
                                    className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-800 group-hover:text-indigo-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    I have read and understand the instructions.
                                </label>
                                <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                                    I agree to be proctored via camera.
                                </p>
                            </div>
                        </div>

                         <Button 
                            size="lg" 
                            className="w-full md:w-auto min-w-[240px] text-lg font-bold h-14 shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all rounded-xl transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={!agreed || !cameraActive}
                            onClick={handleStartClick}
                        >
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : (
                                examDetails?.assessment_type === "SECTION_WISE" ? "Continue \u2192" : "Start Assessment"
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

