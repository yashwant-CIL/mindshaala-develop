import { ArrowLeft, Brain, Cloud, Wifi, Cpu, Glasses, Printer as Printer3D, Radio } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface EmergingTechProps {
  onBack: () => void;
}

export function EmergingTech({ onBack }: EmergingTechProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl text-gray-900">Emerging Technologies</h1>
                <p className="text-sm text-gray-500">Future tech: AI, IoT, Cloud, AR/VR</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Module 7/8</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Artificial Intelligence */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg">Artificial Intelligence (AI)</h2>
              <p className="text-sm text-gray-500">Machines that can think and learn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-sm mb-2">What is AI?</h3>
                <p className="text-xs text-gray-700 mb-2">
                  AI enables machines to perform tasks that typically require human intelligence
                </p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Learning from experience</li>
                  <li>• Recognizing patterns</li>
                  <li>• Making decisions</li>
                  <li>• Understanding language</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm mb-2">Machine Learning</h3>
                <p className="text-xs text-gray-700">
                  Subset of AI where computers learn from data without explicit programming
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm mb-3">AI in Daily Life:</h3>
              <div className="space-y-2">
                {[
                  { icon: '🗣️', name: 'Voice Assistants', example: 'Alexa, Siri, Google Assistant' },
                  { icon: '🎵', name: 'Recommendations', example: 'Netflix, Spotify, YouTube' },
                  { icon: '🚗', name: 'Self-Driving Cars', example: 'Tesla Autopilot' },
                  { icon: '📸', name: 'Face Recognition', example: 'Phone unlock, Photo tagging' },
                  { icon: '🎮', name: 'Gaming', example: 'Smart opponents, NPCs' },
                  { icon: '🏥', name: 'Healthcare', example: 'Disease diagnosis, Drug discovery' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-2 bg-white rounded">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Cloud Computing */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg">Cloud Computing</h2>
              <p className="text-sm text-gray-500">Access data and programs over the internet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2">What is Cloud?</h3>
              <p className="text-xs text-gray-700 mb-3">
                Instead of storing files on your computer, store them on internet servers
              </p>
              <div className="space-y-1 text-xs">
                <p className="text-green-600">✓ Access anywhere</p>
                <p className="text-green-600">✓ Automatic backup</p>
                <p className="text-green-600">✓ Share easily</p>
                <p className="text-green-600">✓ No device storage needed</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm mb-3">Popular Cloud Services:</h3>
              <div className="space-y-2">
                {[
                  { name: 'Google Drive', use: 'File storage & docs' },
                  { name: 'Dropbox', use: 'File sync & share' },
                  { name: 'iCloud', use: 'Apple device backup' },
                  { name: 'OneDrive', use: 'Microsoft storage' },
                ].map((service) => (
                  <div key={service.name} className="p-2 bg-white rounded border border-gray-200">
                    <p className="text-xs">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.use}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm mb-2">Benefits:</h3>
              <ul className="text-xs space-y-2 text-gray-700">
                <li>💰 <strong>Cost Effective</strong> - No hardware needed</li>
                <li>📈 <strong>Scalable</strong> - Grow as needed</li>
                <li>🔄 <strong>Automatic Updates</strong> - Always latest version</li>
                <li>🌍 <strong>Global Access</strong> - Work from anywhere</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Internet of Things (IoT) */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg">Internet of Things (IoT)</h2>
              <p className="text-sm text-gray-500">Everyday objects connected to the internet</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { icon: '🏠', name: 'Smart Home', example: 'Smart lights, thermostats' },
              { icon: '⌚', name: 'Wearables', example: 'Fitness trackers, smartwatches' },
              { icon: '🚗', name: 'Smart Cars', example: 'Connected vehicles' },
              { icon: '🏥', name: 'Healthcare', example: 'Remote monitoring devices' },
              { icon: '🌾', name: 'Agriculture', example: 'Smart irrigation systems' },
              { icon: '🏭', name: 'Industry', example: 'Smart factories' },
              { icon: '🏙️', name: 'Smart Cities', example: 'Traffic management' },
              { icon: '📦', name: 'Logistics', example: 'Package tracking' },
            ].map((item) => (
              <div key={item.name} className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-xs mb-1">{item.name}</p>
                <p className="text-xs text-gray-600">{item.example}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm mb-2">How IoT Works:</h3>
            <div className="flex items-center justify-center gap-3 text-xs">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1">
                  📱
                </div>
                <p>Sensors</p>
                <p className="text-gray-500">Collect data</p>
              </div>
              <div className="text-xl">→</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1">
                  🌐
                </div>
                <p>Internet</p>
                <p className="text-gray-500">Send data</p>
              </div>
              <div className="text-xl">→</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1">
                  ⚙️
                </div>
                <p>Process</p>
                <p className="text-gray-500">Analyze</p>
              </div>
              <div className="text-xl">→</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1">
                  💡
                </div>
                <p>Action</p>
                <p className="text-gray-500">Control devices</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Other Technologies */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Other Emerging Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Glasses, title: 'Virtual & Augmented Reality', color: 'purple', desc: 'VR: Immersive digital worlds | AR: Digital overlay on real world', examples: 'Gaming, Training, Education, Shopping' },
              { icon: Printer3D, title: '3D Printing', color: 'orange', desc: 'Create physical objects from digital designs', examples: 'Prototypes, Medical implants, Custom parts' },
              { icon: Cpu, title: 'Robotics', color: 'red', desc: 'Programmable machines that can perform tasks', examples: 'Manufacturing, Surgery, Exploration' },
              { icon: Radio, title: 'Drones', color: 'blue', desc: 'Unmanned aerial vehicles', examples: 'Delivery, Photography, Agriculture' },
            ].map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.title} className={`p-4 bg-${tech.color}-50 rounded-lg border border-${tech.color}-200`}>
                  <Icon className={`w-8 h-8 text-${tech.color}-600 mb-2`} />
                  <h3 className="text-sm mb-2">{tech.title}</h3>
                  <p className="text-xs text-gray-700 mb-2">{tech.desc}</p>
                  <p className="text-xs text-gray-600">Examples: {tech.examples}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Future Impact */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h2 className="text-lg mb-4">Impact on Future</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h3 className="text-sm mb-2 text-green-700">Positive Impact</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Improved healthcare</li>
                <li>• Better education access</li>
                <li>• Efficient transportation</li>
                <li>• Environmental protection</li>
                <li>• Increased productivity</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h3 className="text-sm mb-2 text-blue-700">Career Opportunities</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• AI/ML Engineers</li>
                <li>• Cloud Architects</li>
                <li>• IoT Developers</li>
                <li>• Robotics Engineers</li>
                <li>• Data Scientists</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h3 className="text-sm mb-2 text-orange-700">Challenges</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Privacy concerns</li>
                <li>• Job displacement</li>
                <li>• Security risks</li>
                <li>• Digital divide</li>
                <li>• Ethical questions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
