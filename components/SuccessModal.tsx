import { useEffect } from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  routeData?: {
    routeName: string;
    description: string;
    googleMapsUrl: string;
    distance: number;
    time: number;
    startingLocation?: string;
    startTime?: string;
    tags?: string[];
  };
}

export function SuccessModal({ isOpen, onClose, routeData, isLoggedIn }: SuccessModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-6" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>
        </div>
        <h2 className="text-[#1E293B] mb-3 text-center">Route Shared!</h2>
        <p className="text-[#1E293B] opacity-70 mb-6 text-center">
          Your route has been successfully submitted! {isLoggedIn ? 'You can find it in "My Routes" under your profile menu.' : ''}
        </p>

        {routeData && routeData.googleMapsUrl && (
          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6 border border-gray-200">
            <div className="text-sm text-[#1E293B] opacity-70 mb-2">Google Maps Route</div>
            <p className="text-xs text-[#10B981] mb-2 font-medium">Here's a link for your route! Save it for later:</p>
            <a
              href={routeData.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[#1E293B] hover:text-[#10B981] transition-colors group bg-white p-3 rounded border border-gray-200"
            >
              <span className="text-sm break-all font-medium">{routeData.routeName || 'View Route'}</span>
              <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-[#1E293B] opacity-60">
              {routeData.distance} miles • {routeData.time} minutes
            </div>
          </div>
        )}

        <Button 
          className="bg-[#10B981] hover:bg-[#059669] text-white w-full"
          onClick={onClose}
        >
          OK
        </Button>
      </div>
    </div>
  );
}