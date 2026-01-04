import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const getSupabaseClient = () => {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  
  return createClient(url, key);
};

const getSupabaseAuthClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};


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


const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );


    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      
      return c.json({ 
        error: 'Unauthorized - Invalid token', 
        message: error.message,
        code: error.code,
        status: error.status
      }, 401);
    }

    if (!user) {
      return c.json({ 
        error: 'Unauthorized - No user found'
      }, 401);
    }
    
    c.set('userId', user.id);
    c.set('userEmail', user.email);
    await next();
  } catch (err) {
    return c.json({ error: 'Authentication failed', message: err.message }, 401);
  }
};

app.get("/make-server-90b519e8/health", (c) => {
  return c.json({ 
    status: "ok",
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  });
});

app.post("/make-server-90b519e8/verify-token", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token' }, 400);
    }

    const supabaseWithServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: dataServiceRole, error: errorServiceRole } = await supabaseWithServiceRole.auth.getUser(accessToken);

    const supabaseWithAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: dataAnon, error: errorAnon } = await supabaseWithAnon.auth.getUser(accessToken);


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
    return c.json({ error: `Exception: ${error.message}` }, 500);
  }
});

app.post("/make-server-90b519e8/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      email_confirm: true
    });

    if (error) {
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
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

app.get("/make-server-90b519e8/tasks", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const allTasks = await kv.getByPrefix('task:');

    const userTasks = allTasks.filter((taskData: any) => {
      return taskData.userId === userId || 
             (taskData.sharedWith && taskData.sharedWith.includes(userId));
    });

    return c.json({ tasks: userTasks });
  } catch (error) {
    return c.json({ error: `Failed to get tasks: ${error.message}` }, 500);
  }
});

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
    return c.json({ error: `Failed to create task: ${error.message}` }, 500);
  }
});


app.put("/make-server-90b519e8/tasks/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    const body = await c.req.json();

    const existingTask = await kv.get(`task:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (existingTask.userId !== userId && 
        !(existingTask.sharedWith && existingTask.sharedWith.includes(userId))) {
      return c.json({ error: 'Unauthorized - You do not have access to this task' }, 403);
    }

    const updatedTask = {
      ...existingTask,
      ...body,
      id: taskId,
      userId: existingTask.userId,
    };

    await kv.set(`task:${taskId}`, updatedTask);

    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    return c.json({ error: `Failed to update task: ${error.message}` }, 500);
  }
});

app.delete("/make-server-90b519e8/tasks/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const taskId = c.req.param('id');

    const existingTask = await kv.get(`task:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (existingTask.userId !== userId) {
      return c.json({ error: 'Unauthorized - Only task owner can delete' }, 403);
    }

    await kv.del(`task:${taskId}`);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: `Failed to delete task: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);