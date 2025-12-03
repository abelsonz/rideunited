import { useState, useEffect, useRef } from 'react';
import { RideCard } from './RideCard';
import { RideDetailModal } from './RideDetailModal';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar } from 'lucide-react';
import { CalendarView } from './CalendarView';

interface Ride {
  id: string;
  image: string;
  title: string;
  description: string;
  tags: Array<{ label: string; color: 'green' | 'blue' | 'purple' | 'indigo' | 'red' }>;
  distance: string;
  time: string;
  location?: string;
  dateTime?: string;
  meetupPoint?: string;
  rideLeader?: string;
  maxRiders?: number;
  routeDetails?: string;
  startTime?: string;
  routeLink?: string;
}

interface UpcomingRidesProps {
  rides: Ride[];
  onLoginClick?: () => void;
}

export function UpcomingRides({ rides, onLoginClick }: UpcomingRidesProps) {
  const [itemsPerView, setItemsPerView] = useState(3);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'calendar'>('carousel');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showCarousel = rides.length > 3; // Keeping this check to determine layout logic, though logic differs now

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10); // -10 for tolerance
    }
  };

  useEffect(() => {
    handleScroll(); // Initial check
  }, [rides, itemsPerView, viewMode]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <section id="upcoming-rides" className="bg-[#F9FAFB] py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8 relative gap-6">
          <h2 className="text-[#1E293B] text-3xl sm:text-4xl text-center">Upcoming Group Rides</h2>
          
          {/* View Mode Toggle - Now positioned below the title */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                viewMode === 'carousel'
                  ? 'bg-[#10B981] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                viewMode === 'calendar'
                  ? 'bg-[#10B981] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
          
          {/* Carousel Navigation Arrows - Positioned below toggle */}
          {showCarousel && viewMode === 'carousel' && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => scroll('left')}
                disabled={!showLeftArrow}
                className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-[#1E293B]" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!showRightArrow}
                className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-[#1E293B]" />
              </button>
            </div>
          )}
        </div>
        
        {viewMode === 'calendar' ? (
          <CalendarView rides={rides} />
        ) : (
          <div className="relative">
            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className={`
                ${showCarousel ? 'flex overflow-x-auto snap-x snap-mandatory pb-4 pt-4 -mx-4 px-4 sm:mx-0 sm:px-4 scrollbar-hide' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}
              `}
              style={showCarousel ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
              onScroll={handleScroll}
            >
              {rides.map((ride) => (
                showCarousel ? (
                  <div 
                    key={ride.id} 
                    className="flex-shrink-0 snap-start pl-4 first:pl-2 sm:pl-0 sm:pr-8 last:pr-4 sm:last:pr-0"
                    style={{ 
                      width: window.innerWidth < 640 ? '85%' : `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 32 / itemsPerView}px)` 
                    }}
                  >
                    <RideCard
                      image={ride.image}
                      title={ride.title}
                      description={ride.description}
                      tags={ride.tags}
                      distance={ride.distance}
                      time={ride.time}
                      location={ride.location}
                      dateTime={ride.dateTime}
                      routeLink={ride.routeLink}
                      onClick={() => handleRideClick(ride)}
                    />
                  </div>
                ) : (
                  <RideCard
                    key={ride.id}
                    image={ride.image}
                    title={ride.title}
                    description={ride.description}
                    tags={ride.tags}
                    distance={ride.distance}
                    time={ride.time}
                    location={ride.location}
                    dateTime={ride.dateTime}
                    routeLink={ride.routeLink}
                    onClick={() => handleRideClick(ride)}
                  />
                )
              ))}
            </div>
          </div>
        )}
      </div>
      <RideDetailModal
        isOpen={isModalOpen}
        ride={selectedRide}
        onClose={handleCloseModal}
        onLoginClick={onLoginClick}
      />
    </section>
  );
}