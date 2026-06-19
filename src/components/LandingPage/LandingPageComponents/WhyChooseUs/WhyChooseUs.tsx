import { FiHeart, FiBookOpen, FiAward, FiBook } from "react-icons/fi";
import img1 from "../../../../assets/student1.webp";
import img2 from "../../../../assets/student2.webp";
import img3 from "../../../../assets/student3.webp";

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-white py-24 px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-16  mx-auto">
      <div className="relative w-full lg:w-1/2 h-[500px] hidden lg:block">
        <div className="absolute -inset-10 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <img src={img1} alt="Student 1" className="absolute top-0 left-0 w-[380px] h-[250px] object-cover rounded-[2rem] shadow-2xl z-10 hover:scale-105 transition-transform duration-500" />
        <img src={img2} alt="Student 2" className="absolute top-48 right-0 w-[240px] h-[260px] object-cover rounded-[2rem] shadow-2xl z-30 hover:scale-105 transition-transform duration-500" />
        <img src={img3} alt="Student 3" className="absolute bottom-0 left-20 w-[240px] h-[240px] object-cover rounded-[2rem] shadow-2xl z-40 hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="w-full lg:w-1/2">
        <div className="text-center lg:text-left mb-12">
          <h3 className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-4 text-sm uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">
            <FiBook className="text-indigo-400" />
            Why Choose Us
          </h3>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Know About <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">MindShaala</span> <br /> Learning Platform
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-6 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 group">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              <FiHeart className="text-pink-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Flexible Classes</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Learn at your own pace with recorded sessions designed to fit into your schedule without compromising quality.</p>
            </div>
          </div>

          <div className="flex items-start gap-6 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 group">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              <FiBookOpen className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Learn From Anywhere</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Access high-quality courses and expert instructors from any location, on any device—all you need is an internet connection.</p>
            </div>
          </div>

          <div className="flex items-start gap-6 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 group">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              <FiAward className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Skill-Based Learning</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Gain real-world skills with hands-on assignments and project-based modules designed to make you job-ready.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
