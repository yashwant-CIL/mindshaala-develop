import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiBookOpen, FiPhoneCall, FiBook } from "react-icons/fi";
import Inquiryphoto from "../../../../assets/images/inqury.webp";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LandingpageService } from "../../../../services/LandingpageService";

const InquiryForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    PhoneNumber: "",
    email: "",
    course: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_URL}/v1/cil/courses/get/all`
        // );
        const data = await LandingpageService.getInquiryCourses();
        if (data && Array.isArray(data)) {
          setCourses(data);
        }
      } catch (err) {
        setError("Failed to load courses");
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
    // Fetch IP address
    const fetchIp = async () => {
      try {
        const res = await axios.get("https://api.ipify.org?format=json");
        setIpAddress(res.data.ip);
      } catch (e) {
        setIpAddress("");
      }
    };
    fetchIp();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validation helpers
  const isValidEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const isValidMobile = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email address";
    if (!form.PhoneNumber.trim()) newErrors.PhoneNumber = "Mobile number is required";
    else if (!isValidMobile(form.PhoneNumber)) newErrors.PhoneNumber = "Invalid mobile number";
    if (!form.course) newErrors.course = "Please select a course";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
      toast.warn("Please fix the errors in the form.", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'colored',
      });
      return;
    }
    try {
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        email_address: form.email,
        mobile_number: form.PhoneNumber,
        ip_address: ipAddress,
        course_id: form.course,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/v1/cil/courseEnquiry/add`,
        payload
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Inquiry submitted successfully! Redirecting to courses...", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: 'colored',
        });
        setForm({
          firstName: "",
          lastName: "",
          PhoneNumber: "",
          email: "",
          course: "",
        });
        setErrors({});

        // Navigate to courses page after successful submission
        setTimeout(() => {
          navigate("/courses");
        }, 2000); // Wait 2 seconds for user to see success message
      } else {
        toast.error("Failed to submit inquiry. Please try again.", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: 'colored',
        });
      }
    } catch (err) {
      toast.error("Failed to submit inquiry. Please try again.", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'colored',
      });
      console.error("Inquiry submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#f8fafc]">
      <div className=" mx-auto">
        <div className="text-center mb-16">
          <h4 className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold mb-4 text-sm uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
            <FiBook className="text-indigo-400" />Education For Everyone
          </h4>
          <h2 className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight">
            Get Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Course
            </span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-24">
          {/* Left: Form */}
          <div className="flex-1 flex flex-col justify-center">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                    <FiUser className="text-indigo-400 mr-3" />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
                    />
                  </div>
                  {errors.firstName && <span className="text-red-500 text-xs ml-4 mt-1 font-bold">{errors.firstName}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                    <FiUser className="text-indigo-400 mr-3" />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
                    />
                  </div>
                  {errors.lastName && <span className="text-red-500 text-xs ml-4 mt-1 font-bold">{errors.lastName}</span>}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                  <FiPhoneCall className="text-indigo-400 mr-3" />
                  <input
                    type="tel"
                    name="PhoneNumber"
                    placeholder="Enter Phone Number"
                    value={form.PhoneNumber}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
                  />
                </div>
                {errors.PhoneNumber && <span className="text-red-500 text-xs ml-4 mt-1 font-bold">{errors.PhoneNumber}</span>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                  <FiMail className="text-indigo-400 mr-3" />
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter Email"
                    value={form.email}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs ml-4 mt-1 font-bold">{errors.email}</span>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                  <FiBookOpen className="text-indigo-400 mr-3" />
                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-slate-700 font-medium appearance-none"
                    disabled={loading || !!error}
                  >
                    {loading && <option>Loading...</option>}
                    {error && <option>{error}</option>}
                    {!loading && !error && (
                      <>
                        <option value="">Select a Course</option>
                        {courses.map((course) => (
                          <option key={course.course_id} value={course.course_id}>
                            {course.course_name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                {errors.course && <span className="text-red-500 text-xs ml-4 mt-1 font-bold">{errors.course}</span>}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Get Your Course"}
              </button>
            </form>
          </div>

          {/* Right: Image */}
          <div className="flex-1 flex items-center justify-center lg:justify-end relative">
            <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <img
              src={Inquiryphoto}
              alt="Students collaborating"
              className="relative z-10 rounded-[3rem] w-full max-w-lg h-[500px] object-cover shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
