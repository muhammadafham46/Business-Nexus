import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import DashboardInvestor from "@/pages/dashboard-investor";
import DashboardEntrepreneur from "@/pages/dashboard-entrepreneur";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";

function ProtectedRoute({ children, redirectTo = "/login" }: { children: React.ReactNode; redirectTo?: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to={redirectTo} />;
  }
  
  return <>{children}</>;
}

function RoleBasedRoute({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (user?.role !== role) {
    return <Redirect to={user?.role === "investor" ? "/dashboard/investor" : "/dashboard/entrepreneur"} />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Redirect to={user.role === "investor" ? "/dashboard/investor" : "/dashboard/entrepreneur"} />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AuthRoute>
          <Login />
        </AuthRoute>
      </Route>
      
      <Route path="/login">
        <AuthRoute>
          <Login />
        </AuthRoute>
      </Route>
      
      <Route path="/register">
        <AuthRoute>
          <Register />
        </AuthRoute>
      </Route>
      
      <Route path="/dashboard/investor">
        <ProtectedRoute>
          <RoleBasedRoute role="investor">
            <DashboardInvestor />
          </RoleBasedRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard/entrepreneur">
        <ProtectedRoute>
          <RoleBasedRoute role="entrepreneur">
            <DashboardEntrepreneur />
          </RoleBasedRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile/:id">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/chat/:userId">
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
