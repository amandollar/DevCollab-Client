"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authApi, tokenStorage } from '@/lib/auth';
import toast from 'react-hot-toast';
import { IconCircleCheck, IconCircleX, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = params.verificationToken as string;
        const response = await authApi.verifyEmail(token);
        
        // Store token and user data
        tokenStorage.setToken(response.token);
        setUser(response.user);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        toast.success('Email verified successfully! Welcome to DevCollab!');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed');
        toast.error(error.message || 'Email verification failed');
      }
    };

    if (params.verificationToken) {
      verifyEmail();
    }
  }, [params.verificationToken, router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <IconLoader className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <IconCircleCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Welcome to DevCollab, {user?.name}! Your account has been activated.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                You will be redirected to your dashboard in a few seconds...
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <IconCircleX className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Verification Failed
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        {renderContent()}
      </div>
    </div>
  );
}
