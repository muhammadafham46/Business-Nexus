import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileCard from "@/components/ProfileCard";
import ChatModal from "@/components/ChatModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, HandHeart, Eye, Plus, Filter, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

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
  investmentRange?: string;
}

interface CollaborationRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: string;
  message?: string;
  fromUser?: User;
}

export default function DashboardEntrepreneur() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: investors = [], isLoading: loadingInvestors } = useQuery({
    queryKey: ["/api/users", { role: "investor" }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users?role=investor");
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

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/collaboration-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaboration-requests"] });
    },
  });

  const handleMessageClick = (investor: User) => {
    setSelectedChat(investor);
  };

  const handleCloseChatModal = () => {
    setSelectedChat(null);
  };

  const handleRequestResponse = (requestId: number, status: string) => {
    updateRequestMutation.mutate({ id: requestId, status });
  };

  const filteredInvestors = investors.filter((investor: User) => {
    if (filter === "all") return true;
    if (filter === "fintech") return investor.industries?.includes("FinTech");
    if (filter === "healthcare") return investor.industries?.includes("Healthcare");
    if (filter === "saas") return investor.industries?.includes("SaaS");
    return true;
  });

  const stats = [
    {
      title: "Active Connections",
      value: "45",
      change: "+8%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Collaboration Requests",
      value: requests.filter((r: CollaborationRequest) => r.status === "pending").length.toString(),
      change: `${requests.length} total`,
      icon: HandHeart,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Messages",
      value: "18",
      change: "3 unread",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Profile Views",
      value: "67",
      change: "+23%",
      icon: Eye,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const pendingRequests = requests.filter((r: CollaborationRequest) => r.status === "pending");

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
                Connect with investors and grow your startup
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Update Pitch
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
          {/* Investors Directory */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Potential Investors</CardTitle>
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
                {loadingInvestors ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvestors.map((investor: User) => (
                      <ProfileCard
                        key={investor.id}
                        user={investor}
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
            {/* Collaboration Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <HandHeart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request: CollaborationRequest) => (
                      <div
                        key={request.id}
                        className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={request.fromUser?.avatar} 
                            alt={`${request.fromUser?.firstName} ${request.fromUser?.lastName}`} 
                          />
                          <AvatarFallback className="text-xs">
                            {request.fromUser && getInitials(
                              request.fromUser.firstName, 
                              request.fromUser.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {request.fromUser?.firstName} {request.fromUser?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.message || "Wants to discuss partnership"}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRequestResponse(request.id, "accepted")}
                            disabled={updateRequestMutation.isPending}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRequestResponse(request.id, "rejected")}
                            disabled={updateRequestMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Startup Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Target Funding</span>
                    <span className="font-medium text-foreground">
                      {user?.fundingNeed || "$5M Series A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Raised to Date</span>
                    <span className="font-medium text-foreground">$1.2M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Committed</span>
                    <span className="font-medium text-accent">$500K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "34%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">34% of target reached</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        New connection request from <span className="font-medium">Michael Rodriguez</span>
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        Pitch deck viewed by <span className="font-medium">Sarah Kim</span>
                      </p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        Profile featured in <span className="font-medium">Weekly Spotlight</span>
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
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
