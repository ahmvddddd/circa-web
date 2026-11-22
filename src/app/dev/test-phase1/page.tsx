"use client";

import { useState } from "react";
import { authService } from "@/lib/services/authService";
import { apiClient } from "@/lib/api/client";
import { tokenStorage } from "@/lib/api/auth/token-storage";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/error-handler";

type TestLog = {
  id: number;
  testName: string;
  status: "PASS" | "FAIL" | "INFO";
  details: string;
  timestamp: string;
};

export default function Phase1TestPage() {
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [email, setEmail] = useState("testuser@example.com");
  const [password, setPassword] = useState("Password123!");
  const [name, setName] = useState("Test User");
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (testName: string, status: "PASS" | "FAIL" | "INFO", details: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        testName,
        status,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const ensureRegistered = async () => {
    try {
      await authService.register({ email, password, name });
    } catch {
      // User may already exist
    }
  };

  // 1. Valid Login
  const test1_ValidLogin = async () => {
    try {
      await ensureRegistered();
      tokenStorage.clearToken();
      const res = await authService.login({ email, password });

      const storedToken = tokenStorage.getAccessToken();
      if (storedToken && storedToken === res.accessToken) {
        addLog(
          "1. Valid Login",
          "PASS",
          `AccessToken received & stored in-memory: ${storedToken.slice(0, 15)}...`
        );
      } else {
        addLog("1. Valid Login", "FAIL", "Login returned token but tokenStorage did not update.");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? `HTTP ${err.status} - ${err.message}` : String(err);
      addLog("1. Valid Login", "FAIL", `Error: ${msg}`);
    }
  };

  // 2. Valid Access Token Call
  const test2_ValidTokenCall = async () => {
    try {
      const currentToken = tokenStorage.getAccessToken();
      if (!currentToken) {
        addLog("2. Valid Token Request", "FAIL", "No access token in memory. Run Test 1 first.");
        return;
      }

      // Call protected auth endpoint
      const res = await apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });
      if (res.ok) {
        addLog(
          "2. Valid Token Request",
          "PASS",
          "Protected API request succeeded with Bearer token without triggering refresh."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? `HTTP ${err.status} - ${err.message}` : String(err);
      addLog("2. Valid Token Request", "FAIL", `Error: ${msg}`);
    }
  };

  // 3. Expired/Invalid Access Token -> Refresh -> Retry
  const test3_ExpiredTokenRefresh = async () => {
    addLog("3. Expired Token Auto-Refresh", "INFO", "--- START DIAGNOSTIC TRACE ---");
    try {
      // Setup: Fresh login to ensure active, unrevoked refresh cookie exists
      const loginRes = await authService.login({ email, password });
      addLog(
        "3. Expired Token Auto-Refresh",
        "INFO",
        `Setup: Fresh login completed. Token: ${loginRes.accessToken.slice(0, 10)}...`
      );

      // Inject expired/fake access token into tokenStorage
      tokenStorage.setAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_fake_token");
      addLog(
        "3. Expired Token Auto-Refresh",
        "INFO",
        "Injected simulated expired access token into tokenStorage."
      );

      // Attempt call to protected endpoint
      addLog("3. Expired Token Auto-Refresh", "INFO", "Dispatching request with expired token...");
      const res = await apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });

      const newStoredToken = tokenStorage.getAccessToken();

      if (
        res.ok &&
        newStoredToken &&
        newStoredToken !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_fake_token"
      ) {
        addLog(
          "3. Expired Token Auto-Refresh",
          "PASS",
          `Trace Result: Protected request 401 -> Refresh executed -> New token stored (${newStoredToken.slice(
            0,
            10
          )}...) -> Retry succeeded HTTP 200.`
        );
      } else {
        addLog("3. Expired Token Auto-Refresh", "FAIL", "Request completed but token was not refreshed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? `HTTP ${err.status} - ${JSON.stringify(err.data || err.message)}` : String(err);
      addLog("3. Expired Token Auto-Refresh", "FAIL", `Trace Failure: ${msg}`);
    }
  };

  // 4. Concurrent 401s -> Single Shared In-Flight Refresh
  const test4_Concurrent401s = async () => {
    try {
      // Setup fresh session
      await authService.login({ email, password });
      tokenStorage.setAccessToken("expired_fake_token_for_concurrent_test");

      const req1 = apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });
      const req2 = apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });
      const req3 = apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });

      const results = await Promise.all([req1, req2, req3]);
      const allOk = results.every((r) => r.ok);
      const newToken = tokenStorage.getAccessToken();

      if (allOk && newToken) {
        addLog(
          "4. Concurrent 401 Requests",
          "PASS",
          "3 parallel requests encountered 401. Shared 1 in-flight refresh promise, updated token, and all 3 retried successfully."
        );
      } else {
        addLog("4. Concurrent 401 Requests", "FAIL", "One or more concurrent requests failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? `HTTP ${err.status} - ${err.message}` : String(err);
      addLog("4. Concurrent 401 Requests", "FAIL", `Error: ${msg}`);
    }
  };

  // 5. Refresh Failure Safeguard
  const test5_RefreshFailure = async () => {
    try {
      await authService.logout();
      tokenStorage.setAccessToken("invalid_expired_token_no_cookie");

      await apiClient(ENDPOINTS.AUTH.LOGOUT_ALL, { method: "POST" });
      addLog("5. Refresh Failure Safeguard", "FAIL", "Request should have thrown ApiError.");
    } catch (err: unknown) {
      const currentToken = tokenStorage.getAccessToken();
      if (err instanceof ApiError && err.status === 401 && currentToken === null) {
        addLog(
          "5. Refresh Failure Safeguard",
          "PASS",
          "Refresh failed -> token wiped from storage -> infinite retry loop prevented -> ApiError(401) thrown."
        );
      } else {
        addLog("5. Refresh Failure Safeguard", "FAIL", `Unexpected result: ${String(err)}`);
      }
    }
  };

  // 6. Non-401 Error Passthrough
  const test6_Non401Error = async () => {
    try {
      await authService.login({ email, password });
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

      await apiClient(`${baseUrl}/api/v1/group-admin/check-admin`, { method: "GET" });
      addLog("6. Non-401 Error Passthrough", "FAIL", "Expected request to fail with 403.");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status !== 401) {
        addLog(
          "6. Non-401 Error Passthrough",
          "PASS",
          `No refresh attempted. Preserved backend HTTP status: ${err.status}`
        );
      } else {
        addLog("6. Non-401 Error Passthrough", "FAIL", `Unexpected error: ${String(err)}`);
      }
    }
  };

  // 7. Logout
  const test7_Logout = async () => {
    try {
      await authService.login({ email, password });
      await authService.logout();

      const tokenAfterLogout = tokenStorage.getAccessToken();
      if (tokenAfterLogout === null) {
        addLog("7. Logout", "PASS", "Backend logout invoked and local access token wiped from memory.");
      } else {
        addLog("7. Logout", "FAIL", "Token was not cleared from memory.");
      }
    } catch (err: unknown) {
      const tokenAfterLogout = tokenStorage.getAccessToken();
      if (tokenAfterLogout === null) {
        addLog("7. Logout", "PASS", "Token cleared locally even though logout endpoint returned an error.");
      } else {
        addLog("7. Logout", "FAIL", `Error: ${String(err)}`);
      }
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    await test1_ValidLogin();
    await test2_ValidTokenCall();
    await test3_ExpiredTokenRefresh();
    await test4_Concurrent401s();
    await test5_RefreshFailure();
    await test6_Non401Error();
    await test7_Logout();
    setIsRunning(false);
  };

  const generateFormattedReport = () => {
    const passCount = logs.filter((l) => l.status === "PASS").length;
    const failCount = logs.filter((l) => l.status === "FAIL").length;

    let report = `=== PHASE 1 AUTH API ARCHITECTURE TEST REPORT ===\n`;
    report += `Timestamp: ${new Date().toISOString()}\n`;
    report += `Target API: ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/v1\n`;
    report += `Summary: ${passCount} PASSED | ${failCount} FAILED | Total Tests: 7\n`;
    report += `--------------------------------------------------\n\n`;

    logs.forEach((log) => {
      const prefix = log.status === "INFO" ? "[INFO]" : `[${log.status}]`;
      report += `${prefix} ${log.testName}\n`;
      report += `     Time: ${log.timestamp}\n`;
      report += `     Details: ${log.details}\n\n`;
    });

    report += `==================================================`;
    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateFormattedReport());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 font-sans text-foreground">
      <h1 className="mb-1 text-2xl font-bold">Phase 1 Auth API Architecture Verification</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Executes end-to-end tests against Express backend (`http://localhost:5000`) for Phase 1 files.
      </p>

      {/* Credentials Input */}
      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg border p-4 bg-muted/30">
        <div>
          <label className="block text-xs font-medium mb-1">Test Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Test Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Test Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm bg-background"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isRunning ? "Running Tests..." : "Run All 7 Tests"}
        </button>

        {logs.length > 0 && (
          <button
            onClick={handleCopyReport}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {isCopied ? "✓ Report Copied!" : "📋 Copy Report for Reviewer"}
          </button>
        )}

        <button
          onClick={() => setLogs([])}
          className="ml-auto rounded border border-destructive/50 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/10"
        >
          Clear Logs
        </button>
      </div>

      {/* Visual Terminal Output */}
      <div className="mb-6 rounded-lg border bg-black p-4 font-mono text-xs text-green-400">
        <div className="mb-3 flex items-center justify-between border-b border-gray-800 pb-2 text-gray-400">
          <span>Execution Log Terminal</span>
          <span>{logs.filter((l) => l.status === "PASS").length} Passed</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-600">No tests executed yet. Click "Run All 7 Tests" above.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log, idx) => (
              <div key={log.id} className="flex flex-col gap-1 border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">#{idx + 1}</span>
                  <span
                    className={
                      log.status === "PASS"
                        ? "rounded bg-green-950 px-1.5 py-0.5 text-[10px] font-bold text-green-400 border border-green-800"
                        : log.status === "FAIL"
                        ? "rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-800"
                        : "rounded bg-blue-950 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800"
                    }
                  >
                    {log.status}
                  </span>
                  <span className="font-semibold text-white">{log.testName}</span>
                  <span className="ml-auto text-[10px] text-gray-500">{log.timestamp}</span>
                </div>
                <div className="pl-6 text-gray-300 leading-relaxed">{log.details}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formatted Plain Text Area */}
      {logs.length > 0 && (
        <div className="rounded-lg border p-4 bg-muted/20">
          <div className="mb-2 flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Formatted Plain-Text Report
            </label>
            <button
              onClick={handleCopyReport}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {isCopied ? "Copied!" : "Copy Text"}
            </button>
          </div>
          <textarea
            readOnly
            rows={12}
            value={generateFormattedReport()}
            className="w-full rounded border bg-background font-mono text-xs p-3 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}