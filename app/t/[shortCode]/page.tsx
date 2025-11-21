"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TrackingLinkRedirect() {
  const params = useParams();
  const shortCode = params?.shortCode as string;

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) return;

      try {
        // Record the click
        const response = await fetch(`/api/tracking-links/redirect/${shortCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }),
        });

        if (!response.ok) {
          // If link not found or error, redirect to home
          window.location.href = '/';
          return;
        }

        const { redirectUrl } = await response.json();

        // Redirect to the destination URL
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error redirecting:', error);
        window.location.href = '/';
      }
    };

    handleRedirect();
  }, [shortCode]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
