"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Button, Input, Select, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Zap,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  
  // Other settings
  const [aiModel, setAiModel] = useState("qwen2.5:1.5b");
  const [emailSignature, setEmailSignature] = useState("");
  const [notifications, setNotifications] = useState({
    newLeads: true,
    emailReplies: true,
    bookingConfirmed: true,
    weeklyReport: false
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setEmailSignature(`${user.name || user.username}\n${user.role || "Team Member"}, Nebulist`);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Update profile
      await updateProfile({
        name,
        email,
        role,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Nebulist platform preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <Input 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Your role"
              />
            </div>
          </div>
        </Card>

        {/* AI Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure AI model and behavior</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Model
              </label>
              <Select 
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="qwen2.5:1.5b">Qwen 2.5 1.5B (Fast)</option>
                <option value="phi3:latest">Phi-3 Latest (Balanced)</option>
                <option value="phi3:mini">Phi-3 Mini (Fastest)</option>
                <option value="gemma2:2b">Gemma 2 2B (Quality)</option>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Current: Hybrid mode with 8s timeout + smart fallback
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Signature
              </label>
              <textarea
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Ollama Status</p>
                <p className="text-xs text-muted-foreground">Local AI server connection</p>
              </div>
              <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                Connected
              </Badge>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ left: value ? '28px' : '4px' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
              <p className="text-sm text-muted-foreground">GDPR compliance and data management</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-background/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">GDPR Compliance</p>
                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                All lead data collection follows GDPR guidelines
              </p>
            </div>

            <div className="p-4 bg-background/30 rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Data Retention</p>
              <p className="text-xs text-muted-foreground">
                Lead data retained for 24 months, then archived
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-400"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Settings saved!</span>
            </motion.div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={loading}
            size="lg"
            className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
