import { useState, useEffect } from 'react';
import { X, Map, Clock, Calendar, Navigation, Loader2, Edit2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface MyRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEditRoute?: (route: any) => void;
}

interface Route {
  id: string;
  routeName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  distance: number;
  time: number;
  imageUrl?: string;
  createdAt: string;
  waypoints: any[];
  startingLocation: string;
  startTime: string;
  tags: string[];
  leaderName: string;
  googleMapsUrl: string;
}

export function MyRoutesModal({ isOpen, onClose, userId, onEditRoute }: MyRoutesModalProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserRoutes();
    }
  }, [isOpen, userId]);

  const fetchUserRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/routes/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      } else {
        console.error('Failed to fetch routes');
        toast.error('Failed to load your routes');
      }
    } catch (error) {
      console.error('Error fetching user routes:', error);
      toast.error('An error occurred while loading routes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Approval</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1E293B]">My Routes</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#10B981] animate-spin mb-4" />
              <p className="text-gray-500">Loading your routes...</p>
            </div>
          ) : routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => (
                <div 
                  key={route.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="h-32 bg-gray-100 relative">
                    {route.imageUrl ? (
                      <img 
                        src={route.imageUrl} 
                        alt={route.routeName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Map className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(route.status)}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-[#1E293B] text-lg line-clamp-1">{route.routeName}</h3>
                      {onEditRoute && route.status === 'pending' && (
                        <button
                          onClick={() => onEditRoute(route)}
                          className="flex-shrink-0 p-1.5 text-gray-500 hover:text-[#10B981] hover:bg-green-50 rounded-md transition-colors"
                          title="Edit Route"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{route.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        <span>{route.distance} mi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{route.time} min</span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-400 border-t pt-3 mt-auto">
                      <Calendar className="w-3 h-3 mr-1" />
                      Submitted on {new Date(route.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Map className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No routes yet</h3>
              <p className="text-gray-500 max-w-sm">
                You haven't created any routes yet. Use the Route Creator to plan and share your first ride!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}