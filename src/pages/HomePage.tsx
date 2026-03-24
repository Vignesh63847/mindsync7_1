import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, BarChart3, Music, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: MessageCircle,
    title: "AI Companion",
    desc: "Talk freely about your feelings in English, Tamil, or Tanglish. MindSync listens without judgment.",
  },
  {
    icon: BarChart3,
    title: "Mood Insights",
    desc: "Track your emotional patterns over time with visual mood timelines and weekly summaries.",
  },
  {
    icon: Music,
    title: "Music Therapy",
    desc: "Upload your favorite songs and create personal playlists for calming background music.",
  },
  {
    icon: Heart,
    title: "CBT Techniques",
    desc: "Evidence-based grounding exercises, breathing techniques, and positive reframing suggestions.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto mb-8 flex items-center justify-center glow-border"
          >
            <Brain className="w-10 h-10 text-primary animate-pulse-glow" />
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">Mind</span>
            <span className="text-foreground">Sync</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Your AI-powered mental health companion. A safe, calm space to express your feelings — available 24/7, in your language.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/chat">
                Start Talking <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/insights">View Insights</Link>
            </Button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/60">
            MindSync is not a replacement for professional therapy.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Your wellness, <span className="gradient-text">your way</span>
          </motion.h2>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="glass rounded-2xl p-6 hover:glow-border transition-all duration-500 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="glass rounded-3xl p-10 glow-border">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to start your wellness journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              No sign-up needed. Just start talking.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/chat">
                <MessageCircle className="w-5 h-5 mr-2" /> Chat with MindSync
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto text-center text-xs text-muted-foreground/50">
          <p>MindSync © 2026 — An AI companion for emotional well-being. Not a substitute for professional care.</p>
        </div>
      </footer>
    </div>
  );
}
