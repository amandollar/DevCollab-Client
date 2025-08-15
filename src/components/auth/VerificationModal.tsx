"use client";

import React, { useState } from 'react';
import { authApi } from '@/lib/auth';
import toast from 'react-hot-toast';
import { IconMail, IconRefresh, IconX } from '@tabler/icons-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function VerificationModal({ isOpen, onClose, email }: VerificationModalProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <IconX size={20} />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <IconMail className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verification Required
          </h2>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Your account exists but needs email verification. We've sent a verification link to{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {email}
            </span>
          </p>

          {/* Info box */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please check your email and click the verification link to activate your account.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IconRefresh className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {isResending ? 'Sending...' : 'Resend verification email'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-yellow-600 hover:underline disabled:opacity-50"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
