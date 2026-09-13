package com.wbill.home.hrms.config;

import java.time.LocalDate;

/**
 * Utility for bidirectional Ethiopian Calendar (Ge'ez) and Gregorian Calendar conversions.
 * Handles Ethiopian 13 months: Meskerem (1) through Pagume (13).
 */
public final class HrmsEthiopianCalendarUtil {

    private HrmsEthiopianCalendarUtil() {}

    public static final String[] ETHIOPIAN_MONTHS = {
        "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
        "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
    };

    /**
     * Converts a Gregorian LocalDate into an Ethiopian [year, month, day] array.
     */
    public static int[] toEthiopianDate(LocalDate gregorianDate) {
        int gy = gregorianDate.getYear();
        int gm = gregorianDate.getMonthValue();
        int gd = gregorianDate.getDayOfMonth();

        int jdn = gregorianToJdn(gy, gm, gd);
        return jdnToEthiopian(jdn);
    }

    /**
     * Converts an Ethiopian [year, month, day] into a Gregorian LocalDate.
     */
    public static LocalDate toGregorianDate(int ethYear, int ethMonth, int ethDay) {
        int jdn = ethiopianToJdn(ethYear, ethMonth, ethDay);
        return jdnToGregorian(jdn);
    }

    public static String getEthiopianMonthName(int ethMonth) {
        if (ethMonth >= 1 && ethMonth <= 13) {
            return ETHIOPIAN_MONTHS[ethMonth - 1];
        }
        return "ያልታወቀ";
    }

    public static int getEthiopianMonthIndex(String monthName) {
        if (monthName == null) return 1;
        for (int i = 0; i < ETHIOPIAN_MONTHS.length; i++) {
            if (ETHIOPIAN_MONTHS[i].trim().equalsIgnoreCase(monthName.trim())) {
                return i + 1;
            }
        }
        return 1;
    }

    public static String formatEthiopianPeriod(String monthName, int year) {
        return monthName + ", " + year;
    }

    // --- Internal JDN Conversion Algorithms ---

    private static int gregorianToJdn(int year, int month, int day) {
        int a = (14 - month) / 12;
        int y = year + 4800 - a;
        int m = month + 12 * a - 3;
        return day + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045;
    }

    private static int[] jdnToEthiopian(int jdn) {
        int r = (jdn - 1723856) % 1461;
        int n = (r % 365) + 365 * (r / 1460);
        int year = 4 * ((jdn - 1723856) / 1461) + (r / 365) - (r / 1460);
        int month = (n / 30) + 1;
        int day = (n % 30) + 1;
        return new int[]{year, month, day};
    }

    private static int ethiopianToJdn(int year, int month, int day) {
        return (1723856 + 365) + 365 * (year - 1) + (year / 4) + 30 * (month - 1) + day - 1;
    }

    private static LocalDate jdnToGregorian(int jdn) {
        int l = jdn + 68569;
        int n = (4 * l) / 146097;
        l = l - (146097 * n + 3) / 4;
        int i = (4000 * (l + 1)) / 1461001;
        l = l - (1461 * i) / 4 + 31;
        int j = (80 * l) / 2447;
        int day = l - (2447 * j) / 80;
        l = j / 11;
        int month = j + 2 - (12 * l);
        int year = 100 * (n - 49) + i + l;
        return LocalDate.of(year, month, day);
    }
}
