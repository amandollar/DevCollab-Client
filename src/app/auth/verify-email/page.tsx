"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/auth';
import toast from 'react-hot-toast';
import { IconMail, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email sent successfully! Please check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <IconMail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Check Your Email
          </h2>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {email}
            </span>
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Click the verification link in your email to activate your account and start collaborating!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending || !email}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IconRefresh className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {isResending ? 'Sending...' : 'Resend verification email'}
              </span>
            </button>

            <Link
              href="/auth/login"
              className="block w-full text-center px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            >
              Back to login
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Didn&apos;t receive the verification email? Check your spam folder or request a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <IconMail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
