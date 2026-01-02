import { motion } from "framer-motion";
import { Shield, Eye, Lock, Database, Globe, Brain } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-purple-950 text-indigo-100">
      <header className="border-b border-indigo-500/20 bg-indigo-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><a className="flex items-center gap-2 text-xl font-bold text-indigo-200 hover:text-purple-300 transition-colors"><Brain className="w-5 h-5" />Flaukowski Mind</a></Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/terms"><a className="text-indigo-300 hover:text-purple-300 transition-colors">Terms</a></Link>
            <Link href="/"><a className="text-indigo-300 hover:text-purple-300 transition-colors">Home</a></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"><Shield className="w-10 h-10 text-white" /></div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Privacy Policy</h1>
            <p className="text-lg text-indigo-200">Neural Privacy • Thought Protection</p>
            <p className="text-sm text-indigo-300/70 mt-2">Last Updated: January 2, 2026</p>
          </div>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Globe className="w-6 h-6" />Who We Are</h2>
            <p className="text-indigo-100/80 mb-4"><strong className="text-purple-300">Space Child, LLC</strong> operates Flaukowski Mind—an experimental meta-intelligence and neural exploration platform.</p>
            <p className="text-indigo-300/70 text-sm">Contact: info@spacechild.love</p>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Database className="w-6 h-6" />What We Collect</h2>
            <ul className="list-disc list-inside text-indigo-100/80 space-y-2 ml-4">
              <li><strong className="text-indigo-200">Account:</strong> Email and authentication data</li>
              <li><strong className="text-indigo-200">Exploration Data:</strong> Your interactions with neural tools (encrypted)</li>
              <li><strong className="text-indigo-200">Analytics:</strong> Platform usage via Google Analytics</li>
            </ul>
            <div className="bg-purple-500/10 border border-purple-400/30 p-4 rounded-xl mt-4">
              <p className="text-purple-300 text-sm">🧠 Your neural exploration data is encrypted and never analyzed without consent.</p>
            </div>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Eye className="w-6 h-6" />How We Use Data</h2>
            <ul className="list-disc list-inside text-indigo-100/80 space-y-2 ml-4">
              <li><strong className="text-indigo-200">Personalization:</strong> Tailor your neural exploration</li>
              <li><strong className="text-indigo-200">Improvement:</strong> Enhance the platform</li>
              <li><strong className="text-indigo-200">Research:</strong> Only with explicit opt-in consent</li>
            </ul>
            <div className="bg-indigo-500/10 border border-indigo-400/30 p-4 rounded-xl mt-4">
              <p className="text-indigo-300 text-sm">✧ We <strong>never</strong> sell your data or share your thoughts.</p>
            </div>
          </section>

          <section className="mb-10 bg-indigo-900/30 border border-indigo-500/20 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2"><Lock className="w-6 h-6" />Your Rights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {["🔍 Access", "✏️ Correction", "🗑️ Deletion", "📦 Portability"].map((right) => (
                <div key={right} className="bg-indigo-500/10 border border-indigo-400/30 p-4 rounded-xl">
                  <h3 className="text-purple-300 font-semibold">{right}</h3>
                </div>
              ))}
            </div>
            <p className="text-indigo-100/70 text-sm mt-4">Contact info@spacechild.love to exercise rights.</p>
          </section>

          <section className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/30 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-indigo-200 mb-4">Contact Us</h2>
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
