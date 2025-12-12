import { ALLOWED_ROLES } from "@/app/lib/auth/constants";
import { UserProfile } from "@/app/services/auth/authService";
import { useMemo } from "react";

/**
 * Hook para gestionar el control de acceso basado en roles
 * Responsabilidad: Validar permisos del usuario
 *
 * @param user - Perfil del usuario a validar
 * @returns {Object} Estado de acceso y información relacionada
 */
export function useAccessControl(user: UserProfile | null) {
  const hasAccess = useMemo(() => {
    if (!user || !user.roles) {
      return false;
    }

    return user.roles.some((role) =>
      (ALLOWED_ROLES as readonly string[]).includes(role.toUpperCase())
    );
  }, [user]);

  return {
    hasAccess,
    allowedRoles: ALLOWED_ROLES,
  };
}
