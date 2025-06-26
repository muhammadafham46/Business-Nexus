import { 
  users, 
  collaborationRequests, 
  messages, 
  connections,
  type User, 
  type InsertUser,
  type CollaborationRequest,
  type InsertCollaborationRequest,
  type Message,
  type InsertMessage,
  type Connection,
  type InsertConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Collaboration request operations
  getCollaborationRequest(id: number): Promise<CollaborationRequest | undefined>;
  getCollaborationRequestsForUser(userId: number): Promise<CollaborationRequest[]>;
  getCollaborationRequestsBetweenUsers(fromUserId: number, toUserId: number): Promise<CollaborationRequest[]>;
  createCollaborationRequest(request: InsertCollaborationRequest): Promise<CollaborationRequest>;
  updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest | undefined>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Connection operations
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionsForUser(userId: number): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  areUsersConnected(userId1: number, userId2: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private collaborationRequests: Map<number, CollaborationRequest>;
  private messages: Map<number, Message>;
  private connections: Map<number, Connection>;
  private currentUserId: number;
  private currentCollaborationRequestId: number;
  private currentMessageId: number;
  private currentConnectionId: number;

  constructor() {
    this.users = new Map();
    this.collaborationRequests = new Map();
    this.messages = new Map();
    this.connections = new Map();
    this.currentUserId = 1;
    this.currentCollaborationRequestId = 1;
    this.currentMessageId = 1;
    this.currentConnectionId = 1;

    // Initialize with sample users
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample investors
    const investor1: User = {
      id: 1,
      email: "michael.rodriguez@example.com",
      password: "password123",
      firstName: "Michael",
      lastName: "Rodriguez",
      role: "investor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Experienced venture capitalist with over 15 years in the industry. I specialize in fintech and SaaS investments, focusing on Series A and B rounds.",
      company: "Venture Capital Firm",
      title: "Senior Partner",
      location: "San Francisco, CA",
      website: "www.michaelrodriguez.vc",
      linkedin: "michael-rodriguez-vc",
      industries: ["FinTech", "SaaS", "B2B"],
      investmentRange: "$2M - $10M",
      fundingNeed: null,
      portfolioSize: 32,
      createdAt: new Date(),
    };

    const investor2: User = {
      id: 2,
      email: "sarah.kim@example.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Kim",
      role: "investor",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Focus on healthcare and biotech innovations. Active mentor for early-stage companies.",
      company: "Angel Network",
      title: "Managing Director",
      location: "Boston, MA",
      website: null,
      linkedin: "sarah-kim-angel",
      industries: ["Healthcare", "Biotech"],
      investmentRange: "$500K - $5M",
      fundingNeed: null,
      portfolioSize: 18,
      createdAt: new Date(),
    };

    const investor3: User = {
      id: 3,
      email: "david.chang@example.com",
      password: "password123",
      firstName: "David",
      lastName: "Chang",
      role: "investor",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Invests in consumer tech and e-commerce platforms. Portfolio includes 15+ successful exits.",
      company: "Growth Equity Fund",
      title: "Principal",
      location: "New York, NY",
      website: null,
      linkedin: "david-chang-growth",
      industries: ["Consumer Tech", "E-commerce"],
      investmentRange: "$1M - $15M",
      fundingNeed: null,
      portfolioSize: 25,
      createdAt: new Date(),
    };

    // Sample entrepreneurs
    const entrepreneur1: User = {
      id: 4,
      email: "alex.chen@example.com",
      password: "password123",
      firstName: "Alex",
      lastName: "Chen",
      role: "entrepreneur",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Building the next generation of fintech solutions for small businesses. Former Goldman Sachs analyst with deep expertise in financial services.",
      company: "PayFlow Solutions",
      title: "CEO & Founder",
      location: "San Francisco, CA",
      website: "www.payflowsolutions.com",
      linkedin: "alex-chen-payflow",
      industries: ["FinTech", "B2B"],
      investmentRange: null,
      fundingNeed: "$5M Series A",
      portfolioSize: null,
      createdAt: new Date(),
    };

    const entrepreneur2: User = {
      id: 5,
      email: "lisa.park@example.com",
      password: "password123",
      firstName: "Lisa",
      lastName: "Park",
      role: "entrepreneur",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Revolutionizing healthcare with AI-powered diagnostic tools. MD from Harvard with 10+ years in medical research.",
      company: "MedAI Diagnostics",
      title: "Founder & CTO",
      location: "Boston, MA",
      website: "www.medai-diagnostics.com",
      linkedin: "lisa-park-medai",
      industries: ["Healthcare", "AI", "Biotech"],
      investmentRange: null,
      fundingNeed: "$3M Seed",
      portfolioSize: null,
      createdAt: new Date(),
    };

    const entrepreneur3: User = {
      id: 6,
      email: "marcus.johnson@example.com",
      password: "password123",
      firstName: "Marcus",
      lastName: "Johnson",
      role: "entrepreneur",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Creating sustainable e-commerce solutions that reduce environmental impact. Former Amazon product manager.",
      company: "EcoCommerce",
      title: "CEO",
      location: "Seattle, WA",
      website: "www.ecocommerce.io",
      linkedin: "marcus-johnson-eco",
      industries: ["E-commerce", "Sustainability"],
      investmentRange: null,
      fundingNeed: "$8M Series A",
      portfolioSize: null,
      createdAt: new Date(),
    };

    this.users.set(1, investor1);
    this.users.set(2, investor2);
    this.users.set(3, investor3);
    this.users.set(4, entrepreneur1);
    this.users.set(5, entrepreneur2);
    this.users.set(6, entrepreneur3);
    this.currentUserId = 7;

    // Sample collaboration requests
    const request1: CollaborationRequest = {
      id: 1,
      fromUserId: 1,
      toUserId: 4,
      status: "pending",
      message: "Hi Alex! I've reviewed your pitch deck and I'm really interested in learning more about your fintech solution.",
      createdAt: new Date(),
    };

    const request2: CollaborationRequest = {
      id: 2,
      fromUserId: 2,
      toUserId: 5,
      status: "pending",
      message: "Your healthcare AI solution aligns perfectly with our investment thesis. Would love to discuss further.",
      createdAt: new Date(),
    };

    this.collaborationRequests.set(1, request1);
    this.collaborationRequests.set(2, request2);
    this.currentCollaborationRequestId = 3;

    // Sample messages
    const message1: Message = {
      id: 1,
      fromUserId: 1,
      toUserId: 4,
      content: "Hi Alex! I've reviewed your pitch deck and I'm really interested in learning more about your fintech solution. Would you be available for a call this week?",
      createdAt: new Date(Date.now() - 3600000),
    };

    const message2: Message = {
      id: 2,
      fromUserId: 4,
      toUserId: 1,
      content: "Thank you for your interest, Michael! I'd love to discuss the opportunity. I'm available Tuesday or Thursday afternoon. What works best for you?",
      createdAt: new Date(Date.now() - 2700000),
    };

    const message3: Message = {
      id: 3,
      fromUserId: 1,
      toUserId: 4,
      content: "Perfect! Thursday at 2 PM works great. I'll send you a calendar invite. Looking forward to diving deeper into your market traction and growth strategy.",
      createdAt: new Date(Date.now() - 1800000),
    };

    this.messages.set(1, message1);
    this.messages.set(2, message2);
    this.messages.set(3, message3);
    this.currentMessageId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null,
      company: insertUser.company || null,
      title: insertUser.title || null,
      location: insertUser.location || null,
      website: insertUser.website || null,
      linkedin: insertUser.linkedin || null,
      industries: insertUser.industries || null,
      investmentRange: insertUser.investmentRange || null,
      fundingNeed: insertUser.fundingNeed || null,
      portfolioSize: insertUser.portfolioSize || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getCollaborationRequest(id: number): Promise<CollaborationRequest | undefined> {
    return this.collaborationRequests.get(id);
  }

  async getCollaborationRequestsForUser(userId: number): Promise<CollaborationRequest[]> {
    return Array.from(this.collaborationRequests.values()).filter(
      request => request.toUserId === userId
    );
  }

  async getCollaborationRequestsBetweenUsers(fromUserId: number, toUserId: number): Promise<CollaborationRequest[]> {
    return Array.from(this.collaborationRequests.values()).filter(
      request => 
        (request.fromUserId === fromUserId && request.toUserId === toUserId) ||
        (request.fromUserId === toUserId && request.toUserId === fromUserId)
    );
  }

  async createCollaborationRequest(insertRequest: InsertCollaborationRequest): Promise<CollaborationRequest> {
    const id = this.currentCollaborationRequestId++;
    const request: CollaborationRequest = {
      ...insertRequest,
      id,
      message: insertRequest.message || null,
      status: insertRequest.status || "pending",
      createdAt: new Date()
    };
    this.collaborationRequests.set(id, request);
    return request;
  }

  async updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest | undefined> {
    const request = this.collaborationRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.collaborationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.fromUserId === userId1 && message.toUserId === userId2) ||
        (message.fromUserId === userId2 && message.toUserId === userId1)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async getConnectionsForUser(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      connection => connection.userId1 === userId || connection.userId2 === userId
    );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = this.currentConnectionId++;
    const connection: Connection = {
      ...insertConnection,
      id,
      createdAt: new Date()
    };
    this.connections.set(id, connection);
    return connection;
  }

  async areUsersConnected(userId1: number, userId2: number): Promise<boolean> {
    return Array.from(this.connections.values()).some(
      connection => 
        (connection.userId1 === userId1 && connection.userId2 === userId2) ||
        (connection.userId1 === userId2 && connection.userId2 === userId1)
    );
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getCollaborationRequest(id: number): Promise<CollaborationRequest | undefined> {
    const [request] = await db.select().from(collaborationRequests).where(eq(collaborationRequests.id, id));
    return request || undefined;
  }

  async getCollaborationRequestsForUser(userId: number): Promise<CollaborationRequest[]> {
    return await db.select().from(collaborationRequests)
      .where(or(eq(collaborationRequests.fromUserId, userId), eq(collaborationRequests.toUserId, userId)));
  }

  async getCollaborationRequestsBetweenUsers(fromUserId: number, toUserId: number): Promise<CollaborationRequest[]> {
    return await db.select().from(collaborationRequests)
      .where(
        or(
          and(eq(collaborationRequests.fromUserId, fromUserId), eq(collaborationRequests.toUserId, toUserId)),
          and(eq(collaborationRequests.fromUserId, toUserId), eq(collaborationRequests.toUserId, fromUserId))
        )
      );
  }

  async createCollaborationRequest(insertRequest: InsertCollaborationRequest): Promise<CollaborationRequest> {
    const [request] = await db
      .insert(collaborationRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest | undefined> {
    const [request] = await db
      .update(collaborationRequests)
      .set({ status })
      .where(eq(collaborationRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
          and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection || undefined;
  }

  async getConnectionsForUser(userId: number): Promise<Connection[]> {
    return await db.select().from(connections)
      .where(or(eq(connections.userId1, userId), eq(connections.userId2, userId)));
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async areUsersConnected(userId1: number, userId2: number): Promise<boolean> {
    const [connection] = await db.select().from(connections)
      .where(
        or(
          and(eq(connections.userId1, userId1), eq(connections.userId2, userId2)),
          and(eq(connections.userId1, userId2), eq(connections.userId2, userId1))
        )
      );
    return !!connection;
  }
}

export const storage = new DatabaseStorage();
