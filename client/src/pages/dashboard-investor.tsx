import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileCard from "@/components/ProfileCard";
import ChatModal from "@/components/ChatModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, TrendingUp, Eye, Plus, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  company?: string;
  title?: string;
  bio?: string;
  industries?: string[];
  role: string;
  fundingNeed?: string;
}

interface CollaborationRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: string;
  message?: string;
  fromUser?: User;
}

export default function DashboardInvestor() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: entrepreneurs = [], isLoading: loadingEntrepreneurs } = useQuery({
    queryKey: ["/api/users", { role: "entrepreneur" }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users?role=entrepreneur");
      return response.json();
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["/api/collaboration-requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/collaboration-requests");
      return response.json();
    },
  });

  const handleMessageClick = (entrepreneur: User) => {
    setSelectedChat(entrepreneur);
  };

  const handleCloseChatModal = () => {
    setSelectedChat(null);
  };

  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur: User) => {
    if (filter === "all") return true;
    if (filter === "fintech") return entrepreneur.industries?.includes("FinTech");
    if (filter === "healthcare") return entrepreneur.industries?.includes("Healthcare");
    if (filter === "saas") return entrepreneur.industries?.includes("SaaS");
    return true;
  });

  const stats = [
    {
      title: "Active Connections",
      value: "127",
      change: "+12%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Portfolio Companies",
      value: "32",
      change: "+3",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Messages",
      value: "24",
      change: "5 unread",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Profile Views",
      value: "89",
      change: "+18%",
      icon: Eye,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover promising entrepreneurs and grow your portfolio
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Investment
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-accent font-medium">{stat.change}</span>
                  <span className="text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entrepreneurs Directory */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Promising Entrepreneurs</CardTitle>
                  <Tabs value={filter} onValueChange={setFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="fintech">FinTech</TabsTrigger>
                      <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
                      <TabsTrigger value="saas">SaaS</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {loadingEntrepreneurs ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntrepreneurs.map((entrepreneur: User) => (
                      <ProfileCard
                        key={entrepreneur.id}
                        user={entrepreneur}
                        onMessage={handleMessageClick}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 3).map((request: CollaborationRequest) => (
                    <div
                      key={request.id}
                      className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {request.status === "pending" 
                            ? `Sent request to ${request.fromUser?.firstName}`
                            : `Request ${request.status}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        Profile viewed by <span className="font-medium">3 entrepreneurs</span>
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Investments</span>
                    <span className="font-medium text-foreground">25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Deployed</span>
                    <span className="font-medium text-foreground">$12.5M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Check</span>
                    <span className="font-medium text-foreground">$500K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Portfolio IRR</span>
                    <span className="font-medium text-accent">24.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={handleCloseChatModal}
          otherUser={selectedChat}
        />
      )}
    </DashboardLayout>
  );
}
