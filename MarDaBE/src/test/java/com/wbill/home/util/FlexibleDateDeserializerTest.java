package com.wbill.home.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wbill.home.dto.BankPaymentUpdateDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.*;

public class FlexibleDateDeserializerTest {

    @Test
    @DisplayName("Parse European/Ethiopian dd/MM/yyyy HH:mm: 26/10/2026 00:00")
    void testParseDdMmYyyy() {
        Date d = FlexibleDateDeserializer.parseDate("26/10/2026 00:00");
        assertNotNull(d);
        Calendar cal = Calendar.getInstance();
        cal.setTime(d);
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.OCTOBER, cal.get(Calendar.MONTH));
        assertEquals(26, cal.get(Calendar.DAY_OF_MONTH));
        assertEquals(0, cal.get(Calendar.HOUR_OF_DAY));
        assertEquals(0, cal.get(Calendar.MINUTE));
    }

    @Test
    @DisplayName("Parse European/Ethiopian dd/MM/yyyy HH:mm: 17/10/2026 00:00 (user error scenario)")
    void testParse17102026() {
        Date d = FlexibleDateDeserializer.parseDate("17/10/2026 00:00");
        assertNotNull(d);
        Calendar cal = Calendar.getInstance();
        cal.setTime(d);
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.OCTOBER, cal.get(Calendar.MONTH));
        assertEquals(17, cal.get(Calendar.DAY_OF_MONTH));
    }

    @Test
    @DisplayName("Parse US MM/dd/yyyy HH:mm: 10/23/2026 15:33")
    void testParseMmDdYyyy() {
        Date d = FlexibleDateDeserializer.parseDate("10/23/2026 15:33");
        assertNotNull(d);
        Calendar cal = Calendar.getInstance();
        cal.setTime(d);
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.OCTOBER, cal.get(Calendar.MONTH));
        assertEquals(23, cal.get(Calendar.DAY_OF_MONTH));
        assertEquals(15, cal.get(Calendar.HOUR_OF_DAY));
        assertEquals(33, cal.get(Calendar.MINUTE));
    }

    @Test
    @DisplayName("Parse ISO-8601 UTC string: 2026-08-16T00:00:00.000Z")
    void testParseIso8601() {
        Date d = FlexibleDateDeserializer.parseDate("2026-08-16T00:00:00.000Z");
        assertNotNull(d);
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        cal.setTime(d);
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.AUGUST, cal.get(Calendar.MONTH));
        assertEquals(16, cal.get(Calendar.DAY_OF_MONTH));
    }

    @Test
    @DisplayName("Parse ISO date-only: 2026-10-20")
    void testParseIsoDateOnly() {
        Date d = FlexibleDateDeserializer.parseDate("2026-10-20");
        assertNotNull(d);
        Calendar cal = Calendar.getInstance();
        cal.setTime(d);
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.OCTOBER, cal.get(Calendar.MONTH));
        assertEquals(20, cal.get(Calendar.DAY_OF_MONTH));
    }

    @Test
    @DisplayName("Normalize to ISO format: 26/10/2026 00:00 -> ISO string")
    void testNormalizeToIso() {
        String iso = FlexibleDateDeserializer.normalizeToIso("26/10/2026 00:00");
        assertNotNull(iso);
        assertTrue(iso.startsWith("2026-10-"));
        assertTrue(iso.endsWith("Z"));
    }

    @Test
    @DisplayName("Jackson Deserialization of BankPaymentUpdateDTO with 17/10/2026 00:00")
    void testJacksonDeserialization() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        String json = "{\"moneyCollectedDate\":\"17/10/2026 00:00\",\"tekilalaYetekefele\":40.0,\"bankPaidAgentId\":\"113120\"}";
        BankPaymentUpdateDTO dto = mapper.readValue(json, BankPaymentUpdateDTO.class);
        assertNotNull(dto);
        assertNotNull(dto.getMoneyCollectedDate());
        Calendar cal = Calendar.getInstance();
        cal.setTime(dto.getMoneyCollectedDate());
        assertEquals(2026, cal.get(Calendar.YEAR));
        assertEquals(Calendar.OCTOBER, cal.get(Calendar.MONTH));
        assertEquals(17, cal.get(Calendar.DAY_OF_MONTH));
    }
}

