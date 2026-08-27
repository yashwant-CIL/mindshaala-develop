import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Library,
  Sparkles,
  CheckCircle,
  CreditCard,
  Building2,
  Bookmark,
  Search,
  Clock,
  Download,
  Filter,
  ShieldCheck,
  Star,
  MapPin,
  Wifi,
  Coffee,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface LibrarySubscriptionProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export function LibrarySubscription({ onBack, onNavigate }: LibrarySubscriptionProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'catalog' | 'centers' | 'my-pass'>('plans');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Static subscription plans
  const subscriptionPlans = [
    {
      id: 'digital-pass',
      name: 'Digital Reader Pass',
      tagline: 'Ideal for home learning & digital study',
      monthlyPrice: '₹299',
      yearlyPrice: '₹2,499',
      savings: 'Save 30%',
      popular: false,
      color: 'from-blue-500 to-cyan-500',
      badgeBg: 'bg-blue-100 text-blue-700',
      features: [
        'Access to 50,000+ Digital E-Books & Reference Manuals',
        'NCERT & State Board Solution Repositories',
        'Audiobook Summaries & High-definition PDF Downloads',
        'Personalized Reading Highlights & Digital Sticky Notes',
        '2 Concurrent Device Logins'
      ]
    },
    {
      id: 'hybrid-pass',
      name: 'Hybrid Scholar Pass',
      tagline: 'Combine Digital Library with Physical Reading Room access',
      monthlyPrice: '₹699',
      yearlyPrice: '₹5,999',
      savings: 'Save 40%',
      popular: true,
      color: 'from-indigo-600 to-purple-600',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold',
      features: [
        'All Digital Reader Pass features included',
        'Reserved Desk Booking at MindShaala Partner Reading Hubs',
        'High-Speed Wi-Fi & Charging Spot access',
        'Physical Book Borrowing (Up to 3 books at a time)',
        'Access to Quiet Zone & Group Discussion Rooms',
        '5 Concurrent Device Logins'
      ]
    },
    {
      id: 'vip-pass',
      name: 'VIP Achiever Pass',
      tagline: 'Complete 24/7 Premium Library & Personal Study Suite',
      monthlyPrice: '₹1,299',
      yearlyPrice: '₹10,999',
      savings: 'Save 45%',
      popular: false,
      color: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-100 text-purple-700',
      features: [
        'All Hybrid Scholar Pass features included',
        '24/7 Unlimited Access to Air-Conditioned Reading Hubs',
        'Dedicated Personal Study Locker & Ergonomic Chair',
        'Unlimited Physical Book Issuance & Home Delivery',
        'Complimentary Beverage Bar & Quiet Study Pods',
        '1-on-1 Mentor Support for Doubt Resolution'
      ]
    }
  ];

  // Static Digital E-Books Catalog Data
  const bookCatalog = [
    {
      id: 'b1',
      title: 'Concepts of Physics (Vol 1 & 2)',
      author: 'Dr. H.C. Verma',
      category: 'Physics',
      grade: 'Class 11-12 / JEE',
      rating: 4.9,
      reviews: 1240,
      format: 'E-Book + Audio',
      availableInPhysical: true,
      coverBg: 'from-blue-600 to-indigo-800'
    },
    {
      id: 'b2',
      title: 'Problems in General Physics',
      author: 'I.E. Irodov',
      category: 'Physics',
      grade: 'JEE Advanced',
      rating: 4.8,
      reviews: 890,
      format: 'E-Book',
      availableInPhysical: true,
      coverBg: 'from-cyan-600 to-blue-700'
    },
    {
      id: 'b3',
      title: 'NCERT Exemplar Chemistry',
      author: 'NCERT Editorial Board',
      category: 'Chemistry',
      grade: 'Class 12',
      rating: 4.7,
      reviews: 2150,
      format: 'PDF + Interactive',
      availableInPhysical: true,
      coverBg: 'from-emerald-600 to-teal-800'
    },
    {
      id: 'b4',
      title: 'Mathematics for Class 10 Board Prep',
      author: 'R.D. Sharma',
      category: 'Mathematics',
      grade: 'Class 10',
      rating: 4.9,
      reviews: 3100,
      format: 'E-Book',
      availableInPhysical: true,
      coverBg: 'from-amber-600 to-orange-700'
    },
    {
      id: 'b5',
      title: 'Biology Today: Fundamentals & Beyond',
      author: 'Trueman Biology Series',
      category: 'Biology',
      grade: 'NEET Prep',
      rating: 4.8,
      reviews: 1540,
      format: 'E-Book + Notes',
      availableInPhysical: false,
      coverBg: 'from-green-600 to-emerald-800'
    },
    {
      id: 'b6',
      title: 'General Knowledge & Current Affairs 2026',
      author: 'MindShaala Expert Faculty',
      category: 'General Knowledge',
      grade: 'Competitive Exams',
      rating: 4.9,
      reviews: 980,
      format: 'Audiobook + E-Book',
      availableInPhysical: true,
      coverBg: 'from-purple-600 to-pink-700'
    }
  ];

  // Static Study Center Locations
  const physicalCenters = [
    {
      id: 'c1',
      name: 'MindShaala Central Reading Hub',
      address: 'Sector 17, Knowledge Park, City Center',
      timing: '6:00 AM - 11:00 PM',
      totalDesks: 120,
      availableDesks: 24,
      amenities: ['High-speed Wi-Fi', 'AC Reading Pods', 'Personal Lockers', 'Tea/Coffee Lounge']
    },
    {
      id: 'c2',
      name: 'MindShaala North Campus Library',
      address: 'University Road, Block B, Near Metro Station',
      timing: '24 Hours Open',
      totalDesks: 200,
      availableDesks: 45,
      amenities: ['24/7 Access', 'Silent Zones', 'Group Discussion Rooms', 'Power Outlets at Every Desk']
    }
  ];

  const categories = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Knowledge'];

  const filteredBooks = bookCatalog.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack || (() => onNavigate?.('dashboard'))}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Static Preview Component</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
                  <Library className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    Library Subscription
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base mt-0.5">
                    Access digital books, study reference notes & reserve physical reading desks in one pass.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill Header */}
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-xs text-slate-300 font-medium">Digital Books</p>
                <p className="text-lg font-bold text-amber-400">50,000+</p>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-xs text-slate-300 font-medium">Study Hubs</p>
                <p className="text-lg font-bold text-cyan-400">12 Centers</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-300 font-medium">Pass Status</p>
                <p className="text-xs font-semibold text-emerald-400 mt-1">AVAILABLE</p>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 scrollbar-hide border-b border-white/10">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition-all ${
                activeTab === 'plans'
                  ? 'bg-slate-50 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscription Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-slate-50 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Digital E-Book Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition-all ${
                activeTab === 'centers'
                  ? 'bg-slate-50 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Physical Study Centers</span>
            </button>
            <button
              onClick={() => setActiveTab('my-pass')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition-all ${
                activeTab === 'my-pass'
                  ? 'bg-slate-50 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>My Active Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: SUBSCRIPTION PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Billing toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Choose your Library Pass Plan</h3>
                <p className="text-sm text-slate-500">Flexible monthly or discounted annual access passes.</p>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                    Save 40%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map(plan => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 text-center">
                      ★ Most Popular Choice
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${plan.badgeBg}`}>
                        {plan.savings}
                      </span>
                      <Library className="w-5 h-5 text-slate-400" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 min-h-[32px]">{plan.tagline}</p>

                    {/* Price display */}
                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-[11px] text-blue-600 font-medium mt-1">
                          Equivalent to {plan.monthlyPrice} / month
                        </p>
                      )}
                    </div>

                    {/* Feature list */}
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Privileges:</p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card CTA */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => alert(`Static Component Demo: Successfully selected ${plan.name}!`)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md ${
                        plan.popular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Information Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Need an Institutional or Group Library Pass?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    We offer custom bulk library subscriptions for schools, coaching centers, and study groups with admin controls.
                  </p>
                </div>
              </div>
              <button
                onClick={() => alert('Static Preview: Group pass query sent!')}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl border border-blue-300 shadow-sm shrink-0 transition-colors"
              >
                Contact Institution Desk
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL E-BOOK CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search input */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books, authors, subjects..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="p-5">
                    {/* Fake book cover container */}
                    <div className={`h-36 rounded-xl bg-gradient-to-br ${book.coverBg} p-4 text-white flex flex-col justify-between shadow-inner mb-4 relative overflow-hidden`}>
                      <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex justify-between items-start">
                        <span className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          {book.category}
                        </span>
                        <Bookmark className="w-4 h-4 text-white/80 hover:text-white cursor-pointer" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm line-clamp-2 leading-tight drop-shadow">{book.title}</h4>
                        <p className="text-[11px] text-white/80 mt-1 font-medium">{book.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                        {book.grade}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{book.rating}</span>
                        <span className="text-slate-400 font-normal">({book.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Card Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      {book.format}
                    </span>
                    <button
                      onClick={() => alert(`Static Preview: "${book.title}" added to your Digital Shelf!`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Read Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL STUDY CENTERS */}
        {activeTab === 'centers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Partner Physical Study Centers</h3>
              <p className="text-xs text-slate-500 mb-6">
                Reserve your peaceful, air-conditioned study desk with high-speed Wi-Fi using your Hybrid or VIP Library Pass.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {physicalCenters.map(center => (
                  <div key={center.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{center.name}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            {center.address}
                          </p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
                          {center.availableDesks} Desks Available
                        </span>
                      </div>

                      <div className="my-4 space-y-2">
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Timings: <strong className="text-slate-800">{center.timing}</strong></span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {center.amenities.map((am, i) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                              ✓ {am}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Static Demo: Reserved seat at ${center.name}!`)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors mt-2"
                    >
                      Reserve Desk Seat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MY ACTIVE PASS */}
        {activeTab === 'my-pass' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Pass Card Component */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-400/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ACTIVE LIBRARY PASS</span>
                  </div>
                  <h3 className="text-2xl font-black mt-3 tracking-wide">HYBRID SCHOLAR PASS</h3>
                  <p className="text-xs text-indigo-200">MindShaala Digital & Physical Access Pass</p>
                </div>

                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <Library className="w-8 h-8 text-amber-300" />
                </div>
              </div>

              {/* Pass details */}
              <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/10 text-xs">
                <div>
                  <p className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">Pass ID</p>
                  <p className="font-mono text-sm font-bold text-white mt-0.5">MS-LIB-884920</p>
                </div>
                <div>
                  <p className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">Valid Until</p>
                  <p className="font-mono text-sm font-bold text-amber-300 mt-0.5">31 DEC 2026</p>
                </div>
                <div>
                  <p className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">Issued To</p>
                  <p className="font-semibold text-white mt-0.5">Student Scholar</p>
                </div>
                <div>
                  <p className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">Physical Desk Status</p>
                  <p className="font-semibold text-emerald-400 mt-0.5">Reserved Seat #42</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs">
                <span className="text-indigo-200">Need to renew or upgrade your library tier?</span>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-3 py-1 bg-amber-400 text-slate-900 font-bold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Manage Pass
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
