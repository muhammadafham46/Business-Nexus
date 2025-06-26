import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Globe, Linkedin, Mail, UserPlus, MessageSquare, Building, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getInitials, cn } from "@/lib/utils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onMessage?: (userId: number) => void;
  onConnect?: (userId: number) => void;
}

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

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  userId, 
  onMessage, 
  onConnect 
}: ProfileModalProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${userId}`);
      return response.json();
    },
    enabled: isOpen && !!userId,
  });

  const getIndustryClass = (industry: string) => {
    const industryKey = industry.toLowerCase().replace(/\s+/g, "-");
    return `industry-${industryKey}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 professional-gradient relative overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 -mt-16 relative z-10">
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
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                  {onConnect && (
                    <Button onClick={() => onConnect(user.id)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {onMessage && (
                    <Button variant="outline" onClick={() => onMessage(user.id)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {user.bio && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {user.role === "investor" && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-4">Investment Focus</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.industries && user.industries.length > 0 && (
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-foreground mb-2">Industries</h3>
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
                            </CardContent>
                          </Card>
                        )}
                        
                        {user.investmentRange && (
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-foreground mb-2">Investment Range</h3>
                              <p className="text-sm text-muted-foreground">{user.investmentRange}</p>
                              <p className="text-xs text-muted-foreground mt-1">Typical check size</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "entrepreneur" && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-4">Startup Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.industries && user.industries.length > 0 && (
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-foreground mb-2">Industry Focus</h3>
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
                            </CardContent>
                          </Card>
                        )}
                        
                        {user.fundingNeed && (
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-foreground mb-2">Funding Need</h3>
                              <p className="text-sm text-muted-foreground">{user.fundingNeed}</p>
                              <p className="text-xs text-muted-foreground mt-1">Current funding round</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {user.role === "investor" && user.portfolioSize && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-4">Portfolio Stats</h3>
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
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
