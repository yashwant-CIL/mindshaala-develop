// import React, { useState, useEffect } from 'react';
// import { Trophy, Star, Clock, BookOpen, TrendingUp, User, Calendar, Award, Target, ChevronDown, ChevronUp } from 'lucide-react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { generateExamReportPdf } from '../PdfGenerator/generatePdf';
// import TheoryPdf from '../PdfGenerator/TheoryPdf';
// import Cookies from 'js-cookie';
// import axios from 'axios';

// export default function TheoryResult() {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [animateScore, setAnimateScore] = useState(false);
//   const location = useLocation();
//   const [ResultData, setResultData] = useState(location.state?.result?.output || "");
//   // console.log("Result Data",ResultData)
//   const [isLoading, setIsLoading] = useState(!location.state?.result?.output);
// // console.log("Is Loading:", isLoading);
//   const from  = location?.state?.location || '' ;
//   // console.log("Previous Location :", from);
//   const pdfGenerated = React.useRef(false);
//   const user_ass_id = location.state?.user_ass_id;
//   // console.log("User ass id from thoery Result page", user_ass_id);
//   const user_id = Cookies.get("user_id") || localStorage.getItem("user_id") ;

//   //  const navigate = useNavigate();
//   //  useEffect(() => {
//   //   let timeoutId = null;
//   //   if (isLoading) {
//   //     timeoutId = setTimeout(() => {
//   //       toast.error("Something went wrong, please try again after sometime.");
//   //       navigate("/dashboard");
//   //     }, 60000); // 1 minute = 60000 ms
//   //   }
//   //   return () => {
//   //     if (timeoutId) clearTimeout(timeoutId);
//   //   };
//   // }, [isLoading, navigate]);

// // useEffect(() => {

// //   console.log("Result API called")
// //   const TheoryResult =  async() => {
// //     // if(from === 'thankyou' || ResultData) return;

// //     setIsLoading(true);
// //     try{
// //       const response  = await axios.post(`API_URL`,
// //         {user_ass_id: user_ass_id }
// //       );
// //       if(response.status === 200){
// //         console.log("Response of the Theory Result", response);
// //         setResultData(response.data?.output);
// //       }

// //     }catch(err){
// //       console.error("Error fetching theory result:", err);
// //     }finally{
// //       setIsLoading(false);
// //     }

// //   };
// //   TheoryResult();
// // },[from]);

// useEffect(() => {
//   let retryTimeout = null;

//   const TheoryResult = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post(
//         `API_URL`,
//         { user_ass_id: user_ass_id }
//       );
//       if (response.status === 200) {
//         console.log("Theory Result", response.data);
//         // If status is ACTIVE, set result and stop loading
//         if (response.data?.output?.status === "active") {
//           setResultData(response.data?.output);
//           setIsLoading(false); // <-- Add this line
//         } else {
//           // If not ACTIVE, keep loading and retry after 5 seconds
//           setIsLoading(true);
//           retryTimeout = setTimeout(TheoryResult, 5000);
//         }
//       }
//     } catch (err) {
//       // Check for lock error and retry after 5 seconds
//       if (
//         err?.response?.data?.message &&
//         err.response.data.message.includes("Transaction rolled back due to error: 1213")
//       ) {
//         setIsLoading(true);
//         retryTimeout = setTimeout(TheoryResult, 5000);
//       } else {
//         setIsLoading(false);
//         console.error("Error fetching theory result:", err);
//       }
//     }finally{
//       setIsLoading(false);
//     }
//   };

//   TheoryResult();

//   return () => {
//     if (retryTimeout) clearTimeout(retryTimeout);
//   };
// }, [from, user_ass_id]);

//   const name = Cookies.get('username') || "Student Name";
//   // const studentId = ResultData.user_id ? `ID: ${ResultData.user_id}` : "";
//   const examTitle = ResultData.assessment_name || "Theory Exam";
//   const examDate = ResultData.ass_end_time ? new Date(ResultData.ass_end_time).toLocaleDateString() : "";
//   const duration = ResultData.total_time ? `${ResultData.total_time} min` : "";
//   const totalMarks =ResultData.total_marks ;
//   const obtainedMarks = ResultData.obtained_marks || 0;
//   const percentage = ResultData.obtained_percentage || 0;
//   const grade = ResultData.grade || "-";
//   const rank = ResultData.rank || " ";
//   const totalStudents = ResultData.total_students || " ";
//   const feedback = ResultData.overall_feedback || "";
//   const timeSpent = ResultData.time_taken || ""; 
//   const attemptedQuestions = ResultData.attempted_question || 0;
//   const totalQuestions = ResultData.total_question || 0;
//   const unAttemptedQuestions = ResultData.un_attempted_question || 0;
//   const accuracy = ResultData.accuracy || 0;

//   // If you have subject-wise breakdown, replace this with ResultData.subjects
//   const subjects = ResultData.subjects || [
//     { name: "Total Questions", total: totalQuestions, obtained: attemptedQuestions, percentage: percentage }
//   ];


//   useEffect(() => {
//     setAnimateScore(true);
//   }, []);

//   const getGradeColor = (grade) => {
//     const colors = {
//       'A+': 'text-green-600 bg-green-100',
//       'A': 'text-green-600 bg-green-100',
//       'B+': 'text-blue-600 bg-blue-100',
//       'B': 'text-blue-600 bg-blue-100',
//       'C+': 'text-yellow-600 bg-yellow-100',
//       'C': 'text-yellow-600 bg-yellow-100',
//       'D': 'text-orange-600 bg-orange-100',
//       'F': 'text-red-600 bg-red-100'
//     };
//     return colors[grade] || 'text-gray-600 bg-gray-100';
//   };

//   const getPerformanceMessage = (percentage) => {
//     if (percentage >= 90) return "Exceptional Performance! 🎉";
//     if (percentage >= 80) return "Excellent Work! 👏";
//     if (percentage >= 70) return "Good Job! 👍";
//     if (percentage >= 60) return "Fair Performance 📚";
//     return "Needs Improvement 💪";
//   };

//   // useEffect(() => {
//   //   if(!ResultData || from !== 'thankyou') return;

//   //   const timer = setTimeout(async () => {
//   //     if(pdfGenerated.current) return;
//   //     pdfGenerated.current = true;

//   //     try{
//   //       const pdfBlob = await generateExamReportPdf("theory-pdf-content",`${examTitle} - Report`);
//   //       const url = URL.createObjectURL(pdfBlob);
//   //       window.open(url, '_blank');

//   //       const a  = document.createElement("a");
//   //       a.href = url;
//   //       a.download = `${examTitle} - Report.pdf`;
//   //       document.body.appendChild(a);
//   //       a.click();
        
//   //       setTimeout(() => {
//   //         document.body.removeChild(a);
//   //         URL.revokeObjectURL(url);
//   //       }, 100);
//   //     }catch(err){
//   //       console.error("Error generating PDF:", err);
//   //     }
//   //   },500);
//   //   return () => clearTimeout(timer);
//   // },[ResultData , from, examTitle, user_ass_id]);

//   if (isLoading || !ResultData) {
//     // console.log("result data", ResultData);
//     const dotClasses = 'h-3 w-3 bg-indigo-500 rounded-full mx-1';
//   return (
//     // <div className="flex items-center justify-center min-h-screen bg-gray-50">
//     //   <p className="text-gray-600 text-lg font-medium">Loading your result...</p>
//     // </div>
//     <div className="flex flex-col items-center justify-center p-8  rounded-lg ">
//       <div className="flex space-x-2">
//         {/* Dot 1 - Normal bounce */}
//         <div className={`${dotClasses} animate-bounce`}></div>
        
//         {/* Dot 2 - Delayed bounce (requires custom animation delay) */}
//         {/* We use a custom CSS class for delay since Tailwind doesn't provide it by default */}
//         <div className={`${dotClasses} animate-bounce delay-150`}></div>
        
//         {/* Dot 3 - Further delayed bounce */}
//         <div className={`${dotClasses} animate-bounce delay-300`}></div>
//       </div>

//       <p className="mt-4 text-lg font-medium text-gray-700">
//         Calculating exam results...
//       </p>
//     </div>
//   );
// }

//   return (
//     <>
//     {/* {ResultData && from && (
//       <div id="theory-pdf-content" style={{ position: "absolute", left: "-9999px" }}>
//         <TheoryPdf resultData={ResultData} />
//       </div>
//     )}' */}
//     <div className="max-w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
//       {/* Main Result Card */}
//       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        
//         {/* Header with gradient background */}
//         <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
//           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
//           <div className="relative z-10">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center space-x-4">
//                 <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                   <User className="w-8 h-8 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold">{name}</h1>
//                   {/* <p className="text-blue-100">ID: {studentId}</p> */}
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <Calendar className="w-5 h-5" />
//                   <span>{examDate}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Clock className="w-5 h-5" />
//                   <span>{timeSpent} / {duration}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="text-center">
//               <h2 className="text-4xl font-semibold mb-2">{examTitle}</h2>
//               <p className="text-blue-100 text-xl">{getPerformanceMessage(percentage)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Score Section */}
//         <div className="p-8">
//           <div className="grid md:grid-cols-3 gap-8 mb-8">
//             {/* Main Score */}
//             <div className="md:col-span-2">
//               <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
//                <p className="text-sm text-gray-600">Obtained Marks</p>
//                 <div className="text-center">
//                   <div className={`text-6xl font-bold text-green-600 mb-2 transition-all duration-1000 ${animateScore ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
//                     {obtainedMarks}
//                     <span className="text-3xl text-gray-500">/{totalMarks}</span>
//                   </div>
//                   {/* <div className="text-2xl font-semibold text-green-700 mb-2">
//                     {percentage}%
//                     </div> */}
//                   {/* <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(grade)}`}>
//                     Grade {grade}
//                     </div> */}
//                 </div>
//               </div>
//             </div>

//             {/* Rank and Stats */}
//             <div className="space-y-4">
//               {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
//                 <div className="flex items-center space-x-3">
//                 <Trophy className="w-8 h-8 text-purple-600" />
//                 <div>
//                 <p className="text-sm text-gray-600">Class Rank</p>
//                 <p className="text-2xl font-bold text-purple-600">#{rank}</p>
//                 <p className="text-xs text-gray-500">out of {totalStudents}</p>
//                 </div>
//                 </div>
//                 </div> */}

//               <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
//                 <div className="flex items-center space-x-3">
//                   <Target className="w-8 h-8 text-orange-600" />
//                   <div>
//                     <p className="text-sm text-gray-600">Percentage</p>
//                     <p className="text-2xl font-bold text-orange-600"> {percentage}%</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Subject-wise Breakdown */}
//           <div className="mb-8">
//             {/* <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
//               <BookOpen className="w-5 h-5 text-blue-600" />
//               <span>Subject-wise Performance</span>
//               </h3> */}
//             <div className="grid md:grid-cols-2 gap-4">
//               {/* {subjects.map((subject, index) => (
//                 <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
//                 <div className="flex justify-between items-center mb-2">
//                 <h4 className="font-semibold text-gray-800">{subject.name}</h4>
//                 <span className="text-sm font-medium text-gray-600">
//                 {subject.obtained}/{subject.total}
//                 </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
//                 <div 
//                 className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
//                 style={{ width: `${subject.percentage}%` }}
//                 ></div>
//                 </div>
//                 <div className="text-right">
//                 <span className="text-sm font-semibold text-blue-600">{subject.percentage}%</span>
//                 </div>
//                 </div>
//                 ))} */}
//             </div>
//           </div>

//           {/* Feedback Section - Expandable */}
//             {/* <span>Detailed Feedback & Analysis</span> */}
//           <div className="border-t pt-2">
//             {/* <button 
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-colors duration-200"
//               >
//               <h3 className="text-xl font-semibold flex items-center space-x-2">
//               <Star className="w-5 h-5 text-indigo-600" />
//               </h3>
//               {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//               </button> */}

//             <div className={`transition-all duration-500 overflow-hidden`}>
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Strengths */}
//                 {/* <div className="bg-green-50 rounded-xl p-5 border border-green-100">
//                   <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
//                   <TrendingUp className="w-4 h-4" />
//                   <span>overall_feedback</span>
//                   </h4>
//                   <ul className="space-y-2">
//                   {feedback.strengths.map((strength, index) => (
//                     <li key={index} className="text-green-700 flex items-start space-x-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
//                     <span>{strength}</span>
//                     </li>
//                     ))}
//                     {feedback}
//                     </ul>
//                     </div> */}

//                 {/* Areas for Improvement */}
//                 {/* <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
//                   <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
//                   <Award className="w-4 h-4" />
//                   <span>Areas for Improvement</span>
//                   </h4>
//                   <ul className="space-y-2">
//                   {feedback.improvements.map((improvement, index) => (
//                     <li key={index} className="text-blue-700 flex items-start space-x-2">
//                     <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
//                     <span>{improvement}</span>
//                     </li>
//                     ))}
//                   </ul>
//                 </div> */}
//               </div>

//               {/* Teacher's Comment */}
//               <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
//                 <h4 className="font-semibold text-purple-800 mb-3">Overall Feedback</h4>
//                 <p className="text-purple-700 leading-relaxed italic">"{feedback}"</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="bg-gray-50 px-8 py-4 text-center">
//           <p className="text-gray-600">Keep up the excellent work! 🌟</p>
//         </div>
//       </div>
//     </div>
//                     </>
//   );
// }