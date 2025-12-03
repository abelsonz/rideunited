import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RideDetailModal } from './RideDetailModal';
import skateparkImage from 'figma:asset/96b7f027032f5d93a52203616e8191cf3ab77aa4.png';
import intro2SpeedImage from 'figma:asset/8f7986d87590b9d7f95b11be030a7a81828415b6.png';

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

interface CalendarViewProps {
  rides: Ride[];
}

export function CalendarView({ rides }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getRidesForDate = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    const dayOfWeek = dateToCheck.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Get regular rides for this date
    const regularRides = rides.filter(ride => {
      if (!ride.startTime) return false;
      const rideDate = new Date(ride.startTime);
      return rideDate.getDate() === day &&
             rideDate.getMonth() === month &&
             rideDate.getFullYear() === year;
    });
    
    // Add recurring events
    const recurringRides = [];
    
    // Every Wednesday (day 3) - Skatepark Sesh
    if (dayOfWeek === 3) {
      recurringRides.push({
        id: `skatepark-${year}-${month}-${day}`,
        title: 'Wednesday Skatepark Sesh',
        description: 'Join us for tricks and skills practice at the local skatepark. All skill levels welcome!',
        image: skateparkImage,
        tags: [
          { label: 'Beginner-Friendly', color: 'green' as const },
          { label: 'Skatepark', color: 'purple' as const }
        ],
        distance: '',
        time: '',
        location: 'Lynch Family Skatepark',
        dateTime: 'Lynch Family Skatepark | Every Wednesday at 6pm',
        startTime: new Date(year, month, day, 18, 0).toISOString(),
        rideLeader: 'Zach Abelson',
        maxRiders: 15,
        routeDetails: 'We\'ll meet at the skatepark and spend the session practicing tricks on the concrete features. This is a great opportunity to learn from each other and push your skills in a safe environment. We\'ll have experienced riders available to help beginners get comfortable with basic maneuvers.',
        calendarColor: 'purple' as const, // Recurring rides always have the same color
      });
    }
    
    // Every Friday (day 5) - Intro 2 Speed
    if (dayOfWeek === 5) {
      recurringRides.push({
        id: `intro2speed-${year}-${month}-${day}`,
        title: 'Intro 2 Speed',
        description: 'Learn the basics of high-speed riding with safety tips and group support.',
        image: intro2SpeedImage,
        tags: [
          { label: 'Advanced', color: 'red' as const },
          { label: 'Training', color: 'blue' as const }
        ],
        distance: '',
        time: '',
        location: 'Rivergreen Park',
        dateTime: 'Rivergreen Park | Every Friday at 6 pm',
        startTime: new Date(year, month, day, 18, 0).toISOString(),
        rideLeader: 'BPEV Admins',
        maxRiders: 10,
        routeDetails: 'We\'ll be setting up a track in a large parking lot with cones and a communal hangout space. This is a great opportunity to practice high-speed maneuvers in a controlled environment with fellow riders.',
        calendarColor: 'red' as const, // Recurring rides always have the same color
      });
    }
    
    return [...regularRides, ...recurringRides];
  };

  const getColorForRide = (ride: any, index: number) => {
    // Recurring rides always have the same color
    if (ride.calendarColor) {
      return ride.calendarColor;
    }
    
    // For unique rides, assign different colors based on their ID or index
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];
    
    // Use the ride's ID to consistently assign the same color
    if (ride.id.includes('default-1') || ride.title.includes('Skatepark')) return '#8B5CF6'; // Purple
    if (ride.id.includes('default-2') || ride.title.includes('Intro 2 Speed')) return '#EF4444'; // Red
    if (ride.id.includes('default-3') || ride.title.includes('Backwards')) return '#3B82F6'; // Blue
    if (ride.id.includes('default-4') || ride.title.includes('Boston Common')) return '#10B981'; // Green
    
    // Fallback to cycling through colors based on index
    return colors[index % colors.length];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-[#1E293B] text-white p-4 flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-white">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="border border-gray-100 bg-gray-50 p-2 min-h-[100px]" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const ridesForDay = getRidesForDate(day);
            const isToday = new Date().getDate() === day &&
                           new Date().getMonth() === month &&
                           new Date().getFullYear() === year;

            return (
              <div
                key={day}
                className={`border border-gray-100 p-2 min-h-[100px] ${
                  isToday ? 'bg-[#ECFDF5]' : 'bg-white'
                }`}
              >
                <div className={`text-sm mb-1 ${isToday ? 'text-[#10B981]' : 'text-gray-600'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {ridesForDay.map((ride, index) => (
                    <button
                      key={ride.id}
                      onClick={() => handleRideClick(ride)}
                      style={{ backgroundColor: getColorForRide(ride, index) }}
                      className="w-full text-left px-2 py-1 text-white rounded text-xs hover:opacity-80 transition-opacity truncate"
                    >
                      {ride.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RideDetailModal
        isOpen={isModalOpen}
        ride={selectedRide}
        onClose={handleCloseModal}
      />
    </>
  );
}