#!/bin/bash

echo "🚀 Creating completely separate AI Viva (Voice Feedback) component..."
echo ""

# Step 1: Copy the file
echo "📋 Step 1: Duplicating VivaPractice.tsx..."
cp components/VivaPractice.tsx components/VivaPracticeAIIntegrated.tsx
echo "✅ File duplicated"
echo ""

# Step 2: Update component name
echo "🔧 Step 2: Renaming component function..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' 's/export default function VivaPractice()/export default function VivaPracticeAIIntegrated()/g' components/VivaPracticeAIIntegrated.tsx
else
  # Linux
  sed -i 's/export default function VivaPractice()/export default function VivaPracticeAIIntegrated()/g' components/VivaPracticeAIIntegrated.tsx
fi
echo "✅ Component renamed"
echo ""

# Step 3: Update localStorage keys to be separate
echo "🔧 Step 3: Updating localStorage keys..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/hasShownGeminiTip/hasShownGeminiTipAIIntegrated/g" components/VivaPracticeAIIntegrated.tsx
else
  sed -i "s/hasShownGeminiTip/hasShownGeminiTipAIIntegrated/g" components/VivaPracticeAIIntegrated.tsx
fi
echo "✅ LocalStorage keys updated"
echo ""

# Step 4: Update header title
echo "🔧 Step 4: Updating header text..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/AI Viva Practice<\/h1>/AI Viva Practice (AI Integrated) 🎙️<\/h1>/g' components/VivaPracticeAIIntegrated.tsx
  sed -i '' 's/Gemini AI-powered oral examination practice/Gemini AI + ElevenLabs voice feedback for immersive learning/g' components/VivaPracticeAIIntegrated.tsx
else
  sed -i 's/AI Viva Practice<\/h1>/AI Viva Practice (AI Integrated) 🎙️<\/h1>/g' components/VivaPracticeAIIntegrated.tsx
  sed -i 's/Gemini AI-powered oral examination practice/Gemini AI + ElevenLabs voice feedback for immersive learning/g' components/VivaPracticeAIIntegrated.tsx
fi
echo "✅ Headers updated"
echo ""

echo "✨ Base component created successfully!"
echo ""
echo "⚠️  NEXT: You need to add TTS features manually"
echo ""
echo "📚 Follow these guides:"
echo "  1. Open: CREATE_AI_INTEGRATED_COMPLETE.md"
echo "  2. Add TTS functions (copy-paste from the guide)"
echo "  3. Add TTS UI controls (copy-paste from the guide)"
echo "  4. Update API settings modal (copy-paste from the guide)"
echo ""
echo "🎯 Or skip manual steps and use the pre-made complete version"
echo "   (See instructions in the guide)"
echo ""
echo "✅ Done! The component is ready for TTS enhancements."
