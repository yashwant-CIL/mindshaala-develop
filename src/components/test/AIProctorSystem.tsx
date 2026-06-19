import { useState, useEffect } from 'react';
import {
  Camera, Eye, AlertCircle, CheckCircle, Shield,
  Wifi, WifiOff, Focus, Volume2, VolumeX, Monitor
} from 'lucide-react';

interface AIProctorSystemProps {
  onViolation?: (type: string) => void;
}

export function AIProctorSystem({ onViolation }: AIProctorSystemProps) {
  const [cameraActive, setCameraActive] = useState(true);
  const [focusLevel, setFocusLevel] = useState(100);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const [faceDetected, setFaceDetected] = useState(true);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [audioDetected, setAudioDetected] = useState(false);

  // Simulate proctoring events
  useEffect(() => {
    const interval = setInterval(() => {
      // Random focus changes
      setFocusLevel(Math.max(60, Math.random() * 100));
      
      // Random face detection
      setFaceDetected(Math.random() > 0.1);
      setMultipleFaces(Math.random() > 0.95);
      setAudioDetected(Math.random() > 0.9);
    }, 3000);

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        if (onViolation) onViolation('tab-switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onViolation]);

  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">AI Proctor</h3>
            <p className="text-xs text-white/80">Real-time monitoring</p>
          </div>
        </div>
      </div>

      {/* Camera Feed Placeholder */}
      <div className="relative bg-gray-900 aspect-video">
        {cameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Camera className="w-16 h-16 text-white" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Camera Disabled</p>
            </div>
          </div>
        )}
        
        {/* Status Indicators */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
            faceDetected ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            <Eye className="w-3 h-3" />
            {faceDetected ? 'Face OK' : 'No Face'}
          </div>
          {multipleFaces && (
            <div className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Multiple
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className="p-4 space-y-3">
        {/* Focus Level */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 font-bold">Focus Level</span>
            <span className={`font-bold ${
              focusLevel > 80 ? 'text-green-600' :
              focusLevel > 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {Math.round(focusLevel)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                focusLevel > 80 ? 'bg-green-500' :
                focusLevel > 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${focusLevel}%` }}
            />
          </div>
        </div>

        {/* Violations */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
            <div className="text-red-600 font-bold text-lg">{tabSwitches}</div>
            <div className="text-red-600">Tab Switch</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
            <div className="text-yellow-600 font-bold text-lg">{suspiciousActivity}</div>
            <div className="text-yellow-600">Suspicious</div>
          </div>
          <div className={`border rounded-lg p-2 text-center ${
            audioDetected ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className={`font-bold text-lg ${
              audioDetected ? 'text-orange-600' : 'text-green-600'
            }`}>
              {audioDetected ? <Volume2 className="w-4 h-4 mx-auto" /> : <VolumeX className="w-4 h-4 mx-auto" />}
            </div>
            <div className={audioDetected ? 'text-orange-600' : 'text-green-600'}>
              {audioDetected ? 'Audio' : 'Quiet'}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {!faceDetected && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-red-800">Face Not Detected</div>
              <div className="text-xs text-red-600">Please ensure your face is visible</div>
            </div>
          </div>
        )}

        {multipleFaces && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-yellow-800">Multiple Faces Detected</div>
              <div className="text-xs text-yellow-600">Only one person should be visible</div>
            </div>
          </div>
        )}

        {tabSwitches > 3 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-orange-800">Warning</div>
              <div className="text-xs text-orange-600">Excessive tab switching detected</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold">Proctoring Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Wifi className="w-4 h-4" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
