import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import { 
  Camera, 
  Upload, 
  Crop, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Loader2, 
  FileText, 
  Smartphone 
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { TestService } from "../../../../services/TestServices";
import { ImageCropperModal } from "./ImageCropperModal";

const getLocalDateTimeString = (date = new Date()) => {
  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    "." +
    pad(date.getMilliseconds(), 3)
  );
};

export const TheoryMobileUploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const userAssId = searchParams.get("user_ass_id");
  const userAnswerId = searchParams.get("user_answer_id");
  const questionId = searchParams.get("question_id");
  const sectionNumber = searchParams.get("section_number") || "1";
  const sectionName = searchParams.get("section_name") || "Theory Section";
  const questionNumber = searchParams.get("question_number") || "1";
  const token = searchParams.get("token");

  const [images, setImages] = useState<File[]>([]);
  const [croppingImage, setCroppingImage] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set Auth Token from query param so axiosClient uses it
  useEffect(() => {
    if (token) {
      Cookies.set("token", token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
      try {
        localStorage.setItem("user", JSON.stringify({ token }));
      } catch (e) {
        // Ignore
      }
    }
  }, [token]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Immediately open cropper for the first selected file
    setCroppingImage(files[0]);
    setCropIndex(null); // null means adding a new file

    // If multiple selected, store remaining for sequential cropping
    if (files.length > 1) {
      setImages((prev) => [...prev, ...files.slice(1)]);
    }

    // Reset input value
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropIndex !== null) {
      // Replacing existing image at index
      setImages((prev) => {
        const next = [...prev];
        next[cropIndex] = croppedFile;
        return next;
      });
    } else {
      // Adding new cropped image
      setImages((prev) => [...prev, croppedFile]);
    }
    setCroppingImage(null);
    setCropIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userAnswerId) {
      setErrorMessage("Missing Answer tracking ID. Please re-scan QR Code.");
      return;
    }
    if (images.length === 0) {
      setErrorMessage("Please capture or upload at least one image.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const payload = {
        userAnswerId: userAnswerId,
        userAnswerImages: images,
        userAnswerText: null,
        answerUploadType: "ANSWER_IMAGE",
        status: "ACTIVE",
        attemptStatus: "ANSWERED",
        answerSubmissionTime: getLocalDateTimeString(),
      };

      const response = await TestService.submitUserAnswer(payload);
      if (response) {
        setSubmittedSuccess(true);
      }
    } catch (err: any) {
      console.error("Mobile upload error:", err);
      setErrorMessage(err.message || "Failed to upload answer. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-outfit p-4 flex flex-col justify-between max-w-lg mx-auto">
      {/* Header Info */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Smartphone className="w-32 h-32 text-blue-400" />
        </div>

        <div className="relative z-10">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            Mobile Answer Sheet Upload
          </Badge>

          <h2 className="text-2xl font-black text-white mb-2">Question #{questionNumber}</h2>

          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-700/50 space-y-1 text-xs">
            <p className="text-slate-400 font-semibold uppercase tracking-wider">
              Section {sectionNumber}: <span className="text-slate-200">{sectionName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {submittedSuccess ? (
        <div className="flex-1 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center my-auto shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">Upload Successful!</h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Your answer sheet for Question #{questionNumber} has been uploaded. Your desktop screen will update automatically.
          </p>
          <Button
            onClick={() => {
              setSubmittedSuccess(false);
              setImages([]);
            }}
            variant="outline"
            className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 rounded-2xl px-8"
          >
            Upload Additional Page
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Hidden Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="h-28 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Camera className="w-8 h-8" />
              <span className="font-bold text-xs">Take Photo (Camera)</span>
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-28 border-2 border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-8 h-8 text-blue-400" />
              <span className="font-bold text-xs">Choose from Gallery</span>
            </Button>
          </div>

          {/* Selected / Cropped Images Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Answer Sheet Pages ({images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden aspect-[3/4] shadow-md"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Page Label */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Page {idx + 1}
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-100 flex items-center justify-center gap-2 p-2 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setCroppingImage(file);
                          setCropIndex(idx);
                        }}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-500"
                        title="Crop Image"
                      >
                        <Crop className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleRemoveImage(idx)}
                        className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-500"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Submit Button */}
      {!submittedSuccess && (
        <div className="pt-6 border-t border-slate-800 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isUploading || images.length === 0}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-40"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading Answer Sheet...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Submit Answer Sheet ({images.length} Page{images.length !== 1 ? "s" : ""})</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={!!croppingImage}
        imageFile={croppingImage}
        onClose={() => {
          setCroppingImage(null);
          setCropIndex(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
