package com.wbill.home.util;

import java.time.LocalDate;

/**
 * Test specific dates with the Ethiopian Calendar Converter
 */
public class TestSpecificDates {
    
    public static void main(String[] args) {
        System.out.println("=== Testing Java Ethiopian Calendar Converter ===\n");
        
        // Test dates
        String[] testDateStrings = {
            "2025-10-01",
            "2025-09-24", 
            "1987-03-29",
            "1987-03-29"  // Same as above, testing consistency
        };
        
        for (int i = 0; i < testDateStrings.length; i++) {
            System.out.println((i + 1) + ". Testing: " + testDateStrings[i]);
            
            try {
                // Parse the date string
                LocalDate gregorianDate = LocalDate.parse(testDateStrings[i]);
                System.out.println("   Gregorian Date: " + gregorianDate);
                
                // Convert to Ethiopian
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(gregorianDate);
                
                System.out.println("   Ethiopian Date: " + ethDate.getYear() + "/" + 
                                 ethDate.getMonth() + "/" + ethDate.getDay());
                
                System.out.println("   Formatted (dd/MM/yyyy): " + 
                                 EthiopianCalendarConverter.formatEthiopianDate(ethDate, "dd/MM/yyyy"));
                
                System.out.println("   With Amharic Month: " + 
                                 EthiopianCalendarConverter.formatEthiopianDateWithAmharicMonth(ethDate));
                
                System.out.println("   With English Month: " + 
                                 EthiopianCalendarConverter.formatEthiopianDateWithEnglishMonth(ethDate));
                
                // Convert back to Gregorian for verification
                LocalDate backToGregorian = EthiopianCalendarConverter.ethiopianToGregorian(ethDate);
                System.out.println("   Back to Gregorian: " + backToGregorian);
                
                // Check if round-trip is accurate
                boolean isAccurate = gregorianDate.equals(backToGregorian);
                System.out.println("   Round-trip Accurate: " + (isAccurate ? "✅ Yes" : "❌ No"));
                
                // Additional info
                System.out.println("   Ethiopian Month Name (Amharic): " + 
                                 EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth()));
                System.out.println("   Ethiopian Month Name (English): " + 
                                 EthiopianCalendarConverter.getEthiopianMonthNameEnglish(ethDate.getMonth()));
                
                // Check if it's a leap year
                System.out.println("   Ethiopian Year " + ethDate.getYear() + " is leap year: " + 
                                 EthiopianCalendarConverter.isEthiopianLeapYear(ethDate.getYear()));
                
            } catch (Exception e) {
                System.out.println("   ERROR: " + e.getMessage());
            }
            
            System.out.println();
        }
        
        System.out.println("=== End of Java Converter Test ===");
        
        // Additional test: Current date
        System.out.println("\n=== Current Date Test ===");
        try {
            EthiopianCalendarConverter.EthiopianDate currentEth = 
                EthiopianCalendarConverter.getCurrentEthiopianDate();
            System.out.println("Current Ethiopian Date: " + currentEth.formatWithEnglishMonth());
            System.out.println("Current Ethiopian Date (Amharic): " + currentEth.formatWithAmharicMonth());
            System.out.println("Current Ethiopian Date (dd/MM/yyyy): " + currentEth.format("dd/MM/yyyy"));
        } catch (Exception e) {
            System.out.println("ERROR getting current date: " + e.getMessage());
        }
    }
}
