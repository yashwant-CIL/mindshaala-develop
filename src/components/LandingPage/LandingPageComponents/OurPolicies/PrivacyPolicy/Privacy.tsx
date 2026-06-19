import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "DATA SECURITY",
      content: "We employ industry-standard security measures to protect your data from unauthorized access, disclosure, alteration, or destruction. All data transmission between your device and our servers is encrypted using Secure Socket Layer (SSL) technology."
    },
    {
      title: "DATA USAGE",
      content: "Any data collected is used solely for the purpose of improving our services and enhancing the user experience. We do not share, sell, or disclose any data to third parties unless required by law or with your explicit consent."
    },
    {
      title: "DATA INTEGRITY",
      content: (
        <>
          We maintain the integrity and accuracy of data by regularly updating and reviewing our systems and processes. You have the right to request access to, update, or delete any data collected by contacting us at{" "}
          <a href="mailto:support@medhvrushti.com" className="text-indigo-600 hover:text-blue-600 transition-colors font-bold underline">
            support@medhvrushti.com
          </a>
        </>
      )
    },
    {
      title: "THIRD-PARTY SERVICES",
      content: "Our services may integrate with third-party tools or services for analytics, advertising, or other purposes. We are not responsible for the privacy practices or policies of these third-party services. Please review their respective privacy policies for more information."
    },
    {
      title: "CHILDREN'S PRIVACY",
      content: "Our services are not intended for children under the age of 13. We do not knowingly collect or solicit personal information from children."
    },
    {
      title: "CHANGES TO PRIVACY POLICY",
      content: "We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting on our website. It is your responsibility to review this Privacy Policy periodically for updates or changes."
    },
    {
      title: "CONSENT",
      content: "By using our services, you consent to the terms of this Privacy Policy and agree to abide by its provisions."
    },
    {
      title: "CONTACT US",
      content: (
        <>
          If you have any questions or concerns regarding our Privacy Policy or data practices, please contact us at{" "}
          <a href="mailto:support@medhvrushti.com" className="text-indigo-600 hover:text-blue-600 transition-colors font-bold underline">
            support@medhvrushti.com
          </a>
          . Our dedicated support team will be happy to assist you and address any issues promptly.
        </>
      )
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
                <span className="text-indigo-600/40 underline underline-offset-4">PRIVACY</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Privacy Policy
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 md:px-20 py-12 space-y-12">
            <p className="text-lg text-slate-600 leading-relaxed font-medium pb-8 border-b border-slate-100">
              Thank you for choosing Checkers Innovation Lab for your educational and other product needs.
              We are committed to protecting the privacy and security of your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
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
          </div>

          {/* Footer */}
          <div className="px-8 md:px-20 py-10 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 tracking-widest uppercase">
            Checkers Innovation Lab © 2026. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
