import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// For demo purposes, we'll use a mock user ID
// In production, this would come from authentication
const DEMO_USER_ID = "demo-student-001";

interface OnboardingStatus {
  profileId?: number;
  profileCompleted: boolean;
  assessmentCompleted: boolean;
  onboardingStep: number;
  readinessLevel?: string;
  needsOnboarding: boolean;
}

export function useOnboardingStatus() {
  return useQuery<OnboardingStatus>({
    queryKey: ["/api/onboarding-status", DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/onboarding-status/${DEMO_USER_ID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch onboarding status");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOnboardingGuard() {
  const { pathname: location } = useLocation();
  const navigate = useNavigate();
  const { data: status, isLoading } = useOnboardingStatus();

  useEffect(() => {
    if (isLoading || !status) return;

    // List of paths that don't require onboarding check
    const publicPaths = ["/onboarding", "/register", "/login"];
    const isPublicPath = publicPaths.some((path) => location.startsWith(path));

    // If user needs onboarding and is not on onboarding page, redirect
    if (status.needsOnboarding && !isPublicPath) {
      navigate("/onboarding");
    }
  }, [status, isLoading, location, navigate]);

  return {
    isLoading,
    status,
    needsOnboarding: status?.needsOnboarding ?? true,
  };
}

export function getDemoUserId() {
  return DEMO_USER_ID;
}
