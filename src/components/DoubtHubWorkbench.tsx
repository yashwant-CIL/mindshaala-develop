import { useState, useRef } from 'react';
import { ArrowLeft, Send, Mic, Video, Play, Pause, X, Eye, CheckCircle, Clock, MessageSquare, User, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import mindshaalLogo from 'figma:asset/mindshaalaNew-logoCrop.png';

interface Doubt {
  id: string;
  studentName: string;
  studentClass: string;
  subject: string;
  topic: string;
  question: string;
  timestamp: string;
  status: 'pending' | 'answered';
  priority: 'high' | 'medium' | 'low';
}

interface Reply {
  type: 'text' | 'voice' | 'video';
  content: string;
  audioBlob?: Blob;
  videoBlob?: Blob;
  timestamp: string;
}

interface DoubtHubWorkbenchProps {
  onBack?: () => void;
}

export function DoubtHubWorkbench({ onBack }: DoubtHubWorkbenchProps) {
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [replyType, setReplyType] = useState<'text' | 'voice' | 'video'>('text');
  const [textReply, setTextReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string>('');
  const [videoURL, setVideoURL] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Mock data - In production, this would come from your backend
  const [doubts, setDoubts] = useState<Doubt[]>([
    {
      id: '1',
      studentName: 'Priya Sharma',
      studentClass: 'ICSE Class 10',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      question: 'I am having difficulty understanding how to find the roots of a quadratic equation using the discriminant method. Can you explain when the discriminant is positive, negative, or zero and what that means for the roots?',
      timestamp: '2 hours ago',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      studentName: 'Arjun Patel',
      studentClass: 'ICSE Class 10',
      subject: 'Physics',
      topic: 'Ohm\'s Law',
      question: 'In the circuit diagram given in Exercise 5.3, how do we calculate the total resistance when resistors are connected in both series and parallel? I am confused about the order of calculation.',
      timestamp: '5 hours ago',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '3',
      studentName: 'Ananya Desai',
      studentClass: 'ICSE Class 9',
      subject: 'Chemistry',
      topic: 'Atomic Structure',
      question: 'What is the difference between valency and oxidation state? The textbook uses both terms and I am not sure when to use which one.',
      timestamp: '1 day ago',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '4',
      studentName: 'Rohan Kumar',
      studentClass: 'ICSE Class 10',
      subject: 'English',
      topic: 'The Merchant of Venice',
      question: 'Can you help me understand the theme of mercy vs justice in Act 4? How does Portia\'s speech about mercy relate to Shylock\'s demand for justice?',
      timestamp: '1 day ago',
      status: 'answered',
      priority: 'low'
    }
  ]);

  const pendingDoubts = doubts.filter(d => d.status === 'pending');
  const answeredDoubts = doubts.filter(d => d.status === 'answered');

  const startRecording = async (type: 'voice' | 'video') => {
    try {
      setPermissionError(''); // Clear previous errors
      const constraints = type === 'voice' 
        ? { audio: true }
        : { audio: true, video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: type === 'voice' ? 'audio/webm' : 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        
        if (type === 'voice') {
          setAudioURL(url);
        } else {
          setVideoURL(url);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      
      let errorMessage = 'Unable to access microphone/camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow access to ' + (type === 'voice' ? 'microphone' : 'microphone and camera') + ' in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No ' + (type === 'voice' ? 'microphone' : 'camera') + ' device found.';
      } else {
        errorMessage += 'An error occurred: ' + error.message;
      }
      
      setPermissionError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendReply = () => {
    if (!selectedDoubt) return;

    let hasContent = false;
    if (replyType === 'text' && textReply.trim()) hasContent = true;
    if (replyType === 'voice' && audioURL) hasContent = true;
    if (replyType === 'video' && videoURL) hasContent = true;

    if (!hasContent) {
      alert('Please provide a reply before sending.');
      return;
    }

    // Update doubt status
    setDoubts(prev => prev.map(d => 
      d.id === selectedDoubt.id ? { ...d, status: 'answered' as const } : d
    ));

    // In production, send the reply to backend here
    alert('Reply sent successfully to ' + selectedDoubt.studentName);

    // Reset
    setTextReply('');
    setAudioURL('');
    setVideoURL('');
    setSelectedDoubt(null);
  };

  if (selectedDoubt) {
    return (
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          {/* <img src={mindshaalLogo} alt="MindShaala" className="h-8" /> */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Doubt Hub Workbench</h1>
            <p className="text-sm text-gray-600">Resolve Student Queries</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDoubt(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className=" mx-auto p-6 space-y-6">
          {/* Student Question */}
          <Card className="p-6 bg-white">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {selectedDoubt.studentName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{selectedDoubt.studentName}</h3>
                  <Badge variant="outline" className="text-xs">{selectedDoubt.studentClass}</Badge>
                  <Badge 
                    className={
                      selectedDoubt.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedDoubt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }
                  >
                    {selectedDoubt.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {selectedDoubt.subject}
                  </span>
                  <span>•</span>
                  <span>{selectedDoubt.topic}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedDoubt.timestamp}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Student's Question:</p>
              <p className="text-gray-800 leading-relaxed">{selectedDoubt.question}</p>
            </div>
          </Card>

          {/* Reply Section */}
          <Card className="p-6 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4">Your Reply</h3>

            {/* Reply Type Selection */}
            <div className="flex gap-3 mb-6">
              <Button
                variant={replyType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setReplyType('text');
                  setAudioURL('');
                  setVideoURL('');
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Text Reply
              </Button>
              <Button
                variant={replyType === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setReplyType('voice');
                  setTextReply('');
                  setVideoURL('');
                }}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Reply
              </Button>
              <Button
                variant={replyType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setReplyType('video');
                  setTextReply('');
                  setAudioURL('');
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Video Reply
              </Button>
            </div>

            {/* Text Reply */}
            {replyType === 'text' && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your detailed reply here..."
                  value={textReply}
                  onChange={(e) => setTextReply(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            )}

            {/* Voice Reply */}
            {replyType === 'voice' && (
              <div className="space-y-4">
                {permissionError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 mb-1">Permission Error</p>
                      <p className="text-sm text-red-700">{permissionError}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setPermissionError('')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 border-2 border-dashed border-purple-300">
                  <div className="text-center">
                    {!isRecording && !audioURL && (
                      <>
                        <Mic className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                        <p className="text-gray-700 mb-4">Record your voice explanation</p>
                        <Button onClick={() => startRecording('voice')}>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      </>
                    )}

                    {isRecording && (
                      <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                          <Mic className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-gray-900 mb-4">
                          {formatTime(recordingTime)}
                        </p>
                        <Button variant="destructive" onClick={stopRecording}>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      </>
                    )}

                    {audioURL && !isRecording && (
                      <>
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className="text-gray-700 mb-4">Recording Complete!</p>
                        <audio src={audioURL} controls className="w-full mb-4" />
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => setAudioURL('')}>
                            <X className="w-4 h-4 mr-2" />
                            Discard
                          </Button>
                          <Button onClick={() => startRecording('voice')}>
                            <Mic className="w-4 h-4 mr-2" />
                            Re-record
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video Reply */}
            {replyType === 'video' && (
              <div className="space-y-4">
                {permissionError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 mb-1">Permission Error</p>
                      <p className="text-sm text-red-700">{permissionError}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setPermissionError('')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-dashed border-blue-300">
                  <div className="text-center">
                    {!isRecording && !videoURL && (
                      <>
                        <Video className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-700 mb-4">Record a video explanation</p>
                        <Button onClick={() => startRecording('video')}>
                          <Video className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      </>
                    )}

                    {isRecording && (
                      <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-gray-900 mb-4">
                          {formatTime(recordingTime)}
                        </p>
                        <Button variant="destructive" onClick={stopRecording}>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      </>
                    )}

                    {videoURL && !isRecording && (
                      <>
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className="text-gray-700 mb-4">Recording Complete!</p>
                        <video src={videoURL} controls className="w-full max-w-2xl mx-auto mb-4 rounded-lg" />
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => setVideoURL('')}>
                            <X className="w-4 h-4 mr-2" />
                            Discard
                          </Button>
                          <Button onClick={() => startRecording('video')}>
                            <Video className="w-4 h-4 mr-2" />
                            Re-record
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end mt-6">
              <Button 
                size="lg"
                onClick={handleSendReply}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reply to Student
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Doubt Hub Workbench</h1>
          <p className="text-sm text-gray-600">Manage and resolve student queries</p>
        </div>
      </div>

      <div className=" mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Pending Doubts</p>
                <p className="text-4xl font-bold">{pendingDoubts.length}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-100" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Answered Today</p>
                <p className="text-4xl font-bold">{answeredDoubts.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-100" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                <p className="text-4xl font-bold">127</p>
              </div>
              <User className="w-12 h-12 text-blue-100" />
            </div>
          </Card>
        </div>

        {/* Pending Doubts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Doubts ({pendingDoubts.length})
          </h2>
          <div className="space-y-3">
            {pendingDoubts.map((doubt) => (
              <Card 
                key={doubt.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500"
                onClick={() => setSelectedDoubt(doubt)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {doubt.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{doubt.studentName}</h3>
                      <Badge variant="outline" className="text-xs">{doubt.studentClass}</Badge>
                      <Badge 
                        className={
                          doubt.priority === 'high' ? 'bg-red-100 text-red-700 text-xs' :
                          doubt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 text-xs' :
                          'bg-green-100 text-green-700 text-xs'
                        }
                      >
                        {doubt.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="font-medium text-blue-600">{doubt.subject}</span>
                      <span>•</span>
                      <span>{doubt.topic}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doubt.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{doubt.question}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View & Reply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Answered Doubts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recently Answered ({answeredDoubts.length})
          </h2>
          <div className="space-y-3">
            {answeredDoubts.map((doubt) => (
              <Card 
                key={doubt.id}
                className="p-4 bg-gray-50 border-l-4 border-l-green-500 opacity-75"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {doubt.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-700">{doubt.studentName}</h3>
                      <Badge variant="outline" className="text-xs">{doubt.studentClass}</Badge>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        ANSWERED
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{doubt.subject}</span>
                      <span>•</span>
                      <span>{doubt.topic}</span>
                      <span>•</span>
                      <span>{doubt.timestamp}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{doubt.question}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}