import { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Clock, Award, TrendingUp, BookOpen, Target, CheckCircle2, XCircle,
  Volume2, ArrowLeft, Brain, Sparkles, AlertCircle, Info, BarChart3,
  Timer, Zap, Star, ThumbsUp, ThumbsDown, MessageSquare, FileText,
  Trophy, Calendar, Eye, EyeOff, Settings, Lightbulb, VolumeX, Volume
} from 'lucide-react';

// ============================================================================
// AI CONFIGURATION (GEMINI + ELEVENLABS)
// ============================================================================

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY_HERE';
const ELEVENLABS_API_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah (warm teacher voice)

// This is a placeholder import - in the actual implementation this would come from VivaPractice.tsx
// For now, I'll include the complete interfaces and data inline
