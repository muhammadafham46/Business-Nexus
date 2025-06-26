import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  MapPin,
  Building,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  company?: string;
  title?: string;
  location?: string;
  role: string;
  industries?: string[];
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
  fromUser?: User;
}

export default function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const otherUserId = parseInt(userId || "0");

  const { data: otherUser, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users", otherUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${otherUserId}`);
      return response.json();
    },
    enabled: !!otherUserId,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["/api/messages", otherUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/messages/${otherUserId}`);
      return response.json();
    },
    enabled: !!otherUserId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        toUserId: otherUserId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
      setNewMessage("");
      inputRef.current?.focus();
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (loadingUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!otherUser) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
            <p className="text-muted-foreground mb-6">The user you're trying to chat with doesn't exist.</p>
            <Link href={currentUser?.role === "investor" ? "/dashboard/investor" : "/dashboard/entrepreneur"}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat Area */}
          <div className={`${showInfo ? "lg:col-span-3" : "lg:col-span-4"} flex flex-col`}>
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="professional-gradient text-primary-foreground p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link href={currentUser?.role === "investor" ? "/dashboard/investor" : "/dashboard/entrepreneur"}>
                      <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Avatar className="w-10 h-10 border-2 border-primary-foreground">
                      <AvatarImage src={otherUser.avatar} alt={`${otherUser.firstName} ${otherUser.lastName}`} />
                      <AvatarFallback className="text-primary bg-primary-foreground">
                        {getInitials(otherUser.firstName, otherUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      <p className="text-xs opacity-90">
                        {otherUser.title} {otherUser.company && `at ${otherUser.company}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInfo(!showInfo)}
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">Start a conversation</p>
                      <p className="text-sm">
                        This is the beginning of your conversation with {otherUser.firstName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: Message) => {
                      const isFromCurrentUser = message.fromUserId === currentUser?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            isFromCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={isFromCurrentUser ? currentUser?.avatar : otherUser.avatar} 
                              alt={
                                isFromCurrentUser 
                                  ? `${currentUser?.firstName} ${currentUser?.lastName}` 
                                  : `${otherUser.firstName} ${otherUser.lastName}`
                              } 
                            />
                            <AvatarFallback className="text-xs">
                              {isFromCurrentUser 
                                ? getInitials(currentUser?.firstName || "", currentUser?.lastName || "")
                                : getInitials(otherUser.firstName, otherUser.lastName)
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 ${isFromCurrentUser ? "flex justify-end" : ""}`}>
                            <div className="max-w-xs lg:max-w-md">
                              <div
                                className={`rounded-lg p-3 ${
                                  isFromCurrentUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <p
                                className={`text-xs text-muted-foreground mt-1 ${
                                  isFromCurrentUser ? "text-right" : ""
                                }`}
                              >
                                {formatDateTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* User Info Sidebar */}
          {showInfo && (
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={otherUser.avatar} alt={`${otherUser.firstName} ${otherUser.lastName}`} />
                      <AvatarFallback className="text-lg">
                        {getInitials(otherUser.firstName, otherUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-foreground">
                      {otherUser.firstName} {otherUser.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {otherUser.title}
                    </p>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {otherUser.role}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {otherUser.company && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{otherUser.company}</span>
                      </div>
                    )}
                    
                    {otherUser.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{otherUser.location}</span>
                      </div>
                    )}
                  </div>

                  {otherUser.industries && otherUser.industries.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Industries</h4>
                        <div className="flex flex-wrap gap-1">
                          {otherUser.industries.map((industry) => (
                            <Badge key={industry} variant="outline" className="text-xs">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Link href={`/profile/${otherUser.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
