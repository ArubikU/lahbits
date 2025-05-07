"use client";
import { verifyAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import AuthPageContent from "./auth-page-content";
export default function AuthPage() {
  const auth = verifyAuth()
  if(auth){
    const router = useRouter()
    router.push("/dashboard")
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
