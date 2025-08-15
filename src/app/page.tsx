"use client"
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { FeaturesSectionDemo } from "@/components/ui/FeaturesSectionDemo";
import { ArrowRight } from "lucide-react";
import TestimonialsSection from "@/components/home/testimonial";
import { CardDemo } from "@/components/ui/card-demo";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/auth/login");
  };

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative z-10 flex flex-col items-center px-4 text-center py-20 space-y-10">
        {/* Heading */}
        <TypewriterEffect
          words={[
            {
              text: "DevCollab</>",
              className:
                "text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg",
            },
            {
              text: "Collaborate",
              className:
                "mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed",
            },
          ]}
        />

        {/* Features */}
        <div className="max-w-6xl w-full">
          <FeaturesSectionDemo />
        </div>

        {/* Call to Action */}
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-transform hover:scale-110" onClick={handleClick} >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-base font-medium text-white backdrop-blur-3xl">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </section>

      {/* Decorative Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-12" />

      {/* ===== Testimonials Section ===== */}
      <section className="px-4">
        <TestimonialsSection />
      </section>

      {/* ===== Integration Section ===== */}
      <section className="px-4 py-16 bg-gray-950">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Seamless Integrations
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Connect DevCollab with the tools you already use — streamline your
            workflow and collaborate effortlessly.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12">
          <CardDemo />
        </div>
      </section>
    </div>
  );
}
