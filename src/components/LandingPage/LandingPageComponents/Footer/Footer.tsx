import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { UserContext } from "../../../../App";

const Footer = () => {
  const { setCurrentStep } = useContext(UserContext);
  const navigate = useNavigate();

  const policyLinks = [
    { name: 'Privacy Policy', path: '/privacypolicy' },
    { name: 'Return Policy', path: '/returnpolicy' },
    { name: 'Terms & Conditions', path: '/terms&condition' },
    { name: 'Dispute Resolution', path: '/disputes' },
    { name: 'Disclaimer', path: '/disclaimer' }
  ];

  return (
    <footer className="bg-white text-slate-600 px-6 lg:px-12 py-20 border-t border-slate-100 font-sans w-full">
      <div className=" mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Logo & Intro */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
              Mind<span className="text-indigo-600">Shaala</span>
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8 text-center md:text-left">
              We’re always in search for talented and motivated people. Don’t be shy, introduce yourself!
            </p>
            <div className="flex gap-4">
              {[FaYoutube, FaFacebookF, FaInstagram, FaXTwitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm">
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Link */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">Quick Link</h3>
            <ul className="space-y-4 font-bold text-slate-500">
              {['My Dashboard', 'About us', 'Course', 'Contact'].map((link) => (
                <li key={link} className="hover:text-indigo-600 cursor-pointer transition-colors" 
                  onClick={() => {
                    console.log("Footer: Clicking quick link:", link);
                    if (link === 'My Dashboard') {
                        setCurrentStep('login');
                        navigate("/");
                    } else {
                        setCurrentStep('landing');
                        navigate("/");
                    }
                  }}>
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Our Policies */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">Our Policies</h3>
            <ul className="space-y-4 font-bold text-slate-500">
              {policyLinks.map((policy) => (
                <li 
                    key={policy.name} 
                    className="hover:text-indigo-600 cursor-pointer transition-colors" 
                    onClick={() => {
                        console.log("Footer: Clicking policy:", policy.name, "path:", policy.path);
                        navigate(policy.path);
                    }}
                >
                  {policy.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-4 font-bold text-slate-500">
              <p className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-indigo-600">P:</span> +91 797 212 9040
              </p>
              <p className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-indigo-600">E:</span> info@checkerslab.com
              </p>
              <p className="leading-relaxed mt-4 max-w-[250px]">
                M-5, Kumar Park View Society, Kenjale Nagar, Bibwewadi–Kondhwa Road, Pune - 411037
              </p>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex justify-center text-center">
          <p className="font-bold text-slate-400 text-sm">
            Copyright © 2026 <span className="text-indigo-600">MindShaala</span>. All Rights Reserved.
          </p>
          {/* <div className="flex items-center gap-6">
            <button 
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              onClick={() => {
                console.log("Footer: Clicking Contact Us -> landing");
                setCurrentStep("landing");
              }}
            >
              Contact Us
            </button>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
