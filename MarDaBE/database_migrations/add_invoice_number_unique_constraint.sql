-- =====================================================
-- Invoice Number Unique Constraint Migration
-- =====================================================
-- This script adds a unique constraint on the invoice_number column
-- to provide defense-in-depth protection against duplicate invoice numbers.
-- 
-- If duplicates already exist, they must be resolved before running this script.
-- See the checking queries below to detect existing duplicates.
-- =====================================================

-- STEP 1: Check for existing duplicates (RUN THIS FIRST!)
-- =====================================================
SELECT 
    invoice_number,
    COUNT(*) as duplicate_count,
    STRING_AGG(CAST(id AS VARCHAR), ', ') as reading_ids
FROM billing_reading
WHERE invoice_number IS NOT NULL 
  AND status = 'active'
  AND is_void = false
GROUP BY invoice_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- If the above query returns any rows, you have duplicates that need to be resolved first!
-- Contact the development team before proceeding.

-- =====================================================
-- STEP 2: Add unique constraint (ONLY if no duplicates exist)
-- =====================================================
ALTER TABLE billing_reading 
ADD CONSTRAINT unique_invoice_number UNIQUE (invoice_number);

-- =====================================================
-- VERIFICATION: Confirm constraint was created
-- =====================================================
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'billing_reading'
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'invoice_number';

-- Expected result: One row showing the unique_invoice_number constraint
