import { PinContainer } from "@/components/ui/3d-pin";

const testimonials = [
  {
    name: "Sarah Williams",
    role: "Frontend Developer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    feedback:
      "The platform’s simplicity is its superpower. I can manage projects, chat, and share code without leaving the dashboard.",
  },
  {
    name: "James Patel",
    role: "Full Stack Engineer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    feedback:
      "The platform’s simplicity is its superpower. I can manage projects, chat, and share code without leaving the dashboard.",
  },
  {
    name: "Aisha Khan",
    role: "UI/UX Designer",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    feedback:
      "The platform’s simplicity is its superpower. I can manage projects, chat, and share code without leaving the dashboard.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-4xl font-bold text-white mb-12">
          What Our Users Say
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <PinContainer key={i} title={t.name} href="#">
              <div className="w-[320px] p-5 rounded-2xl bg-slate-900/60 backdrop-blur-lg border border-white/10 shadow-lg text-left flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full border border-white/20"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{t.name}</h3>
                    <p className="text-xs text-white/60">{t.role}</p>
                  </div>
                </div>

                {/* Feedback */}
                <p className="text-white/80 text-sm leading-relaxed">
                  “{t.feedback}”
                </p>
              </div>
            </PinContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
