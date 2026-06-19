import { useState, useEffect } from "react";
// import { useLocation, useRoute } from "../hooks/use-location";
import { useParams } from "react-router-dom";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseService, Course, Package } from "../services/CourseService";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Star, Video, FileText, CheckCircle2, Lock, ChevronDown,  BookOpen, ArrowLeft, Loader2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
import Cookies from 'js-cookie';
import { useCourse } from "../context/CourseContext";

interface CourseDetailViewProps {
    courseId: string | number;
    userId: string | undefined;
    onClose?: () => void;
}

export function CourseDetailView({ courseId, userId, onClose }: CourseDetailViewProps) {
    const { toast } = useToast();
    const { fetchCourses, courses, selectCourse } = useCourse();

    const [course, setCourse] = useState<Course | null>(null);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackageIdx, setSelectedPackageIdx] = useState<number>(-1);
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                // 1. Fetch Course Details (Find from all courses)
                const allCourses = await CourseService.getAllCourses(userId);
                const foundCourse = allCourses.find(c => String(c.subscription_id) === String(courseId) || String(c.id) === String(courseId));
                
                if (foundCourse) {
                    setCourse(foundCourse);
                    
                    // 2. Fetch Packages
                    const pkgData = await CourseService.getPackages(foundCourse.subscription_id);
                    console.log("pkgData", pkgData);
                    setPackages(pkgData);
                } else {
                    toast({
                        title: "Error",
                        description: "Course not found",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error("Error loading details:", error);
                toast({
                    title: "Error",
                    description: "Failed to load course details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, userId, toast]);

    const handleEnroll = async () => {
        if (selectedPackageIdx === -1) {
            toast({ title: "Select Package", description: "Please select a package to enroll.", variant: "default" });
            return;
        }
        if (!course) return;

        setIsEnrolling(true);
        const pkg = packages[selectedPackageIdx];
        const payload = {
            subscription_id: course.subscription_id,
            package_id: pkg.package_id,
            user_id: userId,
            details: course.description || "-",
            total_validity_days: pkg.validity || 180
        };
        console.log("Course Enroll Payload", payload);

        try {
            await CourseService.enroll(payload);
            toast({ title: "Success", description: "Successfully enrolled!", variant: "default" });
            
            // Re-fetch courses and handle selection
            const hadNoCourses = courses.length === 0;
            const updatedCourses = await fetchCourses(userId);
            
            if (hadNoCourses && updatedCourses.length > 0) {
                // If this was the first course, find it and select it
                const newCourse = updatedCourses.find(c => 
                    String(c.subscription_id) === String(course.subscription_id) || 
                    String(c.id) === String(course.id)
                );
                if (newCourse) {
                    selectCourse(newCourse.subscription_id || newCourse.id);
                }
            }

            if (onClose) onClose();
        } catch (error) {
            console.error("Enrollment error:", error);
            toast({ title: "Error", description: "Enrollment failed. Please try again.", variant: "destructive" });
        } finally {
            setIsEnrolling(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading course details...</div>;
    if (!course) return <div className="p-8 text-center text-red-500">Course not found</div>;

    return (
        <div className="w-full bg-white font-sans max-h-[90vh] overflow-y-auto relative p-0 sm:p-4">
            <div className="w-[90%] flex items-center gap-4 mb-6 sticky top-0 bg-white z-30 py-2">
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-semibold">Back to Courses</span>
                </Button>
            </div>
            {/* {onClose && (
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )} */}
                {/* Banner Section */}
            <div className="w-full bg-[#2A2B3F] text-white p-6 md:p-8 relative rounded-xl mb-8">
                    <div className="max-w-4xl relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4">{course.subscription_name}</h1>
                    <p className="text-sm md:text-base opacity-90 mb-6 max-w-lg">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Trusted By:</span> {course.total_enrollments_count || 0} Students
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Language:</span> {course.language || 'English'}
                        </div>
                            <div className="flex items-center gap-2">
                            <span className="font-semibold">Rating:</span> {course.subscription_rating || 4.5} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                    </div>
                    </div>

                    {/* Floating Right Card - Adjusted for modal view */}
                    <div className="mt-6 md:absolute md:top-6 md:right-6 md:w-[280px] bg-white text-black rounded-lg shadow-xl overflow-hidden md:mt-0 z-20 hidden md:block">
                        <div className="h-40 bg-gray-200">
                                <img 
                                src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${course.subscription_image_url}`} 
                                alt={course.subscription_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Removed duplicate Enroll button from floating card as it's now per package */}
                    </div>
            </div>

            {/* Packages Details List */}
            <div className="max-w-full py-4">
                <h2 className="text-xl font-bold mb-4">Available Packages</h2>
                <div className="space-y-4">
                    {packages.map((pkg, idx) => {
                        const isOpen = openIdx === idx;
                        const currentPackageName = course.purchase_status ? "Basic" : null; 
                        
                        let buttonState: 'enroll' | 'purchased' | 'upgrade' = 'enroll';
                        if (course.purchase_status) {
                            if (pkg.package_name === currentPackageName || (pkg.final_package_price <= (packages.find(p => p.package_name === currentPackageName)?.final_package_price || 0))) {
                                buttonState = 'purchased';
                            } else {
                                buttonState = 'upgrade';
                            }
                        }

                        return (
                            <div key={pkg.package_id} className={`border rounded-lg transition-all ${isOpen ? 'shadow-md border-primary/50' : 'border-border'}`}>
                                <div 
                                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50"
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                >
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{pkg.package_name}</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                            <Button 
                                            size="sm"
                                            disabled={isEnrolling}
                                            variant={buttonState === 'purchased' ? "secondary" : "default"}
                                            className={`min-w-[100px] transition-all duration-300 ${
                                                buttonState === 'purchased' 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (buttonState !== 'purchased' && !isEnrolling) {
                                                    setSelectedPackageIdx(idx);
                                                    handleEnroll();
                                                }
                                            }}
                                            >
                                            {isEnrolling && selectedPackageIdx === idx ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Enrolling...
                                                </>
                                            ) : (
                                                buttonState === 'purchased' ? "Purchased" : (buttonState === 'upgrade' ? "Upgrade Package" : "Enroll Now")
                                            )}
                                            </Button>
                                            <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                
                                {isOpen && (
                                    <div className="p-4 border-t bg-muted/10 space-y-4">
                                        <div className="flex justify-between items-center bg-white p-3 rounded-md border">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">Price</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-bold">₹{pkg.final_package_price}</span>
                                                    <span className="text-sm text-gray-400 line-through">₹{pkg.package_price}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">Validity</p>
                                                <p className="font-medium">{pkg.validity}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-700">{pkg.description}</p>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {pkg.content_type_data?.map(contentType => (
                                                <div key={contentType.content_type_id} className="bg-white p-3 rounded border">
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                        {contentType.content_type_name === 'Video' ? <Video className="h-4 w-4"/> : 
                                                            contentType.content_type_name === 'Test' ? <FileText className="h-4 w-4"/> : <BookOpen className="h-4 w-4"/>}
                                                        {contentType.content_type_name}
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {contentType.category_data?.map(cat => (
                                                            <li key={cat.package_access_id} className="flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-2">
                                                                        {cat.enabled_flag ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Lock className="h-3 w-3 text-gray-400" />}
                                                                    {cat.content_category_name}
                                                                </span>
                                                                {/* <Badge variant="outline">{cat.content_count}</Badge> */}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface CourseDetailsProps {
    courseId?: string | number;
    onBack?: () => void;
}

export default function CourseDetails({ courseId: propCourseId, onBack }: CourseDetailsProps) {
    const { courseId: paramCourseId } = useParams<{ courseId: string }>();
    const courseId = propCourseId || paramCourseId;
    // const userId = 100113; // Hardcoded user ID
    const userId = Cookies.get('user_id');

    if (!courseId) return <div className="p-8 text-center text-red-500">Invalid Course ID</div>;

    return (
        <CourseDetailView 
            courseId={courseId} 
            userId={userId} 
            onClose={onBack} 
        />
    );
}
