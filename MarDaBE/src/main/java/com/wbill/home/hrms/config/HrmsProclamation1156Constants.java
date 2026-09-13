package com.wbill.home.hrms.config;

/**
 * Statutory constants and multiplier rules under Ethiopian Labour Proclamation No. 1156/2019
 * and Public Enterprise standards for Municipal Water Utilities.
 */
public final class HrmsProclamation1156Constants {

    private HrmsProclamation1156Constants() {}

    // Maximum regular working hours (Article 61)
    public static final int MAX_DAILY_REGULAR_HOURS = 8;
    public static final int MAX_WEEKLY_REGULAR_HOURS = 48;
    public static final int STANDARD_MONTHLY_WORKING_DAYS = 30;
    public static final int STANDARD_DAILY_HOURS = 8;

    // Overtime rates (Article 68)
    // 1. Daytime Overtime (06:00 AM - 10:00 PM on normal working day): 1.50x
    public static final double OVERTIME_RATE_DAY = 1.50;

    // 2. Nighttime Overtime (10:00 PM - 06:00 AM): 1.75x
    public static final double OVERTIME_RATE_NIGHT = 1.75;

    // 3. Weekly Rest Day Overtime (Sunday / scheduled rest day): 2.00x
    public static final double OVERTIME_RATE_WEEKEND = 2.00;

    // 4. Public Holiday Overtime: 2.50x
    public static final double OVERTIME_RATE_HOLIDAY = 2.50;

    // Statutory Pension Rates (Proclamation No. 1267/2022 & 1268/2022)
    public static final double EMPLOYEE_PENSION_RATE = 0.07; // 7%
    public static final double EMPLOYER_PENSION_RATE = 0.11; // 11%
    public static final double TOTAL_STATUTORY_PENSION_RATE = 0.18; // 18%

    // Annual Leave Entitlement (Article 76-79)
    public static final int BASE_ANNUAL_LEAVE_DAYS = 16;
    public static final int SERVICE_YEARS_PER_ADDITIONAL_LEAVE_DAY = 2;

    // Special Leave Entitlements
    public static final int MATERNITY_LEAVE_DAYS = 120; // 30 prenatal + 90 postnatal (Article 88)
    public static final int PATERNITY_LEAVE_DAYS = 3;
    public static final int BEREAVEMENT_LEAVE_DAYS_IMMEDIATE = 3;
    public static final int BEREAVEMENT_LEAVE_DAYS_EXTENDED = 1;
    public static final int WEDDING_LEAVE_DAYS = 3;

    // Maximum Probation Period in working days (Article 11)
    public static final int MAX_PROBATION_WORKING_DAYS = 60;

    // Default Bank Names
    public static final String PRIMARY_BANK_DEFAULT = "Commercial Bank of Ethiopia";
    public static final String SECONDARY_BANK_DEFAULT = "Abay Bank";
}
