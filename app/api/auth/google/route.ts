import { NextRequest, NextResponse } from "next/server";

// Constantes para la autenticación de Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` : "https://redirectmeto.com/http://localhost:3000/api/auth/google/callback";

// Scope que solicitamos a Google
const SCOPE = "email profile";

export async function GET(request: NextRequest) {
  // Generar un estado aleatorio para protección CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // URL de autenticación de Google
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", SCOPE);
  googleAuthUrl.searchParams.append("state", state);
  
  // Guardar el estado en una cookie para validación posterior
  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos
    path: "/"
  });
  
  return response;
}
