/**
 * Test the new Pure Ethiopian Calendar Converter
 */

import EthiopianCalendarConverterPure from './ethiopianCalendarConverterPure.js';

console.log('=== Testing New Pure Ethiopian Calendar Converter ===\n');

const EthConverter = EthiopianCalendarConverterPure;

const testDates = [
    '2025-10-01',
    '2025-09-24', 
    '1987-03-29',
    '1987/03/29'
];

testDates.forEach((dateStr, index) => {
    console.log(`${index + 1}. Testing: ${dateStr}`);
    
    try {
        // Convert string to Date object
        let date;
        if (dateStr.includes('/')) {
            // Handle YYYY/MM/DD format
            const parts = dateStr.split('/');
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            date = new Date(dateStr);
        }
        
        console.log(`   Gregorian Date: ${date.toDateString()}`);
        
        // Convert to Ethiopian
        const ethDate = EthConverter.gregorianToEthiopian(date);
        
        console.log(`   Ethiopian Date: ${ethDate.year}/${ethDate.month}/${ethDate.day}`);
        console.log(`   Formatted (dd/mm/yyyy): ${EthConverter.formatEthiopianDate(ethDate, 'dd/mm/yyyy')}`);
        console.log(`   With Amharic Month: ${EthConverter.formatEthiopianDateWithAmharicMonth(ethDate)}`);
        console.log(`   With English Month: ${EthConverter.formatEthiopianDateWithEnglishMonth(ethDate)}`);
        
        // Convert back to Gregorian for verification
        const backToGreg = EthConverter.ethiopianToGregorian(ethDate);
        console.log(`   Back to Gregorian: ${backToGreg.toDateString()}`);
        
        // Check if round-trip is accurate
        const isAccurate = Math.abs(date.getTime() - backToGreg.getTime()) < 24 * 60 * 60 * 1000; // Within 1 day
        console.log(`   Round-trip Accurate: ${isAccurate ? '✅ Yes' : '❌ No'}`);
        
    } catch (error) {
        console.log(`   ERROR: ${error.message}`);
    }
    
    console.log('');
});

console.log('=== End of New Pure Converter Test ===');
