#!/bin/bash

# Script to create AI Viva Practice (AI Integrated) version
# This duplicates VivaPractice.tsx and adds TTS capabilities

echo "🚀 Creating AI Viva Practice (AI Integrated) component..."

# Step 1: Copy the original component
cp components/VivaPractice.tsx components/VivaPracticeAIIntegrated.tsx

echo "✅ Component file duplicated"

# Step 2: Modify the component
# Update imports to add TTS-related icons
sed -i '' 's/Volume2, ArrowLeft/Volume2, VolumeX, Volume, ArrowLeft/g' components/VivaPracticeAIIntegrated.tsx

# Update component name
sed -i '' 's/export default function VivaPractice/export default function VivaPracticeAIIntegrated/g' components/VivaPracticeAIIntegrated.tsx

# Update header title
sed -i '' 's/AI Viva Practice<\/h1>/AI Viva Practice (AI Integrated) 🎙️<\/h1>/g' components/VivaPracticeAIIntegrated.tsx

# Update description
sed -i '' 's/Gemini AI-powered oral examination practice/Gemini AI + ElevenLabs voice feedback/g' components/VivaPracticeAIIntegrated.tsx

echo "✅ Component modifications complete"

# Step 3: Add ElevenLabs configuration after Gemini config
# (This requires manual editing - see AI_INTEGRATED_SETUP_GUIDE.md)

echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo "1. Open components/VivaPracticeAIIntegrated.tsx"
echo "2. Add ElevenLabs configuration after line 15 (see AI_INTEGRATED_SETUP_GUIDE.md section 2.2)"
echo "3. Add TTS state management (section 2.3)"
echo "4. Add TTS functions (section 2.4)"
echo "5. Update submitAnswer to call speakFeedback (section 2.5)"
echo "6. Add TTS controls to UI (section 2.6)"
echo "7. Update API settings modal (section 2.7)"
echo ""
echo "📖 Full instructions in: AI_INTEGRATED_SETUP_GUIDE.md"
echo ""
echo "✨ Base component created successfully!"
