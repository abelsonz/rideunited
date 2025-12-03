import { Button } from "./ui/button";
import heroImage from "figma:asset/4b613c21c9606e110c5c2321bdc4c216a120b9dc.png";

export function HeroSection() {
  return (
    <section className="relative bg-white h-[600px] lg:h-[800px] w-full overflow-hidden flex flex-col justify-between pb-20 pt-16">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-[center_40%]"
        style={{ 
          backgroundImage: `url(${heroImage})`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
      </div>

      {/* Title Container - Positioned at the top */}
      <div className="relative w-full px-4 md:px-[100px]">
        <h1 
          className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-none font-black text-center uppercase tracking-tighter w-full" 
          style={{ textShadow: '0.075em 0.075em 0px rgba(16, 185, 129, 0.5), 0.15em 0.15em 0px rgba(16, 185, 129, 0.5)' }}
        >
          Ride <span className="inline-block w-[0.2em]"></span> United
        </h1>
      </div>
      
      {/* Description - Positioned at the bottom */}
      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-[100px] flex justify-center">
        <p className="text-white/90 text-lg sm:text-xl md:text-2xl font-medium drop-shadow-lg text-center max-w-6xl">
          Whether you're a seasoned pro or just curious about life on one wheel, Ride United is your home base. Connect with local riders, master the basics, and discover your city together.
        </p>
      </div>
    </section>
  );
}
