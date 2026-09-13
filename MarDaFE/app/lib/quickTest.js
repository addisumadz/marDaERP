/**
 * Quick test to verify the conversion issue
 */

// Manual implementation of the key conversion functions to test
const ETHIOPIC_EPOCH = 1724221;

function jdFromGregorian(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function ethiopianFromJDN(jd) {
    const r = jd - ETHIOPIC_EPOCH;
    const year = Math.floor((4 * r + 1463) / 1461);
    const t = r - 365 * (year - 1) - Math.floor((year - 1) / 4);
    const month = Math.floor(t / 30) + 1;
    const day = (t % 30) + 1;
    return { year, month, day };
}

function testDate(dateStr) {
    console.log(`Testing: ${dateStr}`);
    const date = new Date(dateStr);
    console.log(`  Gregorian: ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
    
    const jd = jdFromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const ethDate = ethiopianFromJDN(jd);
    
    console.log(`  Ethiopian: ${ethDate.year}/${ethDate.month}/${ethDate.day}`);
    console.log(`  JDN: ${jd}`);
    console.log('');
}

console.log('=== Quick Test - Pure JavaScript Implementation ===\n');

testDate('2025-10-01');
testDate('2025-09-24');
testDate('1987-03-29');

// Test known Ethiopian New Year dates
console.log('=== Known Ethiopian New Year Tests ===');
testDate('2024-09-11'); // Should be 2017/1/1
testDate('2023-09-11'); // Should be 2016/1/1
