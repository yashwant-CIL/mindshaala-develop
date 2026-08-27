import { useState, useEffect, createContext, Dispatch } from "react";
import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { ProfilePage } from "./components/ProfilePage";
import { AssessmentPage } from "./components/AssessmentPage";
import { AnalysisPage } from "./components/AnalysisPage";
import { ReadyToStartPage } from "./components/ReadyToStartPage";
import { Dashboard } from "./components/Dashboard";
import { CourseLearningPage } from "./components/CourseLearningPage";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { PerformanceAnalyticsAdvanced } from "./components/PerformanceAnalyticsAdvanced";
import { MyCourses } from "./components/MyCourses";
import { CoursesAndMaterials } from "./components/CoursesAndMaterials";
import { StudyMaterial } from "./components/StudyMaterial";
import { MapPractice } from "./components/MapPractice";
import PhysicsPhenomenon from "./components/activity-hub/PhysicsPhenomenon";
import ExplainBiology from "./components/activity-hub/ExplainBiology";
import EngineeringConcept from "./components/activity-hub/EngineeringConcept";
import MathGenius from "./components/activity-hub/MathGenius";
import { TakeTest } from "./components/TakeTest";
import { TheoryTestPage } from "./components/TheoryTestPage";
import { EvaluationReport } from "./components/EvaluationReport";
import { AssessmentDashboard } from "./components/AssessmentDashboard";
import { AskDoubt } from "./components/AskDoubt";
import { AskADoubt } from "./components/AskADoubt";
import { Notifications } from "./components/Notifications";
// import { SmartStudyPlanner } from "./components/SmartStudyPlanner";
// import { GamificationSystem } from "./components/GamificationSystem";
// import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
// import { QuestionBank } from "./components/QuestionBank";
import { MySubscriptions } from "./components/MySubscriptions";
import { MentorDashboard } from "./components/MentorDashboard";
import { MentorDoubtResolution } from "./components/MentorDoubtResolution";
import { RequestOneOnOneSession } from "./components/RequestOneOnOneSession";
import { KnowledgeHub } from "./components/KnowledgeHub";
import { CompetePlatform } from "./components/CompetePlatform";
import { ComputerFundamentals } from "./components/ComputerFundamentals";
import { SoftwareApplications } from "./components/SoftwareApplications";
import { ProgrammingFundamentals } from "./components/ProgrammingFundamentals";
import { InternetNetworking } from "./components/InternetNetworking";
import { CyberSafety } from "./components/CyberSafety";
import { NumberSystems } from "./components/NumberSystems";
import { EmergingTech } from "./components/EmergingTech";
import { PracticalSkills } from "./components/PracticalSkills";
import { SkeletalStructureDrawer } from "./components/SkeletalStructureDrawer";
import { AtomicStructureEditor } from "./components/AtomicStructureEditor";
import { ChemicalBondingEditor } from "./components/ChemicalBondingEditor";
import { ReactionMechanismPredictor } from "./components/ReactionMechanismPredictor";
import { ReactionGame } from "./components/ReactionGame";
import { InitialAssessment } from "./components/InitialAssessment";
import VivaPractice from "./components/VivaPractice";
import VivaPracticeTesting from "./components/VivaPracticeTesting";
import VivaResult from "./components/VivaResult";
import { AssessmentIntroModal } from "./components/AssessmentIntroModal";
import { RealWorldSimulator } from "./components/RealWorldSimulator";
import { CareerDiscoverySimulator } from "./components/CareerDiscoverySimulator";
import { CareerTopicAdvisor } from "./components/CareerTopicAdvisor";
import { SmartNotesGenerator } from "./components/SmartNotesGenerator";
import { DoubtResolutionHub } from "./components/DoubtResolutionHub";
import { AIStudyCompanion, AICompanionButton } from "./components/features/AIStudyCompanion";
import { FocusMode, FocusButton } from "./components/features/FocusMode";
import { CustomTestGenerator } from "./components/CustomTestGenerator";
import { DailyChallengeStreak } from "./components/DailyChallengeStreak";
import { ConceptualVivaService } from "./services/ConceptualTutorService";
import { VivaDashboard } from "./components/VivaDashboard";
import InnovativeFeaturesShowcase from "./components/InnovativeFeaturesShowcase";
import { ContentManagement } from "./components/ContentManagement";
import { DoubtHubWorkbench } from "./components/DoubtHubWorkbench";
import { TeacherObservationBoard } from "./components/TeacherObservationBoard";
import TestSeries from "./components/test-series";
import ConceptualVivaDashboard from "./components/conceptual-tutor/ConceptualTutorDashboard";
import ConceptualVivaSelection from "./components/conceptual-tutor/ConceptualTutorSelection";
import ConceptualVivaSession from "./components/conceptual-tutor/ConceptualTutorSession";
import ConceptualVivaHistory from "./components/conceptual-tutor/ConceptualTutorHistory";
import ConceptualVivaResultDetails from "./components/conceptual-tutor/ConceptualTutorResultDetails";
import AITutorDashboard from "./components/ai-tutor/AITutorDashboard";
import AITutorSelection from "./components/ai-tutor/AITutorSelection";
import AITutorSession from "./components/ai-tutor/AITutorSession";
import AITutorHistory from "./components/ai-tutor/AITutorHistory";
import AITutorResultDetails from "./components/ai-tutor/AITutorResultDetails";
import SpeakAlongDashboard from "./components/speakalong-viva/SpeakAlongDashboard";
import SpeakAlongSelection from "./components/speakalong-viva/SpeakAlongSelection";
import SpeakAlongSession from "./components/speakalong-viva/SpeakAlongSession";
import GKDashboard from "./components/GeneralKnowledge/GKDashboard";
import GKExams from "./components/GeneralKnowledge/GKExams";
import GKExamRunner from "./components/GeneralKnowledge/GKExamRunner";
import GKPreparation from "./components/GeneralKnowledge/GKPreparation";
import GKProfile from "./components/GeneralKnowledge/GKProfile";
import GKResult from "./components/GeneralKnowledge/GKResult";
import { Volume2, AlertCircle, ArrowLeft, BrainCircuit } from "lucide-react";
import { SmartStudyPlanner } from "./components/features/SmartStudyPlanner";
import { GamificationSystem } from "./components/features/GamificationSystem";
import { AdvancedAnalytics } from "./components/features/AdvancedAnalytics";
import { QuestionBank } from "./components/features/QuestionBank";
import { MathJaxContext } from "better-react-mathjax";
import { QuestionMathJaxConfig } from "./shared/mathjaxconfig/QuestionMathJax";
import MCQsolutionScreen from "./components/test-series/components/MCQsolutionScreen";
import TheorySolutionScreen from "./components/test-series/components/TheorySolutionScreen";
import { Toaster, toast } from "react-hot-toast";
import { Toaster as ShadcnToaster } from "./components/ui/toaster";

import Cookies from "js-cookie";
import LandingPage from "./components/LandingPage/LandingPage";
import { CartPage } from "./components/CartPage";
import { WishlistPage } from "./components/WishlistPage";
import { ComingSoon } from "./components/ComingSoon";
import { AvailableTest } from "./services/TestServices";

import { TestResultListPage } from "./components/TestResultListPage";
import { Result as DetailedResult } from "./components/Result";
import { LandingPageNavbar } from "./components/LandingPage/LandingPageComponents/Home/LandingPageNavbar";
import PrivacyPolicy from "./components/LandingPage/LandingPageComponents/OurPolicies/PrivacyPolicy/Privacy";
import ReturnPolicy from "./components/LandingPage/LandingPageComponents/OurPolicies/ReturnPolicy/Return";
import Terms from "./components/LandingPage/LandingPageComponents/OurPolicies/Terms&Conditions/Terms";
import Dispute from "./components/LandingPage/LandingPageComponents/OurPolicies/DisputeResolution/Dispute";
import Disclaimer from "./components/LandingPage/LandingPageComponents/OurPolicies/Disclaimer/Disclaimer";
import { TheoryMobileUploadPage } from "./components/test-series/components/ExamScreens/TheoryMobileUploadPage";
// import Footer from "./components/LandingPage/LandingPageComponents/Footer/Footer";

// Existing user data for 9764696566
const existingUserData = {
  phoneNumber: "9764696566",
  profile: {
    firstName: "Rohan",
    lastName: "Sharma",
    dateOfBirth: "2008-05-15",
    currentGrade: "Class 10",
    schoolBoard: "ICSE",
    mediumOfInstruction: "English",
    schoolName: "St. Xavier's High School",
  },
  assessmentResults: {
    totalQuestions: 20,
    correctAnswers: 17,
    percentage: 85,
    subjectWise: {
      Physics: { correct: 5, total: 5 },
      Mathematics: { correct: 4, total: 5 },
      English: { correct: 4, total: 5 },
    },
  },
};

export const UserContext = createContext<{
  state: {
    isAuthenticated: boolean;
    user_id: string | null;
    username: string | null;
  };
  dispatch: Dispatch<any>;
  setCurrentStep: Dispatch<any>;
} | any>(null);

export default function App() {
  const navigate = useNavigate();
  // Load state from local storage
  const loadState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error("Failed to load state", e);
      return defaultValue;
    }
  };

  const [currentStep, setCurrentStep] = useState<
    | "landing"
    | "login"
    | "register"
    | "profile"
    | "assessment"
    | "analysis"
    | "ready"
    | "main"
    | "learning"
    | "testgen"
    | "theorytest"
    | "evaluation"
    | "testresults"
    | "askdoubt"
    | "privacypolicy"
    | "returnpolicy"
    | "terms"
    | "disputes"
    | "disclaimer"
  >(() => loadState("currentStep", "landing"));

  const [activePage, setActivePage] = useState<string>(
    () => loadState("activePage", "dashboard")
  );

  const [selectedUserAssId, setSelectedUserAssId] = useState<string | number | null>(
    () => loadState("selectedUserAssId", null)
  );
  
  const [selectedAssessmentMethod, setSelectedAssessmentMethod] = useState<string | null>(
    () => loadState("selectedAssessmentMethod", null)
  );

  const [phoneNumber, setPhoneNumber] = useState(() => loadState("phoneNumber", ""));
  const [profileData, setProfileData] = useState<any>(() => loadState("profileData", null));
  const [assessmentResults, setAssessmentResults] = useState<any>(() => loadState("assessmentResults", null));
  const [isExistingUser, setIsExistingUser] = useState(() => loadState("isExistingUser", false));
  const [showAICompanion, setShowAICompanion] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [pendingStartTest, setPendingStartTest] = useState<AvailableTest | null>(null);
  const [selectedDoubtId, setSelectedDoubtId] = useState<string>("");
  const [selectedConceptualVivaSessionId, setSelectedConceptualVivaSessionId] = useState<string | number | null>(
    () => loadState("selectedConceptualVivaSessionId", null)
  );
  const [selectedConceptualVivaData, setSelectedConceptualVivaData] = useState<any>(
    () => loadState("selectedConceptualVivaData", null)
  );
  const [selectedConceptualVivaCurrentQuestion, setSelectedConceptualVivaCurrentQuestion] = useState<any>(
    JSON.parse(localStorage.getItem('selectedConceptualVivaCurrentQuestion') || 'null')
  );
  const [selectedConceptualVivaParams, setSelectedConceptualVivaParams] = useState<any>(
    () => loadState("selectedConceptualVivaParams", null)
  );
  const [selectedAITutorSessionId, setSelectedAITutorSessionId] = useState<string | number | null>(
    () => loadState("selectedAITutorSessionId", null)
  );
  const [selectedAITutorData, setSelectedAITutorData] = useState<any>(
    () => loadState("selectedAITutorData", null)
  );
  const [selectedAITutorCurrentQuestion, setSelectedAITutorCurrentQuestion] = useState<any>(
    JSON.parse(localStorage.getItem('selectedAITutorCurrentQuestion') || 'null')
  );
  const [selectedAITutorParams, setSelectedAITutorParams] = useState<any>(
    () => loadState("selectedAITutorParams", null)
  );
  const [speakAlongParams, setSpeakAlongParams] = useState<any>(
    () => loadState("speakAlongParams", null)
  );
  const [gkCategory, setGkCategory] = useState<string | null>(
    () => loadState("gkCategory", null)
  );
  const [gkSubcategory, setGkSubcategory] = useState<string | null>(
    () => loadState("gkSubcategory", null)
  );
  const [gkQuestions, setGkQuestions] = useState<any[]>(
    () => loadState("gkQuestions", [])
  );
  const [gkAssessmentId, setGkAssessmentId] = useState<string | number | null>(
    () => loadState("gkAssessmentId", null)
  );
  const [gkTotalMarks, setGkTotalMarks] = useState<number>(
    () => loadState("gkTotalMarks", 40)
  );
  const [gkTotalTimeSeconds, setGkTotalTimeSeconds] = useState<number>(
    () => loadState("gkTotalTimeSeconds", 3600)
  );
  const [gkAssessmentName, setGkAssessmentName] = useState<string | null>(
    () => loadState("gkAssessmentName", null)
  );
  const [showAssessmentIntro, setShowAssessmentIntro] = useState(false);

  // Check for session/token on mount
  useEffect(() => {
    const token = Cookies.get("token");
    // Only redirect to login if we are not on the landing page or onboarding steps
    if (!token && !["landing", "login", "register", "profile", "assessment", "analysis", "ready", "privacypolicy", "returnpolicy", "terms", "disputes", "disclaimer"].includes(currentStep)) {
      setCurrentStep("login");
      toast.error("Session expired. Please log in again.");
    } else if (token) {
        // PER USER REQUEST: Only perform "Clean Start" on a COLD BOOT (Restart).
        // On a REFRESH, we want to stay where we are.
        const isSessionActive = sessionStorage.getItem("app_session_active");
        
        if (!isSessionActive) {
            console.log("App: Cold Start detected - resetting to main/dashboard");
              //  setCurrentStep("profile");
            setCurrentStep("main");
            setActivePage("dashboard");

            // CLEAR internal TakeTest persistence to prevent accidental resume on RESTART
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("takeTest_")) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.removeItem("userAssId");

            // Mark session as active so subsequent REFRESES don't trigger this reset
            sessionStorage.setItem("app_session_active", "true");
        } else {
            console.log("App: Refresh detected - preserving current state");
        }
    }
  }, []); // Run on initial load

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem("currentStep", JSON.stringify(currentStep));
    localStorage.setItem("activePage", JSON.stringify(activePage));
    localStorage.setItem("phoneNumber", JSON.stringify(phoneNumber));
    localStorage.setItem("profileData", JSON.stringify(profileData));
    localStorage.setItem("assessmentResults", JSON.stringify(assessmentResults));
    localStorage.setItem("isExistingUser", JSON.stringify(isExistingUser));
    localStorage.setItem("selectedUserAssId", JSON.stringify(selectedUserAssId));
    localStorage.setItem("selectedAssessmentMethod", JSON.stringify(selectedAssessmentMethod));
    localStorage.setItem("selectedConceptualVivaParams", JSON.stringify(selectedConceptualVivaParams));
    localStorage.setItem("selectedConceptualVivaSessionId", JSON.stringify(selectedConceptualVivaSessionId));
    localStorage.setItem("selectedConceptualVivaData", JSON.stringify(selectedConceptualVivaData));
    localStorage.setItem("selectedConceptualVivaCurrentQuestion", JSON.stringify(selectedConceptualVivaCurrentQuestion));
    localStorage.setItem("selectedAITutorParams", JSON.stringify(selectedAITutorParams));
    localStorage.setItem("selectedAITutorSessionId", JSON.stringify(selectedAITutorSessionId));
    localStorage.setItem("selectedAITutorData", JSON.stringify(selectedAITutorData));
    localStorage.setItem("selectedAITutorCurrentQuestion", JSON.stringify(selectedAITutorCurrentQuestion));
    localStorage.setItem("speakAlongParams", JSON.stringify(speakAlongParams));
    localStorage.setItem("gkCategory", JSON.stringify(gkCategory));
    localStorage.setItem("gkSubcategory", JSON.stringify(gkSubcategory));
    localStorage.setItem("gkQuestions", JSON.stringify(gkQuestions));
    localStorage.setItem("gkAssessmentId", JSON.stringify(gkAssessmentId));
    localStorage.setItem("gkTotalMarks", JSON.stringify(gkTotalMarks));
    localStorage.setItem("gkTotalTimeSeconds", JSON.stringify(gkTotalTimeSeconds));
    localStorage.setItem("gkAssessmentName", JSON.stringify(gkAssessmentName));
  }, [currentStep, activePage, phoneNumber, profileData, assessmentResults, isExistingUser, selectedUserAssId, selectedAssessmentMethod, selectedConceptualVivaParams, selectedConceptualVivaSessionId, selectedConceptualVivaData, selectedConceptualVivaCurrentQuestion, selectedAITutorParams, selectedAITutorSessionId, selectedAITutorData, selectedAITutorCurrentQuestion, speakAlongParams, gkCategory, gkSubcategory, gkQuestions, gkAssessmentId, gkTotalMarks, gkTotalTimeSeconds, gkAssessmentName]);
  
  // Scroll to top on step change and log for debugging
  useEffect(() => {
    console.log("App: currentStep changed to:", currentStep);
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleLogin = (phone: string, initialPage: any = "dashboard") => {
    setPhoneNumber(phone);
    setActivePage(initialPage);

    // Check if this is the existing user (FOR DEMO PURPOSES)
    // Existing users skip onboarding and go directly to main dashboard
    if (phone === "9764696566") {
      setIsExistingUser(true);
      setProfileData(existingUserData.profile);
      setAssessmentResults(existingUserData.assessmentResults);
      setCurrentStep("main"); // Skip to main - user already completed onboarding
    } else {
      // New user - MUST go through full onboarding flow:
      // profile → assessment → analysis → ready → main
      // Sidebar will NOT show until currentStep becomes 'main'
      setIsExistingUser(false);
      // New user - Redirect directly to dashboard as per user request
      setCurrentStep("main");
      setActivePage("dashboard");
    }
  };

  const handleLogout = () => {
    // Clear Cookies
    Cookies.remove('token');
    Cookies.remove('token_version');
    Cookies.remove('username');
    Cookies.remove('user_id');

    // Clear LocalStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('currentStep');
    localStorage.removeItem('activePage');
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('profileData');
    localStorage.removeItem('assessmentResults');
    localStorage.removeItem('selectedCourseId');
    localStorage.removeItem('user_ass_id');
    localStorage.removeItem('selectedUserAssId');
    localStorage.removeItem('selectedAssessmentMethod');

    // Clear TakeTest persistence
    localStorage.removeItem('takeTest_testMode');
    localStorage.removeItem('takeTest_activeTestConfig');
    localStorage.removeItem('takeTest_selectedTestForInstructions');
    localStorage.removeItem('takeTest_activeTab');

    // Reset State
    setCurrentStep("landing");
    setActivePage("dashboard");
    setPhoneNumber("");
    setProfileData(null);
    setAssessmentResults(null);
    setIsExistingUser(false);
    authDispatch({ type: "LOGOUT" });

    toast.success("Successfully logged out");
  };

  const handleProfileComplete = (data: any) => {
    setProfileData(data);
    // Show assessment intro modal instead of going directly to assessment
    setShowAssessmentIntro(true);
  };

  const handleStartAssessment = () => {
    setShowAssessmentIntro(false);
    setCurrentStep("assessment");
  };

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentStep("analysis");
  };

  // const { fetchWishlist, fetchCart } = useCourse();

  useEffect(() => {
    if (currentStep === 'main') {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (userId) {
            // fetchWishlist(userId);
            // fetchCart(userId);
        }
    }
  }, [currentStep]);

  const handleAnalysisComplete = () => {
    setCurrentStep("ready");
  };

  const handleStartLearning = () => {
    setCurrentStep("main");
    setActivePage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setActivePage(page as any);
    navigate("/"); // Reset URL when navigating via sidebar/state
  };

  const handleStartCourse = () => {
    setActivePage("learning");
  };

  const handleGenerateTheoryTest = () => {
    setActivePage("theorytest");
  };

  const handleTheoryTestSubmit = () => {
    setActivePage("evaluation");
  };

  const handleCloseEvaluation = () => {
    setActivePage("dashboard");
  };

  const handleSkipAssessment = () => {
    setShowAssessmentIntro(false);
    // Use existing user mock data if skipping
    setAssessmentResults(existingUserData.assessmentResults);
    setCurrentStep("main");
  };

  const [authState, setAuthState] = useState({
    isAuthenticated: !!Cookies.get("token"),
    user_id: Cookies.get("user_id") || null,
    username: Cookies.get("username") || null,
  });

  const authDispatch = (action: any) => {
    switch (action.type) {
      case "LOGIN":
        setAuthState({
          isAuthenticated: true,
          user_id: action.payload.user_id,
          username: action.payload.username,
        });
        break;
      case "LOGOUT":
        setAuthState({
          isAuthenticated: false,
          user_id: null,
          username: null,
        });
        break;
      default:
        break;
    }
  };

  // Use location to trigger scroll-to-top and handle browser back
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <UserContext.Provider value={{ state: authState, dispatch: authDispatch, setCurrentStep }}>
      <MathJaxContext version={3} config={QuestionMathJaxConfig}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Toaster position="top-right" />
          <ShadcnToaster />
          
          <Routes>
            <Route path="/privacypolicy" element={
              <>
                <LandingPageNavbar />
                <PrivacyPolicy />
              </>
            } />
            <Route path="/returnpolicy" element={
              <>
                <LandingPageNavbar />
                <ReturnPolicy />
              </>
            } />
            <Route path="/terms&condition" element={
              <>
                <LandingPageNavbar />
                <Terms />
              </>
            } />
            <Route path="/disputes" element={
              <>
                <LandingPageNavbar />
                <Dispute />
              </>
            } />
            <Route path="/disclaimer" element={
              <>
                <LandingPageNavbar />
                <Disclaimer />
              </>
            } />
            
            <Route path="/test-series/solutions/:userAssId" element={<MCQsolutionScreen />} />
            <Route path="/test-series/theory-solutions/:userAssId" element={<TheorySolutionScreen />} />
            <Route path="/theory-mobile-upload" element={<TheoryMobileUploadPage />} />

            <Route path="/" element={
              <>
                {currentStep === "landing" && (
                    <LandingPage />
                )}
        {(currentStep === "login" || currentStep === "register") && (
            <LoginPage 
              initialMode={currentStep === "register" ? "register" : "login"}
              onLogin={handleLogin} 
              onBack={() => setCurrentStep("landing")} 
            />
        )}
        {/* {currentStep === "profile" && (
            <ProfilePage
            phoneNumber={phoneNumber}
            onComplete={handleProfileComplete}
            onBack={() => setCurrentStep("login")}
            />
        )} */}
        {currentStep === "assessment" && (
            <AssessmentPage
            onComplete={handleAssessmentComplete}
            profileData={profileData}
            />
        )}
        {currentStep === "analysis" && (
            <AnalysisPage
            results={assessmentResults}
            profileData={profileData}
            onContinue={handleAnalysisComplete}
            />
        )}
        {currentStep === "ready" && (
            <ReadyToStartPage
            onStartLearning={handleStartLearning}
            onBack={() => setCurrentStep("analysis")}
            />
        )}

        {currentStep === "main" && (
          <div className="min-h-screen bg-gray-50 flex">
            {activePage !== "conceptual-tutor-session" && activePage !== "conceptual-viva-session" && activePage !== "speakalong-session" && activePage !== "gk-exam-runner" && activePage !== "ai-tutor-session" && (
              <Sidebar
                  activePage={activePage}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
              />
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar - Only show on specific pages as per user request */}
                {['dashboard', 'my-courses', 'courses', 'wishlist', 'cart', 'notifications'].includes(activePage) && (
                    <Navbar activePage={activePage} onNavigate={handleNavigate} />
                )}
                
                <div className="flex-1 overflow-y-auto">
                    {activePage === "dashboard" && (
                    <Dashboard
                    profileData={profileData}
                    results={assessmentResults}
                    onStartCourse={handleStartCourse}
                    onOpenTestGen={() => setActivePage("testgen")}
                    onOpenTestResults={() =>
                      setActivePage("testresults")
                    }
                    onOpenAskDoubt={() => setActivePage("askdoubt")}
                    onNavigate={handleNavigate}
                    />
                )}
                {activePage === "testgen" && (
                  <TakeTest
                  onBack={() => setActivePage("dashboard")}
                  onNavigate={handleNavigate}
                  />
                )}
                {activePage === "theorytest" && (
                  <TheoryTestPage
                  onBack={() => setActivePage("testgen")}
                  onSubmit={handleTheoryTestSubmit}
                  />
                )}
                {activePage === "evaluation" && (
                <EvaluationReport
                    onClose={handleCloseEvaluation}
                    />
                )}
                {activePage === "testresults" && (
                <AssessmentDashboard
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "askdoubt" && (
                <AskDoubt
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "learning" && (
                  <CourseLearningPage
                  onBack={() => setActivePage("dashboard")}
                  />
                )}
                {activePage === "performance" && (
                <PerformanceAnalyticsAdvanced
                onNavigate={handleNavigate}
                />
                )}
                 {activePage === "my-courses" && (
                 <MyCourses onNavigate={handleNavigate} />
                 )}
                {activePage === "courses" && (
                <CoursesAndMaterials
                onStartCourse={handleStartCourse}
                />
                )}
                {activePage === "material" && (
                <StudyMaterial
                onNavigateToCourses={() =>
                  setActivePage("courses")
                }
                />
                )}
                {activePage === "mappractice" && <MapPractice />}
                {activePage === "physics-phenomenon" && <PhysicsPhenomenon onNavigate={handleNavigate} />}
                {activePage === "explain-biology" && <ExplainBiology onNavigate={handleNavigate} />}
                {activePage === "engineering-concept" && <EngineeringConcept onNavigate={handleNavigate} />}
                {activePage === "math-genius" && <MathGenius onNavigate={handleNavigate} />}
                {activePage === "notifications" && (
                <Notifications
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "settings" && (
                    <ComingSoon 
                        title="Settings & Preferences" 
                        description="We're currently building a robust settings panel to help you customize your learning experience. Check back soon!" 
                        onBack={() => handleNavigate('dashboard')} 
                    />
                )}
                {activePage === "studyplanner" && (
                <SmartStudyPlanner />
                )}
                {activePage === "gamification" && (
                <GamificationSystem />
                )}
                {activePage === "analytics" && (
                  <AdvancedAnalytics />
                )}
                {activePage === "questionbank" && <QuestionBank />}
                {activePage === "subscription" && (
                <MySubscriptions
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "mentordashboard" && (
                <MentorDashboard
                onOpenResolution={(id) => {
                  setSelectedDoubtId(id);
                  setActivePage("mentorresolution");
                }}
                />
                )}
                {activePage === "mentorresolution" && (
                <MentorDoubtResolution
                    doubtId={selectedDoubtId}
                    onBack={() => setActivePage("mentordashboard")}
                    />
                )}
                {activePage === "requestsession" && (
                <RequestOneOnOneSession />
                )}
                {activePage === "knowledgehub" && <KnowledgeHub />}
                {activePage === "compete" && <CompetePlatform />}
                {activePage === "computer-fundamentals" && (
                <ComputerFundamentals
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "software-applications" && (
                <SoftwareApplications
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "programming-fundamentals" && (
                <ProgrammingFundamentals
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "internet-networking" && (
                <InternetNetworking
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "cyber-safety" && (
                <CyberSafety
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "number-systems" && (
                <NumberSystems
                    onBack={() => setActivePage("dashboard")}
                    />
                )}
                {activePage === "emerging-tech" && (
                <EmergingTech
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "practical-skills" && (
                <PracticalSkills
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "skeletal-structure" && (
                  <SkeletalStructureDrawer />
                )}
                {activePage === "atomic-structure" && (
                <AtomicStructureEditor />
                )}
                {activePage === "chemical-bonding" && (
                  <ChemicalBondingEditor />
                )}
                {activePage === "reaction-mechanism" && (
                <ReactionMechanismPredictor />
                )}
                {activePage === "reaction-game" && <ReactionGame />}
                {activePage === "initial-assessment" && (
                <InitialAssessment
                onBack={() => setActivePage("dashboard")}
                />
                )}
                {activePage === "take-test" && (
                  <TakeTest
                  onBack={() => setActivePage("dashboard")}
                  onNavigate={handleNavigate}
                  />
                )}
                {activePage === "test-series" && (
                  <TestSeries 
                    onNavigate={handleNavigate} 
                    initialTest={pendingStartTest}
                  />
                )}
                {activePage === "viva-practice" && <VivaPractice />}
                {activePage === "viva-practice-ai-integrated" && (
                  <div className="p-8 mx-auto">
                    <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        🎙️ AI Viva Practice (AI Integrated)
                    </h2>
                    <p className="text-lg text-gray-600">
                        Enhanced version with ElevenLabs voice feedback - Setup Required
                    </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-8 mb-6">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Volume2 className="w-7 h-7" />
                        Complete Separation Achieved ✅
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Both versions are now <strong>completely independent</strong>:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>AI Viva Practice</strong> - Fully functional with Gemini AI (ready to use)</span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">⚙️</span>
                        <span><strong>AI Viva (Voice Feedback)</strong> - Requires one-time setup for TTS capabilities</span>
                        </li>
                    </ul>
                    </div>

                    <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-xl">🚀 Quick Setup (2 options):</h3>
                    
                    <div className="space-y-4">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h4 className="font-bold text-green-900 mb-2">Option 1: Automated Script</h4>
                        <code className="bg-gray-800 text-green-400 px-3 py-2 rounded block mb-2">
                            bash duplicate-and-setup.sh
                        </code>
                        <p className="text-sm text-gray-700">
                            Then follow the manual TTS additions in the guide
                        </p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <h4 className="font-bold text-blue-900 mb-2">Option 2: Complete Manual Setup</h4>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Copy <code className="bg-gray-100 px-1 rounded">VivaPractice.tsx</code> to <code className="bg-gray-100 px-1 rounded">VivaPracticeAIIntegrated.tsx</code></li>
                            <li>Follow <code className="bg-gray-100 px-1 rounded">CREATE_AI_INTEGRATED_COMPLETE.md</code></li>
                            <li>Add TTS functions and UI controls (copy-paste provided)</li>
                            <li>Update import in App.tsx</li>
                        </ol>
                        </div>
                    </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Why Separate Components?
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-2">
                        <li>✅ <strong>No shared dependencies</strong> - Changes to one won't affect the other</li>
                        <li>✅ <strong>Stable original</strong> - Always functional, no TTS complexity</li>
                        <li>✅ <strong>Experimental AI Integrated</strong> - Safe to modify and test</li>
                        <li>✅ <strong>User choice</strong> - Students can pick their preferred experience</li>
                    </ul>
                    </div>

                    <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">📚 Documentation Files:</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded-lg border">
                        <span className="font-bold text-purple-600">CREATE_AI_INTEGRATED_COMPLETE.md</span>
                        <p className="text-xs text-gray-600">Complete setup guide</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                        <span className="font-bold text-blue-600">README_AI_VIVA_INTEGRATED.md</span>
                        <p className="text-xs text-gray-600">Overview & features</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                        <span className="font-bold text-green-600">duplicate-and-setup.sh</span>
                        <p className="text-xs text-gray-600">Automated script</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                        <span className="font-bold text-orange-600">IMPLEMENTATION_STATUS.md</span>
                        <p className="text-xs text-gray-600">Current status</p>
                        </div>
                    </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setActivePage("viva-practice")}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-xl flex items-center gap-2"
                        >
                        <ArrowLeft className="w-5 h-5" />
                        Use Original AI Viva Practice Instead
                    </button>
                    </div>
                </div>
                )}
                {activePage === "viva-dashboard" && <VivaDashboard onNavigate={handleNavigate} />}
                {activePage === "viva-practice-testing" && <VivaPracticeTesting onFinish={() => setActivePage("viva-result")} />}
                {activePage === "viva-result" && <VivaResult />}
                {activePage === "real-world-simulator" && (
                  <RealWorldSimulator />
                )}
                {activePage === "career-discovery-simulator" && (
                  <CareerDiscoverySimulator />
                )}
                {activePage === "career-topic-advisor" && (
                  <CareerTopicAdvisor />
                )}
                {activePage === "smart-notes" && (
                  <SmartNotesGenerator />
                )}
                {activePage === "doubt-hub" && (
                <DoubtResolutionHub />
                )}
                {activePage === "daily-challenge" && (
                <DailyChallengeStreak />
                )}
                {activePage === "innovative-features" && (
                  <InnovativeFeaturesShowcase />
                )}
                {activePage === "content-management" && (
                <ContentManagement />
                )}
                {activePage === "speakalong-dashboard" && (
                  <SpeakAlongDashboard onStartNew={() => setActivePage("speakalong-selection")} />
                )}
                {activePage === "speakalong-selection" && (
                  <SpeakAlongSelection onStartSession={(params) => {
                    setSpeakAlongParams(params);
                    setActivePage("speakalong-session");
                  }} />
                )}
                {activePage === "speakalong-session" && speakAlongParams && (
                  <SpeakAlongSession 
                    courseId={speakAlongParams.course_id}
                    subjectId={speakAlongParams.subject_id}
                    chapterId={speakAlongParams.chapter_id}
                    subjectName={speakAlongParams.subjectName}
                    onExit={() => setActivePage("speakalong-selection")}
                    onFinish={() => setActivePage("speakalong-selection")}
                  />
                )}
                {activePage === "conceptual-tutor-dashboard" && (
                  <ConceptualVivaDashboard />
                )}
                {activePage === "conceptual-tutor-selection" && (
                  <ConceptualVivaSelection 
                    onStartViva={(params) => {
                      setSelectedConceptualVivaParams(params);
                      setSelectedConceptualVivaSessionId(null);
                      setSelectedConceptualVivaData(null);
                      setSelectedConceptualVivaCurrentQuestion(null);
                      setActivePage("conceptual-tutor-session");
                    }}
                  />
                )}
                {activePage === "conceptual-tutor-session" && (
                  <ConceptualVivaSession 
                    initialParams={selectedConceptualVivaParams} 
                    sessionId={selectedConceptualVivaSessionId}
                    initialData={selectedConceptualVivaData}
                    initialQuestion={selectedConceptualVivaCurrentQuestion}
                    onSessionSync={(id, data, currentQ) => {
                      setSelectedConceptualVivaSessionId(id);
                      setSelectedConceptualVivaData(data);
                      setSelectedConceptualVivaCurrentQuestion(currentQ);
                    }}
                    onFinish={(sessionId) => {
                      setSelectedConceptualVivaSessionId(sessionId);
                      setActivePage("conceptual-tutor-result-detail");
                      // Clear current session data but keep sessionId for the result page
                      setSelectedConceptualVivaData(null);
                      setSelectedConceptualVivaCurrentQuestion(null);
                    }}
                    onExit={() => {
                      setActivePage("conceptual-tutor-selection");
                      setSelectedConceptualVivaSessionId(null);
                      setSelectedConceptualVivaData(null);
                      setSelectedConceptualVivaCurrentQuestion(null);
                    }}
                  />
                )}
                {activePage === "conceptual-tutor-report" && (
                  <ConceptualVivaHistory 
                    onViewResult={(sessionId) => {
                      setSelectedConceptualVivaSessionId(sessionId);
                      setActivePage("conceptual-tutor-result-detail");
                    }}
                  />
                )}
                {activePage === "conceptual-tutor-result-detail" && (
                  <ConceptualVivaResultDetails 
                    sessionId={selectedConceptualVivaSessionId as string} 
                    onBack={() => {
                      setActivePage("conceptual-tutor-report");
                      setSelectedConceptualVivaSessionId(null);
                    }}
                    onGoToDashboard={() => {
                      setActivePage("dashboard");
                      setSelectedConceptualVivaSessionId(null);
                    }}
                  />
                )}
                {activePage === "ai-tutor-dashboard" && (
                  <AITutorDashboard />
                )}
                {activePage === "ai-tutor-selection" && (
                  <AITutorSelection 
                    onStartViva={(params) => {
                      setSelectedAITutorParams(params);
                      setSelectedAITutorSessionId(null);
                      setSelectedAITutorData(null);
                      setSelectedAITutorCurrentQuestion(null);
                      setActivePage("ai-tutor-session");
                    }}
                  />
                )}
                {activePage === "ai-tutor-session" && (
                  <AITutorSession 
                    initialParams={selectedAITutorParams} 
                    sessionId={selectedAITutorSessionId}
                    initialData={selectedAITutorData}
                    initialQuestion={selectedAITutorCurrentQuestion}
                    onSessionSync={(id, data, currentQ) => {
                      setSelectedAITutorSessionId(id);
                      setSelectedAITutorData(data);
                      setSelectedAITutorCurrentQuestion(currentQ);
                    }}
                    onFinish={(sessionId) => {
                      setSelectedAITutorSessionId(sessionId);
                      setActivePage("ai-tutor-result-detail");
                      setSelectedAITutorData(null);
                      setSelectedAITutorCurrentQuestion(null);
                    }}
                    onExit={() => {
                      setActivePage("ai-tutor-selection");
                      setSelectedAITutorSessionId(null);
                      setSelectedAITutorData(null);
                      setSelectedAITutorCurrentQuestion(null);
                    }}
                  />
                )}
                {activePage === "ai-tutor-report" && (
                  <AITutorHistory 
                    onViewResult={(sessionId) => {
                      setActivePage("ai-tutor-result-detail");
                      setSelectedAITutorSessionId(sessionId);
                    }}
                    onStartNew={() => {
                      setActivePage("ai-tutor-selection");
                    }}
                  />
                )}
                {activePage === "ai-tutor-result-detail" && (
                  <AITutorResultDetails 
                    sessionId={selectedAITutorSessionId as string} 
                    onBack={() => {
                      setActivePage("ai-tutor-report");
                      setSelectedAITutorSessionId(null);
                    }}
                    onGoToDashboard={() => {
                      setActivePage("dashboard");
                      setSelectedAITutorSessionId(null);
                    }}
                  />
                )}
                {activePage === "gk-dashboard" && (
                  <GKDashboard 
                    onNavigate={handleNavigate} 
                  />
                )}
                {activePage === "gk-preparation" && (
                  <GKPreparation onNavigate={handleNavigate} />
                )}
                {activePage === "gk-exams" && (
                  <GKExams 
                    onStartExam={(cat, sub, questions, id, marks, timeSec, name) => {
                      console.log("App: onStartExam triggered with:", { cat, sub, questions, id, marks, timeSec, name });
                      setGkCategory(cat);
                      setGkSubcategory(sub);
                      setGkQuestions(questions || []);
                      setGkAssessmentId(id || null);
                      setGkTotalMarks(marks || 40);
                      setGkTotalTimeSeconds(timeSec || 3600);
                      setGkAssessmentName(name || null);
                      setActivePage("gk-exam-runner");
                    }} 
                  />
                )}
                {activePage === "gk-exam-runner" && gkCategory && gkSubcategory && (
                  <>
                    {console.log("App: Rendering GKExamRunner with state:", { gkCategory, gkSubcategory, gkQuestionsLength: gkQuestions?.length, gkAssessmentId, gkTotalMarks, gkTotalTimeSeconds, gkAssessmentName })}
                    <GKExamRunner 
                      category={gkCategory} 
                      subcategory={gkSubcategory} 
                      initialQuestions={gkQuestions}
                      assessmentId={gkAssessmentId}
                      totalMarks={gkTotalMarks}
                      totalTimeSeconds={gkTotalTimeSeconds}
                      assessmentName={gkAssessmentName}
                    onExit={() => {
                      setActivePage("gk-exams");
                      setGkQuestions([]);
                    }} 
                    onGoToDashboard={() => {
                      setActivePage("gk-dashboard");
                      setGkQuestions([]);
                    }} 
                    onGoToResults={() => {
                      setActivePage("gk-results");
                      setGkQuestions([]);
                    }} 
                  />
                  </>
                )}
                {activePage === "gk-profile" && (
                  <GKProfile />
                )}
                {(activePage === "gk-result" || activePage === "gk-results") && (
                  <GKResult />
                )}
                {activePage === "doubt-hub-workbench" && (
                   <DoubtHubWorkbench onBack={() => setActivePage("dashboard")} />
                )}
                {activePage === "teacher-observation-board" && (
                  <TeacherObservationBoard />
                )}
                  {activePage === "wishlist" && (
                    <WishlistPage onBack={() => handleNavigate('my-courses')} onNavigate={handleNavigate} />
                  )}
                  {activePage === "cart" && (
                    <CartPage onBack={() => handleNavigate('my-courses')} />
                  )}
                  {activePage === "test-history" && (
                    <TestResultListPage 
                        onViewResult={(id, method) => {
                            setSelectedUserAssId(id);
                            setSelectedAssessmentMethod(method || "MCQ");
                            setActivePage('result-detail');
                        }} 
                        onStartTest={(test) => {
                            setPendingStartTest(test);
                            setActivePage('test-series');
                        }}
                    />
                  )}
                   {activePage === "result-detail" && selectedUserAssId && (
                    <DetailedResult 
                        userAssId={selectedUserAssId} 
                        assessmentMethod={selectedAssessmentMethod}
                        onExit={() => setActivePage('test-history')} 
                    />
                  )}
                  {activePage === "profile" && (
                    <ProfilePage
                      phoneNumber={phoneNumber}
                      onComplete={(data) => {
                        setProfileData(data);
                        setActivePage("dashboard");
                      }}
                      onBack={() => setActivePage("dashboard")}
                    />
                  )}
                </div>
              </div>

              {/* Floating Action Buttons - Always visible in main */}
              <div id="floating-actions-container">
                {!showAICompanion && (
                  <AICompanionButton
                  onClick={() => setShowAICompanion(true)}
                  />
                )}
                {!showFocusMode && (
                  <FocusButton
                    onClick={() => setShowFocusMode(true)}
                    />
                  )}
              </div>

              {/* Overlays */}
              <AIStudyCompanion
                  isOpen={showAICompanion}
                  onClose={() => setShowAICompanion(false)}
                  onMinimize={() => setShowAICompanion(false)}
                  />
              <FocusMode
                  isOpen={showFocusMode}
                  onClose={() => setShowFocusMode(false)}
                  />
            </div>
        )}
        {currentStep === "learning" && (
          <CourseLearningPage
          onBack={() => setCurrentStep("main")}
          />
        )}
        {currentStep === "testgen" && (
          <CustomTestGenerator
            onBack={() => setCurrentStep("main")}
            onGenerateTheoryTest={handleGenerateTheoryTest}
            />
          )}
        {currentStep === "theorytest" && (
          <TheoryTestPage
          onBack={() => setCurrentStep("testgen")}
          onSubmit={handleTheoryTestSubmit}
          />
        )}
        {currentStep === "evaluation" && (
          <EvaluationReport onClose={handleCloseEvaluation} />
        )}
        {currentStep === "testresults" && (
          <AssessmentDashboard
          onBack={() => setCurrentStep("main")}
          />
        )}
        {currentStep === "askdoubt" && (
          <AskADoubt onBack={() => setCurrentStep("main")} />
        )}
              </>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        {/* {showAssessmentIntro && (
          <AssessmentIntroModal
          isOpen={showAssessmentIntro}
          onStart={handleStartAssessment}
          onSkip={handleSkipAssessment}
          studentName={profileData?.firstName || "Student"}
        />
      )} */}
      </div>
    </MathJaxContext>
    </UserContext.Provider>
  );
}