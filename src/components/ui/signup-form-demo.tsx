"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { IconBrandGithub, IconBrandGoogle, IconUpload, IconEye, IconEyeOff, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function SignupFormDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(name, email, password, selectedImage || undefined);
      toast.success("Account created successfully! Please check your email for verification.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      toast.success("Image selected successfully!");
    }
  };

  const handleSocialSignup = (provider: 'github' | 'google') => {
    // TODO: Implement social signup
    toast.success(`${provider} signup coming soon!`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      {/* Form card */}
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome to DevCollab
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Collaborate with developers around the world. Sign up to get started.
        </p>

        {/* Email verification info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              After signing up, you&apos;ll receive a verification email. Please verify your email to activate your account.
            </p>
          </div>
        </div>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="John Doe" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              disabled={isLoading}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </LabelInputContainer>

          {/* Upload image section */}
          <LabelInputContainer className="mb-8">
            <Label htmlFor="image">Profile Image (Optional)</Label>
            <div
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition"
              onClick={() => document.getElementById("imageInput")?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <IconUpload className="h-6 w-6 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload</p>
                </>
              )}
            </div>
            <input
              id="imageInput"
              name="image"
              type="file"
              accept=".jpg,.jpeg,.png,.avif,.webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up &rarr;"}
            <BottomGradient />
          </button>

          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Log in
            </Link>
          </p>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-4">
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              type="button"
              onClick={() => handleSocialSignup('github')}
              disabled={isLoading}
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                GitHub
              </span>
              <BottomGradient />
            </button>
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              type="button"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
