"use client";

import {
  isAdminRole,
  isTechnicalRole,
  isRevenueOfficerRole,
  isStoreRole,
  isCustomerServiceRole,
} from "../ui/manager/custom_newLineConnection/customNewLineUserRoles";

export const WORKFLOW_ACTION_LABEL = "የእርሶን እርምጃ (ስራ) ይጠብቆታል";

export const getNewLineBannerText = (count) =>
  `የእርሶን እርምጃ (ስራ) የሚጠብቁ ${count} ማመልከቻዎች አሉ!`;

export const getMaintenanceBannerText = (count) =>
  `የእርሶን እርምጃ (ስራ) የሚጠብቁ ${count} የጥገና ጥያቄዎች አሉ!`;

/**
 * Returns total count of New Line Connection requests awaiting action from the logged-in role
 */
export function getNewLineRoleActionCount(stats, roles = []) {
  if (!stats) return 0;

  const isTech = isTechnicalRole(roles);
  const isRev = isRevenueOfficerRole(roles);
  const isStore = isStoreRole(roles);
  const isCS = isCustomerServiceRole(roles);
  const isAdmin = isAdminRole(roles);

  const pendingSurvey = Number(stats.pendingSurveyAssignment || 0);
  const surveyInProg = Number(stats.surveyInProgress || 0);
  const pendingPayment = Number(stats.pendingPaymentApproval || 0);
  const pendingStore = Number(stats.pendingStoreCollection || 0);
  const materialsColl = Number(stats.materialsCollected || 0);
  const installInProg = Number(stats.installationInProgress || 0);
  const installComp = Number(stats.installationCompleted || 0);

  if (isAdmin) {
    return (
      pendingSurvey +
      surveyInProg +
      pendingPayment +
      pendingStore +
      materialsColl +
      installInProg +
      installComp
    );
  }

  let total = 0;
  if (isTech && !isRev && !isStore) {
    total += pendingSurvey + surveyInProg + materialsColl + installInProg;
  }
  if (isRev && !isTech) {
    total += pendingPayment;
  }
  if (isStore && !isRev) {
    total += pendingStore;
  }
  if (isCS && !isTech && !isRev && !isStore) {
    total += installComp;
  }

  return total;
}

/**
 * Returns total count of Customer Maintenance requests awaiting action from the logged-in role
 */
export function getMaintenanceRoleActionCount(stats, roles = []) {
  if (!stats) return 0;

  const isTech = isTechnicalRole(roles);
  const isRev = isRevenueOfficerRole(roles);
  const isStore = isStoreRole(roles);
  const isAdmin = isAdminRole(roles);

  const pendingSurvey = Number(stats.pendingSurveyAssignment || 0);
  const surveyInProg = Number(stats.surveyInProgress || 0);
  const pendingPayment = Number(stats.pendingPaymentApproval || 0);
  const pendingStore = Number(stats.pendingStoreCollection || 0);
  const materialsColl = Number(stats.materialsCollected || 0);
  const maintInProg = Number(stats.maintenanceInProgress || 0);

  if (isAdmin) {
    return (
      pendingSurvey +
      surveyInProg +
      pendingPayment +
      pendingStore +
      materialsColl +
      maintInProg
    );
  }

  let total = 0;
  if (isTech && !isRev && !isStore) {
    total += pendingSurvey + surveyInProg + materialsColl + maintInProg;
  }
  if (isRev && !isTech) {
    total += pendingPayment;
  }
  if (isStore && !isRev) {
    total += pendingStore;
  }

  return total;
}

/**
 * Checks if a specific New Line Connection ticket requires an action from the user's role
 */
export function isNewLineActionRequiredForRole(status, roles = []) {
  if (!status) return false;

  const isTech = isTechnicalRole(roles);
  const isRev = isRevenueOfficerRole(roles);
  const isStore = isStoreRole(roles);
  const isCS = isCustomerServiceRole(roles);
  const isAdmin = isAdminRole(roles);

  if (isAdmin) {
    return [
      "PENDING_SURVEY_ASSIGNMENT",
      "SURVEY_IN_PROGRESS",
      "PENDING_PAYMENT_APPROVAL",
      "PENDING_STORE_COLLECTION",
      "MATERIALS_COLLECTED",
      "INSTALLATION_IN_PROGRESS",
      "INSTALLATION_COMPLETED",
    ].includes(status);
  }

  switch (status) {
    case "PENDING_SURVEY_ASSIGNMENT":
    case "SURVEY_IN_PROGRESS":
    case "MATERIALS_COLLECTED":
    case "INSTALLATION_IN_PROGRESS":
      return isTech && !isRev && !isStore;
    case "PENDING_PAYMENT_APPROVAL":
      return isRev && !isTech;
    case "PENDING_STORE_COLLECTION":
      return isStore && !isRev;
    case "INSTALLATION_COMPLETED":
      return isCS && !isTech && !isRev && !isStore;
    default:
      return false;
  }
}

/**
 * Checks if a specific Customer Maintenance ticket requires an action from the user's role
 */
export function isMaintenanceActionRequiredForRole(status, roles = []) {
  if (!status) return false;

  const isTech = isTechnicalRole(roles);
  const isRev = isRevenueOfficerRole(roles);
  const isStore = isStoreRole(roles);
  const isAdmin = isAdminRole(roles);

  if (isAdmin) {
    return [
      "PENDING_SURVEY_ASSIGNMENT",
      "SURVEY_IN_PROGRESS",
      "PENDING_PAYMENT_APPROVAL",
      "PENDING_STORE_COLLECTION",
      "MATERIALS_COLLECTED",
      "MAINTENANCE_IN_PROGRESS",
    ].includes(status);
  }

  switch (status) {
    case "PENDING_SURVEY_ASSIGNMENT":
    case "SURVEY_IN_PROGRESS":
    case "MATERIALS_COLLECTED":
    case "MAINTENANCE_IN_PROGRESS":
      return isTech && !isRev && !isStore;
    case "PENDING_PAYMENT_APPROVAL":
      return isRev && !isTech;
    case "PENDING_STORE_COLLECTION":
      return isStore && !isRev;
    default:
      return false;
  }
}
