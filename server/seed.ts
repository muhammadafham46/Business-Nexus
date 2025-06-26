import { db } from "./db";
import { users, collaborationRequests, messages } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with sample data...");
  
  try {
    // Insert sample users
    const sampleUsers = [
      {
        email: "michael.rodriguez@example.com",
        password: "password123",
        firstName: "Michael",
        lastName: "Rodriguez",
        role: "investor",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Experienced venture capitalist with 15+ years in tech investments. Focus on B2B SaaS and fintech startups.",
        company: "Rodriguez Capital",
        title: "Senior Partner",
        location: "San Francisco, CA",
        website: "www.michaelrodriguez.vc",
        linkedin: "michael-rodriguez-vc",
        industries: ["FinTech", "SaaS", "B2B"],
        investmentRange: "$2M - $10M",
        portfolioSize: 32,
      },
      {
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
        linkedin: "sarah-kim-angel",
        industries: ["Healthcare", "Biotech"],
        investmentRange: "$500K - $5M",
        portfolioSize: 18,
      },
      {
        email: "david.chang@example.com",
        password: "password123",
        firstName: "David",
        lastName: "Chang",
        role: "investor",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Invests in consumer tech and e-commerce platforms. Portfolio includes 15+ successful exits.",
        company: "Chang Ventures",
        title: "Founder & Managing Partner",
        location: "Los Angeles, CA",
        website: "www.changventures.com",
        linkedin: "david-chang-ventures",
        industries: ["E-commerce", "Consumer Tech"],
        investmentRange: "$1M - $15M",
        portfolioSize: 25,
      },
      {
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
        fundingNeed: "$5M Series A",
      },
      {
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
        fundingNeed: "$3M Seed",
      },
      {
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
        fundingNeed: "$8M Series A",
      }
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✓ Sample users inserted");

    // Insert sample collaboration requests
    const sampleRequests = [
      {
        fromUserId: 1,
        toUserId: 4,
        message: "Interested in discussing your fintech solution. I have experience investing in similar B2B payment platforms.",
        status: "pending",
      },
      {
        fromUserId: 2,
        toUserId: 5,
        message: "Your AI diagnostic platform aligns perfectly with our healthcare investment thesis. Would love to connect.",
        status: "accepted",
      }
    ];

    await db.insert(collaborationRequests).values(sampleRequests);
    console.log("✓ Sample collaboration requests inserted");

    // Insert sample messages
    const sampleMessages = [
      {
        fromUserId: 2,
        toUserId: 5,
        content: "Hi Lisa, thanks for accepting my collaboration request. I'd love to learn more about your AI diagnostic platform.",
      },
      {
        fromUserId: 5,
        toUserId: 2,
        content: "Hi Sarah, great to connect! Our platform uses machine learning to analyze medical imaging with 95% accuracy. Would you be available for a call this week?",
      },
      {
        fromUserId: 2,
        toUserId: 5,
        content: "That sounds very promising! I'm available Tuesday or Thursday afternoon. Should we schedule a 30-minute introductory call?",
      }
    ];

    await db.insert(messages).values(sampleMessages);
    console.log("✓ Sample messages inserted");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();