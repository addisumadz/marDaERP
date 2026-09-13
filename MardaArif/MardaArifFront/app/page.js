"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("arif_token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  }, [router]);

  return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );
}
