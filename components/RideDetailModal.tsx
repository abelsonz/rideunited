import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { MapPin, Clock, Calendar, Navigation2, Users } from "lucide-react";
import { RideChat } from "./RideChat";

interface RideDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
  ride: {
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
    routeLink?: string;
  } | null;
}

export function RideDetailModal({ isOpen, onClose, onLoginClick, ride }: RideDetailModalProps) {
  if (!ride) return null;

  const getTagClasses = (color: string) => {
    const colorMap = {
      green: 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]',
      blue: 'bg-blue-50 text-blue-600 border-blue-600',
      purple: 'bg-purple-50 text-purple-600 border-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-600',
      red: 'bg-red-50 text-red-600 border-red-600',
    };
    return colorMap[color] || colorMap.green;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1E293B] text-center">
            {ride.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6B7280] text-center">
            {ride.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ride Image */}
          <div className="rounded-lg overflow-hidden">
            <img
              src={ride.image}
              alt={ride.title}
              className="w-full h-64 object-contain"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {ride.tags.map((tag, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full border text-sm ${getTagClasses(tag.color)}`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* Ride Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ride.dateTime && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Date & Time</h4>
                    <p className="text-[#1E293B]">{ride.dateTime}</p>
                  </div>
                </div>
              </div>
            )}

            {ride.location && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Location</h4>
                    <p className="text-[#1E293B]">{ride.location}</p>
                  </div>
                </div>
              </div>
            )}

            {ride.meetupPoint && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Navigation2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Meeting Point</h4>
                    <p className="text-[#1E293B]">{ride.meetupPoint}</p>
                  </div>
                </div>
              </div>
            )}

            {(ride.time || ride.distance) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Duration & Distance</h4>
                    <p className="text-[#1E293B]">
                      {ride.time && ride.distance ? `${ride.time} • ${ride.distance}` : ride.time || ride.distance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {ride.rideLeader && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Ride Leader</h4>
                    <p className="text-[#1E293B]">{ride.rideLeader}</p>
                  </div>
                </div>
              </div>
            )}

            {ride.routeLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#1E293B] font-semibold mb-1">Route Map</h4>
                    <a 
                      href={ride.routeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10B981] hover:text-[#059669] hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      View Route on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Route Details */}
          {ride.routeDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-[#1E293B] font-semibold mb-3">Route Details</h4>
              <p className="text-[#1E293B]">{ride.routeDetails}</p>
            </div>
          )}

          {/* Ride Chat */}
          <RideChat rideId={ride.id} onLoginClick={onLoginClick} />
        </div>
      </DialogContent>
    </Dialog>
  );
}