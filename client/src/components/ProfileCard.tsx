import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MessageSquare } from "lucide-react";
import { getInitials, cn } from "@/lib/utils";

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
  fundingNeed?: string;
}

interface ProfileCardProps {
  user: User;
  onMessage?: (userId: number) => void;
  className?: string;
}

export default function ProfileCard({ user, onMessage, className }: ProfileCardProps) {
  const getIndustryClass = (industry: string) => {
    const industryKey = industry.toLowerCase().replace(/\s+/g, "-");
    return `industry-${industryKey}`;
  };

  const getStatusColor = () => {
    // Mock online status - in real app this would come from data
    const statuses = ["online", "away", "offline"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      online: "status-online",
      away: "status-away", 
      offline: "status-offline"
    }[status];
  };

  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {user.firstName} {user.lastName}
              </h3>
              <Badge variant="secondary" className={cn("text-xs", getStatusColor())}>
                Online
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {user.title} {user.company && `at ${user.company}`}
            </p>
            
            {user.bio && (
              <p className="text-sm text-foreground mb-3 line-clamp-2">
                {user.bio}
              </p>
            )}
            
            {user.role === "investor" && user.investmentRange && (
              <p className="text-sm font-medium text-accent mb-3">
                Investment Range: {user.investmentRange}
              </p>
            )}
            
            {user.role === "entrepreneur" && user.fundingNeed && (
              <p className="text-sm font-medium text-accent mb-3">
                Seeking: {user.fundingNeed}
              </p>
            )}
            
            {user.industries && user.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.industries.slice(0, 3).map((industry) => (
                  <Badge 
                    key={industry} 
                    variant="outline" 
                    className={cn("industry-tag", getIndustryClass(industry))}
                  >
                    {industry}
                  </Badge>
                ))}
                {user.industries.length > 3 && (
                  <Badge variant="outline" className="industry-tag bg-muted text-muted-foreground">
                    +{user.industries.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/profile/${user.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                {onMessage && (
                  <Button size="sm" onClick={() => onMessage(user.id)}>
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
