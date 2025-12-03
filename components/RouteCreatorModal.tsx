import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { InteractiveMap } from './InteractiveMap';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Waypoint {
  id: string;
  position: { lat: number; lng: number };
  order: number;
  name?: string;
}

interface RouteCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (routeData: { routeName: string; description: string; googleMapsUrl: string; distance: number; time: number; startingLocation: string; startTime: string; tags: string[]; leaderName: string; imageUrl: string; waypoints?: Waypoint[] }) => void;
  userId?: string;
  initialRoute?: any;
  isAdmin?: boolean;
  adminToken?: string;
}

export function RouteCreatorModal({ isOpen, onClose, onShare, userId, initialRoute, isAdmin, adminToken }: RouteCreatorModalProps) {
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [startingLocation, setStartingLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isOpen && initialRoute) {
      setRouteName(initialRoute.routeName || '');
      setDescription(initialRoute.description || '');
      setWaypoints(initialRoute.waypoints || []);
      setStartingLocation(initialRoute.startingLocation || '');
      setStartTime(initialRoute.startTime || '');
      setTags(initialRoute.tags || []);
      setLeaderName(initialRoute.leaderName || '');
      setImagePreview(initialRoute.imageUrl || null);
      // Reset image file as we have a preview but no file object
      setImageFile(null);
    } else if (isOpen && !initialRoute) {
      // Reset form when opening fresh
      setRouteName('');
      setDescription('');
      setWaypoints([]);
      setStartingLocation('');
      setStartTime('');
      setTags([]);
      setLeaderName('');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen, initialRoute]);

  // Calculate estimated distance and time based on waypoints
  const calculateRouteStats = () => {
    if (waypoints.length < 2) {
      return { distance: 0, time: 0 };
    }

    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i].position;
      const to = waypoints[i + 1].position;
      // Haversine formula for distance calculation
      const R = 3959; // Earth's radius in miles
      const dLat = ((to.lat - from.lat) * Math.PI) / 180;
      const dLon = ((to.lng - from.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from.lat * Math.PI) / 180) *
          Math.cos((to.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    // Estimate time assuming 10 mph average biking speed
    const estimatedTime = (totalDistance / 10) * 60; // in minutes

    return {
      distance: Math.round(totalDistance * 10) / 10,
      time: Math.round(estimatedTime),
    };
  };

  const { distance, time } = calculateRouteStats();

  const generateGoogleMapsUrl = () => {
    if (waypoints.length < 2) return '';

    const origin = `${waypoints[0].position.lat},${waypoints[0].position.lng}`;
    const destination = `${waypoints[waypoints.length - 1].position.lat},${waypoints[waypoints.length - 1].position.lng}`;
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=bicycling`;

    // Add waypoints in between (if any)
    if (waypoints.length > 2) {
      const waypointsParam = waypoints
        .slice(1, -1)
        .map((wp) => `${wp.position.lat},${wp.position.lng}`)
        .join('|');
      url += `&waypoints=${waypointsParam}`;
    }

    return url;
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called - Starting route submission...');
    console.log('Route name:', routeName);
    console.log('Leader name:', leaderName);
    console.log('Waypoints count:', waypoints.length);
    
    if (!routeName.trim()) {
      toast.error('Please enter a route name');
      return;
    }
    if (!leaderName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (waypoints.length < 2) {
      toast.error('Please add at least 2 waypoints to create a route');
      return;
    }

    setIsSubmitting(true);
    console.log('✅ Validation passed, creating form data...');

    try {
      const googleMapsUrl = generateGoogleMapsUrl();
      console.log('📍 Google Maps URL generated:', googleMapsUrl);

      // Create form data
      const formData = new FormData();
      formData.append('routeName', routeName);
      formData.append('description', description);
      formData.append('leaderName', leaderName);
      formData.append('googleMapsUrl', googleMapsUrl);
      formData.append('waypoints', JSON.stringify(waypoints));
      formData.append('distance', distance.toString());
      formData.append('time', time.toString());
      formData.append('startingLocation', startingLocation);
      formData.append('startTime', startTime);
      formData.append('tags', JSON.stringify(tags));
      
      if (userId) {
        formData.append('userId', userId);
      }
      
      if (imageFile) {
        formData.append('image', imageFile);
        console.log('🖼️ Image attached:', imageFile.name, imageFile.size, 'bytes');
      }

      console.log('📤 Submitting to backend...');
      
      const url = initialRoute 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/routes/${initialRoute.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/routes`;
        
      const method = initialRoute ? 'PUT' : 'POST';
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${publicAnonKey}`,
      };
      
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }

      // Submit to backend
      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      console.log('📤 Route submission response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Route submission failed:', error);
        throw new Error(error.error || 'Failed to submit route');
      }

      const result = await response.json();
      console.log('✅ Route submission successful:', result);
      
      toast.success(initialRoute ? 'Route updated successfully!' : 'Route submitted for approval! You\'ll be notified when it\'s reviewed.');
      
      // Call the original onShare callback for UI updates (just for success modal)
      onShare({
        routeName,
        description,
        googleMapsUrl,
        distance,
        time,
        startingLocation,
        startTime,
        tags,
        leaderName,
        imageUrl: imagePreview || '',
        waypoints, // Include waypoints for Google Maps URL generation
      });

      // Reset form
      if (!initialRoute) {
        setRouteName('');
        setDescription('');
        setWaypoints([]);
        setStartingLocation('');
        setStartTime('');
        setTags([]);
        setCurrentTag('');
        setLeaderName('');
        setImageFile(null);
        setImagePreview(null);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting route:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit route');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWaypoint = (waypointId: string) => {
    const filtered = waypoints.filter((wp) => wp.id !== waypointId);
    const reordered = filtered.map((wp, idx) => ({
      ...wp,
      order: idx + 1,
    }));
    setWaypoints(reordered);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      
      if (file.size > MAX_SIZE) {
        // Compress the image
        compressImage(file);
      } else {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const compressImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions (max 1920px width/height)
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 1920;
        
        if (width > height && width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              setImageFile(compressedFile);
              setImagePreview(canvas.toDataURL('image/jpeg', 0.8));
              toast.success(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-white/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
          <h2 className="text-[#1E293B] text-xl sm:text-2xl">{initialRoute ? 'Edit Route' : 'Route Creator'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 p-4 sm:p-8 max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-140px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
          {/* Left Column - Map (2/3 width on desktop, full width on mobile) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">How to create a route:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-blue-600">
                  <li><strong>Important:</strong> You don't need to be signed in to create a route, but you must be signed in to save it to your account.</li>
                  <li>Search for a location or <strong>click directly on the map</strong> to place a waypoint.</li>
                  <li>You need at least 2 waypoints (start and end) to create a route.</li>
                  <li>Use the search bar to find specific places, then click "Add to Route" or click on the map.</li>
                </ul>
              </div>
            </div>

            {/* Map */}
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <InteractiveMap
                waypoints={waypoints}
                onWaypointsChange={setWaypoints}
              />
            </div>

            {/* Waypoint List - Always visible */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h3 className="text-[#1E293B] text-base sm:text-lg">Waypoints</h3>
                <span className="text-xs sm:text-sm text-gray-500">Click map to add • Right-click markers to delete</span>
              </div>
              {waypoints.length > 0 ? (
                <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                  {waypoints.map((waypoint, index) => (
                    <div
                      key={waypoint.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className="flex-shrink-0 w-7 h-7 bg-[#10B981] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1E293B] truncate">
                          {waypoint.name || `${waypoint.position.lat.toFixed(5)}, ${waypoint.position.lng.toFixed(5)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteWaypoint(waypoint.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete waypoint"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No waypoints yet</p>
                  <p className="text-xs mt-1">Click on the map to add your first waypoint</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form (1/3 width) */}
          <div className="col-span-1">
            <div className="space-y-6">
              {/* Route Statistics */}
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-gray-200">
                <h3 className="text-[#1E293B] mb-3">Route Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#1E293B] opacity-70 mb-1">Distance</div>
                    <div className="text-[#1E293B]">{distance} miles</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#1E293B] opacity-70 mb-1">Est. Time</div>
                    <div className="text-[#1E293B]">{time} minutes</div>
                  </div>
                </div>
              </div>

              {/* Route Name */}
              <div>
                <Label htmlFor="routeName" className="text-[#1E293B] mb-2 block">
                  Route Name
                </Label>
                <Input
                  id="routeName"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g., Charles River Loop"
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-[#1E293B] mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell riders what makes this route special..."
                  className="w-full min-h-[120px]"
                />
              </div>

              {/* Starting Location */}
              <div>
                <Label htmlFor="startingLocation" className="text-[#1E293B] mb-2 block">
                  Starting Location
                </Label>
                <Input
                  id="startingLocation"
                  value={startingLocation}
                  onChange={(e) => setStartingLocation(e.target.value)}
                  placeholder="e.g., Boston Common"
                  className="w-full"
                />
              </div>

              {/* Start Time */}
              <div>
                <Label htmlFor="startTime" className="text-[#1E293B] mb-2 block">
                  Start Date & Time
                </Label>
                <Input
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  type="datetime-local"
                  className="w-full"
                />
              </div>

              {/* Social Tagging */}
              <div>
                <Label className="text-[#1E293B] mb-2 block">Social Tags</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add a tag (e.g., Scenic)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-[#10B981] hover:bg-[#059669] text-white"
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-[#10B981] text-white hover:bg-[#059669] flex items-center gap-1 px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-gray-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Leader Name */}
              <div>
                <Label htmlFor="leaderName" className="text-[#1E293B] mb-2 block">
                  Leader Name
                </Label>
                <Input
                  id="leaderName"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="imageUrl" className="text-[#1E293B] mb-2 block">
                  Image Upload
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This image will be used as the cover image for the route posting.
                </p>
              </div>

              {/* Submit Button */}
              <div className="mt-6 space-y-3">
                <Button 
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : initialRoute ? 'Update Route' : 'Submit Route for Approval'}
                </Button>
                
                <div className="text-xs text-gray-500 space-y-2">
                  <p className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>A Google Maps link with bicycle routing will be automatically generated for your route.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Routes are reviewed by admins before appearing on the Upcoming Rides page.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}