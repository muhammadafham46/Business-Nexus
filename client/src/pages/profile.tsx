import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Globe, 
  Linkedin, 
  Mail, 
  UserPlus, 
  MessageSquare, 
  Building, 
  TrendingUp,
  Edit,
  Phone,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getInitials, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  company?: string;
  title?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  industries?: string[];
  investmentRange?: string;
  fundingNeed?: string;
  portfolioSize?: number;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const userId = parseInt(id || "0");
  const isOwnProfile = currentUser?.id === userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });

  const { data: connectionStatus } = useQuery({
    queryKey: ["/api/connections/check", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/connections/check/${userId}`);
      return response.json();
    },
    enabled: !!userId && !isOwnProfile,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/connections", { otherUserId: userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/check", userId] });
      toast({
        title: "Connection sent!",
        description: `You're now connected with ${user?.firstName} ${user?.lastName}`,
      });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Unable to connect at this time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/collaboration-requests", {
        toUserId: userId,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: `Your collaboration request has been sent to ${user?.firstName}`,
      });
    },
    onError: () => {
      toast({
        title: "Request failed",
        description: "Unable to send request at this time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleMessage = () => {
    window.location.href = `/chat/${userId}`;
  };

  const handleCollaborate = () => {
    const message = user?.role === "investor" 
      ? `Hi ${user.firstName}, I'm interested in discussing potential investment opportunities for my startup.`
      : `Hi ${user.firstName}, I'd like to explore investment opportunities in your startup.`;
    
    sendRequestMutation.mutate(message);
  };

  const getIndustryClass = (industry: string) => {
    const industryKey = industry.toLowerCase().replace(/\s+/g, "-");
    return `industry-${industryKey}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Section */}
        <div className="relative">
          <div className="h-48 professional-gradient rounded-t-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 px-8">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg mx-auto lg:mx-0">
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center lg:text-left mt-4 lg:mt-0">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {user.title} {user.company && `at ${user.company}`}
                </p>
                {user.location && (
                  <div className="flex items-center justify-center lg:justify-start mt-1 text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
              
              {!isOwnProfile && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                  {!connectionStatus?.connected && (
                    <Button 
                      onClick={handleConnect}
                      disabled={connectMutation.isPending}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {connectMutation.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleMessage}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  {currentUser?.role !== user.role && (
                    <Button 
                      onClick={handleCollaborate}
                      disabled={sendRequestMutation.isPending}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {sendRequestMutation.isPending ? "Sending..." : "Collaborate"}
                    </Button>
                  )}
                </div>
              )}
              
              {isOwnProfile && (
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {user.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {user.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {user.role === "investor" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.industries && user.industries.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Industries</h3>
                            <div className="flex flex-wrap gap-2">
                              {user.industries.map((industry) => (
                                <Badge 
                                  key={industry} 
                                  variant="outline" 
                                  className={cn("industry-tag", getIndustryClass(industry))}
                                >
                                  {industry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {user.investmentRange && (
                          <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Investment Range</h3>
                            <p className="text-sm text-muted-foreground">{user.investmentRange}</p>
                            <p className="text-xs text-muted-foreground">Typical check size</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.role === "entrepreneur" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Startup Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.industries && user.industries.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Industry Focus</h3>
                            <div className="flex flex-wrap gap-2">
                              {user.industries.map((industry) => (
                                <Badge 
                                  key={industry} 
                                  variant="outline" 
                                  className={cn("industry-tag", getIndustryClass(industry))}
                                >
                                  {industry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {user.fundingNeed && (
                          <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Funding Need</h3>
                            <p className="text-sm text-muted-foreground">{user.fundingNeed}</p>
                            <p className="text-xs text-muted-foreground">Current funding round</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {user.role === "investor" && user.portfolioSize && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Investments</span>
                          <span className="font-medium text-foreground">{user.portfolioSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Active Portfolio</span>
                          <span className="font-medium text-foreground">{Math.floor(user.portfolioSize * 0.8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Successful Exits</span>
                          <span className="font-medium text-accent">{Math.floor(user.portfolioSize * 0.2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                      {user.linkedin && (
                        <div className="flex items-center space-x-3">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.linkedin}</span>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.website}</span>
                        </div>
                      )}
                      {user.company && (
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.company}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {connectionStatus?.connected && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 text-accent">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        You are connected with {user.firstName}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-foreground">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="text-foreground capitalize">{user.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p className="text-foreground">{user.company || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p className="text-foreground">{user.title || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-foreground">{user.location || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="text-foreground">{user.website || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                      <p className="text-foreground">{user.linkedin || "Not specified"}</p>
                    </div>
                    {user.role === "investor" && user.investmentRange && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Investment Range</label>
                        <p className="text-foreground">{user.investmentRange}</p>
                      </div>
                    )}
                    {user.role === "entrepreneur" && user.fundingNeed && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Funding Need</label>
                        <p className="text-foreground">{user.fundingNeed}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        Profile updated with new bio information
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        {user.role === "investor" ? "New investment made" : "Funding milestone reached"}
                      </p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground">
                        Joined Business Nexus platform
                      </p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
