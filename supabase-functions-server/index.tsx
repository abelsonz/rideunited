import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

console.log('🚀 Ride United Admin Server Starting - Version 2.0');

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create storage bucket on startup
const bucketName = 'make-8e620cdb-route-images';

// Initialize bucket
const initBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating route images bucket...');
      await supabase.storage.createBucket(bucketName, {
        public: false, // Private bucket for moderation
        fileSizeLimit: 5242880, // 5MB max
      });
      console.log('Bucket created successfully');
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
};

initBucket();

// ===== ROUTES API =====

// Submit a new route (pending approval)
app.post('/make-server-8e620cdb/routes', async (c) => {
  try {
    const formData = await c.req.formData();
    
    const routeName = formData.get('routeName') as string;
    const description = formData.get('description') as string;
    const leaderName = formData.get('leaderName') as string;
    const googleMapsUrl = formData.get('googleMapsUrl') as string;
    const waypoints = JSON.parse(formData.get('waypoints') as string);
    const distance = parseFloat(formData.get('distance') as string);
    const time = parseFloat(formData.get('time') as string);
    const startingLocation = formData.get('startingLocation') as string;
    const startTime = formData.get('startTime') as string;
    const tags = JSON.parse(formData.get('tags') as string);
    const userId = formData.get('userId') as string;
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!routeName || !leaderName || !waypoints || waypoints.length < 2) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Upload image to storage if provided
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${imageFile.name}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return c.json({ error: 'Failed to upload image' }, 500);
      }

      imageUrl = fileName; // Store filename, will generate signed URL when retrieving
    }

    // Create route object
    const routeId = crypto.randomUUID();
    const route = {
      id: routeId,
      routeName,
      description,
      leaderName,
      googleMapsUrl,
      waypoints,
      distance,
      time,
      startingLocation,
      startTime,
      tags,
      imageUrl,
      userId: userId || null, // Store userId if provided
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
    };

    // Store in KV
    await kv.set(`route:${routeId}`, route);
    
    console.log(`✅ Route stored in KV with key: route:${routeId}`);
    console.log(`📦 Route data:`, JSON.stringify(route, null, 2));
    
    // Add to pending list
    const pendingRoutes = await kv.get('routes:pending') || [];
    console.log(`📋 Current pending routes before adding:`, pendingRoutes);
    pendingRoutes.push(routeId);
    await kv.set('routes:pending', pendingRoutes);
    console.log(`📋 Pending routes after adding:`, pendingRoutes);

    // If userId is present, add to user's route list
    if (userId) {
      const userRouteKey = `user:${userId}:routes`;
      const userRoutes = await kv.get(userRouteKey) || [];
      userRoutes.push(routeId);
      await kv.set(userRouteKey, userRoutes);
      console.log(`👤 Added route to user list: ${userRouteKey}`);
    }

    console.log(`New route submitted: ${routeName} by ${leaderName} (ID: ${routeId})`);

    return c.json({ 
      success: true, 
      message: 'Route submitted for approval',
      routeId 
    });
  } catch (error) {
    console.error('Error submitting route:', error);
    return c.json({ error: `Failed to submit route: ${error.message}` }, 500);
  }
});

// Get all approved routes
app.get('/make-server-8e620cdb/routes', async (c) => {
  try {
    const approvedRouteIds = await kv.get('routes:approved') || [];
    
    if (approvedRouteIds.length === 0) {
      return c.json({ routes: [] });
    }

    const routes = await kv.mget(approvedRouteIds.map(id => `route:${id}`));
    
    // Generate signed URLs for images
    const routesWithImages = await Promise.all(
      routes.map(async (route) => {
        if (route?.imageUrl) {
          const { data: signedUrlData } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(route.imageUrl, 3600); // 1 hour expiry
          
          return {
            ...route,
            imageUrl: signedUrlData?.signedUrl || null,
          };
        }
        return route;
      })
    );

    return c.json({ routes: routesWithImages.filter(r => r !== null) });
  } catch (error) {
    console.error('Error fetching approved routes:', error);
    return c.json({ error: `Failed to fetch routes: ${error.message}` }, 500);
  }
});

// Get routes for a specific user
app.get('/make-server-8e620cdb/routes/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userRouteKey = `user:${userId}:routes`;
    const userRouteIds = await kv.get(userRouteKey) || [];
    
    if (userRouteIds.length === 0) {
      return c.json({ routes: [] });
    }

    // Fetch all routes for the user
    const routes = await kv.mget(userRouteIds.map(id => `route:${id}`));
    
    // Filter out any nulls (in case a route was deleted but ID remains in user list)
    const validRoutes = routes.filter(r => r !== null);

    // Generate signed URLs for images
    const routesWithImages = await Promise.all(
      validRoutes.map(async (route) => {
        if (route?.imageUrl) {
          try {
            // Check if it's already a full URL
            if (route.imageUrl.startsWith('http://') || route.imageUrl.startsWith('https://')) {
               return { ...route, imageUrl: route.imageUrl };
            }

            const { data: signedUrlData } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(route.imageUrl, 3600); // 1 hour expiry
            
            return {
              ...route,
              imageUrl: signedUrlData?.signedUrl || null,
            };
          } catch (e) {
            console.error('Error generating signed URL:', e);
            return route;
          }
        }
        return route;
      })
    );

    return c.json({ routes: routesWithImages });
  } catch (error) {
    console.error('Error fetching user routes:', error);
    return c.json({ error: `Failed to fetch user routes: ${error.message}` }, 500);
  }
});

// Contact form submission
app.post('/make-server-8e620cdb/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();
    
    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400);
    }

    const submissionId = crypto.randomUUID();
    const submission = {
      id: submissionId,
      name,
      email,
      subject,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Store in KV
    await kv.set(`contact:${submissionId}`, submission);
    
    // Add to list of submissions
    const submissions = await kv.get('contact:submissions') || [];
    submissions.push(submissionId);
    await kv.set('contact:submissions', submissions);
    
    console.log(`New contact submission from ${name} (${email})`);
    
    return c.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: `Failed to send message: ${error.message}` }, 500);
  }
});

// Get contact submissions (admin only)
app.get('/make-server-8e620cdb/admin/contact/submissions', async (c) => {
  const auth = await verifyAdmin(c);
  if (!auth.valid) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const submissionIds = await kv.get('contact:submissions') || [];
    
    if (submissionIds.length === 0) {
      return c.json({ submissions: [] });
    }
    
    const submissions = await kv.mget(submissionIds.map((id: string) => `contact:${id}`));
    const validSubmissions = submissions.filter((s: any) => s !== null);
    
    // Sort by date desc
    validSubmissions.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ submissions: validSubmissions });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return c.json({ error: 'Failed to fetch submissions' }, 500);
  }
});

// ===== ADMIN API =====

// Admin login (simple password check or user token bypass)
app.post('/make-server-8e620cdb/admin/login', async (c) => {
  try {
    const body = await c.req.json();
    
    // Option 1: Login with User Token (for specific admins)
    if (body.access_token) {
       const { data: { user }, error } = await supabase.auth.getUser(body.access_token);
       
       // Hardcoded admin emails
       const ADMIN_EMAILS = ['zabel3211@gmail.com'];
       
       if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
          // Generate admin session
          const token = crypto.randomUUID();
          const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
          await kv.set(`admin:session:${token}`, { expiresAt, email: user.email });
          console.log(`✅ Admin login via token for ${user.email}`);
          return c.json({ success: true, token });
       }
       
       return c.json({ error: 'Unauthorized access' }, 401);
    }

    // Option 2: Password login (existing)
    const { password } = body;
    
    // Store admin password in KV (you can set this via the admin panel first time)
    const adminPassword = await kv.get('admin:password') || 'RideUnited2025'; // Default password
    
    if (password === adminPassword) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      await kv.set(`admin:session:${token}`, { expiresAt });
      
      return c.json({ success: true, token });
    }
    
    return c.json({ error: 'Invalid password' }, 401);
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ error: `Login failed: ${error.message}` }, 500);
  }
});

// User signup with auto-confirm
app.post('/make-server-8e620cdb/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

// Verify admin session
const verifyAdmin = async (c: any) => {
  const authToken = c.req.header('X-Admin-Token');
  console.log('🔐 Verifying admin - X-Admin-Token header:', authToken ? 'Present' : 'Missing');
  
  if (!authToken) {
    console.log('❌ Admin verification failed: No admin token');
    return { valid: false, error: 'No admin token' };
  }
  
  console.log('🔐 Checking session for token:', authToken.substring(0, 20) + '...');
  
  const session = await kv.get(`admin:session:${authToken}`);
  console.log('🔐 Session data:', session ? 'Found' : 'Not found');
  
  if (!session) {
    console.log('❌ Admin verification failed: Session not found in KV');
    return { valid: false, error: 'Invalid or expired session' };
  }
  
  console.log('🔐 Session expires at:', new Date(session.expiresAt).toISOString());
  console.log('🔐 Current time:', new Date(Date.now()).toISOString());
  
  if (session.expiresAt < Date.now()) {
    console.log('❌ Admin verification failed: Session expired');
    return { valid: false, error: 'Invalid or expired session' };
  }
  
  console.log('✅ Admin verification successful');
  return { valid: true };
};

// Get pending routes
app.get('/make-server-8e620cdb/admin/routes/pending', async (c) => {
  console.log('📥 GET /admin/routes/pending - Loading pending routes');
  const verification = await verifyAdmin(c);
  if (!verification.valid) {
    console.log('❌ Admin verification failed:', verification.error);
    return c.json({ code: 401, message: verification.error }, 401);
  }

  try {
    const routes = await kv.getByPrefix('route:');
    console.log('📥 Total routes found:', routes?.length || 0);
    const pendingRoutes = routes.filter((r: any) => r.status === 'pending');
    console.log('📥 Pending routes found:', pendingRoutes?.length || 0);
    
    // Generate signed URLs for images
    const routesWithSignedUrls = await Promise.all(
      pendingRoutes.map(async (route: any) => {
        if (route.imageUrl) {
          try {
            // Check if it's already a full URL (external or signed URL)
            if (route.imageUrl.startsWith('http://') || route.imageUrl.startsWith('https://')) {
              console.log('Route has external image URL, skipping signed URL generation:', route.id);
              return { ...route, imageUrl: null }; // Don't use external URLs
            }
            
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(route.imageUrl, 3600); // 1 hour expiry
            
            if (signedUrlError) {
              console.error('Error generating signed URL for route:', route.id, signedUrlError);
              return { ...route, imageUrl: null };
            }
            
            return { ...route, imageUrl: signedUrlData?.signedUrl || null };
          } catch (error) {
            console.error('Error generating signed URL for route:', route.id, error);
            return { ...route, imageUrl: null };
          }
        }
        return route;
      })
    );
    
    return c.json({ routes: routesWithSignedUrls });
  } catch (error) {
    console.error('❌ Error loading pending routes:', error);
    return c.json({ error: 'Failed to load routes' }, 500);
  }
});

// Get approved routes
app.get('/make-server-8e620cdb/admin/routes/approved', async (c) => {
  console.log('📥 GET /admin/routes/approved - Loading approved routes');
  const verification = await verifyAdmin(c);
  if (!verification.valid) {
    console.log('❌ Admin verification failed:', verification.error);
    return c.json({ code: 401, message: verification.error }, 401);
  }

  try {
    const routes = await kv.getByPrefix('route:');
    console.log('📥 Total routes found:', routes?.length || 0);
    const approvedRoutes = routes.filter((r: any) => r.status === 'approved');
    console.log('📥 Approved routes found:', approvedRoutes?.length || 0);
    
    // Generate signed URLs for images
    const routesWithSignedUrls = await Promise.all(
      approvedRoutes.map(async (route: any) => {
        if (route.imageUrl) {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(route.imageUrl, 3600); // 1 hour expiry
            
            if (signedUrlError) {
              console.error('Error generating signed URL for route:', route.id, signedUrlError);
              return { ...route, imageUrl: null };
            }
            
            return { ...route, imageUrl: signedUrlData?.signedUrl || null };
          } catch (error) {
            console.error('Error generating signed URL for route:', route.id, error);
            return { ...route, imageUrl: null };
          }
        }
        return route;
      })
    );
    
    return c.json({ routes: routesWithSignedUrls });
  } catch (error) {
    console.error('❌ Error loading approved routes:', error);
    return c.json({ error: 'Failed to load routes' }, 500);
  }
});

// Approve a route (admin only)
app.post('/make-server-8e620cdb/admin/routes/:id/approve', async (c) => {
  const auth = await verifyAdmin(c);
  if (!auth.valid) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const routeId = c.req.param('id');
    const route = await kv.get(`route:${routeId}`);
    
    if (!route) {
      return c.json({ error: 'Route not found' }, 404);
    }
    
    // Update route status
    route.status = 'approved';
    await kv.set(`route:${routeId}`, route);
    
    // Remove from pending list
    const pendingRoutes = await kv.get('routes:pending') || [];
    const updatedPending = pendingRoutes.filter(id => id !== routeId);
    await kv.set('routes:pending', updatedPending);
    
    // Add to approved list
    const approvedRoutes = await kv.get('routes:approved') || [];
    approvedRoutes.push(routeId);
    await kv.set('routes:approved', approvedRoutes);
    
    console.log(`Route approved: ${route.routeName} (ID: ${routeId})`);
    
    return c.json({ success: true, message: 'Route approved' });
  } catch (error) {
    console.error('Error approving route:', error);
    return c.json({ error: `Failed to approve route: ${error.message}` }, 500);
  }
});

// Reject a route (admin only)
app.post('/make-server-8e620cdb/admin/routes/:id/reject', async (c) => {
  const auth = await verifyAdmin(c);
  if (!auth.valid) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const routeId = c.req.param('id');
    const route = await kv.get(`route:${routeId}`);
    
    if (!route) {
      return c.json({ error: 'Route not found' }, 404);
    }
    
    // Delete image from storage if exists
    if (route.imageUrl) {
      await supabase.storage.from(bucketName).remove([route.imageUrl]);
    }
    
    // Update route status
    route.status = 'rejected';
    await kv.set(`route:${routeId}`, route);
    
    // Remove from pending list
    const pendingRoutes = await kv.get('routes:pending') || [];
    const updatedPending = pendingRoutes.filter(id => id !== routeId);
    await kv.set('routes:pending', updatedPending);
    
    console.log(`Route rejected: ${route.routeName} (ID: ${routeId})`);
    
    return c.json({ success: true, message: 'Route rejected' });
  } catch (error) {
    console.error('Error rejecting route:', error);
    return c.json({ error: `Failed to reject route: ${error.message}` }, 500);
  }
});

// Update an existing route
app.put('/make-server-8e620cdb/routes/:id', async (c) => {
  try {
    const routeId = c.req.param('id');
    const formData = await c.req.formData();
    
    // Fetch existing route
    const existingRoute = await kv.get(`route:${routeId}`);
    if (!existingRoute) {
      return c.json({ error: 'Route not found' }, 404);
    }

    // Check authorization (user owns route OR admin)
    const userId = formData.get('userId') as string;
    const adminToken = c.req.header('X-Admin-Token');
    let isAdmin = false;

    if (adminToken) {
       const auth = await verifyAdmin(c);
       if (auth.valid) isAdmin = true;
    }

    // Authorization Logic
    if (isAdmin) {
       // Admin can edit anything
    } else {
       // User must own the route
       if (existingRoute.userId !== userId) {
           return c.json({ error: 'Unauthorized' }, 403);
       }
       // User can only edit pending routes
       if (existingRoute.status !== 'pending') {
           return c.json({ error: 'Cannot edit route that has been processed' }, 403);
       }
    }

    const routeName = formData.get('routeName') as string;
    const description = formData.get('description') as string;
    const leaderName = formData.get('leaderName') as string;
    const googleMapsUrl = formData.get('googleMapsUrl') as string;
    const waypoints = JSON.parse(formData.get('waypoints') as string);
    const distance = parseFloat(formData.get('distance') as string);
    const time = parseFloat(formData.get('time') as string);
    const startingLocation = formData.get('startingLocation') as string;
    const startTime = formData.get('startTime') as string;
    const tags = JSON.parse(formData.get('tags') as string);
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!routeName || !leaderName || !waypoints || waypoints.length < 2) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Handle image update
    let imageUrl = existingRoute.imageUrl;
    if (imageFile && imageFile.size > 0) {
      // Upload new image
      const timestamp = Date.now();
      const fileName = `${timestamp}-${imageFile.name}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return c.json({ error: 'Failed to upload image' }, 500);
      }

      // Delete old image if it exists and isn't external
      if (existingRoute.imageUrl && !existingRoute.imageUrl.startsWith('http')) {
          await supabase.storage.from(bucketName).remove([existingRoute.imageUrl]);
      }

      imageUrl = fileName;
    }

    // Update route object
    const updatedRoute = {
      ...existingRoute,
      routeName,
      description,
      leaderName,
      googleMapsUrl,
      waypoints,
      distance,
      time,
      startingLocation,
      startTime,
      tags,
      imageUrl,
    };
    
    await kv.set(`route:${routeId}`, updatedRoute);
    
    console.log(`✅ Route updated: ${routeName} (ID: ${routeId})`);

    return c.json({ 
      success: true, 
      message: 'Route updated successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Error updating route:', error);
    return c.json({ error: `Failed to update route: ${error.message}` }, 500);
  }
});

// Delete a route (admin only) - Deletes from any status
app.delete('/make-server-8e620cdb/admin/routes/:id', async (c) => {
  const auth = await verifyAdmin(c);
  if (!auth.valid) {
    return c.json({ error: auth.error }, 401);
  }
  
  try {
    const routeId = c.req.param('id');
    const route = await kv.get(`route:${routeId}`);
    
    if (!route) {
      return c.json({ error: 'Route not found' }, 404);
    }
    
    // Delete image from storage if exists
    if (route.imageUrl) {
      console.log(`🗑️ Deleting image: ${route.imageUrl}`);
      await supabase.storage.from(bucketName).remove([route.imageUrl]);
    }
    
    // Delete from KV
    await kv.del(`route:${routeId}`);
    
    // Remove from appropriate list based on status
    if (route.status === 'pending') {
      const pendingRoutes = await kv.get('routes:pending') || [];
      const updatedPending = pendingRoutes.filter(id => id !== routeId);
      await kv.set('routes:pending', updatedPending);
    } else if (route.status === 'approved') {
      const approvedRoutes = await kv.get('routes:approved') || [];
      const updatedApproved = approvedRoutes.filter(id => id !== routeId);
      await kv.set('routes:approved', updatedApproved);
    }
    
    console.log(`🗑️ Route deleted: ${route.routeName} (ID: ${routeId})`);
    
    return c.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    console.error('Error deleting route:', error);
    return c.json({ error: `Failed to delete route: ${error.message}` }, 500);
  }
});

// Delete user account
app.post('/make-server-8e620cdb/delete-account', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Missing Authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json({ error: 'Invalid user token' }, 401);
    }

    console.log(`🗑️ Request to delete user: ${user.id} (${user.email})`);

    // 1. Delete user's routes from KV
    // Find all routes by this user
    const userRouteKey = `user:${user.id}:routes`;
    const userRouteIds = await kv.get(userRouteKey) || [];
    
    if (userRouteIds.length > 0) {
      console.log(`🗑️ Deleting ${userRouteIds.length} routes for user ${user.id}`);
      
      for (const routeId of userRouteIds) {
        const route = await kv.get(`route:${routeId}`);
        if (route) {
          // Remove image if exists
          if (route.imageUrl) {
             await supabase.storage.from(bucketName).remove([route.imageUrl]);
          }
          
          // Delete route data
          await kv.del(`route:${routeId}`);
          
          // Remove from lists
          if (route.status === 'pending') {
            const pending = await kv.get('routes:pending') || [];
            await kv.set('routes:pending', pending.filter((id: string) => id !== routeId));
          } else if (route.status === 'approved') {
            const approved = await kv.get('routes:approved') || [];
            await kv.set('routes:approved', approved.filter((id: string) => id !== routeId));
          }
        }
      }
      
      // Delete user's route list
      await kv.del(userRouteKey);
    }

    // 2. Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Error deleting user from Auth:', deleteError);
      return c.json({ error: 'Failed to delete user account' }, 500);
    }

    console.log(`✅ User account deleted successfully: ${user.id}`);
    return c.json({ success: true, message: 'Account deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    return c.json({ error: `Failed to delete account: ${error.message}` }, 500);
  }
});

// ===== CHAT API =====

// Get chat messages for a ride
app.get('/make-server-8e620cdb/chat/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const messages = await kv.get(`chat:${rideId}:messages`) || [];
    return c.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Add a chat message
app.post('/make-server-8e620cdb/chat/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const { message, userToken } = await c.req.json();
    
    if (!message || !userToken) {
      return c.json({ error: 'Message and user token are required' }, 400);
    }

    // Verify user
    const { data: { user }, error } = await supabase.auth.getUser(userToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const newMessage = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      message,
      createdAt: new Date().toISOString(),
    };

    const messages = await kv.get(`chat:${rideId}:messages`) || [];
    messages.push(newMessage);
    
    // Keep only last 50 messages
    if (messages.length > 50) {
      messages.shift();
    }
    
    await kv.set(`chat:${rideId}:messages`, messages);
    
    return c.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error adding chat message:', error);
    return c.json({ error: 'Failed to add message' }, 500);
  }
});

// Delete a chat message (Admin or Message Author)
app.delete('/make-server-8e620cdb/chat/:rideId/:messageId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const messageId = c.req.param('messageId');
    
    let isAdmin = false;
    let userId = null;

    // 1. Check Admin
    const adminVerification = await verifyAdmin(c);
    if (adminVerification.valid) {
        isAdmin = true;
    }

    // 2. Check User (if not admin)
    if (!isAdmin) {
        const authHeader = c.req.header('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            // Only verify if it's not the anon key (simple check or just verify)
            if (token) {
                const { data: { user }, error } = await supabase.auth.getUser(token);
                if (user) {
                    userId = user.id;
                }
            }
        }
    }

    if (!isAdmin && !userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const messages = await kv.get(`chat:${rideId}:messages`) || [];
    const messageIndex = messages.findIndex((m: any) => m.id === messageId);
    
    if (messageIndex === -1) {
        return c.json({ error: 'Message not found' }, 404);
    }

    const message = messages[messageIndex];

    // Authorization check
    // Allow if admin OR if user owns the message
    if (isAdmin || (userId && message.userId === userId)) {
        const updatedMessages = messages.filter((m: any) => m.id !== messageId);
        await kv.set(`chat:${rideId}:messages`, updatedMessages);
        return c.json({ success: true });
    } else {
        return c.json({ error: 'You can only delete your own messages' }, 403);
    }

  } catch (error) {
    console.error('Error deleting chat message:', error);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

Deno.serve(app.fetch);