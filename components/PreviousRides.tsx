import { useState, useEffect } from 'react';
import { RideCard } from './RideCard';
import { RideDetailModal } from './RideDetailModal';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar } from 'lucide-react';
import { CalendarView } from './CalendarView';

interface Ride {
  id: string;
  image: string;
  title: string;
  description: string;
  tags: { label: string; color: 'green' | 'blue' | 'purple' | 'indigo' | 'red' }[];
  distance: string;
  time: string;
  location?: string;
  dateTime?: string;
  rideLeader?: string;
  maxRiders?: number;
  routeDetails?: string;
  startTime?: string;
  routeLink?: string;
}

interface PreviousRidesProps {
  rides: Ride[];
}

export function PreviousRides({ rides }: PreviousRidesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'calendar'>('carousel');

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

  const maxIndex = Math.max(0, rides.length - itemsPerView);
  const showCarousel = rides.length > 3;

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-[#1E293B] text-4xl text-center flex-1">Previous Rides</h2>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
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

            {showCarousel && viewMode === 'carousel' && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-[#1E293B]" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-[#1E293B]" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {viewMode === 'calendar' ? (
          <CalendarView rides={rides} />
        ) : !showCarousel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rides.map((ride) => (
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
            ))}
          </div>
        ) : (
          <div className="overflow-hidden py-4">
            <div 
              className="flex transition-transform duration-500 ease-out gap-8"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {rides.map((ride) => (
                <div 
                  key={ride.id} 
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 32 / itemsPerView}px)` }}
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
              ))}
            </div>
            
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-[#10B981] w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <RideDetailModal
        isOpen={isModalOpen}
        ride={selectedRide}
        onClose={handleCloseModal}
      />
    </section>
  );
}