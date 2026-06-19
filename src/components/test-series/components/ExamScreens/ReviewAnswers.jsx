import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn } from "../../../public/animation/animations.js";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import Cookies from "js-cookie";
import useGlobalStore from "../../Store/globalStore.js";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import getCroppedImg from './utils/cropImage'; // Your crop utility
import QuestionMathJax from "../QuestionMathJax.jsx";
import { MathJaxContext } from "better-react-mathjax";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const uploadOptions = [
  { label: "Upload from Device", value: "device" },
  { label: "Use Camera", value: "camera" },
  { label: "Scan QR", value: "qr" },
];

const ReviewAnswers = () => {
  const { state } = useLocation();
  const { answers, questionPaperData, userAnswerIds } = state || {};
  const [uploadModal, setUploadModal] = useState({
    open: false,
    qid: null,
    section: null,
  });
  const [showCamera, setShowCamera] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});
  const [matchAnswers, setMatchAnswers] = useState({});
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [tfAnswers, setTfAnswers] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [pendingUploads, setPendingUploads] = useState({}); // { [qid]: [File, ...] }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [uploadedStatus, setUploadedStatus] = useState({});
  const location = useLocation();
  const user_ass_id = location.state?.user_ass_id || useGlobalStore.getState().userAssId;
  // const [uploadedImages, setUploadedImages] = useState({});
  const [token, setToken] = useState('');
  const [savedMcq, setSavedMcq] = useState({});
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropperInstance, setCropperInstance] = useState([])

  const [attemptedTimestamps, setAttemptedTimestamps] = useState({});

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    const croppedImg = await getCroppedImg(cropImageSrc, croppedAreaPixels);
    // Convert base64 to File
    const blob = await (await fetch(croppedImg)).blob();
    const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });
    setPendingUploads((prev) => ({
      ...prev,
      [uploadModal.qid]: [croppedFile], // Replace with cropped image
      // [uploadModal.qid]: [...(prev[uploadModal.qid] || []), croppedFile], // Add cropped image
    }));
    setShowCrop(false);
    setCropImageSrc(null);
  };


  function getLocalDateTimeString(date = new Date()) {
    // Pad helper
    const pad = (n, z = 2) => String(n).padStart(z, '0');
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
  }

  // Initialize state from existing answers
  useEffect(() => {
    setToken(Cookies.get("token"));
    if (answers) {
      // Initialize MCQ answers
      const mcqState = {};
      // Initialize True/False answers
      const tfState = {};
      // Initialize Match answers
      const matchState = {};
      // Initialize uploaded images
      const imagesState = {};

      questionPaperData.section_data?.forEach((section) => {
        section.question_data.forEach((q) => {
          if (
            q.question_type_name === "Theory mcq 1 marks" || "Assertion&Reasoning" &&
            answers[q.question_id] !== undefined
          ) {
            // mcqState[q.question_id] = answers[q.question_id];
            const ans = answers[q.question_id];
            if (typeof ans === "string" && ans.length === 1 && ans.match(/[A-Z]/i)) {
              mcqState[q.question_id] = ans.charCodeAt(0) - 65;
            } else if (!isNaN(Number(ans))) {
              mcqState[q.question_id] = Number(ans);
            }
          } else if (
            q.question_type_name === "True/False" &&
            answers[q.question_id] !== undefined
          ) {
            tfState[q.question_id] = String(answers[q.question_id]);
          } else if (q.question_type_name === "Match the Following") {
            q.match_pairs.forEach((_, i) => {
              const key = `${q.question_id}_${i}`;
              if (answers[key] !== undefined) {
                matchState[key] = answers[key];
              }
            });
          } else if (
            answers[q.question_id] &&
            typeof answers[q.question_id] === "object"
          ) {
            // Handle uploaded images
            imagesState[q.question_id] = answers[q.question_id];
          }
        });
      });

      setMcqAnswers(mcqState);
      setTfAnswers(tfState);
      setMatchAnswers(matchState);
      setUploadedImages(imagesState);
    }
  }, [answers, questionPaperData]);
  

  useEffect(() => {
    if (!userAnswerIds) return;
    //Restrict to go back from exam screen
    //Full Screen Method
    const enterFullScreen = () => {
      const element = document.documentElement; // Fullscreen the entire document
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(); // For older Firefox
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(); // For older Safari/Chrome
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen(); // For IE/Edge
      }
    };


    enterFullScreen();

    // Prevent back navigation
    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (!userAnswerIds) return;
    const fetchUploadStatus = async () => {
      const statusObj = {};
      const mcqState = {};
      const savedMcqState = {};
      const tfState = {};
      const savedTfState = {};
      // for (const qid in userAnswerIds) {
      //   const user_answer_id = userAnswerIds[qid];
      //   try {
      //     const res = await axios.get(`API_URL`)
      //     // If user_answer is not null, mark as uploaded
      //     if (res.data && res.data.user_answer) {
      //       statusObj[qid] = "uploaded";

      //       const answer = res.data.user_answer;
      //       const options = [
      //         // You need to get the options for this qid from your questionPaperData
      //         // Find the section and question for this qid:
      //         ...(() => {
      //           for (const section of questionPaperData.section_data || []) {
      //             for (const q of section.question_data) {
      //               if (q.question_id == qid) {
      //                 return [
      //                   q.option1_latex,
      //                   q.option2_latex,
      //                   q.option3_latex,
      //                   q.option4_latex,
      //                   q.option5_latex,
      //                 ].filter(Boolean);
      //               }
      //             }
      //           }
      //           return [];
      //         })()
      //       ];

      //       if (typeof answer === "string") {
      //         if (answer.length === 1 && answer.match(/[A-Z]/i)) {
      //           mcqState[qid] = answer.charCodeAt(0) - 65;
      //           savedMcqState[qid] = true;
      //         } else if (!isNaN(Number(answer))) {
      //           mcqState[qid] = Number(answer);
      //           savedMcqState[qid] = true;
      //         } else {
      //           // Try to match the answer value to the option value
      //           const idx = options.findIndex(opt => opt === answer);
      //           if (idx !== -1) {
      //             mcqState[qid] = idx;
      //             savedMcqState[qid] = true;
      //           }
      //         }
      //       } else if (typeof answer === "number") {
      //         mcqState[qid] = answer;
      //         savedMcqState[qid] = true;
      //       }
      //     }
      //   } catch (err) {
      //     console.log("Error", err.message);
      //     // Optionally handle error
      //   }
      // }
      // setUploadedStatus((prev) => ({ ...prev, ...statusObj }));
      // setMcqAnswers((prev) => ({ ...prev, ...mcqState }));
      // setSavedMcq((prev) => ({ ...prev, ...savedMcqState })); // <-- Add this line
      for (const qid in userAnswerIds) {
        const user_answer_id = userAnswerIds[qid];
        try {
          const res = await axios.get(`API_URL`)
          if (res.data && res.data.user_answer ) {
            statusObj[qid] = "uploaded";
            // Find the question type for this qid
            let questionType = "";
            let answer = res.data.user_answer;
            for (const section of questionPaperData.section_data || []) {
              for (const q of section.question_data) {
                if (q.question_id == qid) {
                  questionType = q.question_type_name;
                  break;
                }
              }
            }
            if (questionType === "Theory mcq 1 marks" || "Assertion&Reasoning") {
              const answerAlphabet = res.data.user_answer;
              const idx = answerAlphabet
                ? answerAlphabet.charCodeAt(0) - 65
                : undefined;
              setMcqAnswers((prev) => ({ ...prev, [qid]: idx }));
              setSavedMcq((prev) => ({ ...prev, [qid]: true }));
              savedMcqState[qid] = true;
            } else if (questionType === "True or False") {
              tfState[qid] = String(answer);
              savedMcqState[qid] = true;
            }
          }
        } catch (err) {
          // handle error
        }
      }
      setUploadedStatus((prev) => ({ ...prev, ...statusObj }));
      setMcqAnswers((prev) => ({ ...prev, ...mcqState }));
      setTfAnswers((prev) => ({ ...prev, ...tfState }));
      setSavedMcq((prev) => ({ ...prev, ...savedMcqState }));
    };

    fetchUploadStatus();
    // eslint-disable-next-line
  }, [userAnswerIds]);

  if (!answers || !questionPaperData) {
    return (
      <div className="p-8 text-center text-red-600">No answers to review.</div>
    );
  }

  // Handle MCQ answer change
  const handleMcqChange = (qid, value) => {
    setMcqAnswers((prev) => ({ ...prev, [qid]: value }));
    setAttemptedTimestamps((prev) => ({
      ...prev,
      [uploadModal.qid]: getLocalDateTimeString(),
    }));
  };

  // Handle True/False answer change
  const handleTfChange = (qid, value) => {
    setTfAnswers((prev) => ({ ...prev, [qid]: value })); // value is "true" or "false"
    setAttemptedTimestamps((prev) => ({
      ...prev,
      [uploadModal.qid]: getLocalDateTimeString(),
    }));
  };

  // Handle Match answer change
  const handleMatchChange = (key, value) => {
    setMatchAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Update handleCapture to store File objects for upload


  const handleCapture = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && uploadModal.qid) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCropImageSrc(ev.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
      setUploadComplete(false);

      // Set the attempted timestamp for this theory question
      setAttemptedTimestamps((prev) => ({
        ...prev,
        [uploadModal.qid]: getLocalDateTimeString(),
      }));
    }
  };


  const removePendingImage = (qid, idx) => {
    setPendingUploads((prev) => {
      const updated = [...(prev[qid] || [])];
      updated.splice(idx, 1);
      return { ...prev, [qid]: updated };
    });
  };

  // Cancel device upload
  const handleCancelUpload = (qid) => {
    setPendingUploads((prev) => ({ ...prev, [qid]: [] }));
    setUploadComplete(false);
    closeUploadModal();
  };

  // Upload device images for a question
  const handleUploadImages = async (qid, idx) => {
    // console.log("Uploading images for question:", qid);
    setUploading(true);
    try {
      const token = Cookies.get("token") || localStorage.getItem("token");
      const files = pendingUploads[qid];
      const userAnswerId = userAnswerIds[qid];
      // console.log(
      //   "Uploading files for question:",
      //   qid,
      //   "User Answer ID:",
      //   userAnswerId,
      //   "token",
      //   token
      // );
      let newImageUrls = [];

      for (let file of files) {
        const formData = new FormData();
        formData.append("userAnswerId", userAnswerId);
        formData.append("userAnswerImages", file);
        formData.append("userAnswerText", null);
        formData.append("answerUploadType", "ANSWER_IMAGE");
        formData.append("status", "ACTIVE");
        formData.append("attemptStatus", "ANSWERED");
        // formData.append("book_mark_status", !!reviewStatus[qid]);
        // formData.append("answerSubmissionTime", attemptedTimestamps[qid] || null);
        formData.append("answerSubmissionTime", attemptedTimestamps[qid] || getLocalDateTimeString());

        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ':', pair[1]);
        // }
        // Replace with your actual API endpoint
        const res = await axios.post(`API_URL`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (res.status === 200) {
          // console.log("Upload successful :", res);
          setUploadedStatus((prev) => ({ ...prev, [qid]: "uploaded" }));
          setUploadModal({ open: false, qid: null, section: null, questionNumber: idx + 1 });
          setShowCamera(false);
          setShowQR(false);
          setCapturedImage(null);
          setUploadComplete(false);
          setQrData(null);
        }
        // If your API returns the uploaded image URL, use it. Otherwise, use local preview.
        if (res.data?.imageUrl) {
          newImageUrls.push(res.data.imageUrl);
        } else {
          newImageUrls.push(URL.createObjectURL(file));
        }
      }
      setUploadedImages((prev) => ({
        ...prev,
        [qid]: [...(prev[qid] || []), ...newImageUrls],
      }));
      setPendingUploads((prev) => ({ ...prev, [qid]: [] }));
      setUploadComplete(false);
      closeUploadModal();
    } catch (err) {
      alert("Upload failed. Please try again.");
      console.error("Upload error:", err);
    }
    setUploading(false);
  };
  // Generate QR data for a specific question
  const generateQRData = (question) => {
    // Create a URL that points to your camera instruction page
    // const cameraUrl = `${window.location.origin
    //   }/camera-instructions?questionId=${question.question_id}&assessmentId=${questionPaperData.assessment_id || "unknown"
    //   }&sectionId=${question.section?.assessment_section_id || "unknown"}`;
    const cameraUrl = `${window.location.origin}/camera-instructions?questionId=${question.question_id}&userAnswerId=${userAnswerIds[question.question_id]}`;

    return cameraUrl;
  };

  // Before generating QR, store info in localStorage
  // const handleQROption = (question, section, questionNumber) => {
  //   console.log("Stored cameraInfo in localStorage:", {
  //     sectionNumber: section.section_number,
  //     sectionHeading: section.section_heading,
  //     questionNumber: questionNumber,
  //   });
  //   localStorage.setItem("cameraInfo", JSON.stringify({
  //     sectionNumber: section.section_number,
  //     sectionHeading: section.section_heading,
  //     questionNumber: questionNumber,
  //   }));
  //   setQrData(`${window.location.origin}/camera-instructions`);
  //   console.log("QR Data URL:", qrData);
  //   setShowQR(true);
  // };

  const handleQROption = (qid, section, questionNumber) => {
    if (!section) {
      alert("Section information is missing!");
      return;
    }
    localStorage.setItem("cameraInfo", JSON.stringify({
      sectionNumber: section.section_number,
      sectionHeading: section.section_heading,
      questionNumber: questionNumber,
    }));
    // // setQrData(`${window.location.origin}/camera-instructions`);
    // setQrData(`${window.location.origin}/#/camera-instructions`);
    // setShowQR(true);
    setQrData(`${window.location.origin}/#/camera-instructions?questionId=${qid}&userAnswerId=${userAnswerIds[qid]}&token=${token}`);
    setShowQR(true);
  };

  const getAnswerDisplay = (q, idx) => {
    if (q.question_type_name === "Theory mcq 1 marks" || "Assertion&Reasoning") {
      const options = [
        q.option1_latex,
        q.option2_latex,
        q.option3_latex,
        q.option4_latex,
        q.option5_latex,
      ].filter((opt) => opt !== null && opt !== undefined);

      return (
        <div className="flex flex-col gap-2 mt-2">
          {options.map((opt, optIdx) => (
            <label key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`mcq-${q.question_id}`}
                value={optIdx}
                checked={mcqAnswers[q.question_id] === optIdx}
                onChange={() => handleMcqChange(q.question_id, optIdx)}
                className="h-4 w-4 text-blue-600"
                disabled={!!savedMcq[q.question_id]} // lock if submitted
              />
              <span>
                {String.fromCharCode(65 + optIdx)}) {opt}
              </span>
            </label>
          ))}
          {mcqAnswers[q.question_id] !== undefined && !savedMcq[q.question_id] && (
            <div className="flex gap-4 mt-2">
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded shadow"
                onClick={() => handleSaveMCQ(q.question_id)}
              >
                Save
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded shadow"
                onClick={() => handleClearMCQ(q.question_id)}
              >
                Clear Response
              </button>
            </div>
          )}
        </div>
      );
    }

    //True and False
    if (q.question_type_name === "True or False") {
      return (
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`tf-${q.question_id}`}
              value="TRUE"
              // checked={tfAnswers[q.question_id] === true}4
              checked={tfAnswers[q.question_id] === "TRUE"}
              onChange={() => handleTfChange(q.question_id, "TRUE")}
              className="h-4 w-4 text-blue-600"
              disabled={!!savedMcq[q.question_id]} // lock if submitted
            />
            True
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`tf-${q.question_id}`}
              value="FALSE"
              // checked={tfAnswers[q.question_id] === false}
              checked={tfAnswers[q.question_id] === "FALSE"}
              onChange={() => handleTfChange(q.question_id, "FALSE")}
              className="h-4 w-4 text-blue-600"
              disabled={!!savedMcq[q.question_id]} // lock if submitted
            />
            False
          </label>
          {tfAnswers[q.question_id] !== undefined && !savedMcq[q.question_id] && (
            <div className="flex gap-4 mt-2">
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded shadow"
                onClick={() => handleSaveMCQ(q.question_id)}
              >
                Save
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded shadow"
                onClick={() => handleClearMCQ(q.question_id)}
              >
                Clear Response
              </button>
            </div>

          )}
        </div>
      );
    }

    //Match the Following
    if (q.question_type_name === "Match the Following") {
      const getAlphabetPrefix = (idx) => String.fromCharCode(65 + idx);
      const rightItems = q.shuffle_options
        ? [...q.match_pairs]
          .sort(() => Math.random() - 0.5)
          .map((pair) => pair.right)
        : q.match_pairs.map((pair) => pair.right);

      return (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-center bg-gray-100 py-2">
                Column A
              </h4>
              <ul className="space-y-2">
                {q.match_pairs.map((pair, idx) => (
                  <li
                    key={`left-${idx}`}
                    className="p-2 border rounded flex items-center"
                  >
                    <span className="mr-2 font-medium">{idx + 1}.</span>
                    {pair.left}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-center bg-gray-100 py-2">
                Column B
              </h4>
              <ul className="space-y-2">
                {rightItems.map((item, idx) => (
                  <li
                    key={`right-${idx}`}
                    className="p-2 border rounded flex items-center"
                  >
                    <span className="mr-2 font-medium">
                      {getAlphabetPrefix(idx)}.
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Input boxes for matching at the bottom */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Your Answers:</h4>
            <div className="grid grid-cols-2 gap-2">
              {q.match_pairs.map((pair, idx) => (
                <div key={`input-${idx}`} className="flex items-center">
                  <span className="mr-2 font-semibold">{idx + 1} →</span>
                  <input
                    type="text"
                    placeholder="Enter letter"
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={matchAnswers[`${q.question_id}_${idx}`] || ""}
                    onChange={(e) =>
                      handleMatchChange(
                        `${q.question_id}_${idx}`,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // For theory or other types
    return (
      <div className="mt-2">
        {uploadedStatus[q.question_id] === "uploaded" ? (
          <button
            className="px-4 py-1 bg-gray-400 text-white rounded shadow cursor-not-allowed"
            disabled
          >
            Uploaded
          </button>
        ) : (
          <button
            className="px-4 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded shadow hover:scale-105 transition"
            onClick={() =>
              setUploadModal({
                open: true,
                qid: q.question_id,
                section: q.section,
              })
            }
          >
            Upload Answer
          </button>
        )}

        {/* Show uploaded images preview */}
        {/* {uploadedImages[q.question_id] &&
          uploadedImages[q.question_id].length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedImages[q.question_id].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Uploaded ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
            </div>
          )} */}
      </div>
    );
  };

  // const refreshSingleMCQAnswer = async (qid, user_answer_id) => {
  //   try {
  //     const res = await axios.get(
  //       `API_URL`
  //     );
  //     if (res.data && res.data.user_answer) {
  //       // Convert alphabet back to index for checked state
  //       const answerAlphabet = res.data.user_answer;
  //       const idx = answerAlphabet
  //         ? answerAlphabet.charCodeAt(0) - 65
  //         : undefined;
  //       setMcqAnswers((prev) => ({ ...prev, [qid]: idx }));
  //     }
  //   } catch (err) {
  //     // Optionally handle error
  //   }
  // };

  //New Method
  const refreshSingleMCQAnswer = async (qid, user_answer_id, questionType) => {
    try {
      const res = await axios.get(
        `API_URL`
      );
      if (res.data && res.data.user_answer) {
        if (questionType === "MCQ(Theory)") {
          // Convert alphabet back to index for checked state
          const answerAlphabet = res.data.user_answer;
          const idx = answerAlphabet
            ? answerAlphabet.charCodeAt(0) - 65
            : undefined;
          setMcqAnswers((prev) => ({ ...prev, [qid]: idx }));
          setSavedMcq((prev) => ({ ...prev, [qid]: true }));
        } else if (questionType === "True or False") {
          // Set the string value and lock
          setTfAnswers((prev) => ({ ...prev, [qid]: String(res.data.user_answer) }));
          setSavedMcq((prev) => ({ ...prev, [qid]: true }));
        }
      }
    } catch (err) {
      // Optionally handle error
      console.error("Error refreshing answer:", err);
    }
  };

  const handleSaveMCQ = async (qid, questionType) => {
    const user_answer_id = userAnswerIds[qid];
    let userAnswerText = null;
    let attemptStatus = "UN_ANSWERED";

    // Convert index to alphabet (A, B, C, ...)
    // const selectedIdx = mcqAnswers[qid];
    // const selectedAlphabet = String.fromCharCode(65 + Number(selectedIdx));

    if (mcqAnswers[qid] !== undefined) {
      // MCQ
      const selectedIdx = mcqAnswers[qid];
      userAnswerText = String.fromCharCode(65 + Number(selectedIdx));
      attemptStatus = userAnswerText ? "ANSWERED" : "UN_ANSWERED";
    } else if (tfAnswers[qid] !== undefined) {
      // True/False
      userAnswerText = tfAnswers[qid]; // "true" or "false"
      attemptStatus = userAnswerText ? "ANSWERED" : "UN_ANSWERED";
    }
    const MCQpayload = {
      userAnswerId: user_answer_id,
      userAnswerImages: null,
      userAnswerText,
      answerUploadType: "ANSWER_TEXT",
      status: "ACTIVE",
      attemptStatus,
      // book_mark_status: !!reviewStatus[qid],
      answerSubmissionTime: attemptedTimestamps[qid] || getLocalDateTimeString(),
    }
    try {
      await axios.post(
        `API_URL`,
        MCQpayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("MCQ Payload", MCQpayload);
      console.log("MCQ uploaded")
      await refreshSingleMCQAnswer(qid, user_answer_id);
      setSavedMcq((prev) => ({ ...prev, [qid]: true })); // Mark as saved
      // alert("Answer saved!");
      toast.success("Answer Saved!", {
                  position: 'top-center',
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: false,
                  theme: 'colored',
                });
    } catch (err) {
      // alert("Failed to save answer.");
      toast.error("Failed to save answer!Please try again.", {
                  position: 'top-center',
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: false,
                  theme: 'colored',
                });
      console.error("MCQ save error:", err.message);
    }
  };

  const handleClearMCQ = (qid) => {
    setSavedMcq((prev) => ({ ...prev, [qid]: true })); // Mark as saved
    setMcqAnswers((prev) => ({ ...prev, [qid]: undefined }));
  };

  

  const finalSubmit = async () => {
    setUploading(true);
    const payload = {
      // user_ass_id: questionPaperData.user_assessment_id,
      assessment_status: "SUBMITTED",
      // time_taken: time_taken,
      // ass_end_time: ass_end_time,
      //...other parameters as needed
    };
    // console.log("Final Submit Payload", payload);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/v1/cil/assessment/submit/theory?user_ass_id=${user_ass_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // alert("All answers submitted!");
        toast.success("All answers submitted!", {
                  position: 'top-right',
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: false,
                  theme: 'colored',
                });
        console.log("All requests completed successfully");
        console.log("Navigating to solution page");
        navigate("/thank-you", {
          replace: true,
          state: {
            from: "/review-answer",
            user_ass_id,
          },
        });
      }
    } catch (err) {
      alert("Submission failed. Please try again.");
      console.error("Submission error", err.message);
    }
    setUploading(false);
  };

  const confirmFinalSubmit = () => {
    Swal.fire({
      title: "Submit Exam?",
      text: "Are you sure you want to submit all answers?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        finalSubmit();
      } else {
        Swal.fire("Cancelled", "You can continue your exam.", "info");
      }
    });
  };

  const closeUploadModal = () => {
    setUploadModal({ open: false, qid: null, section: null });
    setShowCamera(false);
    setShowQR(false);
    setCapturedImage(null);
    setUploadComplete(false);
    setQrData(null);
  };

  const handleAddMore = () => {
    // Camera stays open, just allow another capture
  };

  // Handle option selection in the upload modal
  // const handleUploadOption = (option, question) => {
  //   if (option.value === "device") {
  //     fileInputRef.current.click();
  //   } else if (option.value === "camera") {
  //     setShowCamera(true);
  //   } else if (option.value === "qr") {
  //     handleQROption(question);
  //   }
  // };

  const handleUploadOption = (option, qid, section, questionNumber) => {
    // console.log("Selected option:", option, "for question:", qid, section, questionNumber);
    if (option.value === "device") {
      fileInputRef.current.click();
    } else if (option.value === "camera") {
      setShowCamera(true);
    } else if (option.value === "qr") {
      handleQROption(qid, section, questionNumber);
      // console.log("QR Data URL:", "qid",qid,"section",section,"questionNumber", questionNumber);
    }
  };

  return (
    <MathJaxContext
      config={{
        loader: { load: ["input/tex", "output/chtml"] }, // Use HTML instead of SVG
        tex: {
          inlineMath: [["\\(", "\\)"]],
          displayMath: [["\\[", "\\]"]],
          processEscapes: true,
        },
        chtml: {
          scale: 1, // Keep math text size normal
          minScale: 0.5, // Minimum scaling
          matchFontHeight: true, // Ensures math font matches surrounding text
        },
        options: {
          enableMenu: true, // Enable right-click menu
        },
      }}
    >

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8 flex flex-col items-center font-inter text-gray-800"
      >
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 sm:p-10 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-200 mb-4 hover:shadow-blue-100 transition-all duration-300"
        >
          {/* Header section with enhanced styling */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8 pb-4 border-b border-gray-200"
          >
            <p className="font-bold text-lg sm:text-xl md:text-2xl mb-1 text-gray-900 hover:text-blue-700 transition-colors">
              {/* {questionPaperData.exam_details.board.replace(/\\/g, '')} */}
            </p>
            <p className="font-bold text-base sm:text-lg md:text-xl mb-1 text-gray-800">
              {/* {questionPaperData.exam_details.examination} */}
              {questionPaperData.assessment_name || "Examination Name"}
            </p>
            <p className="font-bold text-sm sm:text-base md:text-lg mb-4 text-gray-700">
              {/* {questionPaperData.exam_details.class} */}
            </p>
            <div className="flex justify-between items-center text-sm sm:text-base mb-8 px-4">
              {/* <p className="text-gray-600">Time: {questionPaperData.exam_details.time_allowed || "30"}</p> */}
              <p className="text-gray-600">
                Time: {questionPaperData.total_tim || "30"}
              </p>
              {/* <p className="text-gray-600">Max. Marks: {questionPaperData.exam_details.max_marks || "80"}</p> */}
              <p className="text-gray-600">
                Max. Marks: {questionPaperData.total_marks || "80"}
              </p>
            </div>
            <h1 className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-wide text-blue-700 uppercase">
              Review Your Answers
            </h1>
          </motion.div>

          <div className="space-y-10">
            {/* {questionPaperData.section_data?.map((section, sIdx) => ( */}
            {questionPaperData.section_data
              ?.slice() // create a copy to avoid mutating original
              .sort((a, b) => (a.section_number ?? 0) - (b.section_number ?? 0))
              .map((section, sIdx) => (
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: sIdx * 0.1 }}
                  key={section.assessment_section_id}
                  className="hover:shadow-lg transition-shadow duration-300 rounded-xl p-4"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-indigo-700">
                      Section {section.section_number}: {section.section_heading}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {/* {section.question_data.map((q, idx) => (
                    <div
                    key={q.question_id}
                      className="p-4 rounded-lg border shadow-sm bg-gradient-to-r from-white to-blue-50"
                    >
                      <div className="font-semibold text-black text-left">
                         <p className="font-medium flex items-start">
                          <span>{idx + 1}.</span>&nbsp;
                          <span className="inline-block">
                            <QuestionMathJax content={q.question_latex} />
                          </span>
                          {q.question_diagrams_url && q.question_diagrams_url.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                            {q.question_diagrams_url.map((url, idx) => (
                              <img
                              key={idx}
                               src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
                               alt={`Diagram ${idx + 1}`}
                                className="max-w-full h-auto border rounded-lg"
                                style={{ maxHeight: "300px" }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
                                }}
                              />
                            ))}
                          </div>
                        )}
                        </p>
                      </div>
                      {getAnswerDisplay({ ...q, section }, idx)}
                    </div>
                  ))} */}
                    {section.question_data.map((q, idx) => (
                      <div
                        key={q.question_id}
                        className="p-4 rounded-lg border shadow-sm bg-gradient-to-r from-white to-blue-50"
                      >
                        <div className="font-semibold text-black text-left">
                          {/* Question text */}
                          <p className="font-medium flex items-start">
                            <span>{idx + 1}.</span>&nbsp;
                            <span className="inline-block">
                              <QuestionMathJax content={q.question_latex} />
                            </span>
                          </p>

                          {/* Images always below */}
                          {q.question_diagrams_url && q.question_diagrams_url.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                              {q.question_diagrams_url.map((url, imgIdx) => (
                                <img
                                  key={`${q.question_id}-${url}-${imgIdx}`}
                                  src={`${import.meta.env.VITE_API_URL}/v1/cil/images/${url}`}
                                  alt={`Diagram ${imgIdx + 1}`}
                                  className="max-w-full h-auto border rounded-lg"
                                  style={{ maxHeight: "300px" }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/400x300?text=Diagram+Not+Available";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Answer Display */}
                        {getAnswerDisplay({ ...q, section }, idx)}
                      </div>
                    ))}

                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="w-full py-4 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={confirmFinalSubmit}
            disabled={uploading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg font-bold text-lg transition-all duration-300"
          >
            {uploading ? "Submitting..." : "Submit All Answers"}
          </motion.button>
        </motion.div>

        {/* Upload Modal */}
        {uploadModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-red-600"
                onClick={closeUploadModal}
              >
                &times;
              </button>
              <h3 className="text-lg font-bold mb-4 text-blue-700">
                Upload Answer for Section {uploadModal.section?.section_number}:{" "}
                {uploadModal.section?.section_heading}
              </h3>

              {/* Show already uploaded images */}
              {uploadedImages[uploadModal.qid] &&
                uploadedImages[uploadModal.qid].length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Uploaded Images:</h4>
                    <div className="flex flex-wrap gap-2">
                      {uploadedImages[uploadModal.qid].map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            // onClick={() => removeImage(uploadModal.qid, idx)}
                            onClick={() => removePendingImage(uploadModal.qid, idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-4">
                {/* QR Code Display */}
                {showQR && qrData && (
                  <div className="flex flex-col items-center space-y-4">
                    <h4 className="font-medium text-center">
                      Scan this QR code with your phone
                    </h4>
                    <QRCodeSVG
                      value={qrData}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="border border-gray-200 p-2 rounded"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      <p>1. Open your phone's camera app</p>
                      <p>2. Point it at this QR code</p>
                      <p>3. Tap the link that appears</p>
                      <p>4. Follow the instructions to capture your answer</p>
                    </div>
                    <button
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:scale-105 transition"
                      onClick={closeUploadModal}
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* Camera View */}
                {showCamera && !uploadComplete && (
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={handleCapture}
                      multiple
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Click the button below to open your device's camera
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {pendingUploads[uploadModal.qid]?.length > 0 ? "Add Image" : "Open Camera"}
                    </button>
                    {/* Preview all captured images */}
                    {pendingUploads[uploadModal.qid] && pendingUploads[uploadModal.qid].length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pendingUploads[uploadModal.qid].map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              // key={idx}
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              onClick={() => removePendingImage(uploadModal.qid, idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show Upload and Cancel only if at least one image is captured */}
                    {pendingUploads[uploadModal.qid] && pendingUploads[uploadModal.qid].length > 0 && (
                      <div className="flex gap-4 mt-2">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                          onClick={() => handleUploadImages(uploadModal.qid)}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-400 text-white rounded shadow"
                          onClick={() => handleCancelUpload(uploadModal.qid)}
                          disabled={uploading}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Options (only show if not in QR or Camera mode) */}
                {!showQR && !showCamera && !uploadComplete && (
                  <>
                    {uploadOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-lg shadow hover:scale-105 transition"
                        onClick={() =>
                          handleUploadOption(opt, uploadModal.qid, uploadModal.section, uploadModal.questionNumber)
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={handleCapture}
                      multiple
                    />
                    {/* Preview all captured images */}
                    {pendingUploads[uploadModal.qid] && pendingUploads[uploadModal.qid].length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pendingUploads[uploadModal.qid].map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              // key={idx}
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              onClick={() => removePendingImage(uploadModal.qid, idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show Upload and Cancel only if at least one image is captured */}
                    {pendingUploads[uploadModal.qid] && pendingUploads[uploadModal.qid].length > 0 && (
                      <div className="flex gap-4 mt-2">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                          onClick={() => handleUploadImages(uploadModal.qid)}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-400 text-white rounded shadow"
                          onClick={() => handleCancelUpload(uploadModal.qid)}
                          disabled={uploading}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                  </>
                )}

                {/* Done button after upload (only for device uploads) */}
                {uploadComplete && pendingUploads[uploadModal.qid] && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {pendingUploads[uploadModal.qid].map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              // onClick={() => removeImage(uploadModal.qid, idx)}
                              onClick={() => removePendingImage(uploadModal.qid, idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>
                    <div className="flex gap-4">
                      {uploadedImages[uploadModal.qid] &&
                        uploadedImages[uploadModal.qid].length > 0 ? (
                        <span className="px-4 py-2 bg-green-500 text-white rounded shadow flex items-center">
                          Uploaded
                        </span>
                      ) : (
                        <>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                            onClick={() => handleUploadImages(uploadModal.qid)}
                            disabled={uploading}
                          >
                            {uploading ? "Uploading..." : "Upload"}
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-400 text-white rounded shadow"
                            onClick={() => handleCancelUpload(uploadModal.qid)}
                            disabled={uploading}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cropper Modal */}

        {showCrop && cropImageSrc && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg relative w-full max-w-[95vw]">
              <button
                className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-red-600"
                onClick={() => {
                  setShowCrop(false);
                  setCropImageSrc(null);
                }}
              >
                &times;
              </button>
              <h3 className="text-lg font-bold mb-4 text-blue-700">
                Crop Your Image
              </h3>
              <div className="relative w-full h-[60vw] max-h-[70vh] min-h-[300px]">
                <Cropper
                  src={cropImageSrc}
                  style={{ height: "100%", width: "100%" }}
                  initialAspectRatio={NaN}
                  guides={true}
                  viewMode={1}
                  dragMode="crop"
                  cropBoxResizable={true}
                  cropBoxMovable={true}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  onInitialized={instance => setCropperInstance(instance)}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto"
                  onClick={async () => {
                    if (cropperInstance) {
                      const croppedImg = cropperInstance.getCroppedCanvas().toDataURL("image/jpeg");
                      // Convert base64 to File
                      const blob = await (await fetch(croppedImg)).blob();
                      const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });
                      setPendingUploads(prev => ({
                        ...prev,
                        [uploadModal.qid]: [...(prev[uploadModal.qid] || []), croppedFile],
                      }));
                      setShowCrop(false);
                      setCropImageSrc(null);
                    }
                  }}
                >
                  Save Crop
                </button>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto"
                  onClick={() => {
                    setShowCrop(false);
                    setCropImageSrc(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )} 
      </motion.div>
    </MathJaxContext>
  );
};

export default ReviewAnswers;
