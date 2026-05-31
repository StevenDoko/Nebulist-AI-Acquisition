"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { User, Mail, Shield, LogOut, LogIn } from "lucide-react";

interface UserInfoProps {
  user: {
    username: string;
    name?: string;
    email: string;
    role: string;
  } | null;
  onLogout: () => Promise<void>;
}

export function UserInfo({ user, onLogout }: UserInfoProps) {
  const router = useRouter();

  async function handleLogout() {
    await onLogout();
    router.push("/login");
  }

  if (!user) {
    return (
      <div className="p-4 border-t border-white/10">
        <Button
          variant="secondary"
          className="w-full glass hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
          onClick={() => router.push("/login")}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/10">
      <div className="mb-3 glass rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name || user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {user.role}
          </span>
        </div>
      </div>
      <Button
        variant="secondary"
        className="w-full glass hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
