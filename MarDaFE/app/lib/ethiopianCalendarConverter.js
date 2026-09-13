/**
 * Ethiopian Calendar Converter Utility Class
 * 
 * This utility class provides bidirectional conversion between Gregorian and Ethiopian calendars.
 * It uses the ethiopian-date package for reliable conversions and provides additional formatting
 * and validation utilities.
 * 
 * Features:
 * - Convert Gregorian dates to Ethiopian calendar
 * - Convert Ethiopian dates to Gregorian calendar
 * - Format dates in various Ethiopian formats
 * - Validate Ethiopian dates
 * - Handle date ranges and filtering
 * - Support for both JavaScript Date objects and date strings
 */
// Use a non-conflicting import name for the library
const ethiopic = require("ethiopian-date");

class EthiopianCalendarConverter {

  /**
   * Convert Gregorian date to Ethiopian calendar
   * @param {Date|string} gregorianDate - Gregorian date as Date object or string
   * @returns {Object} Ethiopian date object with year, month, day properties
   */
  static gregorianToEthiopian(gregorianDate) {
    try {
      let date;

      // Normalize input to avoid timezone-induced day/year shifts
      if (typeof gregorianDate === 'string') {
        // Handle ISO date strings like 'YYYY-MM-DD' safely without timezone shifts
        const isoMatch = gregorianDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
          const y = parseInt(isoMatch[1], 10);
          const m = parseInt(isoMatch[2], 10);
          const d = parseInt(isoMatch[3], 10);
          // Construct as UTC to avoid local TZ affecting the day
          date = new Date(Date.UTC(y, m - 1, d));
        } else {
          // Fallback to native parsing
          date = new Date(gregorianDate);
        }
      } else if (gregorianDate instanceof Date) {
        date = gregorianDate;
      } else {
        throw new Error('Invalid date format');
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      // Use UTC parts to be timezone-agnostic
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth() + 1; // 1-12
      const d = date.getUTCDate();

      const ethiopianArray = ethiopic.toEthiopian(y, m, d);

      return {
        year: ethiopianArray[0],
        month: ethiopianArray[1],
        day: ethiopianArray[2]
      };
    } catch (error) {
      console.error('Error converting Gregorian to Ethiopian:', error);
    }
  }

  /**
   * Convert Ethiopian date to Gregorian calendar
   * @param {Object} ethiopianDate - Ethiopian date object with year, month, day properties
   * @returns {Date} Gregorian Date object
   */
  static ethiopianToGregorian(ethiopianDateOrYear, month, day) {
    try {
      let y, m, d;
      if (
        typeof ethiopianDateOrYear === 'object' &&
        ethiopianDateOrYear !== null &&
        'year' in ethiopianDateOrYear &&
        'month' in ethiopianDateOrYear &&
        'day' in ethiopianDateOrYear
      ) {
        y = ethiopianDateOrYear.year;
        m = ethiopianDateOrYear.month;
        d = ethiopianDateOrYear.day;
      } else {
        y = ethiopianDateOrYear;
        m = month;
        d = day;
      }

      if (!y || !m || !d) {
        throw new Error('Invalid Ethiopian date');
      }

      const gregorianArray = ethiopic.toGregorian(y, m, d);
      // Return a UTC Date so UI remains stable across timezones
      return new Date(Date.UTC(gregorianArray[0], gregorianArray[1] - 1, gregorianArray[2]));
    } catch (error) {
      console.error('Error converting Ethiopian to Gregorian:', error);
      return null;
    }
  }

  /**
   * Format Ethiopian date as string
   * @param {Date|string} gregorianDate - Gregorian date to convert and format
   * @param {string} format - Format type: 'dd/mm/yyyy', 'dd-mm-yyyy', 'yyyy/mm/dd', etc.
   * @returns {string} Formatted Ethiopian date string
   */
  static formatEthiopianDate(gregorianDate, format = 'dd/mm/yyyy') {
    const ethDate = this.gregorianToEthiopian(gregorianDate);

    if (!ethDate) {
      return '-';
    }

    const { year, month, day } = ethDate;
    const paddedDay = day.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');

    switch (format.toLowerCase()) {
      case 'dd/mm/yyyy':
        return `${paddedDay}/${paddedMonth}/${year}`;
      case 'dd-mm-yyyy':
        return `${paddedDay}-${paddedMonth}-${year}`;
      case 'yyyy/mm/dd':
        return `${year}/${paddedMonth}/${paddedDay}`;
      case 'yyyy-mm-dd':
        return `${year}-${paddedMonth}-${paddedDay}`;
      case 'mm/dd/yyyy':
        return `${paddedMonth}/${paddedDay}/${year}`;
      default:
        return `${paddedDay}/${paddedMonth}/${year}`;
    }
  }

  /**
   * Format Ethiopian date with month names in Amharic
   * @param {Date|string} gregorianDate - Gregorian date to convert and format
   * @returns {string} Formatted Ethiopian date with Amharic month name
   */
  static formatEthiopianDateWithAmharicMonth(gregorianDate) {
    const ethDate = this.gregorianToEthiopian(gregorianDate);

    if (!ethDate) {
      return '-';
    }

    const monthNames = [
      'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታህሣሥ', 'ጥር', 'የካቲት',
      'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
    ];

    const { year, month, day } = ethDate;
    const monthName = monthNames[month - 1] || 'Unknown';

    return `${day} ${monthName} ${year}`;
  }

  /**
   * Get Ethiopian month names in Amharic
   * @returns {Array} Array of Ethiopian month names in Amharic
   */
  static getEthiopianMonthNames() {
    return [
      'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታህሣሥ', 'ጥር', 'የካቲት',
      'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
    ];
  }

  /**
   * Get Ethiopian month names in English
   * @returns {Array} Array of Ethiopian month names in English
   */
  static getEthiopianMonthNamesEnglish() {
    return [
      'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
      'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
    ];
  }

  /**
   * Validate Ethiopian date
   * @param {number} year - Ethiopian year
   * @param {number} month - Ethiopian month (1-13)
   * @param {number} day - Ethiopian day
   * @returns {boolean} True if valid Ethiopian date
   */
  static isValidEthiopianDate(year, month, day) {
    try {
      // Basic range checks
      if (year < 1 || month < 1 || month > 13 || day < 1) {
        return false;
      }

      // Check day limits for regular months
      if (month <= 12 && day > 30) {
        return false;
      }

      // Check day limits for Pagumen (13th month)
      if (month === 13) {
        // Pagumen has 5 days in regular years, 6 in leap years
        const isLeapYear = this.isEthiopianLeapYear(year);
        const maxDays = isLeapYear ? 6 : 5;
        if (day > maxDays) {
          return false;
        }
      }

      // Try to convert to Gregorian to validate
      const gregorianDate = this.ethiopianToGregorian(year, month, day);
      return gregorianDate !== null && !isNaN(gregorianDate.getTime());
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Ethiopian year is a leap year
   * @param {number} year - Ethiopian year
   * @returns {boolean} True if leap year
   */
  static isEthiopianLeapYear(year) {
    // Ethiopian leap year calculation
    return (year % 4) === 3;
  }

  /**
   * Convert Ethiopian date string to Gregorian date for filtering
   * @param {string} ethiopianDateString - Ethiopian date in format 'dd/mm/yyyy'
   * @returns {Date|null} Gregorian Date object or null if invalid
   */
  static ethiopianStringToGregorian(ethiopianDateString) {
    try {
      const parts = ethiopianDateString.split('/');
      if (parts.length !== 3) {
        return null;
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (!this.isValidEthiopianDate(year, month, day)) {
        return null;
      }

      return this.ethiopianToGregorian(year, month, day);
    } catch (error) {
      console.error('Error parsing Ethiopian date string:', error);
      return null;
    }
  }

  /**
   * Get current Ethiopian date
   * @returns {Object} Current Ethiopian date object with year, month, day
   */
  static getCurrentEthiopianDate() {
    return this.gregorianToEthiopian(new Date());
  }

  /**
   * Parse Ethiopian date string to Ethiopian date object
   * @param {string} dateString - Ethiopian date string in format 'dd/MM/yyyy' or 'dd-MM-yyyy'
   * @returns {Object} Ethiopian date object with year, month, day properties
   */
  static parseEthiopianDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      throw new Error('Invalid date string');
    }

    // Handle different separators
    const cleanDateString = dateString.replace(/[-\/]/g, '/');
    const parts = cleanDateString.split('/');

    if (parts.length !== 3) {
      throw new Error('Invalid date format. Expected dd/MM/yyyy or dd-MM-yyyy');
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error('Invalid date values');
    }

    // Basic validation
    if (month < 1 || month > 13) {
      throw new Error('Invalid month. Ethiopian calendar has 13 months');
    }

    if (day < 1 || day > 30) {
      throw new Error('Invalid day');
    }

    return { year, month, day };
  }

  /**
   * Get current Ethiopian date as formatted string
   * @param {string} format - Date format (default: 'dd/mm/yyyy')
   * @returns {string} Current Ethiopian date as formatted string
   */
  static getCurrentEthiopianDateString(format = 'dd/mm/yyyy') {
    return this.formatEthiopianDate(new Date(), format);
  }
  /**
   * Compare two Ethiopian dates
   * @param {Object} date1 - First Ethiopian date {year, month, day}
   * @param {Object} date2 - Second Ethiopian date {year, month, day}
   * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  static compareEthiopianDates(date1, date2) {
    if (date1.year !== date2.year) {
      return date1.year < date2.year ? -1 : 1;
    }
    if (date1.month !== date2.month) {
      return date1.month < date2.month ? -1 : 1;
    }
    if (date1.day !== date2.day) {
      return date1.day < date2.day ? -1 : 1;
    }
    return 0;
  }

  /**
   * Filter dates within Ethiopian date range
   * @param {Array} dates - Array of Gregorian dates
   * @param {Object} fromEthDate - Start Ethiopian date {year, month, day}
   * @param {Object} toEthDate - End Ethiopian date {year, month, day}
   * @returns {Array} Filtered array of dates
   */
  static filterDatesByEthiopianRange(dates, fromEthDate, toEthDate) {
    if (!fromEthDate && !toEthDate) {
      return dates;
    }

    return dates.filter(date => {
      const ethDate = this.gregorianToEthiopian(date);
      if (!ethDate) return false;

      if (fromEthDate && this.compareEthiopianDates(ethDate, fromEthDate) < 0) {
        return false;
      }

      if (toEthDate && this.compareEthiopianDates(ethDate, toEthDate) > 0) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get Ethiopian date range as Gregorian dates for database queries
   * @param {Object} fromEthDate - Start Ethiopian date {year, month, day}
   * @param {Object} toEthDate - End Ethiopian date {year, month, day}
   * @returns {Object} {fromDate: Date, toDate: Date} Gregorian date range
   */
  static getGregorianRangeFromEthiopian(fromEthDate, toEthDate) {
    const result = {};

    if (fromEthDate) {
      result.fromDate = this.ethiopianToGregorian(
        fromEthDate.year,
        fromEthDate.month,
        fromEthDate.day
      );
    }

    if (toEthDate) {
      result.toDate = this.ethiopianToGregorian(
        toEthDate.year,
        toEthDate.month,
        toEthDate.day
      );
    }

    return result;
  }

  /**
   * Create Ethiopian date picker compatible value
   * @param {Date|string} gregorianDate - Gregorian date
   * @returns {string} Ethiopian date in YYYY-MM-DD format for date inputs
   */
  static toEthiopianInputValue(gregorianDate) {
    const ethDate = this.gregorianToEthiopian(gregorianDate);
    if (!ethDate) return '';

    const { year, month, day } = ethDate;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /**
   * Parse Ethiopian date input value to Gregorian date
   * @param {string} ethiopianInputValue - Ethiopian date in YYYY-MM-DD format
   * @returns {Date|null} Gregorian Date object
   */
  static fromEthiopianInputValue(ethiopianInputValue) {
    if (!ethiopianInputValue) return null;

    try {
      const parts = ethiopianInputValue.split('-');
      if (parts.length !== 3) return null;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      return this.ethiopianToGregorian(year, month, day);
    } catch (error) {
      console.error('Error parsing Ethiopian input value:', error);
      return null;
    }
  }
}

export default EthiopianCalendarConverter;
