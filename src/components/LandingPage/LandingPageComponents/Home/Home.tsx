import { useContext } from "react";
import studentImg from "../../../../../src/assets/MedhVrushti_Landing_Page/landingpageimg.webp";
import { BookOpenCheck, GraduationCap, Infinity } from "lucide-react";
import { FiBook } from "react-icons/fi";
import { UserContext } from "../../../../App";

const features = [
  {
    icon: <BookOpenCheck size={40} className="text-indigo-700" />,
    title: "100+ Online Courses",
    description: "Enjoy A Variety Of Fresh Topics",
  },
  {
    icon: <GraduationCap size={40} className="text-indigo-700" />,
    title: "Expert Instruction",
    description: "Find The Right Instructor For You",
  },
  {
    icon: <Infinity size={40} className="text-indigo-700" />,
    title: "Learn Without Limits",
    description: "Learn On Your Schedule",
  },
];

const Home = () => {
  // const { state, setCurrentStep } = useContext(UserContext);

  return (
    <div className="w-full pt-20 overflow-hidden bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-10 lg:px-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12  mx-auto">
          {/* Left Text */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm mb-6 animate-fadeIn">
              <FiBook className="w-4 h-4" />
              <span>Start Strong. Stay Ahead.</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Grow Smarter. <br />
              <span className="text-indigo-600 inline-block mt-2">Move Faster.</span> <br />
              <span className="text-slate-800">Go Further.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0">
              Step into a new era of learning where ambition meets action—sharpen
              your skills and own your growth with clarity and confidence.
            </p>

            {/* <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:scale-95"
                onClick={() => setCurrentStep("login")}
              >
                Browse Courses
              </button>
              {!state.isAuthenticated && (
                <button 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl border-2 border-slate-100 hover:border-indigo-600/20 hover:bg-slate-50 transition-all transform hover:-translate-y-1 active:scale-95"
                  onClick={() => setCurrentStep("profile")}
                >
                  Join For Free
                </button>
              )}
            </div> */}
          </div>

          {/* Right Image */}
          <div className="flex-1 relative animate-fadeIn self-end flex items-end">
             {/* Decorative blob */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50 z-0"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 z-0"></div>
            
            <img
              src={studentImg}
              alt="Student"
              className="relative z-10 w-full h-auto object-contain transform hover:scale-[1.02] transition-transform duration-500 mb-[-1px]"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-6 lg:px-12 bg-indigo-700 py-12">
        <div className=" mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white backdrop-blur-md border border-indigo-500/30 transition-all duration-500 group"
            >
              <div className="shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-700 group-hover:text-slate-900 transition-colors mb-1">{feature.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-500 font-medium transition-colors leading-tight">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
