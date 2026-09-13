"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugClaimsPage() {
  const { data: session, status } = useSession();
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/debug/claims");
        const json = await res.json();
        setApiData(json);
      } catch (e) {
        setApiError(String(e));
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Debug Claims</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">NextAuth useSession()</h2>
        <div className="rounded border border-stroke dark:border-strokedark p-4">
          <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify({ status, session }, null, 2)}</pre>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">/api/debug/claims (server)</h2>
        <div className="rounded border border-stroke dark:border-strokedark p-4">
          {apiError ? (
            <div className="text-red-500">{apiError}</div>
          ) : (
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(apiData, null, 2)}</pre>
          )}
        </div>
      </section>
    </div>
  );
}
