"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie);

    // Test API /api/auth/me
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => setApiResponse({ error: err.message }));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Auth</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">AuthContext State</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({ user, loading, isAuthenticated }, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">API Response (/api/auth/me)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Browser Cookies</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap break-all">
            {cookies || "No cookies found"}
          </pre>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button
              onClick={() => window.location.href = "/login"}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                fetch("/api/auth/logout", { method: "POST" })
                  .then(() => window.location.href = "/login");
              }}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Force Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
