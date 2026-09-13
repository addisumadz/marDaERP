/**
 * Ethiopian Calendar Converter Usage Examples
 * 
 * This file demonstrates how to use the EthiopianCalendarConverterPure class
 * for various date conversion and formatting operations.
 */

import EthiopianCalendarConverterPure from './ethiopianCalendarConverterPure.js';

// Alias for shorter usage
const EthConverter = EthiopianCalendarConverterPure;
const EthiopianDate = EthConverter.EthiopianDate;

console.log('=== Ethiopian Calendar Converter Usage Examples ===\n');

// Example 1: Convert current date to Ethiopian
console.log('1. Current Date Conversion:');
const today = new Date();
const todayEthiopian = EthConverter.gregorianToEthiopian(today);
console.log(`Today (Gregorian): ${today.toDateString()}`);
console.log(`Today (Ethiopian): ${todayEthiopian.toString()}`);
console.log(`Today (Ethiopian with Amharic): ${todayEthiopian.formatWithAmharicMonth()}`);
console.log(`Today (Ethiopian with English): ${todayEthiopian.formatWithEnglishMonth()}\n`);

// Example 2: Convert specific Gregorian dates to Ethiopian
console.log('2. Specific Date Conversions:');
const testDates = [
    new Date(2024, 0, 1),   // January 1, 2024
    new Date(2024, 8, 11),  // September 11, 2024 (Ethiopian New Year)
    new Date(2024, 11, 25), // December 25, 2024
    new Date(2023, 6, 4)    // July 4, 2023
];

testDates.forEach((date, index) => {
    const ethDate = EthConverter.gregorianToEthiopian(date);
    console.log(`${index + 1}. ${date.toDateString()} → ${ethDate.formatWithEnglishMonth()}`);
});
console.log();

// Example 3: Convert Ethiopian dates to Gregorian
console.log('3. Ethiopian to Gregorian Conversion:');
const ethiopianTestDates = [
    new EthiopianDate(2016, 1, 1),   // Ethiopian New Year 2016
    new EthiopianDate(2016, 13, 5),  // Last day of Ethiopian year 2016
    new EthiopianDate(2015, 6, 15),  // Mid-year date
    new EthiopianDate(2017, 4, 20)   // Another test date
];

ethiopianTestDates.forEach((ethDate, index) => {
    const gregDate = EthConverter.ethiopianToGregorian(ethDate);
    console.log(`${index + 1}. ${ethDate.formatWithEnglishMonth()} → ${gregDate.toDateString()}`);
});
console.log();

// Example 4: Date parsing and formatting
console.log('4. Date Parsing and Formatting:');
const dateStrings = [
    "15/03/2016",    // dd/MM/yyyy format
    "20-07-2015",    // dd-MM-yyyy format
    "2017-12-10"     // yyyy-MM-dd format
];

dateStrings.forEach((dateStr, index) => {
    try {
        const parsedEthDate = EthConverter.parseEthiopianDate(dateStr);
        const gregDate = EthConverter.ethiopianToGregorian(parsedEthDate);
        console.log(`${index + 1}. Parsed "${dateStr}" → ${parsedEthDate.formatWithEnglishMonth()} → ${gregDate.toDateString()}`);
    } catch (error) {
        console.log(`${index + 1}. Error parsing "${dateStr}": ${error.message}`);
    }
});
console.log();

// Example 5: Different formatting options
console.log('5. Different Formatting Options:');
const sampleEthDate = new EthiopianDate(2016, 7, 25);
const formats = [
    "dd/MM/yyyy",
    "dd-MM-yyyy", 
    "yyyy/MM/dd",
    "yyyy-MM-dd",
    "mm/dd/yyyy"
];

console.log(`Sample Ethiopian Date: ${sampleEthDate.formatWithEnglishMonth()}`);
formats.forEach(format => {
    console.log(`${format}: ${EthConverter.formatEthiopianDate(sampleEthDate, format)}`);
});
console.log();

// Example 6: Date validation
console.log('6. Date Validation:');
const validationTests = [
    [2016, 1, 1],    // Valid
    [2016, 13, 5],   // Valid (Pagumen)
    [2016, 13, 7],   // Invalid (Pagumen too many days)
    [2015, 13, 6],   // Valid (leap year Pagumen)
    [2016, 15, 1],   // Invalid (month > 13)
    [2016, 5, 31],   // Invalid (day > 30 for regular month)
    [0, 1, 1],       // Invalid (year < 1)
    [2016, 0, 1]     // Invalid (month < 1)
];

validationTests.forEach(([year, month, day], index) => {
    const isValid = EthConverter.isValidEthiopianDate(year, month, day);
    const status = isValid ? '✓ Valid' : '✗ Invalid';
    console.log(`${index + 1}. ${year}-${month}-${day}: ${status}`);
});
console.log();

// Example 7: Leap year checking
console.log('7. Ethiopian Leap Years:');
const testYears = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
testYears.forEach(year => {
    const isLeap = EthConverter.isEthiopianLeapYear(year);
    console.log(`${year}: ${isLeap ? 'Leap Year' : 'Regular Year'}`);
});
console.log();

// Example 8: Date comparison
console.log('8. Date Comparison:');
const date1 = new EthiopianDate(2016, 5, 15);
const date2 = new EthiopianDate(2016, 7, 10);
const date3 = new EthiopianDate(2016, 5, 15);

console.log(`Date 1: ${date1.formatWithEnglishMonth()}`);
console.log(`Date 2: ${date2.formatWithEnglishMonth()}`);
console.log(`Date 3: ${date3.formatWithEnglishMonth()}`);
console.log(`Compare Date1 vs Date2: ${EthConverter.compareEthiopianDates(date1, date2)}`);
console.log(`Compare Date1 vs Date3: ${EthConverter.compareEthiopianDates(date1, date3)}`);
console.log(`Compare Date2 vs Date1: ${EthConverter.compareEthiopianDates(date2, date1)}`);
console.log();

// Example 9: Date range operations
console.log('9. Date Range Operations:');
const fromEthDate = new EthiopianDate(2016, 3, 1);
const toEthDate = new EthiopianDate(2016, 5, 30);
const [fromGregDate, toGregDate] = EthConverter.getGregorianRangeFromEthiopian(fromEthDate, toEthDate);

console.log(`Ethiopian Range: ${fromEthDate.formatWithEnglishMonth()} to ${toEthDate.formatWithEnglishMonth()}`);
console.log(`Gregorian Range: ${fromGregDate.toDateString()} to ${toGregDate.toDateString()}`);

// Test if dates fall within range
const testRangeDates = [
    new Date(2023, 10, 15), // November 15, 2023
    new Date(2024, 0, 20),  // January 20, 2024
    new Date(2024, 2, 10)   // March 10, 2024
];

testRangeDates.forEach((date, index) => {
    const inRange = EthConverter.isDateInEthiopianRange(date, fromEthDate, toEthDate);
    const ethEquivalent = EthConverter.gregorianToEthiopian(date);
    console.log(`${index + 1}. ${date.toDateString()} (${ethEquivalent.formatWithEnglishMonth()}): ${inRange ? 'In Range' : 'Out of Range'}`);
});
console.log();

// Example 10: Input field compatibility
console.log('10. Input Field Compatibility:');
const inputTestDate = new Date(2024, 5, 15); // June 15, 2024
const inputValue = EthConverter.toEthiopianInputValue(inputTestDate);
const parsedBack = EthConverter.fromEthiopianInputValue(inputValue);

console.log(`Original Gregorian: ${inputTestDate.toDateString()}`);
console.log(`Ethiopian Input Value: ${inputValue}`);
console.log(`Parsed Back to Gregorian: ${parsedBack.toDateString()}`);
console.log(`Round-trip successful: ${inputTestDate.toDateString() === parsedBack.toDateString()}`);
console.log();

// Example 11: Month names
console.log('11. Ethiopian Month Names:');
console.log('Amharic Names:');
EthConverter.getEthiopianMonthNamesAmharic().forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
});

console.log('\nEnglish Names:');
EthConverter.getEthiopianMonthNamesEnglish().forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
});
console.log();

// Example 12: Error handling
console.log('12. Error Handling:');
const errorTests = [
    () => EthConverter.gregorianToEthiopian(null),
    () => EthConverter.parseEthiopianDate("invalid-date"),
    () => new EthiopianDate(2016, 15, 1),
    () => EthConverter.ethiopianToGregorian(2016, 13, 7)
];

errorTests.forEach((test, index) => {
    try {
        test();
        console.log(`${index + 1}. No error thrown (unexpected)`);
    } catch (error) {
        console.log(`${index + 1}. Caught expected error: ${error.message}`);
    }
});

console.log('\n=== End of Examples ===');

// Export for use in other modules
export {
    EthConverter,
    EthiopianDate
};
