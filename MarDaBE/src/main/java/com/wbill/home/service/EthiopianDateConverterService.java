package com.wbill.home.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class EthiopianDateConverterService {

	private static final int JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; // Julian Day of 1 Mäskäräm 1 (Ethiopian calendar)

    // Convert Gregorian date to Julian Day Number (JDN)
    private static int gregorianToJDN(int year, int month, int day) {
        int a = (14 - month) / 12;
        int y = year + 4800 - a;
        int m = month + 12 * a - 3;
        return day + (153 * m + 2)/5 + 365 * y + y/4 - y/100 + y/400 - 32045;
    }

    // Convert Julian Day Number (JDN) to Gregorian date
    private static int[] jdnToGregorian(int jdn) {
        int f = jdn + 1401 + (((4 * jdn + 274277) / 146097) * 3) / 4 - 38;
        int e = 4 * f + 3;
        int g = (e % 1461) / 4;
        int h = 5 * g + 2;
        int day = (h % 153) / 5 + 1;
        int month = ((h / 153 + 2) % 12) + 1;
        int year = e / 1461 - 4716 + (12 + 2 - month) / 12;
        return new int[]{year, month, day};
    }

    // Convert Gregorian date to Ethiopian date
    public static int[] gregorianToEthiopian(int year, int month, int day) {
        int jd = gregorianToJDN(year, month, day);
        int r = (jd - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
        int n = r % 365 + 365 * (r / 1460);
        int ethYear = 4 * ((jd - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) + r / 365 - r / 1460;
        int ethMonth = n / 30 + 1;
        int ethDay = n % 30 + 1;
        return new int[]{ethYear, ethMonth, ethDay};
    }

    // Convert Ethiopian date to Gregorian date
    public static int[] ethiopianToGregorian(int ethYear, int ethMonth, int ethDay) {
        int jd = JD_EPOCH_OFFSET_AMETE_MIHRET + 365 * (ethYear - 1) + (ethYear / 4) + 30 * (ethMonth - 1) + ethDay - 1;
        return jdnToGregorian(jd);
    }
}
