import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "REFUND ELIGIBILITY",
      content: [
        "Refunds are eligible for educational packages within 30 days of the original purchase date.",
        "To request a refund, email us at support@medhvrushti.com within the specified timeframe.",
        "Refunds are applicable only if the educational package has not been accessed or used."
      ]
    },
    {
      title: "REFUND PROCESS",
      content: [
        "Once your refund request is approved, the refund amount will be calculated as follows:",
        "Total amount paid for the educational package minus any transaction fees.",
        "The remaining amount after deducting transaction fees will be refunded to the original payment method."
      ]
    },
    {
      title: "BANK TRANSACTION FEES",
      content: "Bank transaction fees incurred during the original purchase and refund process will be deducted from the refund amount."
    },
    {
      title: "REFUND TIMELINE",
      content: "Refunds will be processed within 7 business days of receiving the refund request. Allow additional time for the refunded amount to reflect in your account."
    },
    {
      title: "CONTACT US FOR RETURNS",
      content: (
        <>
          If you have any questions or concerns, contact us at{" "}
          <a href="mailto:support@medhvrushti.com" className="text-indigo-600 hover:text-blue-600 transition-colors font-bold underline">
            support@medhvrushti.com
          </a>
          .
        </>
      )
    },
    {
      title: "POLICY CHANGES",
      content: "Checkers Innovation Lab reserves the right to modify this Refund Policy at any time without prior notice. Changes will be effective immediately upon posting on our website."
    },
    {
      title: "ACCEPTANCE OF TERMS",
      content: "By purchasing our products, you acknowledge and agree to abide by the terms of this Refund Policy. This Refund Policy is governed by the laws of India."
    },
    {
      title: "CUSTOMER RESPONSIBILITY",
      content: "Ensure the correct product is selected before purchase. Dissatisfaction post-purchase does not qualify for a refund if the product has been accessed or used."
    },
    {
      title: "NON-TRANSFERABLE",
      content: "Refunds are non-transferable and only applicable to the original purchaser."
    },
    {
      title: "FAIR USAGE POLICY",
      content: "Refunds granted only for genuine dissatisfaction with the product or service quality."
    },
    {
      title: "EXCEPTIONAL CIRCUMSTANCES",
      content: "In cases like technical issues preventing access, alternative solutions may be offered at our discretion."
    },
    {
      title: "CANCELLATION POLICY",
      content: "Once a refund is processed, access to the corresponding educational package will be canceled."
    },
    {
      title: "PROMOTIONAL PACKAGES",
      content: "Refunds not applicable to packages purchased during promotional periods unless stated otherwise."
    },
    {
      title: "SEVERABILITY",
      content: "If any provision is deemed invalid, the remaining provisions remain in effect."
    },
    {
      title: "LANGUAGE",
      content: "In case of discrepancies, the English version prevails."
    },
    {
      title: "CUSTOMER FEEDBACK",
      content: "Share your experience to help us improve our services. We value your feedback as we continue to grow."
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
                <span className="text-indigo-600/40 underline underline-offset-4">REFUND</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Refund Policy
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 md:px-20 py-12 space-y-12">
            <p className="text-lg text-slate-600 leading-relaxed font-medium pb-8 border-b border-slate-100">
              Thank you for choosing Checkers Innovation Lab for your educational and other product needs. 
              We are committed to providing high-quality products and services. 
              Please carefully read our Refund Policy to understand your rights and obligations.
            </p>

            {sections.map((section, index) => (
              <section key={index} className="space-y-6">
                <h2 className="text-indigo-600 font-extrabold text-[11px] tracking-[0.2em] flex items-center gap-4">
                  SECTION {index + 1}: {section.title}
                  <div className="h-px flex-grow bg-slate-200/50" />
                </h2>
                <div className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold pl-0 md:pl-6 max-w-5xl">
                  {Array.isArray(section.content) ? (
                    <ul className="space-y-4">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600/30 mt-2.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    section.content
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="px-8 md:px-20 py-10 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 tracking-widest uppercase">
            Checkers Innovation Lab © 2026. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
