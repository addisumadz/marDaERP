/**
 * Test Suite for Ethiopian Calendar Converter
 * 
 * Simple test runner to verify the converter functionality
 */

import EthiopianCalendarConverterPure from './ethiopianCalendarConverterPure.js';

const EthConverter = EthiopianCalendarConverterPure;
const EthiopianDate = EthConverter.EthiopianDate;

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Got: ${actual}`);
        }
    }
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} - Expected true, got false`);
        }
    }
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} - Expected false, got true`);
        }
    }
    
    run() {
        console.log('🧪 Running Ethiopian Calendar Converter Tests...\n');
        
        this.tests.forEach(({ name, testFn }) => {
            try {
                testFn.call(this);
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        });
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

const runner = new TestRunner();

// Test 1: Basic Gregorian to Ethiopian conversion
runner.test('Basic Gregorian to Ethiopian conversion', function() {
    const gregDate = new Date(2024, 8, 11); // September 11, 2024 (Ethiopian New Year)
    const ethDate = EthConverter.gregorianToEthiopian(gregDate);
    
    this.assertEqual(ethDate.year, 2017, 'Year should be 2017');
    this.assertEqual(ethDate.month, 1, 'Month should be 1 (Meskerem)');
    this.assertEqual(ethDate.day, 1, 'Day should be 1');
});

// Test 2: Basic Ethiopian to Gregorian conversion
runner.test('Basic Ethiopian to Gregorian conversion', function() {
    const ethDate = new EthiopianDate(2017, 1, 1);
    const gregDate = EthConverter.ethiopianToGregorian(ethDate);
    
    this.assertEqual(gregDate.getFullYear(), 2024, 'Year should be 2024');
    this.assertEqual(gregDate.getMonth(), 8, 'Month should be 8 (September)');
    this.assertEqual(gregDate.getDate(), 11, 'Day should be 11');
});

// Test 3: Round-trip conversion
runner.test('Round-trip conversion accuracy', function() {
    const originalDate = new Date(2024, 5, 15); // June 15, 2024
    const ethDate = EthConverter.gregorianToEthiopian(originalDate);
    const backToGreg = EthConverter.ethiopianToGregorian(ethDate);
    
    this.assertEqual(originalDate.getTime(), backToGreg.getTime(), 'Round-trip should preserve date');
});

// Test 4: Ethiopian leap year calculation
runner.test('Ethiopian leap year calculation', function() {
    this.assertTrue(EthConverter.isEthiopianLeapYear(2015), '2015 should be leap year');
    this.assertFalse(EthConverter.isEthiopianLeapYear(2016), '2016 should not be leap year');
    this.assertTrue(EthConverter.isEthiopianLeapYear(2019), '2019 should be leap year');
});

// Test 5: Date validation
runner.test('Date validation', function() {
    this.assertTrue(EthConverter.isValidEthiopianDate(2016, 1, 1), 'Valid date should pass');
    this.assertTrue(EthConverter.isValidEthiopianDate(2016, 13, 5), 'Valid Pagumen date should pass');
    this.assertFalse(EthConverter.isValidEthiopianDate(2016, 13, 7), 'Invalid Pagumen date should fail');
    this.assertFalse(EthConverter.isValidEthiopianDate(2016, 14, 1), 'Invalid month should fail');
    this.assertFalse(EthConverter.isValidEthiopianDate(2016, 5, 31), 'Invalid day should fail');
});

// Test 6: Date parsing
runner.test('Date parsing', function() {
    const ethDate1 = EthConverter.parseEthiopianDate('15/03/2016');
    this.assertEqual(ethDate1.day, 15, 'Day should be parsed correctly');
    this.assertEqual(ethDate1.month, 3, 'Month should be parsed correctly');
    this.assertEqual(ethDate1.year, 2016, 'Year should be parsed correctly');
    
    const ethDate2 = EthConverter.parseEthiopianDate('2016-12-20');
    this.assertEqual(ethDate2.year, 2016, 'ISO format year should be parsed correctly');
    this.assertEqual(ethDate2.month, 12, 'ISO format month should be parsed correctly');
    this.assertEqual(ethDate2.day, 20, 'ISO format day should be parsed correctly');
});

// Test 7: Date formatting
runner.test('Date formatting', function() {
    const ethDate = new EthiopianDate(2016, 7, 25);
    
    this.assertEqual(EthConverter.formatEthiopianDate(ethDate, 'dd/MM/yyyy'), '25/07/2016', 'dd/MM/yyyy format');
    this.assertEqual(EthConverter.formatEthiopianDate(ethDate, 'yyyy-MM-dd'), '2016-07-25', 'yyyy-MM-dd format');
    this.assertEqual(EthConverter.formatEthiopianDate(ethDate, 'MM/dd/yyyy'), '07/25/2016', 'MM/dd/yyyy format');
});

// Test 8: Month names
runner.test('Month names', function() {
    this.assertEqual(EthConverter.getEthiopianMonthNameAmharic(1), 'መስከረም', 'First month Amharic name');
    this.assertEqual(EthConverter.getEthiopianMonthNameEnglish(1), 'Meskerem', 'First month English name');
    this.assertEqual(EthConverter.getEthiopianMonthNameAmharic(13), 'ጳጉሜ', 'Pagumen Amharic name');
    this.assertEqual(EthConverter.getEthiopianMonthNameEnglish(13), 'Pagumen', 'Pagumen English name');
});

// Test 9: Date comparison
runner.test('Date comparison', function() {
    const date1 = new EthiopianDate(2016, 5, 15);
    const date2 = new EthiopianDate(2016, 7, 10);
    const date3 = new EthiopianDate(2016, 5, 15);
    
    this.assertEqual(EthConverter.compareEthiopianDates(date1, date2), -1, 'Earlier date should return -1');
    this.assertEqual(EthConverter.compareEthiopianDates(date2, date1), 1, 'Later date should return 1');
    this.assertEqual(EthConverter.compareEthiopianDates(date1, date3), 0, 'Equal dates should return 0');
});

// Test 10: Input value conversion
runner.test('Input value conversion', function() {
    const gregDate = new Date(2024, 5, 15);
    const inputValue = EthConverter.toEthiopianInputValue(gregDate);
    const parsedBack = EthConverter.fromEthiopianInputValue(inputValue);
    
    this.assertEqual(gregDate.getTime(), parsedBack.getTime(), 'Input value round-trip should preserve date');
});

// Test 11: Current date functions
runner.test('Current date functions', function() {
    const currentEth = EthConverter.getCurrentEthiopianDate();
    const currentStr = EthConverter.getCurrentEthiopianDateString('yyyy-MM-dd');
    
    this.assertTrue(currentEth instanceof EthiopianDate, 'Should return EthiopianDate instance');
    this.assertTrue(typeof currentStr === 'string', 'Should return string');
    this.assertTrue(currentStr.length > 0, 'String should not be empty');
});

// Test 12: Edge cases
runner.test('Edge cases', function() {
    // Test Pagumen in leap year
    const leapYearPagumen = new EthiopianDate(2015, 13, 6); // 2015 is leap year
    const gregDate = EthConverter.ethiopianToGregorian(leapYearPagumen);
    this.assertTrue(gregDate instanceof Date, 'Should convert leap year Pagumen correctly');
    
    // Test last day of regular year
    const regularYearPagumen = new EthiopianDate(2016, 13, 5); // 2016 is not leap year
    const gregDate2 = EthConverter.ethiopianToGregorian(regularYearPagumen);
    this.assertTrue(gregDate2 instanceof Date, 'Should convert regular year Pagumen correctly');
});

// Test 13: Error handling
runner.test('Error handling', function() {
    let errorThrown = false;
    
    try {
        new EthiopianDate(2016, 15, 1); // Invalid month
    } catch (error) {
        errorThrown = true;
    }
    this.assertTrue(errorThrown, 'Should throw error for invalid date');
    
    errorThrown = false;
    try {
        EthConverter.parseEthiopianDate('invalid-date');
    } catch (error) {
        errorThrown = true;
    }
    this.assertTrue(errorThrown, 'Should throw error for invalid date string');
});

// Test 14: Known date conversions
runner.test('Known date conversions', function() {
    // Test some known conversions
    const knownConversions = [
        { greg: new Date(2000, 0, 1), eth: { year: 1992, month: 4, day: 22 } }, // Jan 1, 2000
        { greg: new Date(2024, 8, 11), eth: { year: 2017, month: 1, day: 1 } }, // Ethiopian New Year 2017
    ];
    
    knownConversions.forEach(({ greg, eth }, index) => {
        const converted = EthConverter.gregorianToEthiopian(greg);
        this.assertEqual(converted.year, eth.year, `Known conversion ${index + 1} year`);
        this.assertEqual(converted.month, eth.month, `Known conversion ${index + 1} month`);
        this.assertEqual(converted.day, eth.day, `Known conversion ${index + 1} day`);
    });
});

// Run all tests
const success = runner.run();

if (success) {
    console.log('\n🎉 All tests passed! The Ethiopian Calendar Converter is working correctly.');
} else {
    console.log('\n💥 Some tests failed. Please check the implementation.');
}

export default runner;
