import { ExternalLink } from 'lucide-react';

interface FooterProps {
  onContactClick: () => void;
}

export function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="bg-[#1E293B] text-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          <div className="md:pr-8 lg:pr-12">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">About Ride United</h3>
            <p className="text-gray-300 text-sm opacity-80 mb-3 sm:mb-4">
              An experience platform built for my community - connecting electric unicycle riders across the greater Boston area.
            </p>
            <p className="text-gray-400 text-sm">
              © 2025 Zach Abelson
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Photos by Jan Bloch Photography
            </p>
          </div>
          
          <div className="md:pl-8 lg:pl-12">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#new-rider-guide" 
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1"
                >
                  New Rider Guide
                </a>
              </li>
              <li>
                <a 
                  href="#upcoming-rides" 
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1"
                >
                  Upcoming Rides
                </a>
              </li>
              <li>
                <a 
                  href="#for-ride-leaders" 
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1"
                >
                  Route & Event Creator
                </a>
              </li>
              <li>
                <button 
                  onClick={onContactClick}
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1 text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a 
                  href="/pitch" 
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1"
                >
                  Pitch Deck
                </a>
              </li>
              <li>
                <a 
                  href="/admin" 
                  className="text-gray-300 hover:text-[#10B981] transition-colors text-sm flex items-center gap-1"
                >
                  Admin Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}