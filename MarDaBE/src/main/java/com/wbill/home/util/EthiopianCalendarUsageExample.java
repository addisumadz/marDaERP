package com.wbill.home.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Usage examples for EthiopianCalendarConverter in typical backend scenarios
 * 
 * This class demonstrates how to integrate the Ethiopian Calendar Converter
 * with common backend operations like filtering, formatting for APIs, etc.
 */
public class EthiopianCalendarUsageExample {
    
    /**
     * Example: Customer registration with Ethiopian date display
     */
    public static class Customer {
        private String name;
        private LocalDate registrationDate;
        
        public Customer(String name, LocalDate registrationDate) {
            this.name = name;
            this.registrationDate = registrationDate;
        }
        
        public String getName() { return name; }
        public LocalDate getRegistrationDate() { return registrationDate; }
        
        /**
         * Get registration date in Ethiopian calendar format
         */
        public String getRegistrationDateEthiopian() {
            if (registrationDate == null) return null;
            EthiopianCalendarConverter.EthiopianDate ethDate = 
                EthiopianCalendarConverter.gregorianToEthiopian(registrationDate);
            return ethDate.formatWithAmharicMonth();
        }
        
        /**
         * Get registration date in Ethiopian calendar for API response
         */
        public String getRegistrationDateEthiopianFormatted(String format) {
            if (registrationDate == null) return null;
            EthiopianCalendarConverter.EthiopianDate ethDate = 
                EthiopianCalendarConverter.gregorianToEthiopian(registrationDate);
            return ethDate.format(format);
        }
    }
    
    /**
     * Example: Filtering customers by Ethiopian date range
     */
    public static List<Customer> filterCustomersByEthiopianDateRange(
            List<Customer> customers, 
            String fromEthiopianDate, 
            String toEthiopianDate) {
        
        List<Customer> filteredCustomers = new ArrayList<>();
        
        // Parse Ethiopian date strings
        EthiopianCalendarConverter.EthiopianDate fromDate = null;
        EthiopianCalendarConverter.EthiopianDate toDate = null;
        
        try {
            if (fromEthiopianDate != null && !fromEthiopianDate.trim().isEmpty()) {
                fromDate = EthiopianCalendarConverter.parseEthiopianDate(fromEthiopianDate);
            }
            if (toEthiopianDate != null && !toEthiopianDate.trim().isEmpty()) {
                toDate = EthiopianCalendarConverter.parseEthiopianDate(toEthiopianDate);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Ethiopian date format", e);
        }
        
        // Filter customers
        for (Customer customer : customers) {
            if (customer.getRegistrationDate() == null) continue;
            
            boolean inRange = EthiopianCalendarConverter.isDateInEthiopianRange(
                customer.getRegistrationDate(), fromDate, toDate);
            
            if (inRange) {
                filteredCustomers.add(customer);
            }
        }
        
        return filteredCustomers;
    }
    
    /**
     * Example: API response DTO with Ethiopian date formatting
     */
    public static class CustomerResponseDTO {
        private String name;
        private String registrationDateGregorian;
        private String registrationDateEthiopian;
        private String registrationDateEthiopianAmharic;
        
        public CustomerResponseDTO(Customer customer) {
            this.name = customer.getName();
            this.registrationDateGregorian = customer.getRegistrationDate() != null ? 
                customer.getRegistrationDate().toString() : null;
            this.registrationDateEthiopian = customer.getRegistrationDateEthiopianFormatted("dd/MM/yyyy");
            this.registrationDateEthiopianAmharic = customer.getRegistrationDateEthiopian();
        }
        
        // Getters
        public String getName() { return name; }
        public String getRegistrationDateGregorian() { return registrationDateGregorian; }
        public String getRegistrationDateEthiopian() { return registrationDateEthiopian; }
        public String getRegistrationDateEthiopianAmharic() { return registrationDateEthiopianAmharic; }
    }
    
    /**
     * Example: Service method for handling Ethiopian date input from frontend
     */
    public static LocalDate parseEthiopianDateInput(String ethiopianDateInput) {
        if (ethiopianDateInput == null || ethiopianDateInput.trim().isEmpty()) {
            return null;
        }
        
        try {
            return EthiopianCalendarConverter.fromEthiopianInputValue(ethiopianDateInput);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                "Invalid Ethiopian date format: " + ethiopianDateInput + 
                ". Expected format: YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY", e);
        }
    }
    
    /**
     * Example: Generate Ethiopian calendar report data
     */
    public static class EthiopianCalendarReport {
        private String currentEthiopianDate;
        private String currentEthiopianMonth;
        private boolean isCurrentYearLeap;
        private List<String> monthNames;
        
        public EthiopianCalendarReport() {
            EthiopianCalendarConverter.EthiopianDate today = 
                EthiopianCalendarConverter.getCurrentEthiopianDate();
            
            this.currentEthiopianDate = today.formatWithAmharicMonth();
            this.currentEthiopianMonth = EthiopianCalendarConverter
                .getEthiopianMonthNameAmharic(today.getMonth());
            this.isCurrentYearLeap = EthiopianCalendarConverter
                .isEthiopianLeapYear(today.getYear());
            
            this.monthNames = new ArrayList<>();
            String[] amharicMonths = EthiopianCalendarConverter.getEthiopianMonthNamesAmharic();
            for (String month : amharicMonths) {
                monthNames.add(month);
            }
        }
        
        // Getters
        public String getCurrentEthiopianDate() { return currentEthiopianDate; }
        public String getCurrentEthiopianMonth() { return currentEthiopianMonth; }
        public boolean isCurrentYearLeap() { return isCurrentYearLeap; }
        public List<String> getMonthNames() { return monthNames; }
    }
    
    /**
     * Example: Utility method for database queries with Ethiopian date ranges
     */
    public static LocalDate[] convertEthiopianRangeToGregorianForDatabase(
            String fromEthiopianDate, String toEthiopianDate) {
        
        EthiopianCalendarConverter.EthiopianDate fromEth = null;
        EthiopianCalendarConverter.EthiopianDate toEth = null;
        
        if (fromEthiopianDate != null && !fromEthiopianDate.trim().isEmpty()) {
            fromEth = EthiopianCalendarConverter.parseEthiopianDate(fromEthiopianDate);
        }
        
        if (toEthiopianDate != null && !toEthiopianDate.trim().isEmpty()) {
            toEth = EthiopianCalendarConverter.parseEthiopianDate(toEthiopianDate);
        }
        
        return EthiopianCalendarConverter.getGregorianRangeFromEthiopian(fromEth, toEth);
    }
    
    /**
     * Demo method showing various usage scenarios
     */
    public static void main(String[] args) {
        System.out.println("=== Ethiopian Calendar Usage Examples ===\n");
        
        // Example 1: Create customers with different registration dates
        List<Customer> customers = new ArrayList<>();
        customers.add(new Customer("አበበ ከበደ", LocalDate.of(2024, 1, 15)));
        customers.add(new Customer("ፋጥማ አህመድ", LocalDate.of(2024, 9, 11))); // Ethiopian New Year
        customers.add(new Customer("ዮሐንስ ተስፋዬ", LocalDate.of(2024, 12, 25)));
        
        System.out.println("1. Customer Registration Dates:");
        System.out.println("-------------------------------");
        for (Customer customer : customers) {
            System.out.println("Customer: " + customer.getName());
            System.out.println("  Gregorian: " + customer.getRegistrationDate());
            System.out.println("  Ethiopian: " + customer.getRegistrationDateEthiopian());
            System.out.println("  Ethiopian (formatted): " + 
                             customer.getRegistrationDateEthiopianFormatted("dd/MM/yyyy"));
            System.out.println();
        }
        
        // Example 2: Filter by Ethiopian date range
        System.out.println("2. Filtering by Ethiopian Date Range:");
        System.out.println("------------------------------------");
        List<Customer> filtered = filterCustomersByEthiopianDateRange(
            customers, "01/01/2016", "30/12/2016");
        System.out.println("Customers registered in Ethiopian year 2016:");
        for (Customer customer : filtered) {
            System.out.println("- " + customer.getName() + " (" + 
                             customer.getRegistrationDateEthiopian() + ")");
        }
        System.out.println();
        
        // Example 3: API Response DTOs
        System.out.println("3. API Response DTOs:");
        System.out.println("--------------------");
        for (Customer customer : customers) {
            CustomerResponseDTO dto = new CustomerResponseDTO(customer);
            System.out.println("Customer DTO for: " + dto.getName());
            System.out.println("  Gregorian: " + dto.getRegistrationDateGregorian());
            System.out.println("  Ethiopian: " + dto.getRegistrationDateEthiopian());
            System.out.println("  Ethiopian (Amharic): " + dto.getRegistrationDateEthiopianAmharic());
            System.out.println();
        }
        
        // Example 4: Ethiopian Calendar Report
        System.out.println("4. Ethiopian Calendar Report:");
        System.out.println("-----------------------------");
        EthiopianCalendarReport report = new EthiopianCalendarReport();
        System.out.println("Current Ethiopian Date: " + report.getCurrentEthiopianDate());
        System.out.println("Current Month: " + report.getCurrentEthiopianMonth());
        System.out.println("Is Current Year Leap: " + report.isCurrentYearLeap());
        System.out.println("All Month Names: " + String.join(", ", report.getMonthNames()));
        System.out.println();
        
        // Example 5: Database query date range conversion
        System.out.println("5. Database Query Date Range Conversion:");
        System.out.println("---------------------------------------");
        LocalDate[] gregorianRange = convertEthiopianRangeToGregorianForDatabase(
            "01/08/2016", "30/08/2016");
        System.out.println("Ethiopian range 01/08/2016 to 30/08/2016");
        System.out.println("Converts to Gregorian range: " + 
                         gregorianRange[0] + " to " + gregorianRange[1]);
        
        System.out.println("\n=== Usage Examples Completed ===");
    }
}
