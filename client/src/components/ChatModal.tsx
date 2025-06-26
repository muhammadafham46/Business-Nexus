import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
  fromUser?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    company?: string;
  };
}

export default function ChatModal({ isOpen, onClose, otherUser }: ChatModalProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", otherUser.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/messages/${otherUser.id}`);
      return response.json();
    },
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        toUserId: otherUser.id,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUser.id] });
      setNewMessage("");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-xl transform transition-transform duration-300 z-50 border-l border-border">
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="professional-gradient text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
                {otherUser.company || "Online"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: Message) => {
                const isFromCurrentUser = message.fromUserId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      isFromCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={isFromCurrentUser ? user?.avatar : otherUser.avatar} 
                        alt={
                          isFromCurrentUser 
                            ? `${user?.firstName} ${user?.lastName}` 
                            : `${otherUser.firstName} ${otherUser.lastName}`
                        } 
                      />
                      <AvatarFallback className="text-xs">
                        {isFromCurrentUser 
                          ? getInitials(user?.firstName || "", user?.lastName || "")
                          : getInitials(otherUser.firstName, otherUser.lastName)
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 ${isFromCurrentUser ? "flex justify-end" : ""}`}>
                      <div>
                        <div
                          className={`rounded-lg p-3 max-w-xs ${
                            isFromCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
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

        {/* Chat Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-2">
            <Input
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
      </div>
    </div>
  );
}
