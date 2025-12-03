import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Home, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import floatPosterImg from 'figma:asset/d7fb4ac7b11f68a7d4a47df152f105027fbb5b30.png';
import smartRouteImg from 'figma:asset/94e9da9c7fcada21ae7a564c0c7b0ab058150ba3.png';
import eventsTopImg from 'figma:asset/880273039797459c8adc3b76cec06fe685a2e434.png';
import eventsBottomImg from 'figma:asset/5b54bc060c9ea0920f0702768f881da3446564a3.png';
import adminDashboardImg from 'figma:asset/e059760f99fa62fc0795c8e537347a66daeec883.png';
import businessCardImg from 'figma:asset/21ee3f32e46475ba242bc792bd5746b1bb262530.png';
import ruLogoImg from 'figma:asset/83d0917cf2593b3c51096e2542a4919957b4c8f9.png';

// Placeholders - please replace with the actual uploaded assets
const FLOAT_POSTER = floatPosterImg;
const ROUTE_CREATOR_UI = smartRouteImg;
const UPCOMING_RIDES_UI = eventsTopImg;
const CALENDAR_UI = eventsBottomImg;
const ADMIN_UI = adminDashboardImg;
const BUSINESS_CARD = businessCardImg;
const RU_LOGO = ruLogoImg;

export function PitchPresentation() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 7;

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides) setCurrentSlide(c => c + 1);
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) setCurrentSlide(c => c - 1);
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        // Prevent default space scrolling
        if (e.key === ' ') e.preventDefault();
        nextSlide();
      }
      if (e.key === 'ArrowLeft') prevSlide();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getSlideClass = (slideNum: number) => {
    const base = "absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-4 md:p-8 transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto md:overflow-hidden";
    if (slideNum === currentSlide) {
      return `${base} opacity-100 translate-y-0 scale-100 pointer-events-auto z-10`;
    }
    return `${base} opacity-0 translate-y-[30px] scale-95 pointer-events-none`;
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1E293B] font-sans text-[#F8FAFC] z-50">
      {/* SLIDE 1: HERO */}
      <div className={`${getSlideClass(1)} bg-white text-[#1E293B] !justify-center pt-0 text-center`}>
        <div className="flex flex-col justify-center items-center h-full">
          <h1 
            className="text-[4rem] sm:text-[6rem] md:text-[9rem] font-black uppercase leading-[0.9] md:leading-[0.85] text-[#1E293B] mb-8 md:mb-12 tracking-[-2px] md:tracking-[-4px]"
            style={{ textShadow: '0.075em 0.075em 0px rgba(16, 185, 129, 0.5), 0.15em 0.15em 0px rgba(16, 185, 129, 0.5)' }}
          >
            Ride <span className="inline-block w-1 md:w-2"></span> United
          </h1>
          <p className="text-xl sm:text-2xl md:text-[1.75rem] max-w-[90%] md:max-w-[800px] text-[#64748b] font-medium leading-tight mx-auto px-4">
            The ultimate experience platform for the <br className="hidden md:block" />
            modern electric unicycle rider
            <br className="block my-12 md:my-16" />
            <span className="text-[#10B981]">Connect | Master | Discover</span>
          </p>
        </div>
      </div>

      {/* SLIDE 2: THE VISION */}
      <div className={`${getSlideClass(2)} !p-0 bg-[#1E293B] text-white`}>
        <div className="w-full h-full relative flex flex-col items-center p-4 md:p-8">
          {/* Top Left Label */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10">
            <h3 className="text-[#10B981] uppercase tracking-[3px] text-sm md:text-base font-bold">The Problem</h3>
          </div>
          
          {/* Centered Header - Now Flex Row for Content */}
          <div className="flex flex-col md:flex-row items-center justify-center w-full h-full max-w-[1400px] gap-8 md:gap-16 mt-12 md:mt-0">
            
            {/* Left Side: Text */}
            <div className="flex-1 text-left z-10">
              <h2 className="text-4xl md:text-[3.5rem] font-extrabold mb-6 md:mb-8 leading-[1.1] text-white">
                A Stagnant Community
              </h2>
              <div className="space-y-6 text-lg md:text-[1.25rem] opacity-80 leading-relaxed">
                <p>
                  Boston is home to nearly 100 electric unicycle riders, but we're coming together as a community less often recently. While the talent and interest are here, we lack the cohesion seen in other major cities.
                </p>
                <p>
                  The passion exists, but the network is missing. Without a central hub for communication and organization, it's difficult for veterans to lead and for newcomers to join. We have the riders; we just need the connection.
                </p>
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="flex-1 flex items-center justify-center h-full max-h-[50vh] md:max-h-[70vh]">
              <ImageWithFallback 
                src={FLOAT_POSTER} 
                alt="Float Past the Friction Poster" 
                className="h-full w-auto max-h-full shadow-2xl object-contain rounded-lg scale-110"
              />
            </div>

          </div>
        </div>
      </div>

      {/* SLIDE 3: PROCESS */}
      <div className={`${getSlideClass(3)} bg-[#F1F5F9] text-[#1E293B]`}>
        <div className="w-full max-w-[1400px] h-full relative flex flex-col items-center justify-center pt-16 md:pt-20 pb-8 px-4 md:px-8">
           {/* Top Left Label */}
           <div className="absolute top-6 left-6 md:top-10 md:left-10">
            <h3 className="text-[#10B981] uppercase tracking-[3px] text-sm md:text-base font-bold">The Process</h3>
          </div>

          <div className="text-center max-w-[800px] mb-8 md:mb-16 shrink-0 mt-8 md:mt-12 absolute top-[calc(15%-50px)]">
            <h2 className="text-[#1E293B] text-3xl md:text-[3.5rem] font-extrabold leading-[1.1]">Revitalizing the Ecosystem</h2>
            <p className="text-[#64748b] text-lg md:text-[1.2rem] mt-2 md:mt-4">Ride United fixes this by providing tools for both the veterans and the newcomers</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full overflow-y-auto md:overflow-visible min-h-0 pb-12 md:pb-0 justify-center mt-[200px]">
            {[
              {
                title: "For Leaders",
                text: "We empower experienced riders with an intuitive mapping system to easily create, share, and lead group rides—removing the friction of organization."
              },
              {
                title: "For Newcomers",
                text: "We provide a dedicated New Rider Guide to help beginners start safely. It's about lowering the barrier to entry for the average person."
              },
              {
                title: "For Growth",
                text: "Physical business cards and posters bridge the digital gap, allowing us to recruit curious onlookers and turn them into active community members."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 bg-white p-6 md:p-10 rounded-2xl shadow-lg border-t-[6px] border-[#10B981] hover:-translate-y-1 transition-transform duration-300 flex flex-col">
                <h4 className="text-xl md:text-2xl font-extrabold mb-2 md:mb-4 text-[#1E293B]">{item.title}</h4>
                <p className="text-[#475569] leading-relaxed text-base md:text-[1.1rem]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLIDE 4: TECH & SCREENSHOTS */}
      <div className={`${getSlideClass(4)} bg-[#F8FAFC] text-[#1E293B] !justify-start md:!justify-center`}>
        <div className="w-full max-w-[1600px] h-full relative flex flex-col items-center justify-center pt-16 md:pt-20 pb-4 px-4 md:px-8">
          {/* Top Left Label */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10">
            <h3 className="text-[#10B981] uppercase tracking-[3px] text-sm md:text-base font-bold">The Solution</h3>
          </div>

          <div className="text-center mb-10 md:mb-14 shrink-0 mt-8 md:mt-12 absolute top-[calc(15%-50px)]">
            <h2 className="text-[#1E293B] text-3xl md:text-[3.5rem] font-extrabold leading-[1.1]">Ride United Platform</h2>
             <p className="text-[#64748b] text-lg md:text-[1.2rem] mt-2 md:mt-4">Powered by modern tech</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full h-[60vh] md:h-[60vh] min-h-[400px] mt-[200px]">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl hover:border-[#10B981] transition-all duration-300 group h-full">
              <div className="h-[55%] bg-[#f1f5f9] overflow-hidden border-b border-[#e2e8f0] relative shrink-0">
                <ImageWithFallback 
                  src={ROUTE_CREATOR_UI} 
                  alt="Route Creator UI" 
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-2">Smart Route Creator</h3>
                <p className="text-[#64748b] leading-normal text-sm md:text-[0.95rem] mb-4 line-clamp-3">
                  Interactive mapping with Mapbox GL. Auto-calculates distance and estimates ride time for PEVs.
                </p>
                <div className="mt-auto flex gap-2 flex-wrap">
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">Mapbox</span>
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">Geocoding</span>
                </div>
              </div>
            </div>

            {/* Feature 2 (COLLAGE) */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl hover:border-[#10B981] transition-all duration-300 group h-full">
              <div className="h-[55%] bg-[#f1f5f9] overflow-hidden border-b border-[#e2e8f0] relative flex flex-col shrink-0">
                <div className="h-1/2 overflow-hidden border-b border-[#e2e8f0]">
                  <ImageWithFallback src={UPCOMING_RIDES_UI} alt="Ride Card Modal" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="h-1/2 overflow-hidden">
                  <ImageWithFallback src={CALENDAR_UI} alt="Calendar View" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-2">Community Events</h3>
                <p className="text-[#64748b] leading-normal text-sm md:text-[0.95rem] mb-4 line-clamp-3">
                  Dynamic event feed powered by Supabase. Filter by skill level (Beginner/Advanced).
                </p>
                <div className="mt-auto flex gap-2 flex-wrap">
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">React</span>
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">Postgres</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl hover:border-[#10B981] transition-all duration-300 group h-full">
              <div className="h-[55%] bg-[#f1f5f9] overflow-hidden border-b border-[#e2e8f0] relative shrink-0">
                <ImageWithFallback 
                  src={ADMIN_UI} 
                  alt="Admin UI" 
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-2">Administrative Dashboard</h3>
                <p className="text-[#64748b] leading-normal text-sm md:text-[0.95rem] mb-4 line-clamp-3">
                  Dedicated approval workflows to ensure route safety and quality control.
                </p>
                <div className="mt-auto flex gap-2 flex-wrap">
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">Auth</span>
                  <span className="bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase">Edge Functions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE 5: MARKETING */}
      <div className={`${getSlideClass(5)} bg-[#1E293B] text-white bg-[radial-gradient(circle_at_70%_50%,#334155_0%,#1E293B_100%)]`}>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center max-w-[1400px] px-8 w-full">
          <div className="flex-1 text-center md:text-left order-2 md:order-1">
            <h2 className="text-5xl md:text-[5rem] font-bold leading-tight">
              Scan<br />Ride<br /><span className="text-[#10B981]">Connect</span>
            </h2>
            <p className="text-xl md:text-[1.5rem] mt-6 md:mt-8 opacity-80 font-light">
              Bridging the gap between the curious observer and the active rider
            </p>
          </div>
          <div className="w-full max-w-[350px] md:max-w-[550px] shadow-2xl rounded-[15px] -rotate-3 hover:rotate-0 hover:scale-102 transition-all duration-500 border-[4px] border-white/5 order-1 md:order-2">
             <ImageWithFallback src={BUSINESS_CARD} alt="Business Card" className="w-full rounded-[11px]" />
          </div>
        </div>
      </div>

      {/* SLIDE 6: IMPACT */}
      <div className={`${getSlideClass(6)} bg-[#F8FAFC] text-[#1E293B]`}>
        <div className="w-full max-w-[1600px] h-full relative flex flex-col items-center justify-center pt-16 md:pt-20 pb-4 px-4 md:px-8">
           {/* Top Left Label */}
           <div className="absolute top-6 left-6 md:top-10 md:left-10">
            <h3 className="text-[#10B981] uppercase tracking-[3px] text-sm md:text-base font-bold">The Impact</h3>
          </div>

          <div className="text-center mb-12 md:mb-20 shrink-0 mt-8 md:mt-12 absolute top-[calc(15%-50px)]">
            <h2 className="text-[#1E293B] text-3xl md:text-[3rem] font-bold leading-tight">Building the Future of Urban Mobility</h2>
            <p className="text-[#64748b] text-lg md:text-[1.2rem] mt-2 md:mt-4">Connecting riders everywhere</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full min-h-0 pb-12 md:pb-0 mt-[200px]">
            {[
              { val: "∞", label: "Routes", desc: "An ever-expanding library of user-generated paths. From scenic river runs to technical urban shortcuts, the possibilities are limitless." },
              { val: <Globe className="w-16 h-16 md:w-20 md:h-20 mx-auto" />, label: "Any Rider", desc: "Born in Boston, built for the world. A scalable architecture ready for any community that moves.", icon: true },
              { val: "24/7", label: "Community Access", desc: "Always on, always connected. A dedicated digital space that never sleeps, fostering engagement long after the ride ends." }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 md:p-12 bg-white rounded-[20px] flex flex-col justify-center shadow-lg border border-slate-100 hover:-translate-y-2 hover:shadow-xl hover:border-[#10B981] transition-all duration-300">
                <div className={`font-black leading-none mb-2 text-[#10B981] ${stat.icon ? 'flex justify-center items-center py-2' : 'text-6xl md:text-[5rem]'}`}>
                  {stat.val}
                </div>
                <h3 className="text-lg md:text-[1.25rem] font-bold text-[#1E293B]">{stat.label}</h3>
                <p className="text-[#64748b] mt-2 text-sm md:text-base">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLIDE 7: CLOSING */}
      <div className={`${getSlideClass(7)} bg-[#10B981] text-white bg-[linear-gradient(135deg,#10B981_0%,#047857_100%)]`}>
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl md:text-[8rem] font-black leading-[0.9] mb-6 md:mb-8 drop-shadow-2xl">
            LET'S<br />RIDE
          </h1>
          <p className="text-lg md:text-[1.5rem] opacity-90 font-medium">Designed & Developed by Zach Abelson</p>
          <a 
            href="https://zachabelson.com"
            className="mt-8 md:mt-12 bg-white text-[#10B981] px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-lg md:text-[1.2rem] hover:scale-105 transition-transform shadow-lg"
          >
            Explore Ride United
          </a>
        </div>
      </div>

      {/* LOGO */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <ImageWithFallback 
          src={RU_LOGO} 
          alt="Ride United Logo" 
          className="w-6 md:w-8 h-auto"
        />
      </div>

      {/* CONTROLS */}
      <div className="fixed bottom-8 right-8 z-[100] flex gap-4">
        <a 
          href="https://zachabelson.com"
          className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-white rounded-full flex items-center justify-center text-[#1E293B] shadow-md hover:text-[#10B981] hover:scale-110 transition-all"
          aria-label="Return to Website"
        >
          <Home className="w-5 h-5 md:w-6 md:h-6" />
        </a>
        <button 
          onClick={prevSlide}
          className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-white rounded-full flex items-center justify-center text-[#1E293B] shadow-md transition-all ${currentSlide === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#10B981] hover:scale-110'}`}
          aria-label="Previous Slide"
          disabled={currentSlide === 1}
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <button 
          onClick={nextSlide}
          className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-white rounded-full flex items-center justify-center text-[#1E293B] shadow-md transition-all ${currentSlide === totalSlides ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#10B981] hover:scale-110'}`}
          aria-label="Next Slide"
          disabled={currentSlide === totalSlides}
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
}