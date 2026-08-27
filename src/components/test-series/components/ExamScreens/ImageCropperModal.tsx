import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  RotateCw, 
  RotateCcw, 
  Check, 
  Crop, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw 
} from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface ImageCropperModalProps {
  imageFile: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageFile,
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Crop rectangle state in normalized percentages [0-100]
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging state
  const isDragging = useRef<boolean>(false);
  const activeHandle = useRef<string | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startCrop = useRef<{ x: number; y: number; width: number; height: number }>({ x: 5, y: 5, width: 90, height: 90 });

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setRotation(0);
        setScale(1);
        setCrop({ x: 5, y: 5, width: 90, height: 90 });
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
  }, [imageFile]);

  if (!isOpen || !imageSrc) return null;

  const handlePointerDown = (e: React.PointerEvent, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    activeHandle.current = handle;
    startPos.current = { x: e.clientX, y: e.clientY };
    startCrop.current = { ...crop };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - startPos.current.y) / rect.height) * 100;

    setCrop(() => {
      let { x, y, width, height } = startCrop.current;

      if (!activeHandle.current) {
        // Move whole crop box
        x = Math.max(0, Math.min(100 - width, x + deltaX));
        y = Math.max(0, Math.min(100 - height, y + deltaY));
      } else {
        // Handle resizing
        if (activeHandle.current.includes("w")) {
          const newX = Math.max(0, Math.min(x + width - 10, x + deltaX));
          width = width + (x - newX);
          x = newX;
        }
        if (activeHandle.current.includes("e")) {
          width = Math.max(10, Math.min(100 - x, width + deltaX));
        }
        if (activeHandle.current.includes("n")) {
          const newY = Math.max(0, Math.min(y + height - 10, y + deltaY));
          height = height + (y - newY);
          y = newY;
        }
        if (activeHandle.current.includes("s")) {
          height = Math.max(10, Math.min(100 - y, height + deltaY));
        }
      }

      return { x, y, width, height };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      activeHandle.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore
      }
    }
  };

  const processCrop = () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Original image dimensions
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;

      // Handle rotation
      const rad = (rotation * Math.PI) / 180;
      const rotW = Math.abs(origW * Math.cos(rad)) + Math.abs(origH * Math.sin(rad));
      const rotH = Math.abs(origW * Math.sin(rad)) + Math.abs(origH * Math.cos(rad));

      // Rotated Canvas
      const rotCanvas = document.createElement("canvas");
      rotCanvas.width = rotW;
      rotCanvas.height = rotH;
      const rotCtx = rotCanvas.getContext("2d");

      if (rotCtx) {
        rotCtx.translate(rotW / 2, rotH / 2);
        rotCtx.rotate(rad);
        rotCtx.drawImage(img, -origW / 2, -origH / 2);
      }

      // Compute pixel crop coordinates on rotated image
      const cropPxX = (crop.x / 100) * rotW;
      const cropPxY = (crop.y / 100) * rotH;
      const cropPxW = (crop.width / 100) * rotW;
      const cropPxH = (crop.height / 100) * rotH;

      canvas.width = Math.max(1, cropPxW);
      canvas.height = Math.max(1, cropPxH);

      ctx.drawImage(
        rotCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        cropPxW,
        cropPxH
      );

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            const fileName = imageFile ? `cropped_${imageFile.name}` : `cropped_${Date.now()}.jpg`;
            const croppedFile = new File([blob], fileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile);
            onClose();
          }
        },
        "image/jpeg",
        0.85
      );
    };
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-lg">Crop & Adjust Answer Sheet</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Cropping Work Area */}
      <div className="flex-1 flex items-center justify-center relative my-4 overflow-hidden select-none">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[65vh] overflow-hidden border-2 border-dashed border-slate-600/50 rounded-xl bg-slate-950 flex items-center justify-center"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Base Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop target"
            style={{
              transform: `rotate(${rotation}deg) scale(${scale})`,
              transition: isDragging.current ? "none" : "transform 0.2s ease-out",
            }}
            className="max-w-full max-h-[65vh] object-contain pointer-events-none"
          />

          {/* Dark Overlay around Crop Box */}
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />

          {/* Active Crop Rectangle */}
          <div
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
            }}
            onPointerDown={(e) => handlePointerDown(e, null)}
            className="absolute border-2 border-blue-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move touch-none"
          >
            {/* Grid Lines */}
            <div className="w-full h-full border-t border-b border-dashed border-white/30 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-dashed border-white/30" />
              <div className="border-r border-dashed border-white/30" />
            </div>

            {/* Corner Handles */}
            <div
              onPointerDown={(e) => handlePointerDown(e, "nw")}
              className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize touch-none"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, "ne")}
              className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize touch-none"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, "sw")}
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize touch-none"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, "se")}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize touch-none"
            />
          </div>
        </div>
      </div>

      {/* Control Bar & Actions */}
      <div className="bg-slate-800/90 backdrop-blur border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Rotation & Zoom Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation((r) => r - 90)}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
            title="Rotate Left"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Rotate -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation((r) => r + 90)}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Rotate +90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRotation(0);
              setScale(1);
              setCrop({ x: 5, y: 5, width: 90, height: 90 });
            }}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 md:flex-none border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={processCrop}
            disabled={isProcessing}
            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 hover:from-blue-500 hover:to-indigo-500"
          >
            {isProcessing ? (
              <span>Cropping...</span>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Done & Use Crop
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
