/**
 * Test the existing Ethiopian Calendar Converter
 */

import EthiopianCalendarConverter from './ethiopianCalendarConverter.js';

console.log('=== Testing Existing Ethiopian Calendar Converter ===\n');

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
            // Handle MM/DD/YYYY or DD/MM/YYYY format
            const parts = dateStr.split('/');
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            date = new Date(dateStr);
        }
        
        console.log(`   Gregorian Date: ${date.toDateString()}`);
        
        // Convert to Ethiopian
        const ethDate = EthiopianCalendarConverter.gregorianToEthiopian(date);
        
        if (ethDate) {
            console.log(`   Ethiopian Date: ${ethDate.year}/${ethDate.month}/${ethDate.day}`);
            console.log(`   Formatted (dd/mm/yyyy): ${EthiopianCalendarConverter.formatEthiopianDate(date, 'dd/mm/yyyy')}`);
            console.log(`   With Amharic Month: ${EthiopianCalendarConverter.formatEthiopianDateWithAmharicMonth(date)}`);
            console.log(`   With English Month: ${ethDate.day} ${EthiopianCalendarConverter.getEthiopianMonthNamesEnglish()[ethDate.month - 1]} ${ethDate.year}`);
            
            // Convert back to Gregorian for verification
            const backToGreg = EthiopianCalendarConverter.ethiopianToGregorian(ethDate);
            console.log(`   Back to Gregorian: ${backToGreg ? backToGreg.toDateString() : 'Failed'}`);
        } else {
            console.log(`   ERROR: Failed to convert to Ethiopian`);
        }
        
    } catch (error) {
        console.log(`   ERROR: ${error.message}`);
    }
    
    console.log('');
});

console.log('=== End of Existing Converter Test ===');
