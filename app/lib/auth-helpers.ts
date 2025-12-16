import { auth0 } from "@/app/lib/auth0";
import { NextResponse } from "next/server";
import { UserRole, Permission, hasPermission } from "@/app/lib/auth/permissions";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
}

// Helper para obtener usuario autenticado con su rol
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth0.getSession();

  if (!session?.user) {
    return null;
  }

  // Extraer rol del usuario (viene de Auth0 claims)
  // En Auth0, configurarás esto en Actions/Rules
  const role =
    (session.user["https://gycoding.com/role"] as UserRole) || UserRole.VIEWER;

  return {
    sub: session.user.sub,
    email: session.user.email || "",
    name: session.user.name || "Usuario",
    picture: session.user.picture,
    role,
  };
}

// Middleware para proteger API routes
export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 }
    );
  }

  return { user };
}

// Middleware para verificar permisos específicos
export async function requirePermission(permission: Permission) {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult; // Ya es un error 401
  }

  const { user } = authResult;

  if (!hasPermission(user.role, permission)) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions", required: permission },
      { status: 403 }
    );
  }

  return { user };
}
