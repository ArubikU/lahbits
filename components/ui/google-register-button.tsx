"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

interface GoogleRegisterButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function GoogleRegisterButton({ 
  onSuccess, 
  onError,
  className = "" 
}: GoogleRegisterButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Redireccionar al endpoint de autenticación con Google
      window.location.href = '/api/auth/google';
    } catch (error) {
      setLoading(false);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full ${className}`}
    >
      {loading ? (
        <span className="animate-spin">◌</span>
      ) : (
        <FaGoogle className="w-4 h-4" />
      )}
      <span>Registrarte con Google</span>
    </Button>
  );
}
