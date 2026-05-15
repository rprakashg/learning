"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface EnrollButtonProps {
  courseId: string;
  price: number;
  isFree: boolean;
  isAuthenticated: boolean;
}

export function EnrollButton({ courseId, price, isFree, isAuthenticated }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/courses/${courseId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initiate checkout");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const label =
    !isAuthenticated
      ? "Sign in to enroll"
      : isFree || price === 0
      ? "Enroll for free"
      : `Enroll for ${formatPrice(price)}`;

  return (
    <div>
      <Button
        className="w-full"
        size="lg"
        onClick={handleEnroll}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          label
        )}
      </Button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
