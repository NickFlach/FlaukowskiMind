import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, Check, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({ essential: true, analytics: false });

  useEffect(() => {
    const consent = localStorage.getItem("fm-cookie-consent");
    const gpcSignal = (navigator as any).globalPrivacyControl;
    if (gpcSignal) {
      localStorage.setItem("fm-cookie-consent", JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString(), gpcApplied: true }));
      applyConsent(false);
    } else if (!consent) {
      setTimeout(() => setShowBanner(true), 1500);
    } else {
      applyConsent(JSON.parse(consent).analytics);
    }
  }, []);

  const applyConsent = (analyticsEnabled: boolean) => {
    if (!analyticsEnabled) (window as any)['ga-disable-G-CMEBRPNPGG'] = true;
  };

  const handleAcceptAll = () => {
    localStorage.setItem("fm-cookie-consent", JSON.stringify({ essential: true, analytics: true, timestamp: new Date().toISOString(), gpcApplied: false }));
    applyConsent(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("fm-cookie-consent", JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString(), gpcApplied: false }));
    applyConsent(false);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("fm-cookie-consent", JSON.stringify({ ...preferences, timestamp: new Date().toISOString(), gpcApplied: false }));
    applyConsent(preferences.analytics);
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ duration: 0.4 }} className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-950/95 to-purple-950/95 border-indigo-400/30 shadow-2xl shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/40">
                    <Cookie className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-indigo-100">Cookie Preferences</h2>
                    <p className="text-xs text-indigo-300/70">Flaukowski Mind • Neural Privacy</p>
                  </div>
                </div>
                <button onClick={() => setShowBanner(false)} className="text-indigo-300/70 hover:text-indigo-200 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="text-indigo-100/80 mb-6">
                <p className="mb-3 leading-relaxed">Flaukowski Mind uses cookies for authentication and neural exploration tools. Your thoughts are sacred—you control what data we collect.</p>
                {showDetails && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4 mt-4">
                    <div className="bg-indigo-500/10 border border-indigo-400/30 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-300" /><h3 className="font-semibold text-indigo-200">Essential</h3></div>
                        <span className="text-xs text-indigo-300/70">Always Active</span>
                      </div>
                      <p className="text-sm text-indigo-200/70">Required for authentication and core experience.</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-400/30 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={preferences.analytics} onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })} className="w-4 h-4 accent-purple-500" />
                          <h3 className="font-semibold text-purple-200">Analytics</h3>
                        </div>
                      </div>
                      <p className="text-sm text-indigo-200/70">Help us improve neural exploration tools.</p>
                    </div>
                  </motion.div>
                )}
                <p className="text-sm text-indigo-300/60 mt-3">See our <Link href="/privacy"><a className="text-indigo-300 hover:text-purple-300 underline">Privacy Policy</a></Link>.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setShowDetails(!showDetails)} variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200">{showDetails ? "Hide" : "Manage"}</Button>
                {showDetails ? (
                  <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"><Check className="w-4 h-4 mr-2" />Save</Button>
                ) : (
                  <>
                    <Button onClick={handleRejectAll} variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200">Reject</Button>
                    <Button onClick={handleAcceptAll} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"><Brain className="w-4 h-4 mr-2" />Accept</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
