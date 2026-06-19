import { useContext } from 'react'
import Home from './LandingPageComponents/Home/Home'
import TopCategories from './LandingPageComponents/TopCategories/TopCategories'
import PopularCourses from './LandingPageComponents/PopularCourses/PopularCourses'
import ReviewSection from './LandingPageComponents/Review/ReviewSection'
import DownloadAppSection from './LandingPageComponents/Downloadapp/DownloadAppSection';
import WhyChooseUs from './LandingPageComponents/WhyChooseUs/WhyChooseUs'
import FAQSection from './LandingPageComponents/FAQ/FAQSection'
import InquiryForm from './LandingPageComponents/InquiryForm/InquiryForm'
import Footer from './LandingPageComponents/Footer/Footer'
import UserCourses from './LandingPageComponents/UserCourse/UserCourses'
import { UserContext } from '../../App'
import { LandingPageNavbar } from './LandingPageComponents/Home/LandingPageNavbar'

const LandingPage = () => {
  const { state } = useContext(UserContext);
  return (
    <div>
      <LandingPageNavbar />
      <Home />
      {state.isAuthenticated ? (
        <UserCourses />
      ) : (
        <TopCategories />
      )}

      <PopularCourses />
      <ReviewSection />
      <DownloadAppSection />
      <WhyChooseUs />
      <FAQSection />
      {/* <InquiryForm /> */}
      <Footer />
    </div>
  )
}

export default LandingPage;
