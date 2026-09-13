package com.wbill.home.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Comprehensive Ethiopian Calendar Converter Utility Class
 * 
 * This utility class provides bidirectional conversion between Gregorian and
 * Ethiopian calendars
 * with comprehensive formatting, validation, and utility methods.
 * 
 * Features:
 * - Convert Gregorian dates to Ethiopian calendar
 * - Convert Ethiopian dates to Gregorian calendar
 * - Format dates in various Ethiopian formats
 * - Validate Ethiopian dates
 * - Handle date ranges and filtering
 * - Support for both LocalDate and LocalDateTime
 * - Thread-safe operations
 * 
 * Ethiopian Calendar System:
 * - 13 months: 12 months of 30 days each + Pagumen (5-6 days)
 * - New Year starts on September 11 (or 12 in leap years)
 * - Leap year every 4 years (different from Gregorian)
 * 
 * @author Wbill System
 * @version 1.0
 */
public class EthiopianCalendarConverter {

    // Ethiopian month names in Amharic
    private static final String[] ETHIOPIAN_MONTH_NAMES_AMHARIC = {
            "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
            "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
    };

    // Ethiopian month names in English
    private static final String[] ETHIOPIAN_MONTH_NAMES_ENGLISH = {
            "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
            "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagumen"
    };

    // Month name to index mapping for parsing
    private static final Map<String, Integer> MONTH_NAME_TO_INDEX_AMHARIC = new HashMap<>();
    private static final Map<String, Integer> MONTH_NAME_TO_INDEX_ENGLISH = new HashMap<>();

    // Ethiopian epoch (JDN of 1 Meskerem 0001 E.C.)
    private static final int ETHIOPIC_EPOCH = 1724221;

    // Date format patterns
    private static final Pattern ETHIOPIAN_DATE_PATTERN = Pattern.compile("(\\d{1,2})/(\\d{1,2})/(\\d{4})");
    private static final Pattern ETHIOPIAN_DATE_PATTERN_DASH = Pattern.compile("(\\d{1,2})-(\\d{1,2})-(\\d{4})");
    private static final Pattern ETHIOPIAN_DATE_PATTERN_ISO = Pattern.compile("(\\d{4})-(\\d{1,2})-(\\d{1,2})");

    static {
        // Initialize month name mappings
        for (int i = 0; i < ETHIOPIAN_MONTH_NAMES_AMHARIC.length; i++) {
            MONTH_NAME_TO_INDEX_AMHARIC.put(ETHIOPIAN_MONTH_NAMES_AMHARIC[i], i + 1);
        }
        for (int i = 0; i < ETHIOPIAN_MONTH_NAMES_ENGLISH.length; i++) {
            MONTH_NAME_TO_INDEX_ENGLISH.put(ETHIOPIAN_MONTH_NAMES_ENGLISH[i], i + 1);
        }
    }

    /**
     * Ethiopian Date representation
     */
    public static class EthiopianDate {
        private final int year;
        private final int month; // 1-13
        private final int day; // 1-30 (1-5/6 for Pagumen)

        public EthiopianDate(int year, int month, int day) {
            if (!isValidEthiopianDate(year, month, day)) {
                throw new IllegalArgumentException(
                        String.format("Invalid Ethiopian date: %d-%d-%d", year, month, day));
            }
            this.year = year;
            this.month = month;
            this.day = day;
        }

        public int getYear() {
            return year;
        }

        public int getMonth() {
            return month;
        }

        public int getDay() {
            return day;
        }

        /**
         * Format the Ethiopian date
         * 
         * @param format Format string: "dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", etc.
         * @return Formatted date string
         */
        public String format(String format) {
            return EthiopianCalendarConverter.formatEthiopianDate(this, format);
        }

        /**
         * Format with Amharic month name
         * 
         * @return Date string with Amharic month name
         */
        public String formatWithAmharicMonth() {
            return EthiopianCalendarConverter.formatEthiopianDateWithAmharicMonth(this);
        }

        /**
         * Format with English month name
         * 
         * @return Date string with English month name
         */
        public String formatWithEnglishMonth() {
            return EthiopianCalendarConverter.formatEthiopianDateWithEnglishMonth(this);
        }

        @Override
        public String toString() {
            return String.format("%d/%d/%d", day, month, year);
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj)
                return true;
            if (obj == null || getClass() != obj.getClass())
                return false;
            EthiopianDate that = (EthiopianDate) obj;
            return year == that.year && month == that.month && day == that.day;
        }

        @Override
        public int hashCode() {
            return year * 10000 + month * 100 + day;
        }
    }

    /**
     * Convert Gregorian LocalDate to Ethiopian calendar
     * 
     * @param gregorianDate Gregorian date
     * @return Ethiopian date
     */
    public static EthiopianDate gregorianToEthiopian(LocalDate gregorianDate) {
        if (gregorianDate == null) {
            throw new IllegalArgumentException("Gregorian date cannot be null");
        }

        int jd = jdFromGregorian(gregorianDate.getYear(),
                gregorianDate.getMonthValue(),
                gregorianDate.getDayOfMonth());
        return ethiopianFromJDN(jd);
    }

    /**
     * Convert Gregorian LocalDateTime to Ethiopian calendar
     * 
     * @param gregorianDateTime Gregorian date time
     * @return Ethiopian date (time component is ignored)
     */
    public static EthiopianDate gregorianToEthiopian(LocalDateTime gregorianDateTime) {
        if (gregorianDateTime == null) {
            throw new IllegalArgumentException("Gregorian date time cannot be null");
        }
        return gregorianToEthiopian(gregorianDateTime.toLocalDate());
    }

    /**
     * Convert Ethiopian date to Gregorian LocalDate
     * 
     * @param ethiopianDate Ethiopian date
     * @return Gregorian LocalDate
     */
    public static LocalDate ethiopianToGregorian(EthiopianDate ethiopianDate) {
        if (ethiopianDate == null) {
            throw new IllegalArgumentException("Ethiopian date cannot be null");
        }
        return ethiopianToGregorian(ethiopianDate.year, ethiopianDate.month, ethiopianDate.day);
    }

    /**
     * Convert Ethiopian date components to Gregorian LocalDate
     * 
     * @param year  Ethiopian year
     * @param month Ethiopian month (1-13)
     * @param day   Ethiopian day
     * @return Gregorian LocalDate
     */
    public static LocalDate ethiopianToGregorian(int year, int month, int day) {
        if (!isValidEthiopianDate(year, month, day)) {
            throw new IllegalArgumentException(
                    String.format("Invalid Ethiopian date: %d-%d-%d", year, month, day));
        }

        int jd = jdFromEthiopian(year, month, day);
        int[] gregorian = gregorianFromJDN(jd);
        return LocalDate.of(gregorian[0], gregorian[1], gregorian[2]);
    }

    /**
     * Parse Ethiopian date string to EthiopianDate
     * 
     * @param dateString Date string in format "dd/MM/yyyy", "dd-MM-yyyy", or
     *                   "yyyy-MM-dd"
     * @return Ethiopian date
     */
    public static EthiopianDate parseEthiopianDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            throw new IllegalArgumentException("Date string cannot be null or empty");
        }

        dateString = dateString.trim();

        // Try different patterns
        java.util.regex.Matcher matcher;

        // Pattern: dd/MM/yyyy or dd-MM-yyyy
        matcher = ETHIOPIAN_DATE_PATTERN.matcher(dateString);
        if (!matcher.matches()) {
            matcher = ETHIOPIAN_DATE_PATTERN_DASH.matcher(dateString);
        }
        if (matcher.matches()) {
            int day = Integer.parseInt(matcher.group(1));
            int month = Integer.parseInt(matcher.group(2));
            int year = Integer.parseInt(matcher.group(3));
            return new EthiopianDate(year, month, day);
        }

        // Pattern: yyyy-MM-dd
        matcher = ETHIOPIAN_DATE_PATTERN_ISO.matcher(dateString);
        if (matcher.matches()) {
            int year = Integer.parseInt(matcher.group(1));
            int month = Integer.parseInt(matcher.group(2));
            int day = Integer.parseInt(matcher.group(3));
            return new EthiopianDate(year, month, day);
        }

        throw new IllegalArgumentException("Invalid Ethiopian date format: " + dateString);
    }

    /**
     * Format Ethiopian date as string
     * 
     * @param ethiopianDate Ethiopian date
     * @param format        Format string: "dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd",
     *                      etc.
     * @return Formatted date string
     */
    public static String formatEthiopianDate(EthiopianDate ethiopianDate, String format) {
        if (ethiopianDate == null)
            return null;
        if (format == null)
            format = "dd/MM/yyyy";

        String paddedDay = String.format("%02d", ethiopianDate.day);
        String paddedMonth = String.format("%02d", ethiopianDate.month);
        String year = String.valueOf(ethiopianDate.year);

        switch (format.toLowerCase()) {
            case "dd/mm/yyyy":
                return paddedDay + "/" + paddedMonth + "/" + year;
            case "dd-mm-yyyy":
                return paddedDay + "-" + paddedMonth + "-" + year;
            case "yyyy/mm/dd":
                return year + "/" + paddedMonth + "/" + paddedDay;
            case "yyyy-mm-dd":
                return year + "-" + paddedMonth + "-" + paddedDay;
            case "mm/dd/yyyy":
                return paddedMonth + "/" + paddedDay + "/" + year;
            default:
                return paddedDay + "/" + paddedMonth + "/" + year;
        }
    }

    /**
     * Format Ethiopian date with Amharic month name
     * 
     * @param ethiopianDate Ethiopian date
     * @return Formatted date string with Amharic month name
     */
    public static String formatEthiopianDateWithAmharicMonth(EthiopianDate ethiopianDate) {
        if (ethiopianDate == null)
            return null;

        String monthName = getEthiopianMonthNameAmharic(ethiopianDate.month);
        return ethiopianDate.day + " " + monthName + " " + ethiopianDate.year;
    }

    /**
     * Format Ethiopian date with English month name
     * 
     * @param ethiopianDate Ethiopian date
     * @return Formatted date string with English month name
     */
    public static String formatEthiopianDateWithEnglishMonth(EthiopianDate ethiopianDate) {
        if (ethiopianDate == null)
            return null;

        String monthName = getEthiopianMonthNameEnglish(ethiopianDate.month);
        return ethiopianDate.day + " " + monthName + " " + ethiopianDate.year;
    }

    /**
     * Get Ethiopian month name in Amharic
     * 
     * @param month Month number (1-13)
     * @return Month name in Amharic
     */
    public static String getEthiopianMonthNameAmharic(int month) {
        if (month < 1 || month > 13) {
            throw new IllegalArgumentException("Month must be between 1 and 13");
        }
        return ETHIOPIAN_MONTH_NAMES_AMHARIC[month - 1];
    }

    /**
     * Get Ethiopian month name in English
     * 
     * @param month Month number (1-13)
     * @return Month name in English
     */
    public static String getEthiopianMonthNameEnglish(int month) {
        if (month < 1 || month > 13) {
            throw new IllegalArgumentException("Month must be between 1 and 13");
        }
        return ETHIOPIAN_MONTH_NAMES_ENGLISH[month - 1];
    }

    /**
     * Get all Ethiopian month names in Amharic
     * 
     * @return Array of month names in Amharic
     */
    public static String[] getEthiopianMonthNamesAmharic() {
        return ETHIOPIAN_MONTH_NAMES_AMHARIC.clone();
    }

    /**
     * Get all Ethiopian month names in English
     * 
     * @return Array of month names in English
     */
    public static String[] getEthiopianMonthNamesEnglish() {
        return ETHIOPIAN_MONTH_NAMES_ENGLISH.clone();
    }

    /**
     * Validate Ethiopian date
     * 
     * @param year  Ethiopian year
     * @param month Ethiopian month (1-13)
     * @param day   Ethiopian day
     * @return true if valid Ethiopian date
     */
    public static boolean isValidEthiopianDate(int year, int month, int day) {
        // Basic range checks
        if (year < 1 || month < 1 || month > 13 || day < 1) {
            return false;
        }

        // Check day limits for regular months (1-12)
        if (month <= 12 && day > 30) {
            return false;
        }

        // Check day limits for Pagumen (13th month)
        if (month == 13) {
            boolean isLeapYear = isEthiopianLeapYear(year);
            int maxDays = isLeapYear ? 6 : 5;
            if (day > maxDays) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if Ethiopian year is a leap year
     * 
     * @param year Ethiopian year
     * @return true if leap year
     */
    public static boolean isEthiopianLeapYear(int year) {
        return (year % 4) == 3;
    }

    /**
     * Get current Ethiopian date
     * 
     * @return Current Ethiopian date
     */
    public static EthiopianDate getCurrentEthiopianDate() {
        return gregorianToEthiopian(LocalDate.now());
    }

    /**
     * Get current Ethiopian date as formatted string
     * 
     * @param format Format string
     * @return Current Ethiopian date as formatted string
     */
    public static String getCurrentEthiopianDateString(String format) {
        return formatEthiopianDate(getCurrentEthiopianDate(), format);
    }

    /**
     * Compare two Ethiopian dates
     * 
     * @param date1 First Ethiopian date
     * @param date2 Second Ethiopian date
     * @return -1 if date1 < date2, 0 if equal, 1 if date1 > date2
     */
    public static int compareEthiopianDates(EthiopianDate date1, EthiopianDate date2) {
        if (date1 == null && date2 == null)
            return 0;
        if (date1 == null)
            return -1;
        if (date2 == null)
            return 1;

        if (date1.year != date2.year) {
            return Integer.compare(date1.year, date2.year);
        }
        if (date1.month != date2.month) {
            return Integer.compare(date1.month, date2.month);
        }
        return Integer.compare(date1.day, date2.day);
    }

    /**
     * Check if a Gregorian date falls within an Ethiopian date range
     * 
     * @param gregorianDate     Gregorian date to check
     * @param fromEthiopianDate Start of Ethiopian date range (inclusive)
     * @param toEthiopianDate   End of Ethiopian date range (inclusive)
     * @return true if the date falls within the range
     */
    public static boolean isDateInEthiopianRange(LocalDate gregorianDate,
            EthiopianDate fromEthiopianDate,
            EthiopianDate toEthiopianDate) {
        if (gregorianDate == null)
            return false;

        EthiopianDate ethiopianDate = gregorianToEthiopian(gregorianDate);

        if (fromEthiopianDate != null && compareEthiopianDates(ethiopianDate, fromEthiopianDate) < 0) {
            return false;
        }

        if (toEthiopianDate != null && compareEthiopianDates(ethiopianDate, toEthiopianDate) > 0) {
            return false;
        }

        return true;
    }

    /**
     * Convert Ethiopian date range to Gregorian date range
     * 
     * @param fromEthiopianDate Start Ethiopian date
     * @param toEthiopianDate   End Ethiopian date
     * @return Array containing [fromGregorianDate, toGregorianDate]
     */
    public static LocalDate[] getGregorianRangeFromEthiopian(EthiopianDate fromEthiopianDate,
            EthiopianDate toEthiopianDate) {
        LocalDate fromGregorian = fromEthiopianDate != null ? ethiopianToGregorian(fromEthiopianDate) : null;
        LocalDate toGregorian = toEthiopianDate != null ? ethiopianToGregorian(toEthiopianDate) : null;

        return new LocalDate[] { fromGregorian, toGregorian };
    }

    /**
     * Get Ethiopian date for input field (YYYY-MM-DD format)
     * 
     * @param gregorianDate Gregorian date
     * @return Ethiopian date in YYYY-MM-DD format
     */
    public static String toEthiopianInputValue(LocalDate gregorianDate) {
        if (gregorianDate == null)
            return "";

        EthiopianDate ethiopianDate = gregorianToEthiopian(gregorianDate);
        return formatEthiopianDate(ethiopianDate, "yyyy-MM-dd");
    }

    /**
     * Parse Ethiopian date input value to Gregorian date
     * 
     * @param ethiopianInputValue Ethiopian date in YYYY-MM-DD format
     * @return Gregorian LocalDate
     */
    public static LocalDate fromEthiopianInputValue(String ethiopianInputValue) {
        if (ethiopianInputValue == null || ethiopianInputValue.trim().isEmpty()) {
            return null;
        }

        try {
            EthiopianDate ethiopianDate = parseEthiopianDate(ethiopianInputValue.trim());
            return ethiopianToGregorian(ethiopianDate);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Ethiopian date input: " + ethiopianInputValue, e);
        }
    }

    // ========== Private Helper Methods ==========

    /**
     * Convert Gregorian date to Julian Day Number
     */
    private static int jdFromGregorian(int year, int month, int day) {
        int a = (14 - month) / 12;
        int y = year + 4800 - a;
        int m = month + 12 * a - 3;
        return day + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045;
    }

    /**
     * Convert Julian Day Number to Gregorian date
     */
    private static int[] gregorianFromJDN(int jd) {
        int l = jd + 68569;
        int n = (4 * l) / 146097;
        l = l - (146097 * n + 3) / 4;
        int i = (4000 * (l + 1)) / 1461001;
        l = l - (1461 * i) / 4 + 31;
        int j = (80 * l) / 2447;
        int d = l - (2447 * j) / 80;
        l = j / 11;
        int m = j + 2 - 12 * l;
        int y = 100 * (n - 49) + i + l;
        return new int[] { y, m, d };
    }

    /**
     * Convert Ethiopian date to Julian Day Number
     */
    private static int jdFromEthiopian(int year, int month, int day) {
        return ETHIOPIC_EPOCH + 365 * (year - 1) + (year - 1) / 4 + 30 * (month - 1) + day - 1;
    }

    /**
     * Convert Julian Day Number to Ethiopian date
     */
    private static EthiopianDate ethiopianFromJDN(int jd) {
        int r = jd - ETHIOPIC_EPOCH;
        int year = (4 * r + 1463) / 1461;
        int t = r - 365 * (year - 1) - (year - 1) / 4;
        int month = t / 30 + 1;
        int day = t % 30 + 1;
        return new EthiopianDate(year, month, day);
    }
}
