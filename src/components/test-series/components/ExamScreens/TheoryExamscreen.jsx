// import React, { useEffect, useRef, useState } from "react";
// // import { QRCodeSVG } from "qrcode.react";
// // import UploadPage from "../Upload/Upload";
// import axios from "axios";
// // import { questionPaperDataJSON } from "./DifferentPatternPaper";
// // import testDiagramImage from "../../assets/plantcell.jpg";
// import { motion } from 'framer-motion';
// // import { fadeIn } from '../../../public/animation/animations';
// // import { fadeIn } from "../../../public/animation/animations.js";
// import { replace, useLocation, useNavigate } from "react-router-dom";
// import useGlobalStore from "../../Store/globalStore";
// import Cookies from 'js-cookie';
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import QuestionMathJax from "../QuestionMathJax.jsx";
// import { MathJaxContext } from "better-react-mathjax";

// export const TheoryExamscreen = () => {
//   const location = useLocation();
//   const contentRef = useRef(null);
//   const user_ass_id = useGlobalStore.getState().userAssId || location.state?.user_ass_id;
//   const { from } = location.state || {};
//   const username = Cookies.get("username") || localStorage.getItem("username");
//   const [token, setToken] = useState("");
//   // const [questionPaperData, setQuestionPaperData] = useState(questionPaperDataJSON);
//   const [questionPaperData, setQuestionPaperData] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [hours, setHours] = useState(0);
//   const [minutes, setMinutes] = useState("");
//   const [seconds, setSeconds] = useState(0);
//   const [uploading, setUploading] = useState(false);
//   const navigate = useNavigate();

//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [timeTaken, setTimeTaken] = useState(null);

//   useEffect(() => {
//     setStartTime(new Date().toISOString());
//   }, []);

//   //Check the from condition
//   useEffect(() => {
//     setToken(Cookies.get("token"));
//     //uncoment this
//     // if (
//     //   (from !== "/prepareexam") ||
//     //   !user_ass_id
//     // ) {
//     //   navigate("/mycourses");
//     // }


//     // if (user_ass_id) {
//     //   fetchAssessmentData();
//     // }
//     // console.log("token", token,"user_ass_id", user_ass_id,"from", from);
//   }, [user_ass_id]);


//   //Fetch the Question Paper
//   const fetchQuestionDataFromApi = async () => {
//     // Suppose you store exam start and end times
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axios.get("API_URL"
//         ,
//         //    {
//         //   params: { user_ass_id: USER_ASS_ID },
//         //   headers: { "Content-Type": "application/json" },
//         // }
//       );

//       if (response.data) {
//         // console.log(response.data);
//         setQuestionPaperData(response.data);
//         setMinutes(response.data?.total_time);

//       } else {
//         throw new Error("No data received from API");
//       }
//     } catch (error) {
//       console.error("Error fetching question paper data:", error);
//       setError(error.message || "Failed to fetch question paper data");
//     } finally {
//       setLoading(false);
//     }
//   };


//   //Restrictions on the Screen

//   //Restrict right click
//   useEffect(() => {
//     const disablerightclick = (e) => {
//       e.preventDefault();
//       toast.warn("Right-click is disabled during the  exam!", {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: false,
//         theme: "colored",
//       });
//     };
//     window.addEventListener("contextmenu", disablerightclick);
//     return () => {
//       window.removeEventListener("contextmenu", disablerightclick);
//     };
//   }, []);

//   //Block the buttons on the mobile devices
//   useEffect(() => {
//     // Push a dummy state so back button won’t exit immediately
//     window.history.pushState(null, "", window.location.href);

//     const blockBack = (event) => {
//       event.preventDefault();
//       // Push the same state again so user stays on page
//       window.history.pushState(null, "", window.location.href);
//     };

//     window.addEventListener("popstate", blockBack);

//     return () => {
//       window.removeEventListener("popstate", blockBack);
//     };
//   }, []);



//   //When keyboard keys press give alert
//   useEffect(() => {

//     const handleKeyDown = (e) => {
//       e.preventDefault();
//       toast.warn("This action is prohibited during the exam!", {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: false,
//         theme: "colored",
//       });
//       if (document.fullscreenElement) {
//         if (e.key === "Escape") {
//           document.documentElement.requestFullscreen();
//         }
//       }
//     };

//     const handleBlur = (e) => {
//       e.preventDefault();
//       toast.warn("Switching tabs is prohibited during the exam!", {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: false,
//         theme: "colored",
//       });
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("blur", handleBlur);
//     document.addEventListener("visibilitychange", () => {
//       if (document.hidden) {
//         document.documentElement.requestFullscreen();
//       }
//     });
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("blur", handleBlur);
//     };
//   }, []);

//   //Full Screen Method
//   const enterFullScreen = () => {
//     const element = document.documentElement; // Fullscreen the entire document
//     if (element.requestFullscreen) {
//       element.requestFullscreen();
//     }
//     if (element.mozRequestFullScreen) {
//       element.mozRequestFullScreen(); // For older Firefox
//     } else if (element.webkitRequestFullscreen) {
//       element.webkitRequestFullscreen(); // For older Safari/Chrome
//     } else if (element.msRequestFullscreen) {
//       element.msRequestFullscreen(); // For IE/Edge
//     }
//   };

//   //Restrict to go back from exam screen
//   useEffect(() => {
//     const handleBackButton = (event) => {
//       event.preventDefault();
//       window.history.pushState(null, null, window.location.pathname);
//     };

//     window.history.pushState(null, null, window.location.pathname);
//     window.addEventListener("popstate", handleBackButton);

//     return () => {
//       window.removeEventListener("popstate", handleBackButton);
//     };
//   }, []);

//   //Countdown Timer
//   // useEffect(() => {
//   //   // console.log("Minutes" , minutes);
//   //   const interval = setTimeout(() => {
//   //     if (seconds > 0) {
//   //       setSeconds(seconds - 1);
//   //       return;
//   //     }
//   //     if (seconds === 0) {
//   //       if (minutes === 0 && hours === 0) {
//   //         console.log("Time is Up");
//   //         handleFinalSubmit();
//   //         clearTimeout(interval);
//   //       } else {
//   //         if (minutes === 0 && hours > 0) {
//   //           setSeconds(59);
//   //           setMinutes(59);
//   //           setHours(hours - 1);
//   //         } else {
//   //           setSeconds(59);
//   //           setMinutes(minutes - 1);
//   //           if (minutes === 5) {
//   //             toast.warn("5 minutes remaining");
//   //           }
//   //           if (minutes === 1) {
//   //             toast.warn("1 minute remaining");
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }, 1000);
//   //   return () => clearTimeout(interval);
//   // }, [seconds, minutes, hours]);


//   //New Method
//   useEffect(() => {
//     const interval = setTimeout(() => {
//       if (seconds > 0) {
//         setSeconds(seconds - 1);
//       } else {
//         if (minutes > 0) {
//           setMinutes(minutes - 1);
//           setSeconds(59);

//           if (minutes - 1 === 5) toast.warn("5 minutes remaining");
//           if (minutes - 1 === 1) toast.warn("1 minute remaining");
//         } else if (hours > 0) {
//           setHours(hours - 1);
//           setMinutes(59);
//           setSeconds(59);
//         } else {
//           console.log("Time is Up");
//           finalSubmit();
//           clearTimeout(interval);
//         }
//       }
//     }, 1000);

//     return () => clearTimeout(interval);
//   }, [seconds, minutes, hours]);


//   useEffect(() => {
//     fetchQuestionDataFromApi();
//     enterFullScreen();
//     setLoading(false);
//     const script = document.createElement("script");
//     script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
//     script.async = true;
//     script.onload = () => {
//       window.MathJax = {
//         tex: {
//           inlineMath: [["$", "$"], ["\\(", "\\)"]],
//           displayMath: [["$$", "$$"], ["\\[", "\\]"]],
//         },
//         svg: { fontCache: "global" },
//         startup: {
//           ready: () => {
//             window.MathJax.startup.defaultReady();
//             if (contentRef.current) {
//               window.MathJax.typesetPromise([contentRef.current]).catch((err) =>
//                 console.error("MathJax typesetting error:", err)
//               );
//             }
//           },
//         },
//       };
//     };
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//       delete window.MathJax;
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (window.MathJax && window.MathJax.typesetPromise && contentRef.current) {
//   //     window.MathJax.typesetPromise([contentRef.current]).catch((err) =>
//   //       console.error("MathJax re-typesetting error:", err)
//   //     );
//   //   }
//   // }, [questionPaperData]);
//   useEffect(() => {
//   let cancelled = false;
//   if (window.MathJax?.typesetClear && window.MathJax?.typesetPromise && contentRef.current) {
//     window.MathJax.typesetClear([contentRef.current]); // clear old render
//     window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
//       if (!cancelled) console.error("MathJax re-typesetting error:", err);
//     });
//   }
//   return () => {
//     cancelled = true;
//   };
// }, [questionPaperData]);


//   const closeModal = () => {
//     setShowModal(false);
//     setModalContent(null);
//   };

//   // const handleFinalSubmit = async () => {
//   //   setUploading(true);
//   //   const userAnswerIds = {};
//   //   questionPaperData.section_data?.forEach(section => {
//   //     section.question_data.forEach(q => {
//   //       userAnswerIds[q.question_id] = q.user_answer_id;
//   //     });
//   //   });
//   //   // Calculate ass_end_time (ISO string)
//   //   const localEndTime = new Date();

//   //   // // Calculate time_taken (in seconds)
//   //   // const time_taken = (hours * 3600) + (parseInt(minutes) * 60) + seconds;

//   //   // Calculate time_taken in minutes
//   //   // const time_taken = (hours * 60) + parseInt(minutes) + (seconds / 60);

//   //   let totalTimeTaken = 0;
//   //   if (startTime && localEndTime) {
//   //     totalTimeTaken = Math.round((localEndTime - startTime) / 1000); // in seconds
//   //   }

//   //   const minutesTaken = Math.floor(totalTimeTaken / 60);
//   //   const secondsTaken = totalTimeTaken % 60;
//   //   const formattedTimeTaken = `${minutesTaken}:${secondsTaken < 10 ? "0" : ""
//   //     }${secondsTaken}`;
//   //   // console.log(`Time taken: ${formattedTimeTaken} (Sent as: ${totalTimeTaken} seconds)`);


//   //   // Calculate ass_end_time (ISO string)
//   //   const ass_end_time = new Date().toISOString();
//   //   console.log("answers", answers, "questionPapaer Data", questionPaperData, "user answer id", userAnswerIds, "Time taken", timeTaken, "ass end time", ass_end_time);


//   //   const payload = {
//   //     // user_ass_id: questionPaperData.user_assessment_id,
//   //     assessment_status: "COMPLETED",
//   //     time_taken: formattedTimeTaken,
//   //     ass_end_time: ass_end_time,
//   //     //...other parameters as needed
//   //   };
//   //   console.log("Final Submit Payload", payload);
//   //   try {
//   //     const response = await axios.post(`API_URL`,
//   //       payload,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );

//   //     if (response.status === 200) {
//   //       // alert("All answers submitted!");

//   //     }
//   //   } catch (err) {
//   //     alert("Submission failed. Please try again.");
//   //     console.error("Submission error", err);
//   //   }
//   //   setUploading(false);
//   // };

//   const confirmSubmitWithoutAnswers = () => {
//     Swal.fire({
//       title: "Submit Exam?",
//       text: "Are you sure you want to submit exam? Once you submit this exam, you will no longer be able to upload your answers. ",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit",
//       cancelButtonText: "Cancel",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         submitWithoutAnswers();
//       } else {
//         Swal.fire("Cancelled", "You can continue your exam.", "info");
//       }
//     });
//   };


//   const submitWithoutAnswers = async () => {
//     setUploading(true);

//     const userAnswerIds = {};
//     questionPaperData.section_data?.forEach(section => {
//       section.question_data.forEach(q => {
//         userAnswerIds[q.question_id] = q.user_answer_id;
//       });
//     });

//     // const localEndTime = new Date();
//     // let totalTimeTaken = 0;
//     // if (startTime && localEndTime) {
//     //   totalTimeTaken = Math.round((localEndTime - startTime) / 1000); // in seconds
//     // }

//     // const minutesTaken = Math.floor(totalTimeTaken / 60);
//     // const secondsTaken = totalTimeTaken % 60;
//     // const formattedTimeTaken = `${minutesTaken}:${secondsTaken < 10 ? "0" : ""}${secondsTaken}`;

//     // const ass_end_time = new Date().toISOString();

//     const ass_start_time = startTime;
//     const ass_end_time = new Date().toISOString();
    
//     const start = new Date(ass_start_time);
//     const end = new Date(ass_end_time);
    
//     // difference in milliseconds
//     const diffMs = end - start;
    
//     // convert to seconds
// const totalTimeTaken = Math.round(diffMs / 1000);

// // get minutes and seconds
// const minutes = Math.floor(totalTimeTaken / 60);
// const seconds = totalTimeTaken % 60;

// // format mm:ss
// const formattedTimeTaken = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

// // console.log("Total seconds:", totalTimeTaken); // 12
// // console.log("Formatted:", formattedTimeTaken); // 0:12

// const payload = {
//   ass_start_time: startTime,
//   assessment_status: "COMPLETED",
//   time_taken: formattedTimeTaken, // or totalTimeTaken (in seconds) if backend expects
//   ass_end_time: ass_end_time,
// };
// // console.log("Final Submit Payload", payload);

// try {
//   const response = await axios.post(
//     `API_URL`,
//     payload,
//     {
//       headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200) {
//         Swal.fire("Submitted!", "Your exam have been submitted.", "success");
//         navigate("/dashboard", {
//           state: {
//             answers,
//             questionPaperData,
//             userAnswerIds,
//             time_taken: formattedTimeTaken,
//             ass_end_time,
//             user_ass_id,
//           },
//         }, { replace: true });
//       }
//     } catch (err) {
//       Swal.fire("Error", "Submission failed. Please try again.", "error");
//       console.error("Submission error", err);
//     }

//     setUploading(false);
//   };

//   // 🔹 Handles actual submission (shared by manual + auto submit)
//   const finalSubmit = async () => {
//     setUploading(true);

//     const userAnswerIds = {};
//     questionPaperData.section_data?.forEach(section => {
//       section.question_data.forEach(q => {
//         userAnswerIds[q.question_id] = q.user_answer_id;
//       });
//     });

//     // const localEndTime = new Date();
//     // let totalTimeTaken = 0;
//     // if (startTime && localEndTime) {
//     //   totalTimeTaken = Math.round((localEndTime - startTime) / 1000); // in seconds
//     // }

//     // const minutesTaken = Math.floor(totalTimeTaken / 60);
//     // const secondsTaken = totalTimeTaken % 60;
//     // const formattedTimeTaken = `${minutesTaken}:${secondsTaken < 10 ? "0" : ""}${secondsTaken}`;

//     // const ass_end_time = new Date().toISOString();

//     const ass_start_time = startTime;
//     const ass_end_time = new Date().toISOString();
    
//     const start = new Date(ass_start_time);
//     const end = new Date(ass_end_time);
    
//     // difference in milliseconds
//     const diffMs = end - start;
    
//     // convert to seconds
// const totalTimeTaken = Math.round(diffMs / 1000);

// // get minutes and seconds
// const minutes = Math.floor(totalTimeTaken / 60);
// const seconds = totalTimeTaken % 60;

// // format mm:ss
// const formattedTimeTaken = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

// // console.log("Total seconds:", totalTimeTaken); // 12
// // console.log("Formatted:", formattedTimeTaken); // 0:12

// const payload = {
//   ass_start_time: startTime,
//   assessment_status: "COMPLETED",
//   time_taken: formattedTimeTaken, // or totalTimeTaken (in seconds) if backend expects
//   ass_end_time: ass_end_time,
// };
// // console.log("Final Submit Payload", payload);

// try {
//   const response = await axios.post(`API_URL`,
//     payload,
//     {
//       headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200) {
//         Swal.fire("Submitted!", "Your answers have been submitted.", "success");
//         navigate("/review-answers", {
//           state: {
//             answers,
//             questionPaperData,
//             userAnswerIds,
//             time_taken: formattedTimeTaken,
//             ass_end_time,
//             user_ass_id,
//           },
//         }, { replace: true });
//       }
//     } catch (err) {
//       Swal.fire("Error", "Submission failed. Please try again.", "error");
//       console.error("Submission error", err);
//     }

//     setUploading(false);
//   };

//   // 🔹 Manual submit (with confirmation dialog)
//   const confirmFinalSubmit = () => {
//     Swal.fire({
//       title: "Submit Exam?",
//       text: "Are you sure you want to submit all answers?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit",
//       cancelButtonText: "Cancel",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         finalSubmit();
//       } else {
//         Swal.fire("Cancelled", "You can continue your exam.", "info");
//       }
//     });
//   };


//   // Match the Following with input boxes
//   const renderMatchTheFollowing = (question, index) => {
//     const getAlphabetPrefix = (idx) => String.fromCharCode(65 + idx);
//     const rightItems = question.shuffle_options
//       ? [...question.match_pairs]
//         .sort(() => Math.random() - 0.5)
//         .map((pair) => pair.right)
//       : question.match_pairs.map((pair) => pair.right);

//     return (
//       <MathJaxContext
//         config={{
//           loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
//           tex: {
//             inlineMath: [["\\(", "\\)"]],
//             displayMath: [["\\[", "\\]"]],
//             processEscapes: true,
//           },
//           chtml: {
//             scale: 1, // Keep math text size normal
//             minScale: 0.5, // Minimum scaling
//             matchFontHeight: true, // Ensures math font matches surrounding text
//           },
//           options: {
//             enableMenu: true, // Enable right-click menu
//           },
//         }}
//       >

//         <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//           <div className="flex justify-between items-start">
//             {/* <p className="font-medium">
//             {index + 1}. {question.question_latex}
//             </p> */}
//             <p className="font-medium flex items-start">
//               <span>{index + 1}.</span>&nbsp;
//               <span className="inline-block">
//                 <QuestionMathJax content={question.question_latex} />
//               </span>
//               {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//                 <div className="mt-4 flex flex-wrap gap-4">
//                   {question.question_diagrams_url.map((url, idx) => (
//                     <img
//                       key={`${question.question_id}-${url}-${idx}`}
//                       src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//                       alt={`Diagram ${idx + 1}`}
//                       className="max-w-full h-auto border rounded-lg"
//                       style={{ maxHeight: "300px" }}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </p>
//             <span className="text-sm font-semibold text-gray-600 p-2">
//               [{question.marks} mark{question.marks > 1 ? "s" : ""}]
//             </span>
//           </div>
//           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-3">
//               <h4 className="font-semibold text-center bg-gray-100 py-2">Column A</h4>
//               <ul className="space-y-2">
//                 {question.match_pairs.map((pair, idx) => (
//                   <li
//                     // key={`left-${idx}`} 
//                     key={`left-${question.question_id}-${idx}`}
//                     className="p-2 border rounded flex items-center">
//                     <span className="mr-2 font-medium">{idx + 1}.</span>
//                     {pair.left}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="space-y-3">
//               <h4 className="font-semibold text-center bg-gray-100 py-2">Column B</h4>
//               <ul className="space-y-2">
//                 {rightItems.map((item, idx) => (
//                   <li
//                     // key={`right-${idx}`} 
//                     key={`right-${question.question_id}-${idx}`}
//                     className="p-2 border rounded flex items-center">
//                     <span className="mr-2 font-medium">{getAlphabetPrefix(idx)}.</span>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </MathJaxContext>
//     );
//   };


//   // MCQ Questions without radio buttons
//   const renderMCQ = (question, index) => {
//     const options = [
//       question.option1_latex,
//       question.option2_latex,
//       question.option3_latex,
//       question.option4_latex,
//       question.option5_latex,
//     ].filter(Boolean);

//     return (
//       <MathJaxContext
//         config={{
//           loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
//           tex: {
//             inlineMath: [["\\(", "\\)"]],
//             displayMath: [["\\[", "\\]"]],
//             processEscapes: true,
//           },
//           chtml: {
//             scale: 1, // Keep math text size normal
//             minScale: 0.5, // Minimum scaling
//             matchFontHeight: true, // Ensures math font matches surrounding text
//           },
//           options: {
//             enableMenu: true, // Enable right-click menu
//           },
//         }}
//       >

//         <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//           <div className="flex justify-between items-start">
//             {/* <p className="font-medium">
//             {index + 1}. {question.question_latex}
//           </p>
//           <span className="text-sm font-semibold text-gray-600 ">
//             [{question.marks} mark{question.marks > 1 ? "s" : ""}]
//           </span> */}
//             <div className="font-medium flex items-start">
//               <span>{index + 1}.</span>&nbsp;
//               <span className="inline-block">
//                 <QuestionMathJax content={question.question_latex} />
//               </span>
//               {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//                 <div className="mt-4 flex flex-wrap gap-4">
//                   {question.question_diagrams_url.map((url, idx) => (
//                     <img
//                       key={`${question.question_id}-${url}-${idx}`}
//                       src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//                       alt={`Diagram ${idx + 1}`}
//                       className="max-w-full h-auto border rounded-lg"
//                       style={{ maxHeight: "300px" }}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//             <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//               [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//             </span>
//           </div>
//           <div className="mt-4 ml-6 space-y-2">
//             {options.map((opt, i) => (
//               <div className="flex items-center"
//                 // key={i}
//                 key={`option-${question.question_id}-${i}`}
//               >
//                 <label htmlFor={`mcq_${question.question_id}_${i}`}>
//                   {String.fromCharCode(65 + i)}) 
// <span className="inline-block align-middle">
//   <QuestionMathJax content={opt} />
// </span>
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>
//       </MathJaxContext>
//     );
//   };

//   // Diagram Questions
//   const renderDiagramQuestion = (question, index) => {
//     return (
//       <MathJaxContext
//         config={{
//           loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
//           tex: {
//             inlineMath: [["\\(", "\\)"]],
//             displayMath: [["\\[", "\\]"]],
//             processEscapes: true,
//           },
//           chtml: {
//             scale: 1, // Keep math text size normal
//             minScale: 0.5, // Minimum scaling
//             matchFontHeight: true, // Ensures math font matches surrounding text
//           },
//           options: {
//             enableMenu: true, // Enable right-click menu
//           },
//         }}
//       >

//         <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//           <div className="flex justify-between items-start">
//             {/* <p className="font-medium">
//             {index + 1}. {question.question_latex}
//           </p>
//           <span className="text-sm font-semibold text-gray-600">
//             [{question.marks} mark{question.marks > 1 ? "s" : ""}]
//           </span> */}
//             <p className="font-medium flex items-start">
//               <span>{index + 1}.</span>&nbsp;
//               <span className="inline-block">
//                 <QuestionMathJax content={question.question_latex} />
//               </span>
//               {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//                 <div className="mt-4 flex flex-wrap gap-4">
//                   {question.question_diagrams_url.map((url, idx) => (
//                     <img
//                       key={`${question.question_id}-${url}-${idx}`}
//                       src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//                       alt={`Diagram ${idx + 1}`}
//                       className="max-w-full h-auto border rounded-lg"
//                       style={{ maxHeight: "300px" }}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </p>
//             <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//               [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//             </span>
//           </div>

//           <div className="mt-4">
//             {question.question_diagrams_url?.map((url, idx) => (
//               <div key={`diagram-${idx}`} className="mb-4">
//                 <img
//                   src={""}
//                   alt="Plant cell diagram for labeling"
//                   className="max-w-full h-auto mx-auto border rounded-lg"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                   }}
//                 />
//               </div>
//             ))}
//           </div>

//           <div className="mt-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Label the parts (comma separated):
//             </label>
//             {question.answer_description && (
//               <p className="mt-2 text-xs text-gray-500">
//                 Expected labels: {question.answer_description}
//               </p>
//             )}
//           </div>
//         </div>
//       </MathJaxContext>
//     );
//   };

//   // Comprehension Section
//   const renderComprehensionSection = (section) => {
//     if (section.question_type_name?.toLowerCase() !== "comprehension") {
//       return null;
//     }

//     const hasPassage = section.passage_text || section.passage_latex;
//     if (!hasPassage) {
//       console.warn('Comprehension section missing passage content:', section);
//       return null;
//     }

//     return (
//       <div key={section.assessment_section_id} className="mb-10">
//         <div className="flex justify-between items-center mb-4 border-b pb-2">
//           <h2 className="text-xl font-semibold">
//             Section {section.section_number}: {section.section_heading}
//           </h2>
//           <span className="text-sm font-semibold text-gray-600">
//             [Total: {section.section_total_marks} marks]
//           </span>
//         </div>

//         <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
//           <h3 className="font-bold text-blue-800 mb-3 text-lg">
//             Read the following passage carefully:
//           </h3>
//           <div className="prose max-w-none text-gray-700 leading-relaxed">
//             {section.passage_text ? (
//               <div className="whitespace-pre-line">{section.passage_text}</div>
//             ) : (
//               <div dangerouslySetInnerHTML={{ __html: section.passage_latex }} />
//             )}
//           </div>
//         </div>

//         <div className="space-y-6">
//           {section.question_data?.map((question, qIndex) => (
//             <div
//               // key={question.question_id} 
//               className="pl-4 border-l-4 border-blue-200">
//               {renderQuestion(question, qIndex)}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   // Render each question based on its type
//   const renderQuestion = (question, index) => {
//     switch (question.question_type_name) {
//       case "Match the Following":
//         return renderMatchTheFollowing(question, index);
//       case "Theory mcq 1 marks" || "Assertion&Reasoning" :
//         return renderMCQ(question, index);
//       case "Diagram":
//         return renderDiagramQuestion(question, index);
//       case "True or False":
//         return (
//           <MathJaxContext
//             config={{
//               loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
//               tex: {
//                 inlineMath: [["\\(", "\\)"]],
//                 displayMath: [["\\[", "\\]"]],
//                 processEscapes: true,
//               },
//               chtml: {
//                 scale: 1, // Keep math text size normal
//                 minScale: 0.5, // Minimum scaling
//                 matchFontHeight: true, // Ensures math font matches surrounding text
//               },
//               options: {
//                 enableMenu: true, // Enable right-click menu
//               },
//             }}
//           >

//             <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//               <div className="flex justify-between items-start">
//                 {/* <p className="font-medium">
//                 {index + 1}. {question.question_latex}
//               </p>
//               <span className="text-sm font-semibold text-gray-600">
//                 [{question.marks} mark{question.marks > 1 ? "s" : ""}]
//               </span> */}
//                 <p className="font-medium flex items-start">
//                   <span>{index + 1}.</span>&nbsp;
//                   <span className="inline-block">
//                     <QuestionMathJax content={question.question_latex || ""} />
//                   </span>
//                   <div className="block">
//                   {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//                     <div className="mt-4 flex flex-wrap gap-4">
//                       {question.question_diagrams_url.map((url, idx) => (
//                         <img
//                         // key={idx}
//                         key={`${question.question_id}-${url}-${idx}`}
//                         src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//                         alt={`Diagram ${idx + 1}`}
//                         className="max-w-full h-auto border rounded-lg"
//                         style={{ maxHeight: "300px" }}
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                         }}
//                         />
//                       ))}
//                     </div>
//                   )}
//                   </div>
//                 </p>
//                 <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//                   [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//                 </span>
//               </div>

//             </div>
//           </MathJaxContext>
//         );
//       case "Fill in the Blanks":
//         return (
//           <MathJaxContext
//             config={{
//               loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
//               tex: {
//                 inlineMath: [["\\(", "\\)"]],
//                 displayMath: [["\\[", "\\]"]],
//                 processEscapes: true,
//               },
//               chtml: {
//                 scale: 1, // Keep math text size normal
//                 minScale: 0.5, // Minimum scaling
//                 matchFontHeight: true, // Ensures math font matches surrounding text
//               },
//               options: {
//                 enableMenu: true, // Enable right-click menu
//               },
//             }}
//           >

//             <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//               <div className="flex justify-between items-start">
//                 {/* <p className="font-medium">
//                 {index + 1}. {question.question_latex.replace("__________", "_______")}
//               </p>
//               <span className="text-sm font-semibold text-gray-600">
//                 [{question.marks} mark{question.marks > 1 ? "s" : ""}]
//               </span> */}
//                 <p className="font-medium flex items-start">
//                   <span>{index + 1}.</span>&nbsp;
//                   <span className="inline-block">
//                     <QuestionMathJax content={question.question_latex} />
//                   </span>
//                   {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//                     <div className="mt-4 flex flex-wrap gap-4">
//                       {question.question_diagrams_url.map((url, idx) => (
//                         <img
//                           key={`${question.question_id}-${url}-${idx}`}
//                           src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//                           alt={`Diagram ${idx + 1}`}
//                           className="max-w-full h-auto border rounded-lg"
//                           style={{ maxHeight: "300px" }}
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//                           }}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </p>
//                 <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//                   [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//                 </span>
//               </div>
//             </div>
//           </MathJaxContext>
//         );
//       default:
//         return (
//           // <MathJaxContext
//           //   config={{
//           //     loader: { load: ["input/tex", "output/chtml"] },
//           //     tex: {
//           //       inlineMath: [["$", "$"], ["\\(", "\\)"]],
//           //       displayMath: [["$$", "$$"], ["\\[", "\\]"]],
//           //       processEscapes: true,
//           //     },
//           //     chtml: {
//           //       scale: 1,
//           //       minScale: 0.5,
//           //       matchFontHeight: true,
//           //     },
//           //     options: {
//           //       enableMenu: true,
//           //     },
//           //   }}
//           // >

//           //   <div key={question.question_id} className="mb-8 p-4 border rounded-lg">
//           //     <div className="flex justify-between items-start">
//           //       {/* <p className="font-medium">
//           //       {question.question_latex}
//           //       {index + 1}. <QuestionMathJax content={question.question_latex} />
//           //     </p> */}
//           //       <p className="font-medium flex items-start">
//           //         <span>{index + 1}.</span>&nbsp;
//           //         <span className="inline-block">
//           //           <QuestionMathJax content={question.question_latex} />
//           //         </span>
//           //         {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
//           //           <div className="mt-4 flex flex-wrap gap-4">
//           //             {question.question_diagrams_url.map((url, idx) => (
//           //               <img
//           //                 key={`${question.question_id}-${url}-${idx}`}
//           //                 src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//           //                 alt={`Diagram ${idx + 1}`}
//           //                 className="max-w-full h-auto border rounded-lg"
//           //                 style={{ maxHeight: "300px" }}
//           //                 onError={(e) => {
//           //                   e.target.onerror = null;
//           //                   e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//           //                 }}
//           //               />
//           //             ))}
//           //           </div>
//           //         )}
//           //       </p>
//           //       <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//           //         [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//           //       </span>
//           //     </div>
//           //   </div>
//           // </MathJaxContext>
//           <MathJaxContext
//   config={{
//     loader: { load: ["input/tex", "output/chtml"] },
//     tex: {
//       inlineMath: [["$", "$"], ["\\(", "\\)"]],
//       displayMath: [["$$", "$$"], ["\\[", "\\]"]],
//       processEscapes: true,
//     },
//     chtml: {
//       scale: 1,
//       minScale: 0.5,
//       matchFontHeight: true,
//     },
//     options: {
//       enableMenu: true,
//     },
//   }}
// >
//   <div
//     key={question.question_id}
//     className="mb-8 p-4 border rounded-lg"
//   >
//     {/* Row: Question + Marks */}
//     <div className="flex justify-between items-start">
//       <p className="font-medium flex items-start">
//         <span>{index + 1}.</span>&nbsp;
//         <span className="inline-block">
//           <QuestionMathJax content={question.question_latex} />
//         </span>
//       </p>

//       <span className="text-sm font-semibold text-gray-600 p-2 whitespace-nowrap">
//         [{question.marks} {question.marks > 1 ? "marks" : "mark"}]
//       </span>
//     </div>

//     {/* Row: Images (always below) */}
//     {question.question_diagrams_url &&
//       question.question_diagrams_url.length > 0 && (
//         <div className="mt-4 flex flex-wrap gap-4">
//           {question.question_diagrams_url.map((url, idx) => (
//             <img
//               key={`${question.question_id}-${url}-${idx}`}
//               src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
//               alt={`Diagram ${idx + 1}`}
//               className="max-w-full h-auto border rounded-lg"
//               style={{ maxHeight: "300px" }}
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src =
//                   "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
//               }}
//             />
//           ))}
//         </div>
//       )}
//   </div>
// </MathJaxContext>

//         );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading question paper...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
//           <h3 className="text-lg font-medium text-red-800">Error Loading Question Paper</h3>
//           <p className="mt-2 text-red-600">{error}</p>
//           <button
//             onClick={fetchQuestionDataFromApi}
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!questionPaperData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">No question paper data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Sticky Navbar */}
//       <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg flex items-center justify-between px-6 py-3 overflow-hidden">
//         <span className="text-white font-bold text-lg truncate max-w-[60vw]">
//           {questionPaperData.exam_details?.subject || "Exam Title"}
//         </span>
//         <span className="text-white font-mono text-base sm:text-lg bg-black bg-opacity-20 px-4 py-1 rounded-lg shadow-inner tracking-widest">
//           {/* {formatTime(secondsLeft)} */}
//           <p>
//             Time: {hours < 10 ? `0${hours}` : hours}:
//             {minutes < 10 ? `0${minutes}` : minutes}:
//             {seconds < 10 ? `0${seconds}` : seconds}
//           </p>
//         </span>
//       </nav>

//       {/* Add a spacer to prevent content being hidden under navbar */}
//       {/* <div className="h-16"></div> */}

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8 flex flex-col items-center font-inter text-gray-800"
//       >
//         <motion.div
//           variants={fadeIn}
//           initial="hidden"
//           animate="visible"
//           ref={contentRef}
//           className="bg-white p-6 sm:p-10 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-200 mb-4 hover:shadow-blue-100 transition-all duration-300"
//         >
//           {/* Header section with enhanced styling */}
//           <motion.div
//             initial={{ y: -20 }}
//             animate={{ y: 0 }}
//             className="text-center mb-8 pb-4 border-b border-gray-200"
//           >
//             <p className="font-bold text-lg sm:text-xl md:text-2xl mb-1 text-gray-900 hover:text-blue-700 transition-colors">
//               {/* {questionPaperData.exam_details.board.replace(/\\/g, '') || "Board Name"} */}
//             </p>
//             <p className="font-bold text-base sm:text-lg md:text-xl mb-1 text-gray-800">
//               {/* {questionPaperData.exam_details.examination || "Examination Name"} */}
//               {questionPaperData.assessment_name || "Examination Name"}
//             </p>
//             <p className="font-bold text-sm sm:text-base md:text-lg mb-4 text-gray-700">
//               {/* {questionPaperData.exam_details.class || "Class Name"} */}
//               {/* {questionPaperData.exam_details.class || "Class Name"} */}
//             </p>
//             <div className="flex justify-between items-center text-sm sm:text-base mb-8 px-4">
//               {/* <p className="text-gray-600">Time: {questionPaperData.exam_details.time_allowed || "30"}</p> */}
//               <p className="text-gray-600">Time: {questionPaperData.total_tim || "30"}</p>
//               {/* <p className="text-gray-600">Max. Marks: {questionPaperData.exam_details.max_marks || "80"}</p> */}
//               <p className="text-gray-600">Max. Marks: {questionPaperData.total_marks || "80"}</p>
//             </div>
//             <h1 className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-wide text-blue-700 uppercase">
//               {/* {questionPaperData.exam_details.subject || "Subject Name"} */}
//               {questionPaperData.assessment_name || "Subject Name"}
//             </h1>
//           </motion.div>

//           {/* Instructions with enhanced styling */}
//           <motion.div
//             whileHover={{ scale: 1.01 }}
//             className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm"
//           >
//             <h2 className="font-bold mb-3 text-blue-800">General Instructions:</h2>
//             <ul className="list-disc pl-5 space-y-2 text-gray-700">
//               <li>All questions are compulsory.</li>
//               <li>Read the questions carefully before answering.</li>
//               <li>Marks are indicated against each question.</li>
//             </ul>
//           </motion.div>

//           {/* Sections with enhanced styling */}
//           {questionPaperData.section_data
//             ?.slice() // create a copy to avoid mutating original
//             .sort((a, b) => (a.section_number ?? 0) - (b.section_number ?? 0))
//             .map((section, idx) => {
//               if (section.question_type_name?.toLowerCase() === "comprehension") {
//                 return renderComprehensionSection(section);
//               }
//               return (
//                 <motion.div
//                   initial={{ x: -20 }}
//                   animate={{ x: 0 }}
//                   transition={{ delay: idx * 0.1 }}
//                   key={section.assessment_section_id}
//                   className="mb-10 hover:shadow-lg transition-shadow duration-300 rounded-xl p-4"
//                 >
//                   <div className="mb-10">
//                     <div className="flex justify-between items-center mb-4 border-b pb-2">
//                       <h2 className="text-xl font-semibold">
//                         Section {section.section_number}: {section.section_heading}
//                       </h2>
//                       <span className="text-sm font-semibold text-gray-600">
//                         [Total: {section.section_total_marks} marks]
//                       </span>
//                     </div>
//                     <div className="space-y-6" >
//                       {section.question_data?.map((question, index) =>
//                         // renderQuestion(question, index)
//                         <React.Fragment key={question.question_id || index}>
//                           {renderQuestion(question, index)}
//                         </React.Fragment>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//         </motion.div>

//         <motion.div
//           initial={{ y: 20 }}
//           animate={{ y: 0 }}
//           className="w-full py-4 flex justify-center gap-4"
//         >
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={confirmFinalSubmit}
//             disabled={uploading}
//             className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg font-bold text-lg transition-all duration-300"
//           >
//             {uploading ? "Wait..." : "Upload Answers"}
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={confirmSubmitWithoutAnswers}
//             disabled={uploading}
//             className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg font-bold text-lg transition-all duration-300"
//           >
//             {uploading ? "Submitting" : "Submit"}
//           </motion.button>
//         </motion.div>
//       </motion.div>
//     </>
//   );
// };