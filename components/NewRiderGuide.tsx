import { useState } from 'react';
import { HelpCircle, Shield, ListChecks, Scale } from 'lucide-react';
import { NewRiderDetailModal } from './NewRiderDetailModal';

interface NewRiderGuideProps {
  onContactClick?: () => void;
}

export function NewRiderGuide({ onContactClick }: NewRiderGuideProps) {
  const [selectedSection, setSelectedSection] = useState<'euc' | 'safety' | 'start' | 'laws' | null>(null);

  return (
    <section id="new-rider-guide" className="bg-white py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[#1E293B] text-3xl sm:text-4xl mb-8 sm:mb-12 text-center">New Rider Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Card 1 - What is an EUC */}
          <button 
            onClick={() => setSelectedSection('euc')}
            className="group bg-white border-2 border-[#10B981] rounded-lg p-6 sm:p-8 hover:shadow-xl hover:bg-[#ECFDF5] hover:scale-105 hover:border-[#059669] transition-all duration-200 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#10B981] flex items-center justify-center transition-colors duration-200">
                <HelpCircle className="w-6 h-6 text-[#10B981] group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <h3 className="text-[#1E293B] text-center mb-3">What is an EUC?</h3>
            <p className="text-[#1E293B] text-center opacity-70 text-sm sm:text-base">
              Electric Unicycles are self-balancing personal transportation devices that offer 
              an exciting way to explore your city.
            </p>
          </button>

          {/* Card 2 - Safety (highlighted) */}
          <button 
            onClick={() => setSelectedSection('safety')}
            className="group bg-white border-2 border-[#10B981] rounded-lg p-6 sm:p-8 hover:shadow-xl hover:bg-[#ECFDF5] hover:scale-105 hover:border-[#059669] transition-all duration-200 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#10B981] flex items-center justify-center transition-colors duration-200">
                <Shield className="w-6 h-6 text-[#10B981] group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <h3 className="text-[#1E293B] text-center mb-3">Safety is Non-Negotiable</h3>
            <p className="text-[#1E293B] text-center opacity-70 text-sm sm:text-base">
              Always wear proper protective gear including a helmet, wrist guards, and knee pads. 
              Start slow and practice in safe areas.
            </p>
          </button>

          {/* Card 3 - How to Start */}
          <button 
            onClick={() => setSelectedSection('start')}
            className="group bg-white border-2 border-[#10B981] rounded-lg p-6 sm:p-8 hover:shadow-xl hover:bg-[#ECFDF5] hover:scale-105 hover:border-[#059669] transition-all duration-200 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#10B981] flex items-center justify-center transition-colors duration-200">
                <ListChecks className="w-6 h-6 text-[#10B981] group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <h3 className="text-[#1E293B] text-center mb-3">How to Start</h3>
            <p className="text-[#1E293B] text-center opacity-70 text-sm sm:text-base">
              Join a beginner-friendly group ride, connect with experienced riders, and take it 
              one step at a time. We're here to help!
            </p>
          </button>

          {/* Card 4 - Laws & Regulations */}
          <button 
            onClick={() => setSelectedSection('laws')}
            className="group bg-white border-2 border-[#10B981] rounded-lg p-6 sm:p-8 hover:shadow-xl hover:bg-[#ECFDF5] hover:scale-105 hover:border-[#059669] transition-all duration-200 text-left cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#10B981] flex items-center justify-center transition-colors duration-200">
                <Scale className="w-6 h-6 text-[#10B981] group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <h3 className="text-[#1E293B] text-center mb-3">Laws & Where to Ride</h3>
            <p className="text-[#1E293B] text-center opacity-70 text-sm sm:text-base">
              Know the rules, speed limits, and best practices for riding legally and 
              responsibly in Boston.
            </p>
          </button>
        </div>
      </div>

      <NewRiderDetailModal 
        isOpen={selectedSection !== null}
        onClose={() => setSelectedSection(null)}
        section={selectedSection}
        onContactClick={onContactClick}
      />
    </section>
  );
}