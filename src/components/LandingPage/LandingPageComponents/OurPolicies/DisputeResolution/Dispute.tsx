import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dispute = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "CONTACT US FIRST",
      content: (
        <>
          If any issues arise, reach out to our team at{" "}
          <a href="mailto:support@medhvrushti.com" className="text-indigo-600 hover:text-blue-600 transition-colors font-bold underline">
            support@medhvrushti.com
          </a>
          . Share the problem and relevant documents to collaborate on finding a solution.
        </>
      )
    },
    {
      title: "NOTIFY US OF THE ISSUE",
      content: "If the problem persists, inform us in writing about the issue. Explain the situation, propose a solution, and commit to working in good faith to address the matter."
    },
    {
      title: "SEEK RESOLUTION",
      content: "If the dispute remains unresolved after 15 days from the written notice, either party may propose mediation. We will work together to choose a mediator, and the mediation costs will be shared equally, following established mediation practices."
    },
    {
      title: "NEUTRAL ARBITRATION",
      content: "If mediation doesn't bring a resolution, both parties agree to binding arbitration. An impartial arbitrator, chosen through established practices, will decide the matter. The decision is final, enforceable in any competent court. Both parties agree to individual arbitration, without class or collective proceedings."
    },
    {
      title: "GOVERNING LAW",
      content: "This agreement is governed by the laws of India, without considering conflict of law's provisions."
    },
    {
      title: "TIME LIMIT ON CLAIMS",
      content: "Except for disputes related to intellectual property rights, no claims, suits, or actions may be initiated more than one month after the cause of action has arisen, or any longer period specified under the applicable statute of limitations."
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
                <span className="text-indigo-600/40 underline underline-offset-4">DISPUTE</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Dispute Resolution
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 md:px-20 py-12 space-y-12">
            <p className="text-lg text-slate-600 leading-relaxed font-medium pb-8 border-b border-slate-100">
              Business dispute resolution involves applying various provisions and
              processes, as set forth by law, to settle differences of opinion with
              our users. It offers a faster and more cost-effective alternative to
              pursuing business litigation.
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

            <div className="pt-10 border-t border-slate-100 italic text-slate-500 font-medium text-center text-sm leading-relaxed">
              "Business dispute resolution, focusing on mediation and arbitration, ensures a collaborative environment with users, preserving relationships, providing cost savings, and improving outcomes over traditional legal proceedings."
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

export default Dispute;
