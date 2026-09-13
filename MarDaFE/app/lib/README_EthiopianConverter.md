# Ethiopian Calendar Converter - Pure JavaScript Implementation

A comprehensive Ethiopian calendar converter that provides bidirectional conversion between Gregorian and Ethiopian calendars using pure mathematical algorithms without external dependencies.

## Overview

This implementation is a direct port of the Java `EthiopianCalendarConverter` class, using the same Julian Day Number algorithms for accurate date conversions. It provides all the functionality of the original Java version in a modern JavaScript class.

## Features

- ✅ **Pure JavaScript** - No external dependencies required
- ✅ **Bidirectional Conversion** - Gregorian ↔ Ethiopian calendar
- ✅ **Multiple Date Formats** - Support for various input/output formats
- ✅ **Comprehensive Validation** - Validates Ethiopian dates including leap years
- ✅ **Localization Support** - Month names in both Amharic and English
- ✅ **Date Range Operations** - Filter and compare dates within Ethiopian ranges
- ✅ **Input Field Compatible** - Works with HTML date inputs
- ✅ **Error Handling** - Robust error handling with descriptive messages
- ✅ **Thread-Safe** - All methods are static and stateless

## Ethiopian Calendar System

- **13 months**: 12 months of 30 days each + Pagumen (5-6 days)
- **New Year**: Starts on September 11 (or 12 in leap years)
- **Leap Year**: Every 4 years, when `(year % 4) === 3`
- **Year Difference**: Ethiopian calendar is approximately 7-8 years behind Gregorian

## Installation

Simply import the converter class:

```javascript
import EthiopianCalendarConverterPure from './ethiopianCalendarConverterPure.js';

// Or use CommonJS
const EthiopianCalendarConverterPure = require('./ethiopianCalendarConverterPure.js');
```

## Quick Start

```javascript
import EthiopianCalendarConverterPure from './ethiopianCalendarConverterPure.js';

const EthConverter = EthiopianCalendarConverterPure;
const EthiopianDate = EthConverter.EthiopianDate;

// Convert current date to Ethiopian
const today = new Date();
const todayEthiopian = EthConverter.gregorianToEthiopian(today);
console.log(`Today: ${todayEthiopian.formatWithEnglishMonth()}`);

// Convert Ethiopian date to Gregorian
const ethDate = new EthiopianDate(2017, 1, 1); // Ethiopian New Year 2017
const gregDate = EthConverter.ethiopianToGregorian(ethDate);
console.log(`Ethiopian New Year 2017: ${gregDate.toDateString()}`);
```

## API Reference

### Core Conversion Methods

#### `gregorianToEthiopian(gregorianDate)`
Converts a Gregorian date to Ethiopian calendar.

```javascript
const ethDate = EthConverter.gregorianToEthiopian(new Date(2024, 8, 11));
// Returns: EthiopianDate { year: 2017, month: 1, day: 1 }
```

#### `ethiopianToGregorian(ethiopianDate|year, month, day)`
Converts an Ethiopian date to Gregorian calendar.

```javascript
// Using EthiopianDate object
const gregDate1 = EthConverter.ethiopianToGregorian(new EthiopianDate(2017, 1, 1));

// Using separate parameters
const gregDate2 = EthConverter.ethiopianToGregorian(2017, 1, 1);
```

### Date Parsing and Formatting

#### `parseEthiopianDate(dateString)`
Parses Ethiopian date strings in various formats.

```javascript
const ethDate1 = EthConverter.parseEthiopianDate('15/03/2016');  // dd/MM/yyyy
const ethDate2 = EthConverter.parseEthiopianDate('20-07-2015');  // dd-MM-yyyy
const ethDate3 = EthConverter.parseEthiopianDate('2017-12-10');  // yyyy-MM-dd
```

#### `formatEthiopianDate(ethiopianDate, format)`
Formats Ethiopian dates in various formats.

```javascript
const ethDate = new EthiopianDate(2016, 7, 25);

EthConverter.formatEthiopianDate(ethDate, 'dd/MM/yyyy');  // "25/07/2016"
EthConverter.formatEthiopianDate(ethDate, 'yyyy-MM-dd');  // "2016-07-25"
EthConverter.formatEthiopianDate(ethDate, 'MM/dd/yyyy');  // "07/25/2016"
```

#### `formatEthiopianDateWithAmharicMonth(ethiopianDate)`
Formats dates with Amharic month names.

```javascript
const ethDate = new EthiopianDate(2016, 1, 15);
const formatted = EthConverter.formatEthiopianDateWithAmharicMonth(ethDate);
// Returns: "15 መስከረም 2016"
```

#### `formatEthiopianDateWithEnglishMonth(ethiopianDate)`
Formats dates with English month names.

```javascript
const ethDate = new EthiopianDate(2016, 1, 15);
const formatted = EthConverter.formatEthiopianDateWithEnglishMonth(ethDate);
// Returns: "15 Meskerem 2016"
```

### Validation Methods

#### `isValidEthiopianDate(year, month, day)`
Validates Ethiopian date components.

```javascript
EthConverter.isValidEthiopianDate(2016, 1, 1);    // true
EthConverter.isValidEthiopianDate(2016, 13, 5);   // true (Pagumen)
EthConverter.isValidEthiopianDate(2016, 13, 7);   // false (invalid Pagumen day)
EthConverter.isValidEthiopianDate(2016, 14, 1);   // false (invalid month)
```

#### `isEthiopianLeapYear(year)`
Checks if an Ethiopian year is a leap year.

```javascript
EthConverter.isEthiopianLeapYear(2015);  // true
EthConverter.isEthiopianLeapYear(2016);  // false
EthConverter.isEthiopianLeapYear(2019);  // true
```

### Utility Methods

#### `getCurrentEthiopianDate()`
Gets the current date in Ethiopian calendar.

```javascript
const currentEthDate = EthConverter.getCurrentEthiopianDate();
```

#### `getCurrentEthiopianDateString(format)`
Gets the current Ethiopian date as a formatted string.

```javascript
const currentStr = EthConverter.getCurrentEthiopianDateString('yyyy-MM-dd');
```

#### `compareEthiopianDates(date1, date2)`
Compares two Ethiopian dates.

```javascript
const date1 = new EthiopianDate(2016, 5, 15);
const date2 = new EthiopianDate(2016, 7, 10);

EthConverter.compareEthiopianDates(date1, date2);  // -1 (date1 < date2)
EthConverter.compareEthiopianDates(date2, date1);  //  1 (date2 > date1)
EthConverter.compareEthiopianDates(date1, date1);  //  0 (equal)
```

### Range Operations

#### `isDateInEthiopianRange(gregorianDate, fromEthDate, toEthDate)`
Checks if a Gregorian date falls within an Ethiopian date range.

```javascript
const gregDate = new Date(2024, 2, 15);
const fromEth = new EthiopianDate(2016, 3, 1);
const toEth = new EthiopianDate(2016, 8, 30);

const inRange = EthConverter.isDateInEthiopianRange(gregDate, fromEth, toEth);
```

#### `getGregorianRangeFromEthiopian(fromEthDate, toEthDate)`
Converts Ethiopian date range to Gregorian date range.

```javascript
const fromEth = new EthiopianDate(2016, 3, 1);
const toEth = new EthiopianDate(2016, 5, 30);
const [fromGreg, toGreg] = EthConverter.getGregorianRangeFromEthiopian(fromEth, toEth);
```

### Input Field Support

#### `toEthiopianInputValue(gregorianDate)`
Converts Gregorian date to Ethiopian input field format (YYYY-MM-DD).

```javascript
const inputValue = EthConverter.toEthiopianInputValue(new Date(2024, 5, 15));
// Returns: "2016-10-08" (Ethiopian equivalent)
```

#### `fromEthiopianInputValue(ethiopianInputValue)`
Parses Ethiopian input field value back to Gregorian date.

```javascript
const gregDate = EthConverter.fromEthiopianInputValue('2016-10-08');
```

### Month Names

#### `getEthiopianMonthNameAmharic(month)`
Gets Ethiopian month name in Amharic.

```javascript
EthConverter.getEthiopianMonthNameAmharic(1);   // "መስከረም"
EthConverter.getEthiopianMonthNameAmharic(13);  // "ጳጉሜ"
```

#### `getEthiopianMonthNameEnglish(month)`
Gets Ethiopian month name in English.

```javascript
EthConverter.getEthiopianMonthNameEnglish(1);   // "Meskerem"
EthConverter.getEthiopianMonthNameEnglish(13);  // "Pagumen"
```

#### `getEthiopianMonthNamesAmharic()` / `getEthiopianMonthNamesEnglish()`
Gets all month names as arrays.

```javascript
const amharicMonths = EthConverter.getEthiopianMonthNamesAmharic();
const englishMonths = EthConverter.getEthiopianMonthNamesEnglish();
```

## EthiopianDate Class

The `EthiopianDate` class represents an Ethiopian calendar date.

### Constructor
```javascript
const ethDate = new EthConverter.EthiopianDate(year, month, day);
```

### Methods
- `getYear()` - Returns the year
- `getMonth()` - Returns the month (1-13)
- `getDay()` - Returns the day
- `format(format)` - Formats the date
- `formatWithAmharicMonth()` - Formats with Amharic month name
- `formatWithEnglishMonth()` - Formats with English month name
- `toString()` - Returns string representation
- `equals(other)` - Checks equality with another EthiopianDate

## Ethiopian Month Names

| Month | Amharic | English | Days |
|-------|---------|---------|------|
| 1 | መስከረም | Meskerem | 30 |
| 2 | ጥቅምት | Tikimt | 30 |
| 3 | ኅዳር | Hidar | 30 |
| 4 | ታህሣሥ | Tahsas | 30 |
| 5 | ጥር | Tir | 30 |
| 6 | የካቲት | Yekatit | 30 |
| 7 | መጋቢት | Megabit | 30 |
| 8 | ሚያዚያ | Miazia | 30 |
| 9 | ግንቦት | Ginbot | 30 |
| 10 | ሰኔ | Sene | 30 |
| 11 | ሐምሌ | Hamle | 30 |
| 12 | ነሐሴ | Nehase | 30 |
| 13 | ጳጉሜ | Pagumen | 5-6 |

## Error Handling

The converter throws descriptive errors for invalid inputs:

```javascript
try {
    const invalidDate = new EthConverter.EthiopianDate(2016, 15, 1);
} catch (error) {
    console.log(error.message); // "Invalid Ethiopian date: 2016-15-1"
}

try {
    const invalidParse = EthConverter.parseEthiopianDate('invalid-date');
} catch (error) {
    console.log(error.message); // "Invalid Ethiopian date format: invalid-date"
}
```

## Testing

Run the test suite to verify functionality:

```javascript
import './testEthiopianConverter.js';
```

Or run the usage examples:

```javascript
import './ethiopianCalendarUsageExample.js';
```

## Differences from Original JavaScript Version

This pure implementation differs from the existing `ethiopianCalendarConverter.js` in several ways:

1. **No External Dependencies**: Uses pure mathematical algorithms instead of the `ethiopian-date` package
2. **Direct Java Port**: Uses the same algorithms as the Java implementation for consistency
3. **Enhanced Error Handling**: More descriptive error messages and validation
4. **Complete API**: Includes all methods from the Java version
5. **Better Documentation**: Comprehensive JSDoc comments and examples
6. **Type Safety**: Better parameter validation and type checking

## Performance

The pure implementation is highly performant as it:
- Uses only mathematical calculations (no external library overhead)
- All methods are static (no instance creation overhead)
- Minimal memory allocation
- Fast Julian Day Number algorithms

## Browser Compatibility

Compatible with all modern browsers that support:
- ES6 Classes
- ES6 Modules (or use with a bundler)
- Basic Math operations

## License

This implementation follows the same license as the original Java version in the Wbill project.

## Contributing

When contributing to this converter:
1. Maintain compatibility with the Java version
2. Add comprehensive tests for new features
3. Update documentation
4. Follow the existing code style
5. Ensure no external dependencies are added
