import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { NewRiderGuide } from './components/NewRiderGuide';
import { UpcomingRides } from './components/UpcomingRides';
import { ForRideLeaders } from './components/ForRideLeaders';
import { Footer } from './components/Footer';
import { RouteCreatorModal } from './components/RouteCreatorModal';
import { SuccessModal } from './components/SuccessModal';
import { AuthModal } from './components/AuthModal';
import { MyRoutesModal } from './components/MyRoutesModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { ContactModal } from './components/ContactModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { PitchPresentation } from './components/PitchPresentation';
import Admin from './pages/Admin';
import Marketing from './pages/Marketing';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';
import skateparkImage from 'figma:asset/96b7f027032f5d93a52203616e8191cf3ab77aa4.png';
import intro2SpeedImage from 'figma:asset/8f7986d87590b9d7f95b11be030a7a81828415b6.png';
import backwardsRidingImage from 'figma:asset/d67fd7e2856288385e14a72ba803f4f0b4a5f1c0.png';
import rideUnitedLogoLong from 'figma:asset/83d0917cf2593b3c51096e2542a4919957b4c8f9.png';
import groupRideImage from 'figma:asset/b4a7a32ed7251b0e58636c57226b1231edcaf225.png';
import logo from 'figma:asset/83d0917cf2593b3c51096e2542a4919957b4c8f9.png';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  rideLeader?: string;
  maxRiders?: number;
  routeDetails?: string;
  startTime?: string;
  routeLink?: string;
}

const defaultRides: Ride[] = [
  {
    id: 'default-3',
    image: backwardsRidingImage,
    title: 'Backwards Riding Clinic',
    description: 'Practice backwards riding on the lawn at Boston Common. All skill levels welcome!',
    tags: [
      { label: 'Beginner-Friendly', color: 'green' },
      { label: 'Training', color: 'blue' }
    ],
    distance: '',
    time: '',
    location: 'Boston Common',
    dateTime: 'Boston Common | December 2nd at 5 pm',
    startTime: '2025-12-02T17:00:00',
    rideLeader: 'BPEV Admins',
    maxRiders: 12,
    routeDetails: 'We\'ll focus on developing backwards riding skills in the open space of Boston Common. This clinic is designed for riders who want to learn or improve their backwards riding technique with guidance from experienced riders.',
  },
  {
    id: 'default-4',
    image: groupRideImage,
    title: 'Boston Common to Rivergreen Park',
    description: 'A scenic group ride from the heart of Boston to Rivergreen Park. Enjoy the city views and bike paths!',
    tags: [
      { label: 'Group Ride', color: 'green' },
      { label: 'Scenic', color: 'blue' }
    ],
    distance: '5.2 mi',
    time: '45 min',
    location: 'Boston Common',
    dateTime: 'Boston Common | December 7th at 12 pm',
    startTime: '2025-12-07T12:00:00',
    rideLeader: 'BPEV Admins',
    maxRiders: 20,
    routeDetails: 'Meeting at the Boston Common Frog Pond. We will ride through the city streets and connect to the bike path along the river, ending at Rivergreen Park for a break.',
  },
  {
    id: 'default-1',
    image: skateparkImage,
    title: 'Wednesday Skatepark Sesh',
    description: 'Join us for tricks and skills practice at the local skatepark. All skill levels welcome!',
    tags: [
      { label: 'Beginner-Friendly', color: 'green' },
      { label: 'Skatepark', color: 'purple' }
    ],
    distance: '',
    time: '',
    location: 'Lynch Family Skatepark',
    dateTime: 'Lynch Family Skatepark | Every Wednesday at 6pm',
    startTime: '2024-12-04T18:00:00',
    rideLeader: 'Zach Abelson',
    maxRiders: 15,
    routeDetails: 'We\'ll meet at the skatepark and spend the session practicing tricks on the concrete features. This is a great opportunity to learn from each other and push your skills in a safe environment. We\'ll have experienced riders available to help beginners get comfortable with basic maneuvers.',
  },
  {
    id: 'default-2',
    image: intro2SpeedImage,
    title: 'Intro 2 Speed',
    description: 'Learn the basics of high-speed riding with safety tips and group support.',
    tags: [
      { label: 'Advanced', color: 'red' },
      { label: 'Training', color: 'blue' }
    ],
    distance: '',
    time: '',
    location: 'Rivergreen Park',
    dateTime: 'Rivergreen Park | Every Friday at 6 pm',
    startTime: '2024-12-06T18:00:00',
    rideLeader: 'BPEV Admins',
    maxRiders: 10,
    routeDetails: 'We\'ll be setting up a track in a large parking lot with cones and a communal hangout space. This is a great opportunity to practice high-speed maneuvers in a controlled environment with fellow riders.',
  },
];

export default function App() {
  const [isRouteCreatorOpen, setIsRouteCreatorOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [routeCreatorSource, setRouteCreatorSource] = useState<'nav' | 'myRoutes'>('nav');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [rides, setRides] = useState<Ride[]>(defaultRides);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isMyRoutesOpen, setIsMyRoutesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMyRoutesOpen(false);
    toast.success('Logged out successfully');
  };

  // Simple routing - check both URL and state
  useEffect(() => {
    // Check if URL is /admin or /media on mount
    if (window.location.pathname === '/admin') {
      setShowAdmin(true);
    } else if (window.location.pathname === '/media') {
      setShowMedia(true);
    } else if (window.location.pathname === '/pitch') {
      setShowPitch(true);
    }
  }, []);

  const isAdminPage = showAdmin;
  const isMediaPage = showMedia;
  const isPitchPage = showPitch;

  // Fetch approved routes from backend
  useEffect(() => {
    const fetchApprovedRoutes = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/routes`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const approvedRoutes = data.routes || [];
          
          // Convert backend routes to frontend Ride format
          const formattedRoutes: Ride[] = approvedRoutes.map((route: any) => ({
            id: route.id,
            image: route.imageUrl || logo,
            title: route.routeName,
            description: route.description,
            tags: route.tags ? route.tags.map((tag: string) => ({ 
              label: tag, 
              color: 'green' as const 
            })) : [{ label: 'Community Ride', color: 'green' as const }],
            distance: route.distance ? `${route.distance} mi` : '',
            time: route.time ? `${route.time} min` : '',
            location: route.startingLocation,
            dateTime: (() => {
              const location = route.startingLocation || 'TBD';
              const time = route.startTime ? new Date(route.startTime).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'TBD';
              return `${location} | ${time}`;
            })(),
            startTime: route.startTime,
            routeLink: route.googleMapsUrl,
            rideLeader: route.leaderName,
          }));

          // Filter out duplicates from backend that are already in defaultRides
          const defaultTitles = new Set(defaultRides.map(r => r.title));
          const uniqueFormattedRoutes = formattedRoutes.filter(r => !defaultTitles.has(r.title));

          // Combine default rides with approved user-generated routes and sort
          const allRides = [...uniqueFormattedRoutes, ...defaultRides];
          
          const now = new Date();
          const futureRides = allRides.filter(r => !r.startTime || new Date(r.startTime) >= now);
          const pastRides = allRides.filter(r => r.startTime && new Date(r.startTime) < now);
          
          // Sort future rides by date ascending (closest first)
          futureRides.sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

          // Sort past rides by date ascending (oldest first) as requested
          pastRides.sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

          setRides([...futureRides, ...pastRides]);
        }
      } catch (error) {
        console.error('Error fetching approved routes:', error);
      } finally {
        setIsLoadingRides(false);
      }
    };

    if (!isAdminPage) {
      fetchApprovedRoutes();
    }
  }, [isAdminPage]);

  const handleOpenRouteCreator = (routeToEdit?: any, source: 'nav' | 'myRoutes' = 'nav') => {
    if (routeToEdit && routeToEdit.id && typeof routeToEdit.id === 'string') {
      setEditingRoute(routeToEdit);
    } else {
      setEditingRoute(null);
    }
    setRouteCreatorSource(source);
    setIsRouteCreatorOpen(true);
  };

  const handleCloseRouteCreator = () => {
    setIsRouteCreatorOpen(false);
    setEditingRoute(null);
    
    // If we came from "My Routes", go back there
    if (routeCreatorSource === 'myRoutes') {
      setIsMyRoutesOpen(true);
    }
    
    // Reset source
    setRouteCreatorSource('nav');
  };

  const handleShareRoute = (data: any) => {
    // Just store the route data for the success modal
    // Don't add to rides array - route needs to be approved first
    const routeLink = data.waypoints && data.waypoints.length > 0
      ? `https://www.google.com/maps/dir/${data.waypoints.map((wp: any) => `${wp.position.lat},${wp.position.lng}`).join('/')}/data=!4m2!4m1!3e1`
      : data.googleMapsUrl; // Fallback to the one generated in the modal

    setRouteData({
      ...data,
      googleMapsUrl: routeLink || data.googleMapsUrl,
    });
    setIsRouteCreatorOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    setRouteData(null);
    
    // If we came from "My Routes" (editing), go back there after success too
    if (routeCreatorSource === 'myRoutes') {
      setIsMyRoutesOpen(true);
    }
    
    // Reset source
    setRouteCreatorSource('nav');
  };

  // Render admin page if on /admin route
  if (isAdminPage) {
    return <Admin />;
  }

  // Render marketing page if on /media route
  if (isMediaPage) {
    return <Marketing />;
  }

  // Render pitch page if on /pitch route
  if (isPitchPage) {
    return <PitchPresentation />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onLaunchCreator={handleOpenRouteCreator} 
        onAdminClick={() => setShowAdmin(true)}
        onMediaClick={() => setShowMedia(true)}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onMyRoutesClick={() => setIsMyRoutesOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <HeroSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <UpcomingRides rides={rides} onLoginClick={() => setIsAuthModalOpen(true)} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <NewRiderGuide onContactClick={() => setIsContactModalOpen(true)} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <ForRideLeaders onLaunchCreator={handleOpenRouteCreator} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Footer onContactClick={() => setIsContactModalOpen(true)} />
      </motion.div>
      
      <RouteCreatorModal 
        isOpen={isRouteCreatorOpen}
        onClose={handleCloseRouteCreator}
        onShare={handleShareRoute}
        userId={user?.id}
        initialRoute={editingRoute}
      />
      
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccess}
        routeData={routeData}
        isLoggedIn={!!user}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <MyRoutesModal
        isOpen={isMyRoutesOpen}
        onClose={() => setIsMyRoutesOpen(false)}
        userId={user?.id}
        onEditRoute={(route) => {
          setIsMyRoutesOpen(false);
          handleOpenRouteCreator(route, 'myRoutes');
        }}
      />

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      
      <Toaster />
    </div>
  );
}
