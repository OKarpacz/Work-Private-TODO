import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseClient = () => {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  console.log('Supabase URL:', url);
  console.log('SERVICE_ROLE_KEY exists:', !!key);
  
  return createClient(url, key);
};

const getSupabaseAuthClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    console.log('No access token provided');
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  console.log('Token (first 30 chars):', accessToken.substring(0, 30) + '...');
  console.log('Token (last 10 chars):', '...' + accessToken.slice(-10));
  console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
  console.log('ANON_KEY exists:', !!Deno.env.get('SUPABASE_ANON_KEY'));
  console.log('SERVICE_ROLE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

  try {
    // Use ANON_KEY to verify user tokens (not SERVICE_ROLE_KEY)
    // User tokens from signInWithPassword should be verified with ANON_KEY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Calling supabase.auth.getUser() with access token...');

    // Get the user using their JWT token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.log('❌ Auth verification failed');
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error status:', error.status);
      console.log('Error name:', error.name);
      console.log('Full error object:', JSON.stringify(error, null, 2));
      console.log('Full error (using util.inspect):', error);
      
      return c.json({ 
        error: 'Unauthorized - Invalid token', 
        message: error.message,
        code: error.code,
        status: error.status
      }, 401);
    }

    if (!user) {
      console.log('❌ No user returned from getUser()');
      return c.json({ 
        error: 'Unauthorized - No user found'
      }, 401);
    }

    console.log('✓ User authenticated successfully');
    console.log('  User ID:', user.id);
    console.log('  User email:', user.email);
    
    c.set('userId', user.id);
    c.set('userEmail', user.email);
    await next();
  } catch (err) {
    console.log('❌ Auth middleware exception');
    console.log('Exception message:', err.message);
    console.log('Exception stack:', err.stack);
    console.log('Full exception:', err);
    return c.json({ error: 'Authentication failed', message: err.message }, 401);
  }
};

// Health check endpoint
app.get("/make-server-90b519e8/health", (c) => {
  return c.json({ 
    status: "ok",
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  });
});

// Debug endpoint to test token verification
app.post("/make-server-90b519e8/verify-token", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token' }, 400);
    }

    console.log('=== VERIFYING TOKEN ===');
    console.log('Token (first 50 chars):', accessToken.substring(0, 50) + '...');
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('SUPABASE_ANON_KEY exists:', !!Deno.env.get('SUPABASE_ANON_KEY'));
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    // Try with SERVICE_ROLE_KEY first (recommended for server-side verification)
    const supabaseWithServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: dataServiceRole, error: errorServiceRole } = await supabaseWithServiceRole.auth.getUser(accessToken);

    console.log('\nVerification with SERVICE_ROLE_KEY:');
    console.log('- Error:', errorServiceRole?.message || 'None');
    console.log('- User:', dataServiceRole.user ? `${dataServiceRole.user.id} (${dataServiceRole.user.email})` : 'null');

    // Also try with ANON_KEY for comparison
    const supabaseWithAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: dataAnon, error: errorAnon } = await supabaseWithAnon.auth.getUser(accessToken);

    console.log('\nVerification with ANON_KEY:');
    console.log('- Error:', errorAnon?.message || 'None');
    console.log('- User:', dataAnon.user ? `${dataAnon.user.id} (${dataAnon.user.email})` : 'null');

    if (errorServiceRole && errorAnon) {
      return c.json({ 
        success: false, 
        serviceRoleError: {
          message: errorServiceRole.message,
          code: errorServiceRole.code,
          status: errorServiceRole.status
        },
        anonError: {
          message: errorAnon.message,
          code: errorAnon.code,
          status: errorAnon.status
        },
        supabaseUrl: Deno.env.get('SUPABASE_URL')
      });
    }

    const successData = dataServiceRole.user ? dataServiceRole : dataAnon;
    const successMethod = dataServiceRole.user ? 'SERVICE_ROLE_KEY' : 'ANON_KEY';

    return c.json({ 
      success: true,
      method: successMethod,
      user: {
        id: successData.user?.id,
        email: successData.user?.email
      },
      supabaseUrl: Deno.env.get('SUPABASE_URL')
    });
  } catch (error) {
    console.log('Verify token exception:', error);
    return c.json({ error: `Exception: ${error.message}` }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-90b519e8/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: `Signup error: ${error.message}` }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

// Get all tasks for the authenticated user
app.get("/make-server-90b519e8/tasks", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get all tasks from KV store
    const allTasks = await kv.getByPrefix('task:');
    
    // Filter tasks that belong to the user or are shared with them
    const userTasks = allTasks.filter((taskData: any) => {
      return taskData.userId === userId || 
             (taskData.sharedWith && taskData.sharedWith.includes(userId));
    });

    return c.json({ tasks: userTasks });
  } catch (error) {
    console.log('Get tasks error:', error);
    return c.json({ error: `Failed to get tasks: ${error.message}` }, 500);
  }
});

// Create a new task
app.post("/make-server-90b519e8/tasks", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const taskId = crypto.randomUUID();
    const taskData = {
      id: taskId,
      ...body,
      userId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await kv.set(`task:${taskId}`, taskData);

    return c.json({ success: true, task: taskData });
  } catch (error) {
    console.log('Create task error:', error);
    return c.json({ error: `Failed to create task: ${error.message}` }, 500);
  }
});

// Update a task
app.put("/make-server-90b519e8/tasks/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    const body = await c.req.json();

    // Get existing task
    const existingTask = await kv.get(`task:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Check if user has access to this task
    if (existingTask.userId !== userId && 
        !(existingTask.sharedWith && existingTask.sharedWith.includes(userId))) {
      return c.json({ error: 'Unauthorized - You do not have access to this task' }, 403);
    }

    const updatedTask = {
      ...existingTask,
      ...body,
      id: taskId, // Ensure ID doesn't change
      userId: existingTask.userId, // Ensure owner doesn't change
    };

    await kv.set(`task:${taskId}`, updatedTask);

    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    console.log('Update task error:', error);
    return c.json({ error: `Failed to update task: ${error.message}` }, 500);
  }
});

// Delete a task
app.delete("/make-server-90b519e8/tasks/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const taskId = c.req.param('id');

    // Get existing task
    const existingTask = await kv.get(`task:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Check if user is the owner (only owner can delete)
    if (existingTask.userId !== userId) {
      return c.json({ error: 'Unauthorized - Only task owner can delete' }, 403);
    }

    await kv.del(`task:${taskId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete task error:', error);
    return c.json({ error: `Failed to delete task: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);