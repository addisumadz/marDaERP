/**
 * Pure Ethiopian Calendar Converter Utility Class
 * 
 * This utility class provides bidirectional conversion between Gregorian and Ethiopian calendars
 * using pure mathematical algorithms without external dependencies. Based on the Java implementation
 * with comprehensive formatting, validation, and utility methods.
 * 
 * Features:
 * - Convert Gregorian dates to Ethiopian calendar
 * - Convert Ethiopian dates to Gregorian calendar  
 * - Format dates in various Ethiopian formats
 * - Validate Ethiopian dates
 * - Handle date ranges and filtering
 * - Support for both Date objects and date strings
 * - Thread-safe operations
 * 
 * Ethiopian Calendar System:
 * - 13 months: 12 months of 30 days each + Pagumen (5-6 days)
 * - New Year starts on September 11 (or 12 in leap years)
 * - Leap year every 4 years (different from Gregorian)
 * 
 * @author Wbill System
 * @version 2.0 - Pure JavaScript Implementation
 */

class EthiopianCalendarConverterPure {

    // Ethiopian month names in Amharic
    static ETHIOPIAN_MONTH_NAMES_AMHARIC = [
        "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
        "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
    ];

    // Ethiopian month names in English
    static ETHIOPIAN_MONTH_NAMES_ENGLISH = [
        "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
        "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagumen"
    ];

    // Ethiopian epoch (JDN of 1 Meskerem 0001 E.C.)
    static ETHIOPIC_EPOCH = 1724221;

    // Date format patterns (regex)
    static ETHIOPIAN_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    static ETHIOPIAN_DATE_PATTERN_DASH = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    static ETHIOPIAN_DATE_PATTERN_ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

    /**
     * Ethiopian Date representation
     */
    static EthiopianDate = class {
        constructor(year, month, day) {
            if (!EthiopianCalendarConverterPure.isValidEthiopianDate(year, month, day)) {
                throw new Error(`Invalid Ethiopian date: ${year}-${month}-${day}`);
            }
            this.year = year;
            this.month = month; // 1-13
            this.day = day;     // 1-30 (1-5/6 for Pagumen)
        }

        getYear() { return this.year; }
        getMonth() { return this.month; }
        getDay() { return this.day; }

        /**
         * Format the Ethiopian date
         * @param {string} format Format string: "dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", etc.
         * @returns {string} Formatted date string
         */
        format(format) {
            return EthiopianCalendarConverterPure.formatEthiopianDate(this, format);
        }

        /**
         * Format with Amharic month name
         * @returns {string} Date string with Amharic month name
         */
        formatWithAmharicMonth() {
            return EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(this);
        }

        /**
         * Format with English month name
         * @returns {string} Date string with English month name
         */
        formatWithEnglishMonth() {
            return EthiopianCalendarConverterPure.formatEthiopianDateWithEnglishMonth(this);
        }

        toString() {
            return `${this.day}/${this.month}/${this.year}`;
        }

        equals(other) {
            if (!other || !(other instanceof EthiopianCalendarConverterPure.EthiopianDate)) return false;
            return this.year === other.year && this.month === other.month && this.day === other.day;
        }

        hashCode() {
            return this.year * 10000 + this.month * 100 + this.day;
        }
    };

    /**
     * Convert Gregorian Date to Ethiopian calendar
     * @param {Date|string} gregorianDate Gregorian date
     * @returns {EthiopianDate} Ethiopian date
     */
    static gregorianToEthiopian(gregorianDate) {
        if (!gregorianDate) {
            throw new Error("Gregorian date cannot be null");
        }

        let date;
        if (typeof gregorianDate === 'string') {
            date = new Date(gregorianDate);
        } else if (gregorianDate instanceof Date) {
            date = gregorianDate;
        } else {
            throw new Error("Invalid date format");
        }

        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-based
        const day = date.getDate();

        const jd = this.jdFromGregorian(year, month, day);
        return this.ethiopianFromJDN(jd);
    }

    /**
     * Convert Ethiopian date to Gregorian Date
     * @param {EthiopianDate|number} ethiopianDateOrYear Ethiopian date object or year
     * @param {number} month Ethiopian month (1-13) - optional if first param is EthiopianDate
     * @param {number} day Ethiopian day - optional if first param is EthiopianDate
     * @returns {Date} Gregorian Date
     */
    static ethiopianToGregorian(ethiopianDateOrYear, month, day) {
        let year, m, d;

        if (ethiopianDateOrYear instanceof this.EthiopianDate) {
            year = ethiopianDateOrYear.year;
            m = ethiopianDateOrYear.month;
            d = ethiopianDateOrYear.day;
        } else {
            year = ethiopianDateOrYear;
            m = month;
            d = day;
        }

        if (!this.isValidEthiopianDate(year, m, d)) {
            throw new Error(`Invalid Ethiopian date: ${year}-${m}-${d}`);
        }

        const jd = this.jdFromEthiopian(year, m, d);
        const gregorian = this.gregorianFromJDN(jd);
        return new Date(gregorian[0], gregorian[1] - 1, gregorian[2]); // JavaScript months are 0-based
    }

    /**
     * Parse Ethiopian date string to EthiopianDate
     * @param {string} dateString Date string in format "dd/MM/yyyy", "dd-MM-yyyy", or "yyyy-MM-dd"
     * @returns {EthiopianDate} Ethiopian date
     */
    static parseEthiopianDate(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            throw new Error("Date string cannot be null or empty");
        }

        dateString = dateString.trim();

        // Try different patterns
        let match;

        // Pattern: dd/MM/yyyy
        match = dateString.match(this.ETHIOPIAN_DATE_PATTERN);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);
            return new this.EthiopianDate(year, month, day);
        }

        // Pattern: dd-MM-yyyy
        match = dateString.match(this.ETHIOPIAN_DATE_PATTERN_DASH);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);
            return new this.EthiopianDate(year, month, day);
        }

        // Pattern: yyyy-MM-dd
        match = dateString.match(this.ETHIOPIAN_DATE_PATTERN_ISO);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const day = parseInt(match[3], 10);
            return new this.EthiopianDate(year, month, day);
        }

        throw new Error("Invalid Ethiopian date format: " + dateString);
    }

    /**
     * Format Ethiopian date as string
     * @param {EthiopianDate} ethiopianDate Ethiopian date
     * @param {string} format Format string: "dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", etc.
     * @returns {string} Formatted date string
     */
    static formatEthiopianDate(ethiopianDate, format = "dd/MM/yyyy") {
        if (!ethiopianDate) return null;

        const paddedDay = ethiopianDate.day.toString().padStart(2, '0');
        const paddedMonth = ethiopianDate.month.toString().padStart(2, '0');
        const year = ethiopianDate.year.toString();

        switch (format.toLowerCase()) {
            case "dd/mm/yyyy":
                return `${paddedDay}/${paddedMonth}/${year}`;
            case "dd-mm-yyyy":
                return `${paddedDay}-${paddedMonth}-${year}`;
            case "yyyy/mm/dd":
                return `${year}/${paddedMonth}/${paddedDay}`;
            case "yyyy-mm-dd":
                return `${year}-${paddedMonth}-${paddedDay}`;
            case "mm/dd/yyyy":
                return `${paddedMonth}/${paddedDay}/${year}`;
            default:
                return `${paddedDay}/${paddedMonth}/${year}`;
        }
    }

    /**
     * Format Ethiopian date with Amharic month name
     * @param {EthiopianDate} ethiopianDate Ethiopian date
     * @returns {string} Formatted date string with Amharic month name
     */
    static formatEthiopianDateWithAmharicMonth(ethiopianDate) {
        if (!ethiopianDate) return null;

        const monthName = this.getEthiopianMonthNameAmharic(ethiopianDate.month);
        return `${ethiopianDate.day} ${monthName} ${ethiopianDate.year}`;
    }

    /**
     * Format Ethiopian date with English month name
     * @param {EthiopianDate} ethiopianDate Ethiopian date
     * @returns {string} Formatted date string with English month name
     */
    static formatEthiopianDateWithEnglishMonth(ethiopianDate) {
        if (!ethiopianDate) return null;

        const monthName = this.getEthiopianMonthNameEnglish(ethiopianDate.month);
        return `${ethiopianDate.day} ${monthName} ${ethiopianDate.year}`;
    }

    /**
     * Get Ethiopian month name in Amharic
     * @param {number} month Month number (1-13)
     * @returns {string} Month name in Amharic
     */
    static getEthiopianMonthNameAmharic(month) {
        if (month < 1 || month > 13) {
            throw new Error("Month must be between 1 and 13");
        }
        return this.ETHIOPIAN_MONTH_NAMES_AMHARIC[month - 1];
    }

    /**
     * Get Ethiopian month name in English
     * @param {number} month Month number (1-13)
     * @returns {string} Month name in English
     */
    static getEthiopianMonthNameEnglish(month) {
        if (month < 1 || month > 13) {
            throw new Error("Month must be between 1 and 13");
        }
        return this.ETHIOPIAN_MONTH_NAMES_ENGLISH[month - 1];
    }

    /**
     * Get all Ethiopian month names in Amharic
     * @returns {string[]} Array of month names in Amharic
     */
    static getEthiopianMonthNamesAmharic() {
        return [...this.ETHIOPIAN_MONTH_NAMES_AMHARIC];
    }

    /**
     * Get all Ethiopian month names in English
     * @returns {string[]} Array of month names in English
     */
    static getEthiopianMonthNamesEnglish() {
        return [...this.ETHIOPIAN_MONTH_NAMES_ENGLISH];
    }

    /**
     * Validate Ethiopian date
     * @param {number} year Ethiopian year
     * @param {number} month Ethiopian month (1-13)
     * @param {number} day Ethiopian day
     * @returns {boolean} true if valid Ethiopian date
     */
    static isValidEthiopianDate(year, month, day) {
        // Basic range checks
        if (year < 1 || month < 1 || month > 13 || day < 1) {
            return false;
        }

        // Check day limits for regular months (1-12)
        if (month <= 12 && day > 30) {
            return false;
        }

        // Check day limits for Pagumen (13th month)
        if (month === 13) {
            const isLeapYear = this.isEthiopianLeapYear(year);
            const maxDays = isLeapYear ? 6 : 5;
            if (day > maxDays) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if Ethiopian year is a leap year
     * @param {number} year Ethiopian year
     * @returns {boolean} true if leap year
     */
    static isEthiopianLeapYear(year) {
        return (year % 4) === 3;
    }

    /**
     * Get current Ethiopian date
     * @returns {EthiopianDate} Current Ethiopian date
     */
    static getCurrentEthiopianDate() {
        return this.gregorianToEthiopian(new Date());
    }

    /**
     * Get current Ethiopian date as formatted string
     * @param {string} format Format string
     * @returns {string} Current Ethiopian date as formatted string
     */
    static getCurrentEthiopianDateString(format) {
        return this.formatEthiopianDate(this.getCurrentEthiopianDate(), format);
    }

    /**
     * Compare two Ethiopian dates
     * @param {EthiopianDate} date1 First Ethiopian date
     * @param {EthiopianDate} date2 Second Ethiopian date
     * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
     */
    static compareEthiopianDates(date1, date2) {
        if (!date1 && !date2) return 0;
        if (!date1) return -1;
        if (!date2) return 1;

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
     * Check if a Gregorian date falls within an Ethiopian date range
     * @param {Date} gregorianDate Gregorian date to check
     * @param {EthiopianDate} fromEthiopianDate Start of Ethiopian date range (inclusive)
     * @param {EthiopianDate} toEthiopianDate End of Ethiopian date range (inclusive)
     * @returns {boolean} true if the date falls within the range
     */
    static isDateInEthiopianRange(gregorianDate, fromEthiopianDate, toEthiopianDate) {
        if (!gregorianDate) return false;

        const ethiopianDate = this.gregorianToEthiopian(gregorianDate);

        if (fromEthiopianDate && this.compareEthiopianDates(ethiopianDate, fromEthiopianDate) < 0) {
            return false;
        }

        if (toEthiopianDate && this.compareEthiopianDates(ethiopianDate, toEthiopianDate) > 0) {
            return false;
        }

        return true;
    }

    /**
     * Convert Ethiopian date range to Gregorian date range
     * @param {EthiopianDate} fromEthiopianDate Start Ethiopian date
     * @param {EthiopianDate} toEthiopianDate End Ethiopian date
     * @returns {Date[]} Array containing [fromGregorianDate, toGregorianDate]
     */
    static getGregorianRangeFromEthiopian(fromEthiopianDate, toEthiopianDate) {
        const fromGregorian = fromEthiopianDate ?
            this.ethiopianToGregorian(fromEthiopianDate) : null;
        const toGregorian = toEthiopianDate ?
            this.ethiopianToGregorian(toEthiopianDate) : null;

        return [fromGregorian, toGregorian];
    }

    /**
     * Get Ethiopian date for input field (YYYY-MM-DD format)
     * @param {Date} gregorianDate Gregorian date
     * @returns {string} Ethiopian date in YYYY-MM-DD format
     */
    static toEthiopianInputValue(gregorianDate) {
        if (!gregorianDate) return "";

        const ethiopianDate = this.gregorianToEthiopian(gregorianDate);
        return this.formatEthiopianDate(ethiopianDate, "yyyy-MM-dd");
    }

    /**
     * Parse Ethiopian date input value to Gregorian date
     * @param {string} ethiopianInputValue Ethiopian date in YYYY-MM-DD format
     * @returns {Date} Gregorian Date
     */
    static fromEthiopianInputValue(ethiopianInputValue) {
        if (!ethiopianInputValue || typeof ethiopianInputValue !== 'string') {
            return null;
        }

        try {
            const ethiopianDate = this.parseEthiopianDate(ethiopianInputValue.trim());
            return this.ethiopianToGregorian(ethiopianDate);
        } catch (error) {
            throw new Error("Invalid Ethiopian date input: " + ethiopianInputValue + " - " + error.message);
        }
    }

    // ========== Private Helper Methods ==========

    /**
     * Convert Gregorian date to Julian Day Number
     * @private
     */
    static jdFromGregorian(year, month, day) {
        const a = Math.floor((14 - month) / 12);
        const y = year + 4800 - a;
        const m = month + 12 * a - 3;
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }

    /**
     * Convert Julian Day Number to Gregorian date
     * @private
     */
    static gregorianFromJDN(jd) {
        const l = jd + 68569;
        const n = Math.floor((4 * l) / 146097);
        const l2 = l - Math.floor((146097 * n + 3) / 4);
        const i = Math.floor((4000 * (l2 + 1)) / 1461001);
        const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
        const j = Math.floor((80 * l3) / 2447);
        const d = l3 - Math.floor((2447 * j) / 80);
        const l4 = Math.floor(j / 11);
        const m = j + 2 - 12 * l4;
        const y = 100 * (n - 49) + i + l4;
        return [y, m, d];
    }

    /**
     * Convert Ethiopian date to Julian Day Number
     * @private
     */
    static jdFromEthiopian(year, month, day) {
        return this.ETHIOPIC_EPOCH + 365 * (year - 1) + Math.floor((year - 1) / 4) + 30 * (month - 1) + day - 1;
    }

    /**
     * Convert Julian Day Number to Ethiopian date
     * @private
     */
    static ethiopianFromJDN(jd) {
        const r = jd - this.ETHIOPIC_EPOCH;
        const year = Math.floor((4 * r + 1463) / 1461);
        const t = r - 365 * (year - 1) - Math.floor((year - 1) / 4);
        const month = Math.floor(t / 30) + 1;
        const day = (t % 30) + 1;
        return new this.EthiopianDate(year, month, day);
    }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EthiopianCalendarConverterPure;
}

export default EthiopianCalendarConverterPure;
