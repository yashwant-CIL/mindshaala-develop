import { useState } from 'react';
import { ArrowLeft, Binary, Calculator, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface NumberSystemsProps {
  onBack: () => void;
}

export function NumberSystems({ onBack }: NumberSystemsProps) {
  const [decimalInput, setDecimalInput] = useState('');
  const [binaryResult, setBinaryResult] = useState('');

  const convertToBinary = () => {
    const num = parseInt(decimalInput);
    if (!isNaN(num) && num >= 0) {
      setBinaryResult(num.toString(2));
    }
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
                <h1 className="text-xl text-gray-900">Number Systems & Data</h1>
                <p className="text-sm text-gray-500">Binary, data representation, and logic gates</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Module 6/8</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Number Systems */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Number Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Decimal', base: '10', digits: '0-9', example: '125', desc: 'Our everyday system' },
              { name: 'Binary', base: '2', digits: '0-1', example: '1101', desc: 'Computer language' },
              { name: 'Octal', base: '8', digits: '0-7', example: '175', desc: 'Base 8 system' },
              { name: 'Hexadecimal', base: '16', digits: '0-F', example: '7D', desc: 'Compact representation' },
            ].map((system) => (
              <div key={system.name} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-sm mb-1">{system.name}</h3>
                <p className="text-xs text-gray-600 mb-2">Base {system.base}</p>
                <div className="bg-white p-2 rounded mb-2">
                  <p className="text-xs text-gray-500">Digits: {system.digits}</p>
                  <p className="text-sm font-mono">{system.example}</p>
                </div>
                <p className="text-xs text-gray-600">{system.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Binary Converter */}
        <Card className="p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Number System Converter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Decimal Number:</label>
                <Input
                  type="number"
                  value={decimalInput}
                  onChange={(e) => setDecimalInput(e.target.value)}
                  placeholder="Enter decimal number..."
                />
              </div>
              <Button onClick={convertToBinary} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Convert to Binary
              </Button>
              {binaryResult && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Binary Result:</p>
                  <p className="text-2xl font-mono text-green-700">{binaryResult}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm mb-3">How to Convert:</h3>
              <div className="space-y-2 text-xs">
                <p className="text-gray-700">Example: Convert 13 to Binary</p>
                <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
                  <p>13 ÷ 2 = 6 remainder <strong>1</strong></p>
                  <p>6 ÷ 2 = 3 remainder <strong>0</strong></p>
                  <p>3 ÷ 2 = 1 remainder <strong>1</strong></p>
                  <p>1 ÷ 2 = 0 remainder <strong>1</strong></p>
                  <p className="text-green-600 pt-2 border-t">Read from bottom to top: <strong>1101</strong></p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Representation */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Data Storage Units</h2>
          <div className="space-y-3">
            {[
              { unit: 'Bit', value: '1 or 0', desc: 'Smallest unit of data' },
              { unit: 'Byte', value: '8 bits', desc: 'One character' },
              { unit: 'Kilobyte (KB)', value: '1,024 bytes', desc: 'Small text file' },
              { unit: 'Megabyte (MB)', value: '1,024 KB', desc: 'Song, photo' },
              { unit: 'Gigabyte (GB)', value: '1,024 MB', desc: 'Movie, large app' },
              { unit: 'Terabyte (TB)', value: '1,024 GB', desc: 'Hard drive size' },
            ].map((item, idx) => (
              <div key={item.unit} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{item.unit}</p>
                  <p className="text-xs text-gray-600">{item.value}</p>
                </div>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Logic Gates */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Boolean Logic Gates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'AND', symbol: '∧', desc: 'Output 1 only if both inputs are 1', truth: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
              { name: 'OR', symbol: '∨', desc: 'Output 1 if any input is 1', truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
              { name: 'NOT', symbol: '¬', desc: 'Inverts the input', truth: [[0,1],[1,0]] },
            ].map((gate) => (
              <div key={gate.name} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">{gate.name} Gate</h3>
                  <span className="text-2xl text-purple-600">{gate.symbol}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{gate.desc}</p>
                <div className="bg-white p-2 rounded border border-purple-300">
                  <p className="text-xs mb-2">Truth Table:</p>
                  {gate.name === 'NOT' ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">A</th>
                          <th className="text-left p-1">Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gate.truth.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1">{row[0]}</td>
                            <td className="p-1">{row[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">A</th>
                          <th className="text-left p-1">B</th>
                          <th className="text-left p-1">Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gate.truth.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1">{row[0]}</td>
                            <td className="p-1">{row[1]}</td>
                            <td className="p-1">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Practice Challenges */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Practice Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Binary Converter Game', desc: 'Convert numbers in timed mode', icon: Binary, color: 'blue' },
              { title: 'Memory Unit Quiz', desc: 'Test your knowledge of KB, MB, GB', icon: Calculator, color: 'green' },
              { title: 'Logic Gate Simulator', desc: 'Build circuits with logic gates', icon: Zap, color: 'purple' },
            ].map((challenge) => {
              const Icon = challenge.icon;
              return (
                <div key={challenge.title} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Icon className="w-8 h-8 text-blue-600 mb-2" />
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
