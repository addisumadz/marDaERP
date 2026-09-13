/**
 * User Role Verification Utility for Customer Maintenance Service
 * Mirror of New Line Connection role permissions
 */

export function getUserRoles(session) {
  const sessionRoles = session?.user?.roles || session?.roles || [];
  let roles = Array.isArray(sessionRoles) ? [...sessionRoles] : [];

  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("user_details");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (Array.isArray(parsed?.roles)) {
          roles = [...new Set([...roles, ...parsed.roles])];
        }
        if (parsed?.roleCode) roles.push(parsed.roleCode);
        if (parsed?.roleName) roles.push(parsed.roleName);
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  return roles.map((r) => String(r || "").replace(/^ROLE_/i, "").trim().toLowerCase());
}

export function hasAnyRole(roles, targetList) {
  const targets = targetList.map((t) => t.toLowerCase());
  return roles.some((r) => targets.includes(r) || targets.some((t) => r.includes(t)));
}

// ─── Concrete Role Predicates ───────────────────────────────────────────────

export function isAdminRole(roles) {
  return hasAnyRole(roles, [
    "systemadmin",
    "admin",
    "billzgjt",
    "gm",
    "sraaskiage",
    "cadmin",
    "ሥራ አስኪያጅ",
    "አስተዳዳሪ",
  ]);
}

export function isCustomerServiceRole(roles) {
  if (isAdminRole(roles)) return true;
  return hasAnyRole(roles, [
    "custom_service",
    "fnc",
    "custom_service_officer",
    "customer service",
    "ደንበኞች አገልግሎት",
    "ደንበኛ አገልግሎት",
  ]);
}

export function isTechnicalRole(roles) {
  if (isAdminRole(roles)) return true;
  return hasAnyRole(roles, [
    "custom_technical",
    "techhalafi",
    "plumber forman",
    "plumber",
    "wqexpert",
    "technical manager",
    "m_technical_manager",
    "ቴክኒክ",
    "ቧንቧ",
    "ፎርማን",
  ]);
}

export function isRevenueOfficerRole(roles) {
  if (isAdminRole(roles)) return true;
  return hasAnyRole(roles, [
    "custom_revenuoff",
    "cashier",
    "m_gebi_officer",
    "income officer",
    "ገቢ",
    "ካሸር",
    "ገቢ ሰብሳቢ",
    "revenue",
  ]);
}

export function isStoreRole(roles) {
  if (isAdminRole(roles)) return true;
  return hasAnyRole(roles, [
    "m_branch_store",
    "m_main_store",
    "storemanager",
    "store person",
    "asset officer",
    "storekeeper",
    "inv_storekeeper",
    "መደብር",
    "መጋዘን",
  ]);
}

// ─── Step Permissions ────────────────────────────────────────────────────────

export function canRegisterMaintenance(roles) {
  return isCustomerServiceRole(roles);
}

export function canAssignSurveyPlumber(roles) {
  return isTechnicalRole(roles);
}

export function canEncodeSurveyItems(roles) {
  return isTechnicalRole(roles);
}

export function canApprovePayment(roles) {
  return isRevenueOfficerRole(roles);
}

export function canDispatchStoreItems(roles) {
  return isStoreRole(roles);
}

export function canAssignMaintenancePlumber(roles) {
  return isTechnicalRole(roles);
}

export function canCompleteMaintenance(roles) {
  return isTechnicalRole(roles);
}

export function getUserRoleBadge(roles) {
  if (isAdminRole(roles)) {
    return { title: "አስተዳዳሪ (Admin)", color: "bg-purple-100 text-purple-800 border-purple-300" };
  }
  if (isCustomerServiceRole(roles)) {
    return { title: "ደንበኞች አገልግሎት (Customer Service)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  }
  if (isTechnicalRole(roles)) {
    return { title: "ቴክኒክ ክፍል (Technical Department)", color: "bg-blue-100 text-blue-800 border-blue-300" };
  }
  if (isRevenueOfficerRole(roles)) {
    return { title: "ገቢዎች ክፍል (Revenue Officer)", color: "bg-amber-100 text-amber-800 border-amber-300" };
  }
  if (isStoreRole(roles)) {
    return { title: "መደብር ክፍል (Branch Store)", color: "bg-teal-100 text-teal-800 border-teal-300" };
  }
  return { title: "ተጠቃሚ (Standard User)", color: "bg-gray-100 text-gray-700 border-gray-300" };
}
