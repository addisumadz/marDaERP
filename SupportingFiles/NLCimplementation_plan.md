# Implementation Plan: Restrict Step 4 Edits and Action Buttons for Revenue Office After Payment Approval

In the New Line Connection process, Step 4 (**"Step 4: Review Items, Update Prices & Approve Payment"** / `ደረጃ 4፡ የክፍያ ማረጋገጫ እና ማጽደቂያ`) allows Revenue Officers to review surveyed materials, adjust quantities and unit prices, input payment receipt details, and approve the payment. Currently, once payment is approved, opening this step (or viewing it as a Revenue Officer) still leaves all item quantity/price inputs, item/fee addition/removal controls, revision return, and payment confirmation action buttons active.

This plan details how to lock down Step 4 into a strict **read-only view mode** once payment has been approved, disabling all edit capabilities and action buttons for Revenue Office users while displaying verified payment details (Receipt No., Reference No., Approved By, Approved Date, and Remarks).

---

## User Review Required

> [!IMPORTANT]
> **Key Behavioral Clarification**:
> Once a request has `isPaid === true` or has progressed past `PENDING_PAYMENT_APPROVAL`:
> 1. All item quantities, unit prices, remarks, and fee inputs will be rendered read-only or disabled.
> 2. The action buttons **"ዋጋውን መዝግብ እና ክፍያውን አጽድቅ"** (Approve Payment) and **"ለክለሳ ወደ ቴክኒክ መልስ"** (Return to Technical) will be completely hidden.
> 3. Catalog selection ("እቃ ጨምር"), custom item addition ("ሌላ እቃ"), fee addition ("ክፍያ ጨምር"), and item/fee deletion (Trash icons) will be hidden.
> 4. In place of the payment input form, a verified **Payment Approved Details Card** will display the recorded Receipt Number, Reference Number, Approved By, Approved Date, and Remarks.
> 5. The **"ማጠቃለያውን አትም"** (Print Cost Estimation PDF) button will remain active so Revenue Officers and customers can print or reprint the approved invoice/receipt anytime.

---

## Proposed Changes

### Frontend: Step 4 Modal Component

#### [MODIFY] [CustomPaymentApprovalModal.js](file:///c:/MarDaERP/MarDaFE/app/ui/manager/custom_newLineConnection/CustomPaymentApprovalModal.js)

1. **Add `isPaymentApproved` State / Memo**:
   - Determine if the payment has already been approved:
     ```javascript
     const isPaymentApproved = useMemo(() => {
       if (!request) return false;
       return Boolean(
         request.isPaid ||
         (request.status &&
           request.status !== "PENDING_PAYMENT_APPROVAL" &&
           request.status !== "SURVEY_IN_PROGRESS" &&
           request.status !== "PENDING_SURVEY_ASSIGNMENT" &&
           request.status !== "RETURNED_FOR_REVISION") ||
         request.paymentReceiptNumber ||
         request.paymentApprovedDate
       );
     }, [request]);
     ```

2. **Update `canConfirmPayment` Permission Gate**:
   - Disallow payment confirmation and item modification whenever `isPaymentApproved` is true:
     ```javascript
     const canConfirmPayment = useMemo(() => {
       if (isPaymentApproved) {
         return false; // Lock out edits and action buttons after payment is approved
       }
       if (isTechnical && !isRevenueOfficer) {
         return false;
       }
       return isRevenueOfficer || (isAdminRole(effectiveRoles) && !isTechnical);
     }, [isPaymentApproved, isTechnical, isRevenueOfficer, effectiveRoles]);
     ```

3. **Update Modal Header & Instruction Banner**:
   - When `isPaymentApproved` is true:
     - Header Title: Change to `ደረጃ 4፡ የዋጋ ግምት እና የጸደቀ ክፍያ (Step 4: Review Items & Payment Summary)` with a green badge `✓ ክፍያ ጸድቋል (Paid)`.
     - Instruction Banner: Replace the edit prompt with a lock notice: `🔒 የተጠናቀቀ የክፍያ መረጃ: ክፍያው ስለጸደቀ የእቃዎች ዝርዝር እና ዋጋዎችን ማስተካከል አይቻልም (Read-only)።`

4. **Lock Down Item & Fee Controls**:
   - With `canConfirmPayment` evaluating to `false`:
     - Catalog item dropdown, "እቃ ጨምር", and "ሌላ እቃ" buttons are automatically hidden.
     - Surveyed Quantity, Utility Price, Outside Price, and Remarks inputs are disabled (`disabled={!canConfirmPayment}` or displayed as formatted read-only text).
     - Trash icons on items and additional fees are hidden.
     - Custom fee addition ("ክፍያ ጨምር") is hidden.
     - Additional fee inputs (name, unit, quantity, unit price) are disabled.

5. **Display Verified Payment Details Card in Place of Editable Form**:
   - Update line 1073 where payment confirmation is rendered:
     - If `isPaymentApproved`: Render a dedicated **Payment Completed Card (`የተረጋገጠ የክፍያ መረጃ`)**:
       - Green check badge (`ክፍያው በተሳካ ሁኔታ ጸድቋል ✓`)
       - Receipt Number (`የደረሰኝ ቁጥር`)
       - Reference Number (`የባንክ ማጣቀሻ / ቼክ ቁጥር`)
       - Approved By (`ያጸደቀው ባለሙያ`)
       - Approval Date (`የጸደቀበት ቀን`)
       - Payment Remarks (`የክፍያ ማስታወሻ`)
     - Else if `canConfirmPayment`: Render the active editable receipt input fields and the return-to-technical button.
     - Else (e.g., technical role viewing pending payment): Render the informational notice directing them to Revenue Office.

6. **Footer Action Buttons**:
   - Hide "ለክለሳ ወደ ቴክኒክ መልስ" and "ዋጋውን መዝግብ እና ክፍያውን አጽድቅ" buttons when `isPaymentApproved`.
   - Update "ይቅር" button to read "ዝጋ" (Close).
   - Ensure the "ማጠቃለያውን አትም" (Print) button remains accessible.

---

### Frontend: New Line Connection Page

#### [MODIFY] [page.js](file:///c:/MarDaERP/MarDaFE/app/ui/manager/custom_newLineConnection/page.js)

1. **Contextual Action (`handleViewAction`) for Revenue Office**:
   - In `handleViewAction(req)`:
     - If a Revenue Officer (`canApprovePayment(userRoles) && !isStoreRole(userRoles) && !isTechnicalRole(userRoles)`) clicks the "Eye" button on a request that has already been approved (e.g. `PENDING_STORE_COLLECTION`, `MATERIALS_COLLECTED`, `INSTALLATION_IN_PROGRESS`, `INSTALLATION_COMPLETED`, `FINAL_ACTIVATION_COMPLETED`), open `handleOpenPayment(req)` in read-only mode rather than routing them to Store Dispatch or Technical Survey modals.

2. **Drawer Payment Info Enhancement**:
   - In the Expandable Details Drawer under `የክፍያ መረጃ` (line 1221):
     - Add a clean `ዝርዝር ይመልከቱ` (View Details) button next to the receipt number so Revenue Officers (and Admins) can open the read-only Step 4 modal directly from the drawer to inspect the itemized payment breakdown at any stage.

3. **Status Action Protection**:
   - Verify that Stage 3 action buttons ("ክፍያ አጽድቅ") in the table row only appear strictly when `req.status === "PENDING_PAYMENT_APPROVAL"` and `!req.isPaid`.

---

## Verification Plan

### Automated / Build Verification
- Run Next.js / frontend lint and build check to ensure no syntax errors or unresolved imports:
  ```powershell
  cd c:\MarDaERP\MarDaFE
  npm run build
  ```
  *(or verify hot reload / linting on the modified files)*

### Manual Verification
1. **Pending Payment Scenario (`PENDING_PAYMENT_APPROVAL`)**:
   - Log in or simulate Revenue Officer role (`custom_revenuoff` / `cashier` / `income officer`).
   - Open a request in `PENDING_PAYMENT_APPROVAL` status.
   - Verify:
     - Title reads `"Step 4: Review Items, Update Prices & Approve Payment"`.
     - Quantities, prices, and remarks are editable.
     - Catalog selection, "እቃ ጨምር", "ሌላ እቃ", "ክፍያ ጨምር", and trash buttons are visible.
     - Receipt number and reference number inputs are active.
     - "ለክለሳ ወደ ቴክኒክ መልስ" and "ዋጋውን መዝግብ እና ክፍያውን አጽድቅ" action buttons are visible and functional.

2. **Post-Approval Scenario (Paid / `PENDING_STORE_COLLECTION` or later)**:
   - Complete approval or open an already approved request (e.g. status `PENDING_STORE_COLLECTION`, `MATERIALS_COLLECTED`, etc. with `isPaid: true`).
   - Verify:
     - Title reads `"ደረጃ 4፡ የዋጋ ግምት እና የጸደቀ ክፍያ (Step 4: Review Items & Payment Summary)"` with green `ክፍያ ጸድቋል` badge.
     - Banner shows lock message: `🔒 የተጠናቀቀ የክፍያ መረጃ: ክፍያው ስለጸደቀ የእቃዎች ዝርዝር እና ዋጋዎችን ማስተካከል አይቻልም (Read-only)።`
     - All item quantities, utility prices, outside prices, and remarks are non-editable.
     - "እቃ ጨምር", "ሌላ እቃ", "ክፍያ ጨምር", and item/fee trash buttons are completely absent.
     - Action buttons ("ዋጋውን መዝግብ እና ክፍያውን አጽድቅ", "ለክለሳ ወደ ቴክኒክ መልስ") are completely absent.
     - Verified payment details card displays the recorded receipt number, reference number, approved by, date, and remarks.
     - "ማጠቃለያውን አትም" (Print Estimation PDF) works properly.
     - "ዝጋ" (Close) button closes the modal without changes.
