import { Shield, Lock, Eye, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">

          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="gradient-text">Privacy</span> & Safety
          </h1>
          <p className="text-muted-foreground text-sm">Your mental health data deserves the highest protection</p>
        </motion.div>

        <div className="space-y-6">
          {[
          {
            icon: Lock,
            title: "Your Data Stays Private",
            desc: "Conversations are processed in real-time and not stored on external servers. Mood data is kept locally on your device."
          },
          {
            icon: Eye,
            title: "No Public Sharing",
            desc: "Your conversations are never shared publicly. MindSync does not display, sell, or share your personal data with third parties."
          },
          {
            icon: Server,
            title: "Secure Processing",
            desc: "All AI processing happens through encrypted connections. Your messages are not used to train AI models."
          },
          {
            icon: Shield,
            title: "Not a Replacement for Therapy",
            desc: "MindSync is an AI companion designed to provide emotional support. It is not a substitute for professional mental health care. If you're in crisis, please reach out to a professional."
          }].
          map((item, i) =>
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6">

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 glow-border text-center">

            <h3 className="font-display font-semibold mb-2">Walter Helplines</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="text-foreground">9152987821</span></p>
              <p><span className="text-foreground">1860-2662-345</span></p>
              <p>Text HOME to 070908

                <span className="text-foreground"></span></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>);}