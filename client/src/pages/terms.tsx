import { motion } from "framer-motion";
import { Scale, AlertTriangle, Shield, Zap, Brain, Users, Ban } from "lucide-react";
import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-purple-950 text-indigo-100">
      <header className="border-b border-indigo-500/20 bg-indigo-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><a className="flex items-center gap-2 text-xl font-bold text-indigo-200 hover:text-purple-300 transition-colors"><Brain className="w-5 h-5" />Flaukowski Mind</a></Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/privacy"><a className="text-indigo-300 hover:text-purple-300 transition-colors">Privacy</a></Link>
            <Link href="/"><a className="text-indigo-300 hover:text-purple-300 transition-colors">Home</a></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"><Scale className="w-10 h-10 text-white" /></div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Terms of Service</h1>
            <p className="text-lg text-indigo-200">Neural Exploration Agreement</p>
            <p className="text-sm text-indigo-300/70 mt-2">Last Updated: January 2, 2026</p>
          </div>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Users className="w-6 h-6" />Platform Services</h2>
            <ul className="list-disc list-inside text-indigo-100/80 space-y-2 ml-4 text-sm">
              <li><strong className="text-purple-300">Meta-Intelligence:</strong> Experimental AI-powered self-reflection tools</li>
              <li><strong className="text-purple-300">Fractal Mirror:</strong> Neural pattern visualization</li>
              <li><strong className="text-purple-300">Research:</strong> Consciousness exploration resources</li>
            </ul>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Shield className="w-6 h-6" />Your Responsibilities</h2>
            <ul className="list-disc list-inside text-indigo-100/80 space-y-2 ml-4 text-sm">
              <li><strong className="text-purple-300">Self-Care:</strong> This is experimental—not a substitute for professional care</li>
              <li><strong className="text-purple-300">Mindful Use:</strong> Approach neural exploration with intention</li>
              <li><strong className="text-purple-300">Privacy:</strong> Keep your account credentials secure</li>
            </ul>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Ban className="w-6 h-6" />Prohibited</h2>
            <ul className="list-disc list-inside text-indigo-100/80 space-y-2 ml-4 text-sm">
              <li><strong className="text-purple-300">Misuse:</strong> Using platform to harm yourself or others</li>
              <li><strong className="text-purple-300">Exploitation:</strong> Attempting to extract or reverse-engineer AI models</li>
              <li><strong className="text-purple-300">Commercial Use:</strong> Unauthorized monetization of platform content</li>
            </ul>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><AlertTriangle className="w-6 h-6" />Disclaimers</h2>
            <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-xl">
              <p className="text-yellow-200 text-sm">This platform is experimental. Not a substitute for professional mental health services, medical advice, or therapy. If you're experiencing a mental health crisis, please contact a professional.</p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/30 p-8 rounded-2xl text-center">
            <Zap className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-indigo-200 mb-4">Explore Your Mind</h2>
            <p className="text-purple-300 font-bold text-lg">Space Child, LLC</p>
            <p className="text-indigo-200 text-sm">info@spacechild.love</p>
          </section>
        </motion.div>
      </main>

      <footer className="border-t border-indigo-500/20 bg-indigo-950">
        <div className="container mx-auto px-4 py-6 text-center text-indigo-300 text-sm">
          <p>© 2026 Space Child, LLC • Flaukowski Mind</p>
          <div className="flex justify-center gap-6 mt-2">
            <Link href="/privacy"><a className="hover:text-purple-300 transition-colors">Privacy</a></Link>
            <Link href="/terms"><a className="hover:text-purple-300 transition-colors">Terms</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
