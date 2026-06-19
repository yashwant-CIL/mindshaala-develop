import { useState } from "react";
import { FiBook } from "react-icons/fi";
import personImage1 from "../../../../assets/FaqMan.webp";
import personImage2 from "../../../../assets/Faqgirl.webp";

const faqs = [
  {
    question: "How do I enroll in a course?",
    points: [
      "Go to the “Courses” tab located in the top-right menu.",
      "Browse and select the course you want to join.",
      "Choose your preferred package and click “Enroll.”",
    ],
  },
  {
    question: "Can I access my courses on mobile devices?",
    points: [
      "Log into the app on your mobile device.",
      "Tap the Profile icon in the top-right corner to open the menu.",
      "Go to “Courses,” pick your course and package, then tap “Enroll.”",
    ],
  },
  {
    question: "How long do I have access to a course?",
    points: [
      "Access duration depends on the course’s defined period.",
      "You can review the exact validity on the course details page.",
    ],
  },
  {
    question: "Will I get instant results after completing a test?",
    points: [
      "Results appear immediately after you submit a test.",
      "You can revisit the Results section anytime for past attempts.",
    ],
  },
  {
    question: "Do you offer refunds if I'm not satisfied with a course?",
    points: [
      "Yes, refunds are available as per our refund policy.",
      "Review the refund policy page for eligibility and process steps.",
    ],
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-slate-50 py-24 px-6 lg:px-12">
      <div className=" mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 font-sans">
        <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="relative isolate">
             {/* Decorative blob */}
            <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="relative z-20 w-64 h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src={personImage2} alt="Woman pointing" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-20 -right-20 z-10 w-64 h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white hidden md:block transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <img src={personImage1} alt="Man with glasses" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="text-center lg:text-left mb-12">
            <h3 className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-4 text-sm uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
              <FiBook className="text-indigo-400" />
              Frequently Asked Questions
            </h3>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">Find Answers to Your Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`rounded-3xl border transition-all duration-300 ${
                    isOpen 
                      ? "bg-white border-indigo-200 shadow-xl shadow-indigo-500/5 translate-x-2" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <button
                    className="w-full flex justify-between items-center p-6 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? "text-indigo-600" : "text-slate-700"}`}>
                      {faq.question}
                    </span>
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-300 ${
                      isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isOpen ? "−" : "+"}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 animate-fadeIn">
                      <div className="border-t border-slate-50 pt-6">
                        <ul className="space-y-3">
                          {faq.points.map((point, index) => (
                            <li key={index} className="flex gap-3 text-slate-600 font-medium leading-relaxed">
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
