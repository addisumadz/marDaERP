package com.wbill.home.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertAll;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class EthiopianCalendarUtilTest {

    @Test
    @DisplayName("Round-trip: Gregorian 2017-09-11 -> Ethiopian -> Gregorian (same day)")
    void testRoundTrip_Gregorian_Meskerem1_2010() {
        LocalDate g = LocalDate.of(2017, 9, 11);
        EthiopianCalendarUtil.EthiopianDate e = EthiopianCalendarUtil.toEthiopian(g);
        LocalDate g2 = EthiopianCalendarUtil.toGregorian(e.year, e.month, e.day);
        assertEquals(g, g2, "Round-trip should return the same Gregorian date");
    }

    @Test
    @DisplayName("Round-trip: Gregorian 2020-09-12 -> Ethiopian -> Gregorian (same day)")
    void testRoundTrip_Gregorian_LeapShift_2020_09_12() {
        LocalDate g = LocalDate.of(2020, 9, 12);
        EthiopianCalendarUtil.EthiopianDate e = EthiopianCalendarUtil.toEthiopian(g);
        LocalDate g2 = EthiopianCalendarUtil.toGregorian(e.year, e.month, e.day);
        assertEquals(g, g2, "Round-trip should return the same Gregorian date");
    }

    @Test
    @DisplayName("Round-trip: Ethiopian 2012-06-15 -> Gregorian -> Ethiopian")
    void testRoundTrip_EthiopianToGregorianAndBack() {
        int ey = 2012, em = 6, ed = 15; // Yekatit 15, 2012 EC
        LocalDate g = EthiopianCalendarUtil.toGregorian(ey, em, ed);
        EthiopianCalendarUtil.EthiopianDate e2 = EthiopianCalendarUtil.toEthiopian(g);
        assertAll(
                () -> assertEquals(ey, e2.year),
                () -> assertEquals(em, e2.month),
                () -> assertEquals(ed, e2.day));
    }

    @Test
    @DisplayName("getEthiopianYearMonth uses precise converter")
    void testGetEthiopianYearMonth() {
        LocalDate g = LocalDate.of(2019, 4, 10); // Roughly Miyazia
        int[] ym = EthiopianCalendarUtil.getEthiopianYearMonth(g);
        EthiopianCalendarUtil.EthiopianDate e = EthiopianCalendarUtil.toEthiopian(g);
        assertAll(
                () -> assertEquals(e.year, ym[0]),
                () -> assertEquals(e.month, ym[1]));
    }

    @Test
    @DisplayName("getPreviousKifyaWer decrements month correctly and wraps year at Meskerem")
    void testGetPreviousKifyaWer() {
        String prev1 = EthiopianCalendarUtil.getPreviousKifyaWer("ጥር, 2015");
        assertEquals("ታህሣሥ, 2015", prev1);

        String prev2 = EthiopianCalendarUtil.getPreviousKifyaWer("መስከረም, 2010");
        assertEquals("ነሐሴ, 2009", prev2);
    }
}
