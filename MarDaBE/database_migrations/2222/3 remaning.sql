

-- 1. Add columns for Rejection and Cancellation tracking
ALTER TABLE `custom_new_line_connection_request`
    ADD COLUMN `rejection_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `updated_at`,
    ADD COLUMN `rejected_by` VARCHAR(100) NULL AFTER `rejection_reason`,
    ADD COLUMN `rejected_date` DATETIME NULL AFTER `rejected_by`,
    ADD COLUMN `cancellation_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `rejected_date`;

-- 2. Performance index for status and branch queries
CREATE INDEX `idx_cnl_status_branch` ON `custom_new_line_connection_request` (`status`, `branch_id`);

 by Revenue user on step 3 encoding item list collected by plumber page show me how does it calculate 25% ,55% and የክፍያ ማጠቃለያ (Payment Summary)
 and total payment "ጠቅላላ ክፍያ"