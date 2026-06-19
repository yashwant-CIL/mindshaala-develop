import React, { useContext, useState } from "react";
import logo from "../../../../assets/Mindshaala.png";
import { UserContext } from "../../../../App";

export const LandingPageNavbar = () => {
  const { setCurrentStep } = useContext(UserContext);

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo on the Left */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => {
              console.log("Navbar: Clicking logo -> landing");
              setCurrentStep("landing");
            }}
          >
            <img 
              src={logo} 
              alt="Mindshaala" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* Login and Register on the Right */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                console.log("Navbar: Clicking Login -> login");
                setCurrentStep("login");
              }}
              className="px-6 py-2.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => {
                console.log("Navbar: Clicking Sign up -> register");
                setCurrentStep("register");
              }}
              className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
