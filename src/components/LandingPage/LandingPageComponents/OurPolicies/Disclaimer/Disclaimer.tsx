import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Disclaimer = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "ACCEPTANCE OF TERMS",
      content: "By selecting any educational service package (\"Service\") provided by Checkers Innovation Lab through our website or application, you (\"the student\" or \"User\") acknowledge and agree to the terms outlined in this Disclaimer and the associated dispute resolution procedures."
    },
    {
      title: "NATURE OF THE SERVICE",
      content: "The Services offered by Checkers Innovation Lab are designed to assist and provide the student with opportunities to practice and enhance their knowledge and skills. These Services are intended for educational purposes only. Checkers Innovation Lab does not guarantee the acquisition of any specific knowledge, skill, or educational outcome as a result of using the Services."
    },
    {
      title: "FINANCIAL TERMS",
      content: "Upon selecting a Service package, the student agrees to pay the full amount specified for the selected Service. In case of dissatisfaction with the provided Service, the Student may request a partial refund subject to minimum charges amounting to seventy percent (70%) of the total amount paid. These charges are retained to cover the costs associated with availing the Services."
    },
    {
      title: "RESPONSIBILITY OF UTILIZATION",
      content: "The student bears the sole responsibility for utilizing the provided Services to achieve maximum benefits. The effectiveness of the Service is contingent upon the student’s engagement, effort, and dedication to applying the resources and guidance provided."
    },
    {
      title: "NO GUARANTEES FOR EDUCATIONAL ACHIEVEMENT",
      content: "Checkers Innovation Lab makes no warranties or representations regarding the effectiveness of the Services in improving the student’s knowledge, skills, or academic performance. The student acknowledges that their ability to understand subject material or utilize the Services effectively is not guaranteed by Checkers Innovation Lab."
    },
    {
      title: "LIMITATION OF LIABILITY",
      content: "Checkers Innovation Lab shall not be liable for any failure on the part of the student to achieve desired academic outcomes, understand subject material, or any other aspects related to the student’s personal educational goals."
    },
    {
      title: "ACKNOWLEDGMENT AND DISPUTE RESOLUTION",
      content: "By opting for a Service package, the student acknowledges having read and understood this Disclaimer, agrees to its terms, and commits to following the dispute resolution procedures outlined in our Dispute Resolution Policy, ensuring a fair and efficient resolution process in case of any disagreements."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-10 px-4 md:px-12 lg:px-20 text-slate-900">
      <div className="w-full mx-auto">
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
          {/* Refined Header with Integrated Back Button */}
          <div className="px-8 md:px-16 py-10 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <button 
                onClick={() => navigate("/")}
                className="group inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span>RETURN TO HOME</span>
              </button>
              
              <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
                <span>POLICIES</span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-indigo-600/40 underline underline-offset-4">DISCLAIMER</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Disclaimer Policy
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 md:px-20 py-12 space-y-12">
            <p className="text-lg text-slate-600 leading-relaxed font-medium pb-8 border-b border-slate-100">
              This Disclaimer Policy outlines the terms and conditions regarding the educational 
              services provided by Checkers Innovation Lab. Please read this document carefully 
              before engaging with our services.
            </p>

            {sections.map((section, index) => (
              <section key={index} className="space-y-6">
                <h2 className="text-indigo-600 font-extrabold text-[11px] tracking-[0.2em] flex items-center gap-4">
                  SECTION {index + 1}: {section.title}
                  <div className="h-px flex-grow bg-slate-200/50" />
                </h2>
                <div className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold pl-0 md:pl-6 max-w-5xl">
                  {section.content}
                </div>
              </section>
            ))}

            <div className="pt-10 border-t border-slate-100 space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600 font-semibold text-sm">
                <div className="space-y-1">
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Address</p>
                  <p className="leading-relaxed">
                    M-5, Kumar Park View Cooperative Housing Society,<br />
                    Bibwewadi-Kondhwa Road, Pune, Maharashtra, India
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Email</p>
                    <a href="mailto:support@medhvrushti.com" className="hover:text-indigo-600 transition-colors">
                      support@medhvrushti.com
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Website</p>
                    <a href="https://www.medhvrushti.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      www.medhvrushti.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 md:px-20 py-10 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 tracking-widest uppercase">
            Checkers Innovation Lab © 2026. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
