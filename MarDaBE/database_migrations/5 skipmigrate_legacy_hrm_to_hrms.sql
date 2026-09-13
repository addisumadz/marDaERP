-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- migrate_legacy_hrm_to_hrms.sql
-- Migration script from legacy 'hrm_*' tables to enterprise 'hrms_*' tables
-- Safe to execute: Checks if legacy tables exist before attempting any SELECT/INSERT.
-- If legacy tables are absent, it skips safely without throwing SQL errors!
-- ══════════════════════════════════════════════════════════════════════════════════════════════

DELIMITER //

DROP PROCEDURE IF EXISTS sp_migrate_legacy_hrm_if_exists //

CREATE PROCEDURE sp_migrate_legacy_hrm_if_exists()
BEGIN
    DECLARE legacy_tables_exist INT DEFAULT 0;

    -- Check if legacy table 'hrm_employee_info' exists in current database
    SELECT COUNT(*) INTO legacy_tables_exist
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_info';

    IF legacy_tables_exist = 0 THEN
        SELECT 'Legacy hrm_* tables not found in current database. Skipping migration safely.' AS MigrationStatus;
    ELSE
        SET FOREIGN_KEY_CHECKS = 0;

        -- 1. Migrate Ethiopian Tax Settings (hrm_gibir_setting -> hrms_gibir_setting)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_gibir_setting') THEN
            INSERT INTO `hrms_gibir_setting` (`id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`)
            SELECT `id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`
            FROM `hrm_gibir_setting`
            ON DUPLICATE KEY UPDATE
              `weight` = VALUES(`weight`),
              `upper_limit_birr` = VALUES(`upper_limit_birr`),
              `percent_birr` = VALUES(`percent_birr`),
              `and_above` = VALUES(`and_above`),
              `total_deductible_till_this` = VALUES(`total_deductible_till_this`);
        END IF;

        -- 2. Migrate Salary Configurations (hrm_salary_configurations -> hrms_salary_configurations)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_salary_configurations') THEN
            INSERT INTO `hrms_salary_configurations` (`id`, `config_title`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_deleted`, `is_pension`, `is_leave_config`)
            SELECT `id`, `config_title`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_deleted`, `is_pension`, `is_leave_config`
            FROM `hrm_salary_configurations`
            ON DUPLICATE KEY UPDATE
              `config_title` = VALUES(`config_title`),
              `is_birr` = VALUES(`is_birr`),
              `is_percent` = VALUES(`is_percent`),
              `config_value` = VALUES(`config_value`);
        END IF;

        -- 3. Migrate Employee Master Records (hrm_employee_info -> hrms_employee_info)
        INSERT INTO `hrms_employee_info` (
          `id`, `employee_id`, `tin_number`, `pension_number`, `full_name`, `full_name_am`,
          `mother_name`, `marital_status`, `disability_status`, `first_employment_date`,
          `yeteketerubet_ken`, `current_salary`, `employee_photo`, `employee_signature`,
          `tureta_yemiwetubet_ken`, `date_of_birth`, `employment_status`, `employment_type`,
          `sex`, `nationality`, `registered_date`, `registered_by`, `modified_date`,
          `modified_by`, `is_deleted`, `is_salary_defaults_modified`, `address_ketena_id`,
          `address_streets_id`, `address_city_id`, `branchs_id`,
          `primary_bank_name`, `primary_bank_account`, `secondary_bank_name`
        )
        SELECT
          `id`,
          COALESCE(`employee_id`, CONCAT('EMP-', `id`)),
          `tin_number`,
          `pension_number`,
          COALESCE(`full_name`, 'Unknown Employee'),
          COALESCE(`full_name_am`, `full_name`, 'ያልታወቀ ሠራተኛ'),
          `mother_name`,
          COALESCE(`marital_status`, 'SINGLE'),
          COALESCE(`disability_status`, 'NONE'),
          `first_employment_date`,
          `yeteketerubet_ken`,
          COALESCE(`current_salary`, 0),
          `employee_photo`,
          `employee_signature`,
          `tureta_yemiwetubet_ken`,
          `date_of_birth`,
          COALESCE(`employment_status`, 'ACTIVE'),
          COALESCE(`employment_condition`, 'PERMANENT'),
          COALESCE(`sex`, 'MALE'),
          COALESCE(`nationality`, 'Ethiopian'),
          COALESCE(`registered_date`, NOW()),
          `registered_by`,
          COALESCE(`modified_date`, NOW()),
          `modified_by`,
          `is_deleted`,
          `is_salary_defaults_modified`,
          `address_ketena_id`,
          `address_streets_id`,
          `address_city_id`,
          `branchs_id`,
          COALESCE(`bank_name`, 'Commercial Bank of Ethiopia'),
          CASE WHEN `bank_account` > 0 THEN CAST(`bank_account` AS CHAR) ELSE NULL END,
          'Abay Bank'
        FROM `hrm_employee_info`
        ON DUPLICATE KEY UPDATE
          `full_name` = VALUES(`full_name`),
          `full_name_am` = VALUES(`full_name_am`),
          `current_salary` = VALUES(`current_salary`);

        -- 4. Migrate Education Records
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_education') THEN
            INSERT INTO `hrms_employee_education` (`id`, `hrms_employee_info_id`, `yetmhrt_dereja`, `yetmhrtbet_sm`, `yetmhrt_aynet`, `yetmhrt_dereja_status`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, COALESCE(`yetmhrt_dereja`, 'Degree'), COALESCE(`yetmhrtbet_sm`, 'University'), COALESCE(`yetmhrt_aynet`, 'General'), COALESCE(`yetmhrt_dereja_status`, 'COMPLETED'), `registered_date`, `registered_by`, `modified_date`, `modified_by`, CASE WHEN `deleted` = '1' THEN 1 ELSE 0 END
            FROM `hrm_employee_education`
            ON DUPLICATE KEY UPDATE `yetmhrt_dereja` = VALUES(`yetmhrt_dereja`);
        END IF;

        -- 5. Migrate Skills / Chlota
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_chlota') THEN
            INSERT INTO `hrms_employee_chlota` (`id`, `hrms_employee_info_id`, `chlota_sm`, `chlota_label`, `chlota_remark`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, COALESCE(`chlota_sm`, 'Skill'), `chlota_label`, `chlota_remark`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, CASE WHEN `deleted` = '1' THEN 1 ELSE 0 END
            FROM `hrm_employee_chlota`
            ON DUPLICATE KEY UPDATE `chlota_sm` = VALUES(`chlota_sm`);
        END IF;

        -- 6. Migrate Experience
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_yeteketerebachew') THEN
            INSERT INTO `hrms_employee_yeteketerebachew` (`id`, `hrms_employee_info_id`, `organization_name`, `yesra_medeb`, `demewez_meten`, `employeed_from`, `employeed_to`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, COALESCE(`organization_name`, 'Prior Org'), COALESCE(`yesra_medeb`, 'Position'), `demewez_meten`, `employeed_from`, `employeed_to`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, CASE WHEN `deleted` = '1' THEN 1 ELSE 0 END
            FROM `hrm_employee_yeteketerebachew`
            ON DUPLICATE KEY UPDATE `organization_name` = VALUES(`organization_name`);
        END IF;

        -- 7. Migrate Children / Dependents
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_ljoch') THEN
            INSERT INTO `hrms_employee_ljoch` (`id`, `hrms_employee_info_id`, `yelj_mulu_sm`, `birth_date`, `tsota`, `yeabat_or_enat_mulusm`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, COALESCE(`yelj_mulu_sm`, 'Child'), `birth_date`, COALESCE(`tsota`, 'Male'), `yeabat_or_enat_mulusm`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, CASE WHEN `deleted` = '1' THEN 1 ELSE 0 END
            FROM `hrm_employee_ljoch`
            ON DUPLICATE KEY UPDATE `yelj_mulu_sm` = VALUES(`yelj_mulu_sm`);
        END IF;

        -- 8. Migrate Physical Identification
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_yesewnet_meglecha') THEN
            INSERT INTO `hrms_employee_yesewnet_meglecha` (`id`, `hrms_employee_info_id`, `meglecha_label`, `meglecha_value`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, COALESCE(`meglecha_label`, 'Feature'), COALESCE(`meglecha_value`, 'Detail'), `registered_date`, `registered_by`, `modified_date`, `modified_by`, CASE WHEN `deleted` = '1' THEN 1 ELSE 0 END
            FROM `hrm_employee_yesewnet_meglecha`
            ON DUPLICATE KEY UPDATE `meglecha_value` = VALUES(`meglecha_value`);
        END IF;

        -- 9. Migrate Photos and Documents
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_info_photo') THEN
            INSERT INTO `hrms_employee_info_photo` (`id`, `hrms_employee_info_id`, `is_document`, `is_photo`, `document_photo`, `document_title`, `document_description`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, `is_document`, `is_photo`, `document_photo`, `document_title`, `document_description`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`
            FROM `hrm_employee_info_photo`
            ON DUPLICATE KEY UPDATE `document_photo` = VALUES(`document_photo`);
        END IF;

        -- 10. Migrate Salary Defaults
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_info_salary_defaults') THEN
            INSERT INTO `hrms_employee_info_salary_defaults` (`id`, `hrms_employee_info_id`, `hrms_salary_configurations_id`, `default_value`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, `hrm_salary_configurations_id`, `default_value`, `is_deleted`
            FROM `hrm_employee_info_salary_defaults`
            ON DUPLICATE KEY UPDATE `default_value` = VALUES(`default_value`);
        END IF;

        -- 11. Migrate Leave Requests
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hrm_employee_leave') THEN
            INSERT INTO `hrms_employee_leave` (`id`, `hrms_employee_info_id`, `year`, `leave_days`, `leave_start`, `leave_end`, `leave_reason`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`)
            SELECT `id`, `hrm_employee_info_id`, `year`, `leave_days`, COALESCE(`leave_start`, NOW()), COALESCE(`leave_end`, NOW()), `leave_reason`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, CASE WHEN `deleted` = 'active' THEN 0 ELSE 1 END
            FROM `hrm_employee_leave`
            ON DUPLICATE KEY UPDATE `leave_days` = VALUES(`leave_days`);
        END IF;

        SET FOREIGN_KEY_CHECKS = 1;
        SELECT 'Legacy hrm_* data migration completed successfully.' AS MigrationStatus;
    END IF;
END //

DELIMITER ;

-- Execute the safe migration procedure
CALL sp_migrate_legacy_hrm_if_exists();

-- Clean up the temporary procedure
DROP PROCEDURE IF EXISTS sp_migrate_legacy_hrm_if_exists;
