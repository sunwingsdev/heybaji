import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "aos/dist/aos.css";
import Aos from "aos";
import Hero from "../../components/become-an-affiliate/Hero";
import Contact from "../../components/become-an-affiliate/Contact";
import AffiliateHeader from "../../components/become-an-affiliate/AffiliateHeader";

const BecomeAnAffiliate = () => {
  const location = useLocation();
  useEffect(() => {
    Aos.init({
      duration: 1600, // Animation duration in milliseconds
    });
  }, []);

  // Check if the current path is for Login or Sign Up
  const isLoginOrSignUpPage =
    location.pathname === "/login" || location.pathname === "/sign";

  return (
    <div className="flex flex-col min-h-screen bg-SiteBg text-white">
      {/* Show Header only if not on Login or Sign Up page */}
      {!isLoginOrSignUpPage && <AffiliateHeader />}

      {/* Main Content */}
      <div className="flex-grow">
        <Hero />
        <Outlet />
        <Contact />
      </div>
    </div>
  );
};

export default BecomeAnAffiliate;
