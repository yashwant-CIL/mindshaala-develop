import { useState } from 'react';
import { ArrowLeft, Globe, Wifi, Server, Shield, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface InternetNetworkingProps {
  onBack: () => void;
}

export function InternetNetworking({ onBack }: InternetNetworkingProps) {
  const [selectedTopology, setSelectedTopology] = useState<string | null>(null);

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
                <h1 className="text-xl text-gray-900">Internet & Networking</h1>
                <p className="text-sm text-gray-500">Learn about networks, internet, and connectivity</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Module 4/8</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Internet Basics */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Internet Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Globe, title: 'What is Internet?', desc: 'Global network of interconnected computers', info: 'Billions of devices connected worldwide' },
              { icon: Search, title: 'WWW vs Internet', desc: 'WWW is a service on the Internet', info: 'Internet = Infrastructure, WWW = Service' },
              { icon: Server, title: 'Web Browsers', desc: 'Software to access websites', info: 'Chrome, Firefox, Safari, Edge' },
              { icon: Shield, title: 'URLs & Domains', desc: 'Website addresses and names', info: 'https://www.example.com' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Icon className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{item.desc}</p>
                  <p className="text-xs text-blue-600">{item.info}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Network Types */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Types of Networks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm mb-2">LAN (Local Area Network)</h3>
              <p className="text-xs text-gray-600 mb-2">Small area network</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Home network</li>
                <li>• School/Office network</li>
                <li>• Limited to small area</li>
                <li>• High speed connection</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2">WAN (Wide Area Network)</h3>
              <p className="text-xs text-gray-600 mb-2">Large area network</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Covers cities/countries</li>
                <li>• Internet is largest WAN</li>
                <li>• Connects multiple LANs</li>
                <li>• Lower speed vs LAN</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm mb-2">MAN (Metropolitan Area Network)</h3>
              <p className="text-xs text-gray-600 mb-2">City-wide network</p>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Covers a city</li>
                <li>• Cable TV network</li>
                <li>• Between LAN and WAN</li>
                <li>• Medium coverage area</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Network Topologies */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Network Topologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { name: 'Star', desc: 'All devices connect to central hub', advantage: 'Easy to add devices', disadvantage: 'Hub failure = network fails' },
              { name: 'Bus', desc: 'All devices on single cable', advantage: 'Easy to install', disadvantage: 'Cable break affects all' },
              { name: 'Ring', desc: 'Devices in circular chain', advantage: 'Equal access', disadvantage: 'One failure breaks ring' },
            ].map((topology) => (
              <div 
                key={topology.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTopology === topology.name 
                    ? 'bg-blue-100 border-blue-600' 
                    : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                }`}
                onClick={() => setSelectedTopology(topology.name)}
              >
                <h3 className="text-sm mb-2">{topology.name} Topology</h3>
                <p className="text-xs text-gray-600 mb-2">{topology.desc}</p>
                <div className="h-24 bg-white rounded mb-2 flex items-center justify-center">
                  {topology.name === 'Star' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                      <circle cx="50" cy="50" r="8" fill="#3b82f6" />
                      <circle cx="50" cy="20" r="5" fill="#94a3b8" />
                      <circle cx="80" cy="50" r="5" fill="#94a3b8" />
                      <circle cx="50" cy="80" r="5" fill="#94a3b8" />
                      <circle cx="20" cy="50" r="5" fill="#94a3b8" />
                      <line x1="50" y1="50" x2="50" y2="20" stroke="#64748b" strokeWidth="2" />
                      <line x1="50" y1="50" x2="80" y2="50" stroke="#64748b" strokeWidth="2" />
                      <line x1="50" y1="50" x2="50" y2="80" stroke="#64748b" strokeWidth="2" />
                      <line x1="50" y1="50" x2="20" y2="50" stroke="#64748b" strokeWidth="2" />
                    </svg>
                  )}
                  {topology.name === 'Bus' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                      <line x1="20" y1="50" x2="80" y2="50" stroke="#3b82f6" strokeWidth="3" />
                      <circle cx="30" cy="50" r="5" fill="#94a3b8" />
                      <circle cx="50" cy="50" r="5" fill="#94a3b8" />
                      <circle cx="70" cy="50" r="5" fill="#94a3b8" />
                    </svg>
                  )}
                  {topology.name === 'Ring' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                      <circle cx="50" cy="50" r="25" fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <circle cx="50" cy="25" r="5" fill="#94a3b8" />
                      <circle cx="75" cy="50" r="5" fill="#94a3b8" />
                      <circle cx="50" cy="75" r="5" fill="#94a3b8" />
                      <circle cx="25" cy="50" r="5" fill="#94a3b8" />
                    </svg>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-green-700">✓ {topology.advantage}</p>
                  <p className="text-red-700">✗ {topology.disadvantage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Network Devices */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Network Devices</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Router', icon: '🔀', desc: 'Connects different networks', use: 'Home internet connection' },
              { name: 'Switch', icon: '🔗', desc: 'Connects devices in LAN', use: 'Office network' },
              { name: 'Modem', icon: '📡', desc: 'Modulates/Demodulates signal', use: 'ISP connection' },
              { name: 'Hub', icon: '⭐', desc: 'Basic connection point', use: 'Simple networks' },
            ].map((device) => (
              <div key={device.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-4xl mb-2">{device.icon}</div>
                <h3 className="text-sm mb-1">{device.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{device.desc}</p>
                <p className="text-xs text-blue-600">{device.use}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* IP Address & Protocols */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Addressing & Protocols</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm mb-2">IP Address</h3>
              <p className="text-xs text-gray-600 mb-2">Unique identifier for devices</p>
              <div className="bg-white p-2 rounded border border-purple-300 font-mono text-sm mb-2">
                192.168.1.1
              </div>
              <p className="text-xs text-gray-700">• IPv4: 32-bit address</p>
              <p className="text-xs text-gray-700">• IPv6: 128-bit address (newer)</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-sm mb-2">MAC Address</h3>
              <p className="text-xs text-gray-600 mb-2">Physical hardware address</p>
              <div className="bg-white p-2 rounded border border-orange-300 font-mono text-sm mb-2">
                00:1B:44:11:3A:B7
              </div>
              <p className="text-xs text-gray-700">• Unique to each device</p>
              <p className="text-xs text-gray-700">• Cannot be changed</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm mb-2">HTTP/HTTPS</h3>
              <p className="text-xs text-gray-600 mb-2">Web browsing protocols</p>
              <p className="text-xs text-gray-700">• HTTP: Hypertext Transfer Protocol</p>
              <p className="text-xs text-gray-700">• HTTPS: Secure version (encrypted)</p>
              <p className="text-xs text-green-700">• Always prefer HTTPS 🔒</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm mb-2">TCP/IP</h3>
              <p className="text-xs text-gray-600 mb-2">Internet communication protocol</p>
              <p className="text-xs text-gray-700">• TCP: Transmission Control Protocol</p>
              <p className="text-xs text-gray-700">• IP: Internet Protocol</p>
              <p className="text-xs text-blue-700">• Foundation of the Internet</p>
            </div>
          </div>
        </Card>

        {/* Practice Game */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Network Topology Builder Game</h2>
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 min-h-[300px]">
            <p className="text-center text-gray-500 mt-20">
              🎮 Interactive topology builder coming soon!
              <br />
              <span className="text-sm">Drag devices and cables to build your own network</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
