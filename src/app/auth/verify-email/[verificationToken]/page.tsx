// app/verify-email/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        // Send token to backend API
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${params.token}`,
          { method: "POST" }
        );
        const data = await res.json();
        if (res.ok) {
          setStatus("Email verified successfully!");
        } else {
          setStatus(`Verification failed: ${data.message || "Invalid token"}`);
        }
      } catch (error) {
        setStatus("Something went wrong. Please try again later.");
      }
    };

    verify();
  }, [params.token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-black">
      <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-6 md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
          Email Verification
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{status}</p>
      </div>
    </div>
  );
}
