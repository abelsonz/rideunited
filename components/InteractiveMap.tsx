import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, X, Plus } from 'lucide-react';

interface Waypoint {
  id: string;
  position: { lat: number; lng: number };
  order: number;
  name?: string;
}

interface InteractiveMapProps {
  waypoints: Waypoint[];
  onWaypointsChange: (waypoints: Waypoint[]) => void;
}

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWJlbHNvbnoiLCJhIjoiY21oYmc5MWNjMHVvMjJpcHp2OGFlOTB1byJ9.K3MIFnyO6tc9Dp0at2flYg';

// Google Places API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAxqDg0D4g8Ye1u0JRaH-WLY1EzKP7VSI4';

// Load Google Maps API
let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;

const loadGoogleMapsAPI = (): Promise<void> => {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined' && window.google.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};

export function InteractiveMap({ waypoints, onWaypointsChange }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const waypointsRef = useRef<Waypoint[]>(waypoints);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Keep waypoints ref in sync
  useEffect(() => {
    waypointsRef.current = waypoints;
  }, [waypoints]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Try to get user location, fallback to Boston
    navigator.geolocation.getCurrentPosition(
      (position) => {
        initializeMap([position.coords.longitude, position.coords.latitude]);
      },
      () => {
        // Default to Boston
        initializeMap([-71.0589, 42.3601]);
      }
    );

    function initializeMap(center: [number, number]) {
      if (!mapContainerRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: center,
        zoom: 13,
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add user location marker (blue dot)
      const userMarkerEl = document.createElement('div');
      userMarkerEl.style.width = '16px';
      userMarkerEl.style.height = '16px';
      userMarkerEl.style.backgroundColor = '#3B82F6';
      userMarkerEl.style.border = '3px solid white';
      userMarkerEl.style.borderRadius = '50%';
      userMarkerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      new mapboxgl.Marker(userMarkerEl).setLngLat(center).addTo(map);

      // Wait for map to fully load
      map.on('load', () => {
        // Hide transportation and POI labels
        const layersToHide = [
          'poi-label',
          'transit-label',
          'airport-label',
          'ferry-aerialway-label',
          'poi-minor',
          'poi-major',
          'transit',
          'airport',
        ];

        layersToHide.forEach((layerId) => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
          }
        });

        // Add empty route source
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [],
            },
          },
        });

        // Add route layer
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#10B981',
            'line-width': 4,
            'line-opacity': 0.7,
          },
        });

        setMapLoaded(true);
      });

      // Handle map clicks - add waypoint with reverse geocoding
      map.on('click', async (e) => {
        const lat = e.lngLat.lat;
        const lng = e.lngLat.lng;

        // Reverse geocode to get place name
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
          );
          const data = await response.json();
          const placeName = data.features && data.features.length > 0 
            ? data.features[0].place_name 
            : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          const newWaypoint: Waypoint = {
            id: `waypoint-${Date.now()}-${Math.random()}`,
            position: { lat, lng },
            order: waypointsRef.current.length + 1,
            name: placeName,
          };
          onWaypointsChange([...waypointsRef.current, newWaypoint]);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const newWaypoint: Waypoint = {
            id: `waypoint-${Date.now()}-${Math.random()}`,
            position: { lat, lng },
            order: waypointsRef.current.length + 1,
            name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          };
          onWaypointsChange([...waypointsRef.current, newWaypoint]);
        }
      });

      // Prevent context menu on map
      map.on('contextmenu', (e) => {
        e.preventDefault();
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onWaypointsChange]);

  // Update markers and route when waypoints change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Remove all existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for each waypoint
    waypoints.forEach((waypoint, index) => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      el.style.cssText = 'width: 36px; height: 36px; display: block !important; visibility: visible !important; pointer-events: auto !important;';
      el.innerHTML = `<div style="
        width: 36px;
        height: 36px;
        background-color: #10B981;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
        font-family: 'Inter', sans-serif;
      ">${index + 1}</div>`;

      console.log('Creating waypoint marker:', index + 1, waypoint.position);

      const markerDiv = el.firstChild as HTMLElement;

      // Hover effects
      el.addEventListener('mouseenter', () => {
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.15)';
          markerDiv.style.backgroundColor = '#059669';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.backgroundColor = '#10B981';
        }
      });

      // Right-click to delete
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Deleting waypoint:', waypoint.id);
        
        // Remove this waypoint and reorder the rest
        const filtered = waypointsRef.current.filter((wp) => wp.id !== waypoint.id);
        const reordered = filtered.map((wp, idx) => ({
          ...wp,
          order: idx + 1,
        }));
        onWaypointsChange(reordered);
      });

      // Create marker with options and add to map
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([waypoint.position.lng, waypoint.position.lat])
        .addTo(map);

      // Force the marker wrapper to be visible
      const markerElement = marker.getElement();
      markerElement.style.display = 'block';
      markerElement.style.visibility = 'visible';
      markerElement.style.opacity = '1';

      console.log('Marker added to map:', marker, 'Element:', markerElement);

      markersRef.current.push(marker);
    });

    // Update route line
    const routeSource = map.getSource('route') as mapboxgl.GeoJSONSource;
    if (routeSource) {
      if (waypoints.length >= 2) {
        const coordinates = waypoints.map((wp) => [wp.position.lng, wp.position.lat]);
        routeSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        });
      } else {
        // Clear the route if less than 2 waypoints
        routeSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        });
      }
    }
  }, [waypoints, mapLoaded, onWaypointsChange]);

  const handleDeleteWaypoint = (waypointId: string) => {
    const filtered = waypoints.filter((wp) => wp.id !== waypointId);
    const reordered = filtered.map((wp, idx) => ({
      ...wp,
      order: idx + 1,
    }));
    onWaypointsChange(reordered);
  };

  const handleAddSelectedLocation = () => {
    if (!selectedLocation) return;

    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}-${Math.random()}`,
      position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      order: waypointsRef.current.length + 1,
      name: selectedLocation.name,
    };
    onWaypointsChange([...waypointsRef.current, newWaypoint]);
    
    // Clear selection and search
    setSelectedLocation(null);
    setSearchQuery('');
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
  };

  const handleSearch = async () => {
    if (!mapRef.current || !searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const map = mapRef.current;
      
      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coordinates = feature.center as [number, number];
        const placeName = feature.place_name;

        // Remove previous search marker if it exists
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
        }

        // Create a highlighted marker for the search result
        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundColor = '#EF4444';
        el.style.border = '3px solid white';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
        el.style.animation = 'pulse 2s infinite';

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(coordinates)
          .addTo(map);

        // Add popup with place name
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`<div style="padding: 4px 8px; font-size: 14px;">${placeName}</div>`);
        
        marker.setPopup(popup);
        popup.addTo(map);

        searchMarkerRef.current = marker;

        // Fly to the location with animation
        map.flyTo({
          center: coordinates,
          zoom: 15,
          duration: 1500,
        });

        // Show popup
        setTimeout(() => {
          popup.addTo(map);
        }, 1500);
        
        setSelectedLocation({
          lat: coordinates[1],
          lng: coordinates[0],
          name: placeName
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      // Load Google Maps API first
      await loadGoogleMapsAPI();

      // Use Google Places AutocompleteSuggestion (new API)
      const request = {
        input: query,
        includedRegionCodes: ['us'],
      };

      const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      if (suggestions && suggestions.length > 0) {
        // Convert to format compatible with existing code
        const predictions = suggestions.map((suggestion: any) => ({
          description: suggestion.placePrediction?.text?.text || '',
          place_id: suggestion.placePrediction?.placeId || '',
        }));
        setSearchSuggestions(predictions);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (prediction: any) => {
    if (!mapRef.current) return;
    
    try {
      await loadGoogleMapsAPI();
      
      // Use the new Place API
      const place = new google.maps.places.Place({
        id: prediction.place_id,
      });

      // Fetch place details
      await place.fetchFields({
        fields: ['location', 'displayName'],
      });

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();
        const coordinates: [number, number] = [lng, lat];
        const placeName = prediction.description;

        // Remove previous search marker if it exists
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
        }

        // Create a highlighted marker for the search result
        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundColor = '#EF4444';
        el.style.border = '3px solid white';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
        el.style.animation = 'pulse 2s infinite';

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(coordinates)
          .addTo(mapRef.current!);

        // Add popup with place name
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`<div style="padding: 4px 8px; font-size: 14px;">${placeName}</div>`);
        
        marker.setPopup(popup);
        popup.addTo(mapRef.current!);

        searchMarkerRef.current = marker;

        // Fly to the location with animation
        mapRef.current!.flyTo({
          center: coordinates,
          zoom: 15,
          duration: 1500,
        });

        // Show popup
        setTimeout(() => {
          popup.addTo(mapRef.current!);
        }, 1500);

        setSearchQuery(placeName);
        setShowSuggestions(false);
        setSelectedLocation({
          lat: coordinates[1],
          lng: coordinates[0],
          name: placeName
        });
      }
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />

      {/* Search bar - only overlay on the map */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-10 sm:w-80">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-stretch">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for a location..."
              className="flex-1 border-0 rounded-l px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] text-xs sm:text-sm min-w-0"
              onKeyPress={handleSearchKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-r transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {isSearching ? (
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="border-t border-gray-200 max-h-48 sm:max-h-64 overflow-y-auto">
              {searchSuggestions.map((prediction: any) => (
                <div
                  key={prediction.place_id}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  onClick={() => handleSuggestionClick(prediction)}
                >
                  <div className="text-[#1E293B]">{prediction.structured_formatting?.main_text || prediction.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{prediction.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Selected Location Button */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleAddSelectedLocation}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold transition-all transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
          >
            <Plus className="w-5 h-5" />
            Add "{selectedLocation.name.split(',')[0]}" to Route
          </button>
        </div>
      )}
    </div>
  );
}