import { createSession, getUserByEmail, loginWithGoogle, registerUserWithGoogle } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Constantes para la autenticación de Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` 
  : "https://redirectmeto.com/http://localhost:3000/api/auth/google/callback";

export async function GET(request: NextRequest) {
  try {
    // Obtener el código y el estado de la URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    // Verificar el estado para protección contra CSRF
    const savedState = request.cookies.get("oauth_state")?.value;
    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL("/auth?error=invalid_state", request.url));
    }
    
    // Si no hay código, redirigir con error
    if (!code) {
      return NextResponse.redirect(new URL("/auth?error=no_code", request.url));
    }
    
    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Error al obtener token:", tokenData);
      return NextResponse.redirect(new URL("/auth?error=token_exchange_failed", request.url));
    }
    
    // Obtener información del usuario con el token de acceso
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      console.error("Error al obtener información del usuario:", userData);
      return NextResponse.redirect(new URL("/auth?error=user_info_failed", request.url));
    }
    
    // Verificar si el usuario existe en la base de datos
    let user = await getUserByEmail(userData.email);
    
    // Si el usuario no existe, registrarlo
    if (!user) {
      const registrationResult = await registerUserWithGoogle({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        google_id: userData.id,
      });
      
      if (!registrationResult.success) {
        return NextResponse.redirect(
          new URL(`/auth?error=${registrationResult.message || 'registration_failed'}`, request.url)
        );
      }
      
      user = registrationResult.user as any;
    } else {
      const loginResult = await loginWithGoogle({
        email: userData.email,
        google_id: userData.id,
        name: userData.name,
      });
      if(!loginResult.success) {
        return NextResponse.redirect(
          new URL(`/auth?error=${loginResult.message || 'login_failed'}`, request.url)
        );
      }
      user = loginResult.user as any;
    }
    
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24*31); // 12 horas de sesión
    
    const session = await createSession(user.id, "Google Auth", "1::", expiry);
    
    // Crear respuesta y configurar cookies
    const response = NextResponse.redirect(new URL("/dashboard?oauth=true&se="+session.id+"&expiry="+expiry.toISOString(), request.url));
    
    // Configurar cookies con el ID de sesión y fecha de expiración
    response.cookies.set("sessionId", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiry,
      path: "/",
    });
    
    response.cookies.set("sessionExpiry", expiry.toISOString(), {
      httpOnly: false, // Permitimos que JavaScript acceda a esta cookie para verificaciones en el cliente
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiry,
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Error en el callback de Google:", error);
    return NextResponse.redirect(new URL("/auth?error=unexpected_error", request.url));
  }
}
