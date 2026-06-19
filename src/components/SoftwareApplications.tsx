import { useState } from 'react';
import { ArrowLeft, FileText, Table, Presentation, Paintbrush, Play, Award } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SoftwareApplicationsProps {
  onBack: () => void;
}

export function SoftwareApplications({ onBack }: SoftwareApplicationsProps) {
  const [activeOfficeApp, setActiveOfficeApp] = useState<'word' | 'excel' | 'powerpoint' | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl text-gray-900">Software & Applications</h1>
                <p className="text-sm text-gray-500">Master MS Office and essential software</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Module 2/8
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Operating Systems */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Operating Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Windows', icon: '🪟', desc: 'Most popular OS for personal computers', features: 'User-friendly, Gaming, Business apps' },
              { name: 'macOS', icon: '🍎', desc: 'Apple\'s operating system', features: 'Design work, Creative apps, Seamless ecosystem' },
              { name: 'Linux', icon: '🐧', desc: 'Open-source and free OS', features: 'Programming, Servers, Customizable' },
            ].map((os) => (
              <div key={os.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-4xl mb-2">{os.icon}</div>
                <h3 className="text-sm mb-1">{os.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{os.desc}</p>
                <p className="text-xs text-gray-500">{os.features}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* MS Office Suite */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Microsoft Office Suite</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Word */}
            <div 
              className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveOfficeApp('word')}
            >
              <FileText className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-sm mb-2">Microsoft Word</h3>
              <p className="text-xs text-gray-600 mb-3">Word processing application</p>
              <Button size="sm" className="w-full">
                <Play className="w-3 h-3 mr-2" />
                Practice Word
              </Button>
            </div>

            {/* Excel */}
            <div 
              className="p-6 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveOfficeApp('excel')}
            >
              <Table className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-sm mb-2">Microsoft Excel</h3>
              <p className="text-xs text-gray-600 mb-3">Spreadsheet and data analysis</p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                <Play className="w-3 h-3 mr-2" />
                Practice Excel
              </Button>
            </div>

            {/* PowerPoint */}
            <div 
              className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveOfficeApp('powerpoint')}
            >
              <Presentation className="w-10 h-10 text-orange-600 mb-3" />
              <h3 className="text-sm mb-2">Microsoft PowerPoint</h3>
              <p className="text-xs text-gray-600 mb-3">Presentation software</p>
              <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                <Play className="w-3 h-3 mr-2" />
                Practice PPT
              </Button>
            </div>
          </div>

          {/* Interactive Office Simulator */}
          {activeOfficeApp && (
            <div className="p-6 bg-white border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm">
                  {activeOfficeApp === 'word' && 'Word Processing Practice'}
                  {activeOfficeApp === 'excel' && 'Excel Formulas Practice'}
                  {activeOfficeApp === 'powerpoint' && 'PowerPoint Design Practice'}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setActiveOfficeApp(null)}>
                  Close
                </Button>
              </div>

              {/* Word Simulator */}
              {activeOfficeApp === 'word' && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-2 bg-gray-100 rounded">
                    <Button size="sm" variant="outline">Bold</Button>
                    <Button size="sm" variant="outline">Italic</Button>
                    <Button size="sm" variant="outline">Underline</Button>
                    <Button size="sm" variant="outline">Align Left</Button>
                    <Button size="sm" variant="outline">Align Center</Button>
                  </div>
                  <div className="min-h-[300px] bg-white border border-gray-300 p-4 rounded">
                    <p className="text-sm text-gray-600">
                      Practice formatting text here. Learn to use:
                      <br />• Text formatting (bold, italic, underline)
                      <br />• Paragraph alignment
                      <br />• Inserting tables and images
                      <br />• Using styles and themes
                    </p>
                  </div>
                </div>
              )}

              {/* Excel Simulator */}
              {activeOfficeApp === 'excel' && (
                <div className="space-y-4">
                  <div className="text-sm mb-2">Common Excel Formulas:</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { formula: '=SUM(A1:A10)', desc: 'Add numbers in range' },
                      { formula: '=AVERAGE(A1:A10)', desc: 'Calculate average' },
                      { formula: '=MAX(A1:A10)', desc: 'Find maximum value' },
                      { formula: '=MIN(A1:A10)', desc: 'Find minimum value' },
                      { formula: '=COUNT(A1:A10)', desc: 'Count numbers' },
                      { formula: '=IF(A1>10,"Yes","No")', desc: 'Conditional logic' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                        <code className="text-xs text-green-700">{item.formula}</code>
                        <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PowerPoint Simulator */}
              {activeOfficeApp === 'powerpoint' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Title Slide', icon: '📄' },
                      { name: 'Content Slide', icon: '📝' },
                      { name: 'Two Column', icon: '📊' },
                      { name: 'Image + Text', icon: '🖼️' },
                      { name: 'Chart Slide', icon: '📈' },
                      { name: 'Thank You', icon: '🎉' },
                    ].map((layout) => (
                      <div key={layout.name} className="p-4 bg-orange-50 rounded border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                        <div className="text-2xl mb-2 text-center">{layout.icon}</div>
                        <p className="text-xs text-center">{layout.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Types of Software */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Types of Software</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm mb-2 text-purple-900">System Software</h3>
              <p className="text-xs text-gray-600 mb-2">Manages computer hardware</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Operating Systems</li>
                <li>• Device Drivers</li>
                <li>• Utility Programs</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2 text-blue-900">Application Software</h3>
              <p className="text-xs text-gray-600 mb-2">Programs for specific tasks</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• MS Office</li>
                <li>• Web Browsers</li>
                <li>• Media Players</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm mb-2 text-green-900">Utility Software</h3>
              <p className="text-xs text-gray-600 mb-2">Maintain and optimize system</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Antivirus</li>
                <li>• Disk Cleanup</li>
                <li>• Backup Tools</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Practice Challenges */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Practice Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Word Formatting Challenge', desc: 'Format a document with specific styles', icon: FileText, color: 'blue' },
              { title: 'Excel Formula Quiz', desc: 'Solve problems using Excel formulas', icon: Table, color: 'green' },
              { title: 'PowerPoint Design Task', desc: 'Create presentation from template', icon: Presentation, color: 'orange' },
              { title: 'Software Classification', desc: 'Identify types of software', icon: Award, color: 'purple' },
            ].map((challenge) => {
              const Icon = challenge.icon;
              return (
                <div key={challenge.title} className={`p-4 bg-${challenge.color}-50 rounded-lg border border-${challenge.color}-200`}>
                  <Icon className={`w-8 h-8 text-${challenge.color}-600 mb-2`} />
                  <h3 className="text-sm mb-1">{challenge.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">{challenge.desc}</p>
                  <Button size="sm" className="w-full">Start Challenge</Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
