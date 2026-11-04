import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  FileText,
  Mail,
  Calendar,
  Info,
  Save,
  ArrowLeft,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { UserProfileService } from '../services/UserProfileService';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

interface ProfilePageProps {
  phoneNumber: string;
  profileData?: any;
  onUpdateProfile: (data: any) => void;
  onBack: () => void;
}

// Helper to remove '91' or '+91' country code prefix for 10-digit editing
const stripCountryCode = (num: any) => {
  if (num === null || num === undefined) return '';
  const numStr = String(num);
  const cleaned = numStr.replace(/\s+/g, '');
  if (cleaned.startsWith('+91')) {
    return cleaned.substring(3);
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2);
  }
  return cleaned;
};

// Helper to prepend '91' to form a 12-digit number for backend submission
const formatTo12Digit = (num: any) => {
  if (num === null || num === undefined) return '';
  const numStr = String(num);
  const cleaned = numStr.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  return cleaned; // Fallback
};

export function ProfilePage({ phoneNumber, profileData, onUpdateProfile, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'education'>('personal');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isWhatsappSame, setIsWhatsappSame] = useState<boolean>(true);
  const [originalIsWhatsappSame, setOriginalIsWhatsappSame] = useState<boolean>(true);

  // Split states to directly reflect API GET structure
  const [personalDetails, setPersonalDetails] = useState<any>({
    first_name: '',
    last_name: '',
    email_id: '',
    mobile_no: stripCountryCode(phoneNumber || ''),
    user_whatsapp_no: '',
    date_of_birth: '',
    gender: '',
    parents_contact_no: '',
    address: '',
    profile_image_url: '',
    profile_summary: ''
  });

  const [originalPersonalDetails, setOriginalPersonalDetails] = useState<any>(null);

  const [academicDetails, setAcademicDetails] = useState<any>({
    board_or_university: '',
    standard_name: '',
    institute_name: '',
    start_year: "",
    end_year: "",
    grade_or_marks: '',
    pursuing: false,
    std_id: null,
    academic_id: null,
    verification_status: 'PENDING'
  });

  const [originalAcademicDetails, setOriginalAcademicDetails] = useState<any>(null);

  // Load from API on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) {
          toast.error("User session not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await UserProfileService.getProfile(userId);
        if (data && data.status) {
          if (data.user_personal_details) {
            const personal = data.user_personal_details;
            const cleanMobile = stripCountryCode(personal.mobile_no || phoneNumber || '');
            const cleanWhatsapp = stripCountryCode(personal.user_whatsapp_no || '');
            const sameWhatsapp = cleanWhatsapp === cleanMobile || !cleanWhatsapp;

            const personalState = {
              first_name: personal.first_name || '',
              last_name: personal.last_name || '',
              email_id: personal.email_id || '',
              mobile_no: cleanMobile,
              user_whatsapp_no: cleanWhatsapp || (cleanMobile && !personal.user_whatsapp_no ? cleanMobile : ''),
              date_of_birth: personal.date_of_birth ? personal.date_of_birth.substring(0, 10) : '',
              gender: personal.gender || '',
              parents_contact_no: personal.parents_contact_no || '',
              address: personal.address || '',
              profile_image_url: personal.profile_image_url || '',
              profile_summary: personal.profile_summary || ''
            };

            setPersonalDetails(personalState);
            setOriginalPersonalDetails(personalState);
            setIsWhatsappSame(sameWhatsapp);
            setOriginalIsWhatsappSame(sameWhatsapp);
          }

          if (data.user_academic_details && data.user_academic_details.length > 0) {
            const academic = data.user_academic_details[0];
            const academicState = {
              board_or_university: academic.board_or_university || academic.boardOrUniversity || '',
              standard_name: academic.standard_name || academic.standardName || '',
              institute_name: academic.institute_name || academic.instituteName || '',
              start_year: academic.start_year !== undefined ? academic.start_year : (academic.startYear !== undefined ? academic.startYear : 2022),
              end_year: academic.end_year !== undefined ? academic.end_year : (academic.endYear !== undefined ? academic.endYear : 2026),
              grade_or_marks: academic.grade_or_marks || academic.gradeOrMarks || '',
              pursuing: academic.pursuing !== undefined ? !!academic.pursuing : false,
              std_id: academic.std_id || academic.stdId || null,
              academic_id: academic.academic_id || academic.academicId || academic.id || null,
              verification_status: academic.verification_status || academic.verificationStatus || 'PENDING'
            };
            setAcademicDetails(academicState);
            setOriginalAcademicDetails(academicState);
          } else {
            const defaultAcademic = {
              board_or_university: '',
              standard_name: '',
              institute_name: '',
              start_year: "",
              end_year: "",
              grade_or_marks: '',
              pursuing: false,
              std_id: null,
              academic_id: null,
              verification_status: 'PENDING'
            };
            setAcademicDetails(defaultAcademic);
            setOriginalAcademicDetails(defaultAcademic);
          }
        }
      } catch (err) {
        console.error("Error fetching profile from UserProfileService:", err);
        toast.error("Could not load backend profile data. Using offline state.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [phoneNumber]);

  const grades = [
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'Dropper (JEE)',
    'Dropper (NEET)',
  ];

  const boards = ['CBSE', 'ICSE', 'State Board (Maharashtra)', 'State Board (Other)', 'IB', 'IGCSE'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
      if (!userId) {
        toast.error("User session not found.");
        setSaving(false);
        return;
      }

      if (activeTab === 'education') {
        const academicId = academicDetails.academic_id;
        const payload: any = {
          instituteName: academicDetails.institute_name || '',
          boardOrUniversity: academicDetails.board_or_university || '',
          startYear: academicDetails.start_year ? parseInt(academicDetails.start_year.toString(), 10) : 0,
          endYear: academicDetails.pursuing ? 0 : (academicDetails.end_year ? parseInt(academicDetails.end_year.toString(), 10) : 0),
          gradeOrMarks: academicDetails.grade_or_marks || '',
          verificationStatus: academicDetails.verification_status || 'PENDING',
          stdId: academicDetails.std_id ? parseInt(academicDetails.std_id.toString(), 10) : 0,
          pursuing: !!academicDetails.pursuing,
          userId: parseInt(userId.toString(), 10)
        };
        if (academicId) {
          payload.academicId = parseInt(academicId.toString(), 10);
        }

        console.log("Submitting academic payload:", payload, "academicId:", academicId);

        if (academicId) {
          console.log("Update Academic Details payload from Profile page", payload);
          // Update method (PUT)
          await UserProfileService.updateAcademicDetails(academicId, payload);
        } else {
          console.log("Add Academic details from profile page",payload)
          // Add method (POST)
          await UserProfileService.addAcademicDetails(payload);
        }
      } else {
        // Construct personal and summary flat FormData
        const personalFormData = new FormData();
        personalFormData.append('firstName', personalDetails.first_name || '');
        personalFormData.append('lastName', personalDetails.last_name || '');
        personalFormData.append('emailId', personalDetails.email_id || '');
        personalFormData.append('mobileNo', formatTo12Digit(personalDetails.mobile_no));
        personalFormData.append('userWhatsappNo', formatTo12Digit(isWhatsappSame ? personalDetails.mobile_no : (personalDetails.user_whatsapp_no || '')));
        personalFormData.append('parentsContactNo', personalDetails.parents_contact_no || '');
        personalFormData.append('address', personalDetails.address || '');
        personalFormData.append('gender', personalDetails.gender || '');
        if (personalDetails.date_of_birth) {
          personalFormData.append('dateOfBirth', personalDetails.date_of_birth);
        }
        personalFormData.append('profileSummary', personalDetails.profile_summary || '');

        // Convert FormData to a standard object to print readable keys and values in console
        const payloadObj: any = {};
        personalFormData.forEach((value, key) => {
          payloadObj[key] = value;
        });
        console.log("Submitting personal profile payload:", payloadObj);

        // Submit personal/summary details using updateProfile API call
        await UserProfileService.updateProfile(userId, personalFormData);
      }

      // Section-specific success messages to keep UI experience highly responsive
      if (activeTab === 'personal') {
        toast.success("Personal details saved successfully!");
      } else if (activeTab === 'summary') {
        toast.success("Summary updated successfully!");
      } else if (activeTab === 'education') {
        toast.success("Educational details saved successfully!");
      }

      // Fetch the updated profile details from the backend to keep form fields synchronized and prevent empty values
      const data = await UserProfileService.getProfile(userId);
      if (data && data.status) {
        if (data.user_personal_details) {
          const personal = data.user_personal_details;
          const cleanMobile = stripCountryCode(personal.mobile_no || phoneNumber || '');
          const cleanWhatsapp = stripCountryCode(personal.user_whatsapp_no || '');
          const sameWhatsapp = cleanWhatsapp === cleanMobile || !cleanWhatsapp;

          const personalState = {
            first_name: personal.first_name || '',
            last_name: personal.last_name || '',
            email_id: personal.email_id || '',
            mobile_no: cleanMobile,
            user_whatsapp_no: cleanWhatsapp || (cleanMobile && !personal.user_whatsapp_no ? cleanMobile : ''),
            date_of_birth: personal.date_of_birth ? personal.date_of_birth.substring(0, 10) : '',
            gender: personal.gender || '',
            parents_contact_no: personal.parents_contact_no || '',
            address: personal.address || '',
            profile_image_url: personal.profile_image_url || '',
            profile_summary: personal.profile_summary || ''
          };

          setPersonalDetails(personalState);
          setOriginalPersonalDetails(personalState);
          setIsWhatsappSame(sameWhatsapp);
          setOriginalIsWhatsappSame(sameWhatsapp);
        }

        if (data.user_academic_details && data.user_academic_details.length > 0) {
          const academic = data.user_academic_details[0];
          const academicState = {
            board_or_university: academic.board_or_university || academic.boardOrUniversity || '',
            standard_name: academic.standard_name || academic.standardName || '',
            institute_name: academic.institute_name || academic.instituteName || '',
            start_year: academic.start_year !== undefined ? academic.start_year : (academic.startYear !== undefined ? academic.startYear : 2022),
            end_year: academic.end_year !== undefined ? academic.end_year : (academic.endYear !== undefined ? academic.endYear : 2026),
            grade_or_marks: academic.grade_or_marks || academic.gradeOrMarks || '',
            pursuing: academic.pursuing !== undefined ? !!academic.pursuing : false,
            std_id: academic.std_id || academic.stdId || null,
            academic_id: academic.academic_id || academic.academicId || academic.id || null,
            verification_status: academic.verification_status || academic.verificationStatus || 'PENDING'
          };
          setAcademicDetails(academicState);
          setOriginalAcademicDetails(academicState);
        }

        // Trigger parent state synchronization callback
        onUpdateProfile({
          firstName: data.user_personal_details?.first_name || '',
          lastName: data.user_personal_details?.last_name || '',
          email: data.user_personal_details?.email_id || '',
          gender: data.user_personal_details?.gender || '',
          dateOfBirth: data.user_personal_details?.date_of_birth ? data.user_personal_details.date_of_birth.substring(0, 10) : '',
          phone: data.user_personal_details?.mobile_no || phoneNumber || '',
          aboutMe: data.user_personal_details?.profile_summary || '',
          currentGrade: data.user_academic_details?.[0]?.standard_name || data.user_academic_details?.[0]?.standardName || '',
          schoolBoard: data.user_academic_details?.[0]?.board_or_university || data.user_academic_details?.[0]?.boardOrUniversity || '',
          schoolName: data.user_academic_details?.[0]?.institute_name || data.user_academic_details?.[0]?.instituteName || '',
          user_personal_details: data.user_personal_details || {},
          user_academic_details: data.user_academic_details || []
        });
      }
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(err?.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return !!personalDetails.first_name;
  };

  const isTabFormValid = () => {
    if (activeTab === 'personal') {
      return !!(personalDetails.first_name || '').toString().trim();
    }
    if (activeTab === 'summary') {
      return true;
    }
    if (activeTab === 'education') {
      const stdName = (academicDetails.standard_name || '').toString().trim();
      const boardName = (academicDetails.board_or_university || '').toString().trim();
      return !!stdName && !!boardName;
    }
    return false;
  };

  const isPersonalChanged = () => {
    if (!originalPersonalDetails) return false;
    return (
      personalDetails.first_name !== originalPersonalDetails.first_name ||
      personalDetails.last_name !== originalPersonalDetails.last_name ||
      personalDetails.email_id !== originalPersonalDetails.email_id ||
      personalDetails.user_whatsapp_no !== originalPersonalDetails.user_whatsapp_no ||
      personalDetails.parents_contact_no !== originalPersonalDetails.parents_contact_no ||
      personalDetails.date_of_birth !== originalPersonalDetails.date_of_birth ||
      personalDetails.gender !== originalPersonalDetails.gender ||
      personalDetails.address !== originalPersonalDetails.address ||
      isWhatsappSame !== originalIsWhatsappSame
    );
  };

  const isSummaryChanged = () => {
    if (!originalPersonalDetails) return false;
    return personalDetails.profile_summary !== originalPersonalDetails.profile_summary;
  };

  const isEducationChanged = () => {
    if (!originalAcademicDetails) return false;
    const currentEndYear = academicDetails.pursuing ? null : (academicDetails.end_year || null);
    const originalEndYear = originalAcademicDetails.pursuing ? null : (originalAcademicDetails.end_year || null);
    return (
      academicDetails.board_or_university !== originalAcademicDetails.board_or_university ||
      academicDetails.standard_name !== originalAcademicDetails.standard_name ||
      academicDetails.institute_name !== originalAcademicDetails.institute_name ||
      academicDetails.start_year !== originalAcademicDetails.start_year ||
      currentEndYear !== originalEndYear ||
      academicDetails.grade_or_marks !== originalAcademicDetails.grade_or_marks ||
      academicDetails.pursuing !== originalAcademicDetails.pursuing
    );
  };

  const isSaveButtonDisabled = () => {
    if (saving) return true;
    if (activeTab === 'personal') {
      return !isTabFormValid() || !isPersonalChanged();
    }
    if (activeTab === 'summary') {
      return !isTabFormValid() || !isSummaryChanged();
    }
    if (activeTab === 'education') {
      return !isTabFormValid() || !isEducationChanged();
    }
    return true;
  };

  // Calculate Profile Completion % (excluding educational details for now)
  const calculateCompletion = () => {
    const fields = [
      personalDetails.first_name,
      personalDetails.last_name,
      personalDetails.email_id,
      personalDetails.gender,
      personalDetails.date_of_birth,
      personalDetails.profile_summary,
      personalDetails.parents_contact_no,
      personalDetails.address,
      academicDetails.standard_name,
      academicDetails.board_or_university,
      academicDetails.institute_name,
      academicDetails.grade_or_marks
    
    ];
    const filled = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  if (loading) {
    return (
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin border-transparent"></div>
        </div>
        <p className="text-slate-600 font-extrabold text-lg mt-6 animate-pulse">Loading secure profile...</p>
        <p className="text-slate-400 text-sm mt-1">Retrieving details from server</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back to Dashboard Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Profile Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-inner border border-white/30 shrink-0">
              {personalDetails.first_name ? personalDetails.first_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {personalDetails.first_name || 'Student'} {personalDetails.last_name || ''}
              </h1>
              <p className="text-blue-100 font-medium text-sm mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>+91 {personalDetails.mobile_no}</span>
                {personalDetails.email_id && (
                  <>
                    <span className="opacity-60">•</span>
                    <span>{personalDetails.email_id}</span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                {academicDetails.standard_name && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {academicDetails.standard_name}
                  </span>
                )}
                {academicDetails.board_or_university && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {academicDetails.board_or_university}
                  </span>
                )}
                {academicDetails.verification_status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm ${academicDetails.verification_status === 'APPROVED'
                    ? 'bg-emerald-400 text-slate-900'
                    : 'bg-amber-400 text-slate-900'
                    }`}>
                    <Sparkles className="w-3 h-3" />
                    {academicDetails.verification_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completion Ring */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray={`${completionPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-sm font-black">{completionPercent}%</div>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Profile Status</p>
              <h4 className="text-base font-extrabold mt-0.5">
                {completionPercent === 100 ? 'Fully Completed! 🎉' : 'Complete your profile'}
              </h4>
            </div>
          </div>
        </div>
      </div>
      {/* Horizontally Rectangular Tabs at the top */}
      <div className="flex flex-col gap-6">
        
        {/* Navigation Tabs - Horizontally rectangular cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left border cursor-pointer select-none ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 translate-y-[-2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900 shadow-sm hover:translate-y-[-1px]'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              activeTab === 'personal' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <User className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-tight truncate">Personal Details</span>
              <span className={`block text-[11px] font-medium mt-0.5 truncate ${
                activeTab === 'personal' ? 'text-blue-100' : 'text-slate-400'
              }`}>Basic info & contacts</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left border cursor-pointer select-none ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 translate-y-[-2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900 shadow-sm hover:translate-y-[-1px]'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              activeTab === 'summary' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-tight truncate">Summary (about)</span>
              <span className={`block text-[11px] font-medium mt-0.5 truncate ${
                activeTab === 'summary' ? 'text-blue-100' : 'text-slate-400'
              }`}>About me & bio summary</span>
            </div>
          </button>

          {/* <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left border cursor-pointer select-none ${
              activeTab === 'education'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 translate-y-[-2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900 shadow-sm hover:translate-y-[-1px]'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              activeTab === 'education' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <GraduationCap className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-tight truncate">Educational Details</span>
              <span className={`block text-[11px] font-medium mt-0.5 truncate ${
                activeTab === 'education' ? 'text-blue-100' : 'text-slate-400'
              }`}>Grade, Board & School</span>
            </div>
          </button> */}
        </div>

        {/* Content Form View */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">

              {/* TAB 1: PERSONAL DETAILS */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Personal Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Manage your basic details and identification info.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalDetails.first_name}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, first_name: e.target.value })}
                        placeholder="Enter first name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Last Name</label>
                      <input
                        type="text"
                        value={personalDetails.last_name}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, last_name: e.target.value })}
                        placeholder="Enter last name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={personalDetails.email_id}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, email_id: e.target.value })}
                        placeholder="example@domain.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Mobile Number (Verified)</label>
                      <div className="flex rounded-xl border border-slate-200 bg-slate-100/60 overflow-hidden text-slate-500 cursor-not-allowed select-none transition-all">
                        <span className="flex items-center justify-center px-3.5 bg-slate-150 border-r border-slate-200 text-sm font-bold text-slate-400 select-none">
                          +91
                        </span>
                        <input
                          type="text"
                          value={personalDetails.mobile_no}
                          disabled
                          placeholder="No mobile number"
                          className="w-full px-3.5 py-2.5 bg-transparent text-sm outline-none border-none cursor-not-allowed text-slate-500 font-semibold"
                        />
                      </div>

                      {/* Whatsapp Sync Checkbox */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="whatsapp-same"
                          checked={isWhatsappSame}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsWhatsappSame(checked);
                            if (checked) {
                              setPersonalDetails((prev: any) => ({ ...prev, user_whatsapp_no: prev.mobile_no }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="whatsapp-same" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                          Phone no and whatsapp no is same
                        </label>
                      </div>
                    </div>

                    {/* Whatsapp Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">WhatsApp Number</label>
                      <div className={`flex rounded-xl border overflow-hidden transition-all ${
                        isWhatsappSame 
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-medium' 
                          : 'bg-slate-50 border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-transparent'
                      }`}>
                        <span className="flex items-center justify-center px-3.5 bg-slate-100/80 border-r border-slate-200 text-sm font-bold text-slate-500 select-none">
                          +91
                        </span>
                        <input
                          type="text"
                          value={isWhatsappSame ? personalDetails.mobile_no : personalDetails.user_whatsapp_no}
                          maxLength={10}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setPersonalDetails({ ...personalDetails, user_whatsapp_no: val });
                          }}
                          disabled={isWhatsappSame}
                          placeholder="WhatsApp number"
                          className="w-full px-3.5 py-2.5 bg-transparent text-sm outline-none border-none disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Parents Contact No */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Parents Contact Number</label>
                      <input
                        type="text"
                        value={personalDetails.parents_contact_no}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, parents_contact_no: e.target.value })}
                        placeholder="Enter parents contact number"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={personalDetails.date_of_birth}
                          onChange={(e) => setPersonalDetails({ ...personalDetails, date_of_birth: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all cursor-pointer"
                        />
                        <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Gender</label>
                      <select
                        value={personalDetails.gender}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value="">Select Gender</option>
                        {genders.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Address</label>
                    <textarea
                      value={personalDetails.address}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, address: e.target.value })}
                      placeholder="Enter your current address"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SUMMARY (ABOUT) */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Summary (about)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Briefly tell us about yourself, your learning goals, and career aspirations.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">About Me / Learning Bio</label>
                    <textarea
                      value={personalDetails.profile_summary}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, profile_summary: e.target.value })}
                      placeholder="Share a short summary about your academic journey, hobbies, interests, and what you aim to achieve..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: EDUCATIONAL DETAILS */}
              {activeTab === 'education' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span>Educational Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Verify or update your school, grade, board, and learning goals.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Current Grade / Class <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={academicDetails.standard_name}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, standard_name: e.target.value })}
                        placeholder="e.g. Class 10"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        School Board <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={academicDetails.board_or_university}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, board_or_university: e.target.value })}
                        placeholder="e.g. CBSE, ICSE"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">School / Institute Name</label>
                      <input
                        type="text"
                        value={academicDetails.institute_name}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, institute_name: e.target.value })}
                        placeholder="Enter school name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Grade / Marks Obtained (%)</label>
                      <input
                        type="text"
                        value={academicDetails.grade_or_marks}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, grade_or_marks: e.target.value })}
                        placeholder="e.g. 92% or 9.5 CGPA"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Start Year</label>
                      <input
                        type="number"
                        value={academicDetails.start_year || ''}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, start_year: parseInt(e.target.value) || 0 })}
                        placeholder="Start Year"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">End Year</label>
                      <input
                        type="number"
                        value={academicDetails.pursuing ? '' : (academicDetails.end_year || '')}
                        onChange={(e) => setAcademicDetails({ ...academicDetails, end_year: parseInt(e.target.value) || 0 })}
                        disabled={!!academicDetails.pursuing}
                        placeholder={academicDetails.pursuing ? "N/A (Pursuing)" : "End Year"}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2 flex flex-col justify-center pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="pursuing"
                          checked={!!academicDetails.pursuing}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setAcademicDetails({
                              ...academicDetails,
                              pursuing: isChecked,
                              end_year: isChecked ? "" : academicDetails.end_year
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="pursuing" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                          I am currently pursuing studies at this institute
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Verification Status</label>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${academicDetails.verification_status === 'APPROVED'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : academicDetails.verification_status === 'REJECTED'
                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                          : 'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                        {academicDetails.verification_status || 'PENDING'}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Sticky Action Footer */}
            <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {activeTab !== 'personal' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'summary') setActiveTab('personal');
                      else if (activeTab === 'education') setActiveTab('summary');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center cursor-pointer"
                  >
                    Previous
                  </button>
                )}

                {/* Save Changes Button - now available on all tabs */}
                <button
                  type="submit"
                  disabled={isSaveButtonDisabled()}
                  className="w-full sm:w-auto justify-center px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {activeTab === 'personal' && 'Save Personal Details'}
                        {activeTab === 'summary' && 'Save Summary'}
                        {activeTab === 'education' && 'Save Educational Details'}
                      </span>
                    </>
                  )}
                </button>

                {activeTab !== 'education' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'personal') setActiveTab('summary');
                      else if (activeTab === 'summary') setActiveTab('education');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-md text-center cursor-pointer"
                  >
                    Next Section
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}