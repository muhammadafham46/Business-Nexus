import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  insertCollaborationRequestSchema,
  insertMessageSchema,
  insertConnectionSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/login', async (req: any, res: any) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const { confirmPassword, ...userData } = data;
      const user = await storage.createUser(userData);
      
      (req.session as any).userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post('/api/auth/logout', (req: any, res: any) => {
    (req.session as any).userId = undefined;
    res.json({ message: "Logged out successfully" });
  });

  app.get('/api/auth/me', async (req: any, res: any) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // User routes
  app.get('/api/users', requireAuth, async (req: any, res: any) => {
    const { role } = req.query;
    
    try {
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : await storage.getAllUsers();
      
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/:id', requireAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/users/:id', requireAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId!;
      
      // Users can only update their own profile
      if (id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Collaboration request routes
  app.get('/api/collaboration-requests', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const requests = await storage.getCollaborationRequestsForUser(userId);
      
      // Get user details for each request
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const fromUser = await storage.getUser(request.fromUserId);
          const { password, ...userWithoutPassword } = fromUser || {};
          return {
            ...request,
            fromUser: fromUser ? userWithoutPassword : null
          };
        })
      );
      
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaboration requests" });
    }
  });

  app.post('/api/collaboration-requests', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const requestData = insertCollaborationRequestSchema.parse({
        ...req.body,
        fromUserId: userId
      });

      const request = await storage.createCollaborationRequest(requestData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put('/api/collaboration-requests/:id', requireAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId!;
      const { status } = req.body;

      const request = await storage.getCollaborationRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Only the recipient can update the status
      if (request.toUserId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedRequest = await storage.updateCollaborationRequestStatus(id, status);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  // Message routes
  app.get('/api/messages/:otherUserId', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const otherUserId = parseInt(req.params.otherUserId);
      
      const messages = await storage.getMessagesBetweenUsers(userId, otherUserId);
      
      // Get user details for messages
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const fromUser = await storage.getUser(message.fromUserId);
          const { password, ...userWithoutPassword } = fromUser || {};
          return {
            ...message,
            fromUser: fromUser ? userWithoutPassword : null
          };
        })
      );
      
      res.json(messagesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: userId
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Connection routes
  app.get('/api/connections', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const connections = await storage.getConnectionsForUser(userId);
      
      // Get user details for connections
      const connectionsWithUsers = await Promise.all(
        connections.map(async (connection) => {
          const otherUserId = connection.userId1 === userId ? connection.userId2 : connection.userId1;
          const otherUser = await storage.getUser(otherUserId);
          const { password, ...userWithoutPassword } = otherUser || {};
          return {
            ...connection,
            otherUser: otherUser ? userWithoutPassword : null
          };
        })
      );
      
      res.json(connectionsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const { otherUserId } = req.body;

      // Check if connection already exists
      const exists = await storage.areUsersConnected(userId, otherUserId);
      if (exists) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const connectionData = insertConnectionSchema.parse({
        userId1: userId,
        userId2: otherUserId
      });

      const connection = await storage.createConnection(connectionData);
      res.json(connection);
    } catch (error) {
      res.status(400).json({ message: "Invalid connection data" });
    }
  });

  app.get('/api/connections/check/:otherUserId', requireAuth, async (req: any, res: any) => {
    try {
      const userId = (req.session as any).userId!;
      const otherUserId = parseInt(req.params.otherUserId);
      
      const connected = await storage.areUsersConnected(userId, otherUserId);
      res.json({ connected });
    } catch (error) {
      res.status(500).json({ message: "Failed to check connection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
