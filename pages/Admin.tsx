import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { RouteCreatorModal } from '../components/RouteCreatorModal';
import { Lock, Check, X, Trash2, MapPin, ExternalLink, Home, Mail, MessageSquare, Edit2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/83d0917cf2593b3c51096e2542a4919957b4c8f9.png';

interface Route {
  id: string;
  routeName: string;
  description: string;
  leaderName: string;
  googleMapsUrl: string;
  waypoints: any[];
  distance: number;
  time: number;
  startingLocation: string;
  startTime: string;
  tags: string[];
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  // Data states
  const [pendingRoutes, setPendingRoutes] = useState<Route[]>([]);
  const [approvedRoutes, setApprovedRoutes] = useState<Route[]>([]);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Action states
  const [processingRoutes, setProcessingRoutes] = useState<{ [key: string]: 'approving' | 'rejecting' | 'approved' | 'rejected' | 'deleting' | 'deleted' }>({});
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [isRouteCreatorOpen, setIsRouteCreatorOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Try to login as admin with this token
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/login`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: session.access_token }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          localStorage.setItem('adminToken', data.token);
          setIsLoggedIn(true);
          toast.success('Welcome back, Admin!');
          
          // Load initial data
          await loadPendingRoutes(data.token);
          await loadApprovedRoutes(data.token);
          await loadMessages(data.token);
        }
      }
    } catch (error) {
      console.error('Auto-login check failed:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/login`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      setIsLoggedIn(true);
      toast.success('Logged in successfully');
      
      // Load initial data
      await loadPendingRoutes(data.token);
      await loadApprovedRoutes(data.token);
      await loadMessages(data.token);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRoutes = async (authToken: string) => {
    setIsLoadingPending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/routes/pending`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load routes');
      }

      const data = await response.json();
      setPendingRoutes(data.routes || []);
    } catch (error) {
      console.error('Error loading pending routes:', error);
      toast.error('Failed to load pending routes');
    } finally {
      setIsLoadingPending(false);
    }
  };

  const loadApprovedRoutes = async (authToken?: string) => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return;
    
    setIsLoadingApproved(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/routes/approved`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': tokenToUse,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load approved routes');
      }

      const data = await response.json();
      setApprovedRoutes(data.routes || []);
    } catch (error) {
      console.error('Error loading approved routes:', error);
      toast.error('Failed to load approved routes');
    } finally {
      setIsLoadingApproved(false);
    }
  };

  const loadMessages = async (authToken?: string) => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return;
    
    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/contact/submissions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': tokenToUse,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.submissions || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleApprove = async (routeId: string) => {
    if (!token) return;

    const route = pendingRoutes.find(r => r.id === routeId);
    const routeName = route?.routeName || 'Route';

    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'approving' }));
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/routes/${routeId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve route');
      }

      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'approved' }));
      toast.success(`✅ "${routeName}" has been approved and is now live!`);
      
      setTimeout(() => {
        setPendingRoutes(pendingRoutes.filter(r => r.id !== routeId));
        setProcessingRoutes(prev => {
          const newState = { ...prev };
          delete newState[routeId];
          return newState;
        });
      }, 1500);
    } catch (error) {
      console.error('Error approving route:', error);
      toast.error(`❌ Failed to approve "${routeName}". Please try again.`);
      setProcessingRoutes(prev => {
        const newState = { ...prev };
        delete newState[routeId];
        return newState;
      });
    }
  };

  const handleReject = async (routeId: string) => {
    if (!token) return;

    const route = pendingRoutes.find(r => r.id === routeId);
    const routeName = route?.routeName || 'Route';

    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'rejecting' }));
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/routes/${routeId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject route');
      }

      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'rejected' }));
      toast.success(`🗑️ "${routeName}" has been rejected`);
      
      setTimeout(() => {
        setPendingRoutes(pendingRoutes.filter(r => r.id !== routeId));
        setProcessingRoutes(prev => {
          const newState = { ...prev };
          delete newState[routeId];
          return newState;
        });
      }, 1500);
    } catch (error) {
      console.error('Error rejecting route:', error);
      toast.error(`❌ Failed to reject "${routeName}". Please try again.`);
      setProcessingRoutes(prev => {
        const newState = { ...prev };
        delete newState[routeId];
        return newState;
      });
    }
  };

  const handleDelete = async (route: Route) => {
    if (!token) return;

    const routeName = route.routeName;
    const routeId = route.id;

    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'deleting' }));
    setRouteToDelete(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/routes/${routeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'deleted' }));
      toast.success(`🗑️ "${routeName}" has been permanently deleted`);
      
      setTimeout(() => {
        setApprovedRoutes(approvedRoutes.filter(r => r.id !== routeId));
        setProcessingRoutes(prev => {
          const newState = { ...prev };
          delete newState[routeId];
          return newState;
        });
      }, 1500);
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error(`❌ Failed to delete "${routeName}". Please try again.`);
      setProcessingRoutes(prev => {
        const newState = { ...prev };
        delete newState[routeId];
        return newState;
      });
    }
  };

  const handleShareRoute = (data: any) => {
    // Refresh data after edit
    if (token) {
      loadPendingRoutes(token);
      loadApprovedRoutes(token);
    }
    setIsRouteCreatorOpen(false);
    setEditingRoute(null);
  };

  const renderRouteCard = (route: Route, showApprovalActions: boolean) => (
    <Card key={route.id} className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Image */}
        <div className="lg:col-span-1">
          {route.imageUrl ? (
            <img
              src={route.imageUrl}
              alt={route.routeName}
              className="w-full h-64 lg:h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-64 lg:h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Route Details */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-[#1E293B] text-xl mb-2">{route.routeName}</h3>
            <p className="text-gray-600 text-sm mb-3">{route.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <div className="text-xs text-gray-500">Leader</div>
                <div className="text-sm text-[#1E293B]">{route.leaderName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Distance</div>
                <div className="text-sm text-[#1E293B]">{route.distance} mi</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Est. Time</div>
                <div className="text-sm text-[#1E293B]">{route.time} min</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Waypoints</div>
                <div className="text-sm text-[#1E293B]">{route.waypoints?.length || 0}</div>
              </div>
            </div>

            {route.startingLocation && (
              <div className="mb-3">
                <div className="text-xs text-gray-500">Starting Location</div>
                <div className="text-sm text-[#1E293B]">{route.startingLocation}</div>
              </div>
            )}

            {route.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {route.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <a
                href={route.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#10B981] hover:text-[#059669] flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                View in Google Maps
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                   setEditingRoute(route);
                   setIsRouteCreatorOpen(true);
                }}
                className="text-sm flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit Route
              </Button>
            </div>

            <div className="text-xs text-gray-400">
              {showApprovalActions ? 'Submitted' : 'Approved'} {new Date(route.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {showApprovalActions ? (
              <>
                <Button
                  onClick={() => handleApprove(route.id)}
                  className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white"
                  disabled={processingRoutes[route.id] === 'approving' || processingRoutes[route.id] === 'approved'}
                >
                  {processingRoutes[route.id] === 'approving' ? (
                    <Check className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(route.id)}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={processingRoutes[route.id] === 'rejecting' || processingRoutes[route.id] === 'rejected'}
                >
                  {processingRoutes[route.id] === 'rejecting' ? (
                    <X className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setRouteToDelete(route)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                disabled={processingRoutes[route.id] === 'deleting' || processingRoutes[route.id] === 'deleted'}
              >
                {processingRoutes[route.id] === 'deleting' ? (
                  <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Route
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 w-full py-4 flex justify-center items-center shadow-sm">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="hover:opacity-80 transition-opacity">
            <img src={logo} alt="Ride United" className="h-12" />
          </a>
        </nav>
        <div className="flex items-start justify-center p-4 min-h-[calc(100vh-81px)] pt-24">
          <Card className="w-full max-w-md p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-[#1E293B] text-2xl mb-2">Admin Login</h1>
              <p className="text-gray-500 text-sm text-center">
                Enter password to access dashboard
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="flex-shrink-0">
                <img src={logo} alt="Ride United" className="h-10" />
              </a>
              <div>
                <h1 className="text-[#1E293B] text-2xl sm:text-3xl">Administrative Dashboard</h1>
                <p className="text-gray-500 mt-1">
                  Manage routes and view messages
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="pending">
              Pending ({pendingRoutes.length})
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => loadApprovedRoutes()}>
              Published ({approvedRoutes.length})
            </TabsTrigger>
            <TabsTrigger value="messages" onClick={() => loadMessages()}>
              Messages ({messages.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Routes Tab */}
          <TabsContent value="pending">
            {isLoadingPending ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading pending routes...</p>
              </div>
            ) : pendingRoutes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Check className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
                <p className="text-[#1E293B] text-lg mb-2">All caught up!</p>
                <p className="text-gray-500">No pending routes to review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRoutes.map((route) => renderRouteCard(route, true))}
              </div>
            )}
          </TabsContent>

          {/* Approved Routes Tab */}
          <TabsContent value="approved">
            {isLoadingApproved ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading published routes...</p>
              </div>
            ) : approvedRoutes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-[#1E293B] text-lg mb-2">No published routes yet</p>
                <p className="text-gray-500">Approved routes will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {approvedRoutes.map((route) => renderRouteCard(route, false))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            {isLoadingMessages ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-[#1E293B] text-lg mb-2">No messages yet</p>
                <p className="text-gray-500">Contact form submissions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-[#1E293B] text-lg">{msg.subject}</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{msg.name}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${msg.email}`} className="hover:text-[#10B981] hover:underline">
                              {msg.email}
                            </a>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                          Reply via Email
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!routeToDelete} onOpenChange={() => setRouteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{routeToDelete?.routeName}"? 
              This action cannot be undone and will remove the route from the public listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => routeToDelete && handleDelete(routeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RouteCreatorModal
        isOpen={isRouteCreatorOpen}
        onClose={() => {
            setIsRouteCreatorOpen(false);
            setEditingRoute(null);
            // Refresh data when closing without saving
            if (token) {
              loadPendingRoutes(token);
              loadApprovedRoutes(token);
            }
        }}
        onShare={handleShareRoute}
        initialRoute={editingRoute}
        isAdmin={true}
        adminToken={token || undefined}
      />
    </div>
  );
}
