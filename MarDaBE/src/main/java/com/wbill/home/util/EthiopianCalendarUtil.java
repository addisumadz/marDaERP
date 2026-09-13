package com.wbill.home.util;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Ethiopian calendar utilities with precise conversion to/from Gregorian
 * using Julian Day Number (JDN) algorithms.
 */
public class EthiopianCalendarUtil {

  // 12-month list for business/billing (Pagume is intentionally excluded)
  private static final String[] ETHIOPIAN_MONTH_NAMES = {
      "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
      "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ"
  };

  private static final Map<String, Integer> MONTH_NAME_TO_INDEX = new HashMap<>();

  // Ethiopic epoch (JDN of 1 Meskerem 0001 E.C.)
  private static final int ETHIOPIC_EPOCH = 1724221; // Corrected constant

  static {
    for (int i = 0; i < ETHIOPIAN_MONTH_NAMES.length; i++) {
      MONTH_NAME_TO_INDEX.put(ETHIOPIAN_MONTH_NAMES[i], i); // 0-indexed
    }
  }

  /**
   * Billing-safe previous month: never returns Pagume (month 13).
   * If current is Meskerem, returns Nehase of previous year.
   * Otherwise, simply decrements the month within the same year.
   * Input and output are Ethiopian month names with year, e.g., "ሚያዚያ, 2016".
   */
  public static String getPreviousBillingKifyaWer(String currentKifyaWerString) {
    if (currentKifyaWerString == null || !currentKifyaWerString.contains(",")) {
      throw new IllegalArgumentException("Invalid kifyaWerString format: " + currentKifyaWerString);
    }
    String[] parts = currentKifyaWerString.split(", ");
    String currentMonthName = parts[0];
    int currentYear = Integer.parseInt(parts[1]);

    Integer currentMonthIndex = MONTH_NAME_TO_INDEX.get(currentMonthName);
    if (currentMonthIndex == null) {
      throw new IllegalArgumentException("Invalid Ethiopian month name: " + currentMonthName);
    }

    // Meskerem (index 0) -> Nehase (index 11) of previous year
    if (currentMonthIndex == 0) {
      return ETHIOPIAN_MONTH_NAMES[11] + ", " + (currentYear - 1);
    }
    // Otherwise: decrement within year, but if it would hit Pagume (index 12), skip
    // to Nehase
    int prevIdx = currentMonthIndex - 1;
    if (prevIdx == 12)
      prevIdx = 11; // skip Pagume
    return ETHIOPIAN_MONTH_NAMES[prevIdx] + ", " + currentYear;
  }

  /**
   * Normalize an Ethiopian year/month pair for billing to a 12-month system.
   * If month is 13 (Pagume), returns (year, 12) i.e., treat as Nehase.
   */
  public static int[] normalizeYearMonthForBilling(int year, int month) {
    if (month == 13)
      return new int[] { year, 12 };
    if (month < 1)
      month = 1;
    if (month > 13)
      month = 13;
    return new int[] { year, month };
  }

  /**
   * Convenience: compute Ethiopian Y/M from a Gregorian date and normalize for
   * billing (no Pagume).
   */
  public static int[] getEthiopianYearMonthForBilling(LocalDate date) {
    int[] ym = getEthiopianYearMonth(date);
    return normalizeYearMonthForBilling(ym[0], ym[1]);
  }

  public static String formatMonthYear(LocalDate date) {
    EthiopianDate eth = toEthiopian(date);
    String mName;
    if (eth.month == 13) {
      mName = "ጳጉሜ";
    } else if (eth.month >= 1 && eth.month <= 12) {
      mName = ETHIOPIAN_MONTH_NAMES[eth.month - 1];
    } else {
      mName = "Month " + eth.month;
    }
    return mName + ", " + eth.year;
  }

  // ---------- Public API ----------

  /**
   * Converts a "Month, Year" string (Ethiopian) to the previous month string.
   * Example input: "ሚያዚያ, 2016" -> "መጋቢት, 2016"
   */
  public static String getPreviousKifyaWer(String currentKifyaWerString) {
    // Business rule: system does not use the 13th month; delegate to billing-safe
    // previous month
    return getPreviousBillingKifyaWer(currentKifyaWerString);
  }

  /**
   * Returns the Ethiopian year and month for a given Gregorian date using precise
   * conversion.
   * 
   * @return int[]{ethiopianYear, ethiopianMonth (1..13)}
   */
  public static int[] getEthiopianYearMonth(LocalDate date) {
    EthiopianDate eth = toEthiopian(date);
    return new int[] { eth.year, eth.month };
  }

  /** Converts a Gregorian LocalDate to Ethiopian date (Y, M, D). */
  public static EthiopianDate toEthiopian(LocalDate gregorianDate) {
    if (gregorianDate == null)
      gregorianDate = LocalDate.now();
    int jd = jdFromGregorian(gregorianDate.getYear(), gregorianDate.getMonthValue(), gregorianDate.getDayOfMonth());
    return ethiopicFromJDN(jd);
  }

  /** Converts an Ethiopian date to Gregorian LocalDate. */
  public static LocalDate toGregorian(int ethYear, int ethMonth, int ethDay) {
    int jd = jdFromEthiopic(ethYear, ethMonth, ethDay);
    int[] g = gregorianFromJDN(jd);
    return LocalDate.of(g[0], g[1], g[2]);
  }

  // ---------- Core conversion helpers ----------

  // Julian Day Number from Gregorian date (Fliegel & Van Flandern algorithm)
  private static int jdFromGregorian(int y, int m, int d) {
    int a = (14 - m) / 12;
    int y2 = y + 4800 - a;
    int m2 = m + 12 * a - 3;
    return d + (153 * m2 + 2) / 5 + 365 * y2 + y2 / 4 - y2 / 100 + y2 / 400 - 32045;
  }

  // Gregorian date (Y,M,D) from Julian Day Number
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

  // Julian Day Number from Ethiopic date
  private static int jdFromEthiopic(int year, int month, int day) {
    return ETHIOPIC_EPOCH + 365 * (year - 1) + (year - 1) / 4 + 30 * (month - 1) + day - 1;
  }

  // Ethiopic date from Julian Day Number
  private static EthiopianDate ethiopicFromJDN(int jd) {
    int r = jd - ETHIOPIC_EPOCH;
    int year = (4 * r + 1463) / 1461; // floor division
    int t = r - 365 * (year - 1) - (year - 1) / 4;
    int month = t / 30 + 1;
    int day = t % 30 + 1;
    return new EthiopianDate(year, month, day);
  }

  // ---------- Supporting structures ----------

  /** Simple Ethiopian date holder. */
  public static class EthiopianDate {
    public final int year;
    public final int month; // 1..13
    public final int day; // 1..30 (Pagume 5/6 on leap years)

    public EthiopianDate(int year, int month, int day) {
      this.year = year;
      this.month = month;
      this.day = day;
    }

    @Override
    public String toString() {
      String mName;
      if (month == 13) {
        mName = "ጳጉሜ"; // handle Pagume explicitly since array is 12-months
      } else if (month >= 1 && month <= 12) {
        mName = ETHIOPIAN_MONTH_NAMES[month - 1];
      } else {
        mName = "Month " + month;
      }
      return year + "-" + mName + "-" + day;
    }
  }
}