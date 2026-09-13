package com.wbill.home.util;

import java.time.LocalDate;

/**
 * Test class for EthiopianCalendarConverter
 * 
 * This class demonstrates the usage of the Ethiopian Calendar Converter
 * and can be used for testing the conversion accuracy.
 */
public class EthiopianCalendarConverterTest {
    
    public static void main(String[] args) {
        System.out.println("=== Ethiopian Calendar Converter Test ===\n");
        
        // Test current date conversion
        testCurrentDateConversion();
        
        // Test specific date conversions
        testSpecificDateConversions();
        
        // Test date formatting
        testDateFormatting();
        
        // Test date parsing
        testDateParsing();
        
        // Test date validation
        testDateValidation();
        
        // Test leap year calculations
        testLeapYearCalculations();
        
        // Test date comparisons
        testDateComparisons();
        
        // Test date ranges
        testDateRanges();
        
        // Test month names
        testMonthNames();
        
        System.out.println("\n=== All Tests Completed ===");
    }
    
    private static void testCurrentDateConversion() {
        System.out.println("1. Current Date Conversion Test:");
        System.out.println("--------------------------------");
        
        LocalDate today = LocalDate.now();
        EthiopianCalendarConverter.EthiopianDate ethiopianToday = 
            EthiopianCalendarConverter.getCurrentEthiopianDate();
        
        System.out.println("Today (Gregorian): " + today);
        System.out.println("Today (Ethiopian): " + ethiopianToday);
        System.out.println("Today (Ethiopian with Amharic month): " + ethiopianToday.formatWithAmharicMonth());
        System.out.println("Today (Ethiopian with English month): " + ethiopianToday.formatWithEnglishMonth());
        System.out.println();
    }
    
    private static void testSpecificDateConversions() {
        System.out.println("2. Specific Date Conversion Test:");
        System.out.println("---------------------------------");
        
        // Test some known conversions
        LocalDate[] gregorianDates = {
            LocalDate.of(2024, 1, 1),   // New Year
            LocalDate.of(2024, 9, 11),  // Ethiopian New Year
            LocalDate.of(2024, 12, 25), // Christmas
            LocalDate.of(2023, 9, 11),  // Ethiopian New Year (non-leap)
            LocalDate.of(2024, 2, 29)   // Leap day
        };
        
        for (LocalDate gregorianDate : gregorianDates) {
            EthiopianCalendarConverter.EthiopianDate ethiopianDate = 
                EthiopianCalendarConverter.gregorianToEthiopian(gregorianDate);
            LocalDate backToGregorian = 
                EthiopianCalendarConverter.ethiopianToGregorian(ethiopianDate);
            
            System.out.println("Gregorian: " + gregorianDate + 
                             " -> Ethiopian: " + ethiopianDate + 
                             " -> Back to Gregorian: " + backToGregorian +
                             " (Match: " + gregorianDate.equals(backToGregorian) + ")");
        }
        System.out.println();
    }
    
    private static void testDateFormatting() {
        System.out.println("3. Date Formatting Test:");
        System.out.println("------------------------");
        
        EthiopianCalendarConverter.EthiopianDate testDate = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 15);
        
        System.out.println("Test Ethiopian Date: " + testDate);
        System.out.println("Format dd/MM/yyyy: " + testDate.format("dd/MM/yyyy"));
        System.out.println("Format dd-MM-yyyy: " + testDate.format("dd-MM-yyyy"));
        System.out.println("Format yyyy/MM/dd: " + testDate.format("yyyy/MM/dd"));
        System.out.println("Format yyyy-MM-dd: " + testDate.format("yyyy-MM-dd"));
        System.out.println("With Amharic month: " + testDate.formatWithAmharicMonth());
        System.out.println("With English month: " + testDate.formatWithEnglishMonth());
        System.out.println();
    }
    
    private static void testDateParsing() {
        System.out.println("4. Date Parsing Test:");
        System.out.println("--------------------");
        
        String[] dateStrings = {
            "15/08/2016",
            "15-08-2016", 
            "2016-08-15",
            "01/13/2016", // Pagumen
            "05/13/2015"  // Pagumen in non-leap year
        };
        
        for (String dateString : dateStrings) {
            try {
                EthiopianCalendarConverter.EthiopianDate parsed = 
                    EthiopianCalendarConverter.parseEthiopianDate(dateString);
                System.out.println("Parsed '" + dateString + "' -> " + parsed);
            } catch (Exception e) {
                System.out.println("Failed to parse '" + dateString + "': " + e.getMessage());
            }
        }
        System.out.println();
    }
    
    private static void testDateValidation() {
        System.out.println("5. Date Validation Test:");
        System.out.println("-----------------------");
        
        int[][] testDates = {
            {2016, 8, 15},   // Valid regular date
            {2016, 13, 5},   // Valid Pagumen date
            {2015, 13, 6},   // Invalid - Pagumen day 6 in non-leap year
            {2016, 13, 7},   // Invalid - Pagumen day 7
            {2016, 12, 31},  // Invalid - day 31 in regular month
            {2016, 0, 15},   // Invalid - month 0
            {2016, 14, 15}   // Invalid - month 14
        };
        
        for (int[] date : testDates) {
            boolean isValid = EthiopianCalendarConverter.isValidEthiopianDate(date[0], date[1], date[2]);
            System.out.println("Date " + date[0] + "-" + date[1] + "-" + date[2] + 
                             " is " + (isValid ? "VALID" : "INVALID"));
        }
        System.out.println();
    }
    
    private static void testLeapYearCalculations() {
        System.out.println("6. Leap Year Test:");
        System.out.println("------------------");
        
        int[] testYears = {2015, 2016, 2017, 2018, 2019, 2020};
        
        for (int year : testYears) {
            boolean isLeap = EthiopianCalendarConverter.isEthiopianLeapYear(year);
            System.out.println("Ethiopian year " + year + " is " + 
                             (isLeap ? "LEAP" : "NOT LEAP"));
        }
        System.out.println();
    }
    
    private static void testDateComparisons() {
        System.out.println("7. Date Comparison Test:");
        System.out.println("-----------------------");
        
        EthiopianCalendarConverter.EthiopianDate date1 = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 15);
        EthiopianCalendarConverter.EthiopianDate date2 = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 20);
        EthiopianCalendarConverter.EthiopianDate date3 = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 15);
        
        System.out.println("Date1: " + date1);
        System.out.println("Date2: " + date2);
        System.out.println("Date3: " + date3);
        System.out.println("Compare date1 vs date2: " + 
                         EthiopianCalendarConverter.compareEthiopianDates(date1, date2));
        System.out.println("Compare date1 vs date3: " + 
                         EthiopianCalendarConverter.compareEthiopianDates(date1, date3));
        System.out.println("Date1 equals Date3: " + date1.equals(date3));
        System.out.println();
    }
    
    private static void testDateRanges() {
        System.out.println("8. Date Range Test:");
        System.out.println("------------------");
        
        EthiopianCalendarConverter.EthiopianDate fromDate = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 1);
        EthiopianCalendarConverter.EthiopianDate toDate = 
            new EthiopianCalendarConverter.EthiopianDate(2016, 8, 30);
        
        LocalDate[] testDates = {
            LocalDate.of(2024, 4, 10),  // Should be in range
            LocalDate.of(2024, 3, 15),  // Should be before range
            LocalDate.of(2024, 5, 15)   // Should be after range
        };
        
        System.out.println("Ethiopian range: " + fromDate + " to " + toDate);
        
        for (LocalDate testDate : testDates) {
            boolean inRange = EthiopianCalendarConverter.isDateInEthiopianRange(
                testDate, fromDate, toDate);
            EthiopianCalendarConverter.EthiopianDate ethiopianTestDate = 
                EthiopianCalendarConverter.gregorianToEthiopian(testDate);
            System.out.println("Gregorian " + testDate + " (Ethiopian " + ethiopianTestDate + 
                             ") is " + (inRange ? "IN" : "NOT IN") + " range");
        }
        System.out.println();
    }
    
    private static void testMonthNames() {
        System.out.println("9. Month Names Test:");
        System.out.println("-------------------");
        
        System.out.println("Ethiopian Months (Amharic):");
        String[] amharicMonths = EthiopianCalendarConverter.getEthiopianMonthNamesAmharic();
        for (int i = 0; i < amharicMonths.length; i++) {
            System.out.println((i + 1) + ". " + amharicMonths[i]);
        }
        
        System.out.println("\nEthiopian Months (English):");
        String[] englishMonths = EthiopianCalendarConverter.getEthiopianMonthNamesEnglish();
        for (int i = 0; i < englishMonths.length; i++) {
            System.out.println((i + 1) + ". " + englishMonths[i]);
        }
        System.out.println();
    }
}
