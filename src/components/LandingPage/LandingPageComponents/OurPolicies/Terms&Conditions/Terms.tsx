import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "USER CONDUCT",
      content: [
        "You agree to use our products and services in compliance with all applicable laws, regulations, and these Terms and Conditions.",
        "You must not engage in any activity that may disrupt or interfere with the proper functioning of our products and services or compromise their security."
      ]
    },
    {
      title: "ACCOUNT REGISTRATION",
      content: [
        "You may be required to create an account to access certain features of our products and services.",
        "You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account."
      ]
    },
    {
      title: "PROTECTING YOUR IDENTITY",
      content: [
        "Do not share your account credentials or personal information with anyone else.",
        "Report any unauthorized access to your account immediately to support@medhvrushti.com"
      ]
    },
    {
      title: "PROPER USAGE",
      content: [
        "Our products and services are intended for various purposes. You agree to use them for their intended purpose and in a manner consistent with ethical and lawful conduct.",
        "Do not use our products and services to transmit or store any unlawful, offensive, or inappropriate content."
      ]
    },
    {
      title: "INTELLECTUAL PROPERTY RIGHTS",
      content: [
        "All content and materials provided through our products and services, including but not limited to text, graphics, logos, and software, are the property of Checkers Innovation Lab or its licensors and are protected by copyright and other intellectual property laws.",
        "You may not reproduce, distribute, modify, or create derivative works of any content without prior written consent from Checkers Innovation Lab."
      ]
    },
    {
      title: "DISCLAIMER OF WARRANTIES",
      content: [
        "Our products and services are provided on an \"as-is\" and \"as available\" basis. We make no warranties or representations regarding the accuracy, reliability, or completeness of any content or materials provided through our offerings.",
        "We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement."
      ]
    },
    {
      title: "LIMITATION OF LIABILITY",
      content: "In no event shall Checkers Innovation Lab be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our products and services, including but not limited to loss of data, loss of profits, or business interruption."
    },
    {
      title: "INDEMNIFICATION",
      content: "You agree to indemnify and hold harmless Checkers Innovation Lab, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, or expenses (including attorney's fees) arising out of or in connection with your use of our products and services or violation of these Terms and Conditions."
    },
    {
      title: "CHANGES TO TERMS AND CONDITIONS",
      content: "We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Any changes will be effective immediately upon posting on our website. It is your responsibility to review these Terms and Conditions periodically for updates or changes."
    },
    {
      title: "GOVERNING LAW",
      content: "These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts in India."
    },
    {
      title: "CONTACT US",
      content: (
        <>
          If you have any questions or concerns regarding these Terms and Conditions, please contact us at{" "}
          <a href="mailto:support@medhvrushti.com" className="text-indigo-600 hover:text-blue-600 transition-colors font-bold underline">
            support@medhvrushti.com
          </a>
          . Our customer support team will be happy to assist you and address any issues promptly.
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
                <span className="text-indigo-600/40 underline underline-offset-4">TERMS</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Terms & Conditions
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 md:px-20 py-12 space-y-12">
            <p className="text-lg text-slate-600 leading-relaxed font-medium pb-8 border-b border-slate-100">
              Welcome to Checkers Innovation Lab! These Terms and Conditions govern
              your access to and use of our products and services. By using our
              offerings, you agree to comply with these terms and conditions. Please
              read them carefully.
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

export default Terms;
