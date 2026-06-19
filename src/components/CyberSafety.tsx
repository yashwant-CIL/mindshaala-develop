import { useState } from 'react';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

interface CyberSafetyProps {
  onBack: () => void;
}

export function CyberSafety({ onBack }: CyberSafetyProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 10;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

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
                <h1 className="text-xl text-gray-900">Cyber Safety & Ethics</h1>
                <p className="text-sm text-gray-500">Learn to stay safe online</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Module 5/8</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Password Strength Tester */}
        <Card className="p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Strength Tester
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password..."
                className="pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Strength:</span>
                    <span className={`text-sm ${
                      passwordStrength < 40 ? 'text-red-600' :
                      passwordStrength < 70 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength < 40 ? 'Weak' :
                       passwordStrength < 70 ? 'Medium' :
                       'Strong'}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className={`h-2 ${
                    passwordStrength < 40 ? '[&>div]:bg-red-600' :
                    passwordStrength < 70 ? '[&>div]:bg-orange-600' :
                    '[&>div]:bg-green-600'
                  }`} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    {password.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[a-z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Number
                  </div>
                  <div className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[^a-zA-Z0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Special character (@#$%)
                  </div>
                </div>
              </>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2 text-blue-900">💡 Tips for Strong Passwords:</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Use at least 12 characters</li>
                <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                <li>• Don't use personal information (name, birthdate)</li>
                <li>• Use different passwords for different accounts</li>
                <li>• Consider using a password manager</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Digital Safety Rules */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Digital Safety Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🔒', title: 'Keep Personal Info Private', desc: 'Never share address, phone, or passwords online', do: 'Use privacy settings', dont: 'Post personal details publicly' },
              { icon: '⚠️', title: 'Recognize Phishing', desc: 'Fake emails/messages trying to steal info', do: 'Verify sender', dont: 'Click suspicious links' },
              { icon: '👥', title: 'Be Kind Online', desc: 'Treat others with respect', do: 'Think before posting', dont: 'Cyberbully or share rumors' },
              { icon: '🛡️', title: 'Use Trusted Websites', desc: 'Only visit secure websites', do: 'Look for HTTPS and 🔒', dont: 'Download from unknown sources' },
            ].map((rule) => (
              <div key={rule.title} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-3xl mb-2">{rule.icon}</div>
                <h3 className="text-sm mb-1">{rule.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{rule.desc}</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                    <span className="text-green-700">DO: {rule.do}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <XCircle className="w-3 h-3 text-red-600 mt-0.5" />
                    <span className="text-red-700">DON'T: {rule.dont}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Phishing Quiz */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">🎣 Spot the Phishing Email</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm">Suspicious Email Example:</span>
              </div>
              <div className="bg-gray-50 p-3 rounded text-xs space-y-2">
                <div><strong>From:</strong> support@bankk-secure.com</div>
                <div><strong>Subject:</strong> URGENT! Your account will be closed</div>
                <div className="border-t border-gray-200 pt-2">
                  Dear Customer,
                  <br /><br />
                  Your account has been compromised! Click here immediately to verify your details:
                  <br />
                  <a href="#" className="text-blue-600 underline">http://verify-account-now.xyz</a>
                  <br /><br />
                  Failure to do so will result in account closure within 24 hours.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-sm mb-2 text-red-900">🚩 Red Flags Found:</h3>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Misspelled domain (bankk instead of bank)</li>
                  <li>• Creates urgency/panic</li>
                  <li>• Suspicious link (not official website)</li>
                  <li>• Generic greeting ("Dear Customer")</li>
                  <li>• Threats of account closure</li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm mb-2 text-green-900">✅ What to Do:</h3>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Don't click any links</li>
                  <li>• Check sender's email carefully</li>
                  <li>• Contact bank directly using official number</li>
                  <li>• Report the phishing attempt</li>
                  <li>• Delete the email</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Computer Ethics */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Computer Ethics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm mb-2">Plagiarism</h3>
              <p className="text-xs text-gray-600 mb-2">Using others' work without credit</p>
              <div className="text-xs space-y-1">
                <p className="text-red-600">❌ Copy-paste without citation</p>
                <p className="text-green-600">✅ Give proper credit</p>
                <p className="text-green-600">✅ Use your own words</p>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-sm mb-2">Copyright & Piracy</h3>
              <p className="text-xs text-gray-600 mb-2">Respect intellectual property</p>
              <div className="text-xs space-y-1">
                <p className="text-red-600">❌ Illegal downloads</p>
                <p className="text-red-600">❌ Sharing pirated software</p>
                <p className="text-green-600">✅ Buy or use free alternatives</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2">Digital Footprint</h3>
              <p className="text-xs text-gray-600 mb-2">Your online trail</p>
              <div className="text-xs space-y-1">
                <p className="text-gray-700">• Everything you post stays online</p>
                <p className="text-gray-700">• Think before you share</p>
                <p className="text-green-600">✅ Build positive presence</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Tools */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Security Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Antivirus', icon: '🛡️', desc: 'Protects from malware', example: 'Windows Defender' },
              { name: 'Firewall', icon: '🔥', desc: 'Blocks unauthorized access', example: 'Built into OS' },
              { name: 'VPN', icon: '🔐', desc: 'Encrypts connection', example: 'Privacy protection' },
              { name: 'Backup', icon: '💾', desc: 'Save important data', example: 'Cloud/External drive' },
            ].map((tool) => (
              <div key={tool.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-4xl mb-2">{tool.icon}</div>
                <h3 className="text-sm mb-1">{tool.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{tool.desc}</p>
                <p className="text-xs text-blue-600">{tool.example}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Game */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">🎮 Cyber Safety Challenge</h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <p className="text-center text-gray-600 mb-4">
              Interactive scenarios to test your cyber safety knowledge
              <br />
              <span className="text-sm text-gray-500">(Escape room style game coming soon)</span>
            </p>
            <Button className="mx-auto block">
              <Shield className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
