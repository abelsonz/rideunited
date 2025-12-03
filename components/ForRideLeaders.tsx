import { Button } from './ui/button';
import { Map, Tag, Share2 } from 'lucide-react';

interface ForRideLeadersProps {
  onLaunchCreator: () => void;
}

export function ForRideLeaders({ onLaunchCreator }: ForRideLeadersProps) {
  return (
    <section id="for-ride-leaders" className="bg-[#F9FAFB] py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[#1E293B] text-3xl sm:text-4xl mb-3 text-center">Route & Event Creator</h2>
        <div className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto text-sm sm:text-base px-4">
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#10B981] flex items-center justify-center">
                <Map className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h3 className="text-[#10B981] mb-3 font-semibold no-underline">Smart Route Builder</h3>
            <p className="text-[#1E293B] opacity-70 text-sm sm:text-base px-2">
              Design routes effortlessly with our interactive map. Auto-calculate distance, estimate ride duration, and instantly generate turn-by-turn Google Maps navigation links.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#10B981] flex items-center justify-center">
                <Tag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h3 className="text-[#10B981] mb-3 font-semibold">Rich Ride Cards</h3>
            <p className="text-[#1E293B] opacity-70 text-sm sm:text-base px-2">
              Create detailed event listings with custom cover photos, skill-level tags, and precise meeting points to attract the right group for your specific ride style.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#10B981] flex items-center justify-center">
                <Share2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h3 className="text-[#10B981] mb-3 font-semibold">Community Integration</h3>
            <p className="text-[#1E293B] opacity-70 text-sm sm:text-base px-2">
              Publish directly to the Boston hub where rides are vetted for safety. Manage your community with built-in chat channels dedicated to each specific event.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button 
            className="bg-[#10B981] hover:bg-[#059669] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 px-5 py-4 w-auto text-lg sm:text-xl h-auto"
            onClick={onLaunchCreator}
          >
            Open Route Creator
          </Button>
        </div>
      </div>
    </section>
  );
}