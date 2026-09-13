/**
 * Debug Ethiopian Calendar Conversion
 * Let's test different epoch values and algorithms
 */

// Different possible epoch values to test
const EPOCHS_TO_TEST = [
    { name: "Current (1723856)", value: 1723856 },
    { name: "Alternative 1 (1724221)", value: 1724221 }, // Some sources use this
    { name: "Alternative 2 (1723855)", value: 1723855 }, // Off by 1
    { name: "Alternative 3 (1723857)", value: 1723857 }  // Off by 1 other way
];

function jdFromGregorian(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function ethiopianFromJDN(jd, epoch) {
    const r = jd - epoch;
    const year = Math.floor((4 * r + 1463) / 1461);
    const t = r - 365 * (year - 1) - Math.floor((year - 1) / 4);
    const month = Math.floor(t / 30) + 1;
    const day = (t % 30) + 1;
    return { year, month, day };
}

function testWithDifferentEpochs(dateStr, expectedEthYear) {
    console.log(`\nTesting: ${dateStr} (Expected Ethiopian year: ~${expectedEthYear})`);
    const date = new Date(dateStr);
    const jd = jdFromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    EPOCHS_TO_TEST.forEach(epoch => {
        const ethDate = ethiopianFromJDN(jd, epoch.value);
        const yearDiff = Math.abs(ethDate.year - expectedEthYear);
        const status = yearDiff <= 1 ? "✅" : "❌";
        console.log(`  ${epoch.name}: ${ethDate.year}/${ethDate.month}/${ethDate.day} ${status}`);
    });
}

console.log('=== Debug Ethiopian Calendar Conversion ===');

// Test known conversions
// Ethiopian New Year 2017 should be around September 11, 2024
testWithDifferentEpochs('2024-09-11', 2017);

// Ethiopian New Year 2016 should be around September 11, 2023  
testWithDifferentEpochs('2023-09-11', 2016);

// Test the user's dates
testWithDifferentEpochs('2025-09-24', 2018); // Should be around 2018
testWithDifferentEpochs('2025-10-01', 2018); // Should be around 2018

console.log('\n=== Manual Calculation Check ===');
// Let's manually verify: if 2024-09-11 should be 2017/1/1
// Then the difference should be: 2024 - 2017 = 7 years
const testDate = new Date('2024-09-11');
const jd = jdFromGregorian(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate());
console.log(`JDN for 2024-09-11: ${jd}`);

// If this should be 2017/1/1, then the epoch should be:
// JDN - (days from Ethiopian epoch to 2017/1/1)
const daysFrom1To2017 = 365 * (2017 - 1) + Math.floor((2017 - 1) / 4); // Leap years
const calculatedEpoch = jd - daysFrom1To2017;
console.log(`Calculated epoch if 2024-09-11 = 2017/1/1: ${calculatedEpoch}`);

// Test with calculated epoch
const testResult = ethiopianFromJDN(jd, calculatedEpoch);
console.log(`Test result with calculated epoch: ${testResult.year}/${testResult.month}/${testResult.day}`);
