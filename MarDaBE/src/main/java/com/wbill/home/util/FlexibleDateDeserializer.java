package com.wbill.home.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Flexible Date deserializer and utility supporting ISO-8601, European/Ethiopian
 * (dd/MM/yyyy), US (MM/dd/yyyy), and timestamps with or without time components.
 */
public class FlexibleDateDeserializer extends JsonDeserializer<Date> {

    private static final Pattern SLASH_DATE_PATTERN = Pattern.compile(
            "^(\\d{1,2})/(\\d{1,2})/(\\d{4})(?:[\\sT]+(\\d{1,2}):(\\d{1,2})(?::(\\d{1,2})(?:\\.(\\d{1,3}))?)?)?$"
    );

    private static final String[] STANDARD_FORMATS = new String[] {
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ssX",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd",
            "yyyy/MM/dd HH:mm:ss",
            "yyyy/MM/dd",
            "dd-MM-yyyy HH:mm:ss",
            "dd-MM-yyyy HH:mm",
            "dd-MM-yyyy"
    };

    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        return parseDate(text);
    }

    /**
     * Parse date string flexibly across supported formats.
     */
    public static Date parseDate(String text) {
        if (text == null) {
            return null;
        }
        String s = text.trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) {
            return null;
        }

        // 1. Try numeric epoch timestamp (10 or 13 digits)
        if (s.matches("^\\d{10,13}$")) {
            try {
                long ts = Long.parseLong(s);
                if (s.length() == 10) {
                    ts *= 1000L;
                }
                return new Date(ts);
            } catch (NumberFormatException ignored) {
            }
        }

        // 2. Check for slash dates (dd/MM/yyyy or MM/dd/yyyy with optional time)
        Matcher matcher = SLASH_DATE_PATTERN.matcher(s);
        if (matcher.matches()) {
            int p1 = Integer.parseInt(matcher.group(1));
            int p2 = Integer.parseInt(matcher.group(2));
            boolean hasTime = matcher.group(4) != null;
            boolean hasSec = matcher.group(6) != null;

            String pattern;
            if (p1 > 12) {
                // Must be dd/MM/yyyy
                pattern = hasSec ? "dd/MM/yyyy HH:mm:ss" : (hasTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
            } else if (p2 > 12) {
                // Must be MM/dd/yyyy
                pattern = hasSec ? "MM/dd/yyyy HH:mm:ss" : (hasTime ? "MM/dd/yyyy HH:mm" : "MM/dd/yyyy");
            } else {
                // Ambiguous: default to dd/MM/yyyy (Ethiopian standard notation)
                pattern = hasSec ? "dd/MM/yyyy HH:mm:ss" : (hasTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
            }

            try {
                SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                sdf.setLenient(false);
                return sdf.parse(s);
            } catch (ParseException ignored) {
                // If it fails, fallback to MM/dd/yyyy variant
                try {
                    String altPattern = hasSec ? "MM/dd/yyyy HH:mm:ss" : (hasTime ? "MM/dd/yyyy HH:mm" : "MM/dd/yyyy");
                    SimpleDateFormat altSdf = new SimpleDateFormat(altPattern);
                    altSdf.setLenient(false);
                    return altSdf.parse(s);
                } catch (ParseException ignoredAlt) {
                }
            }
        }

        // 3. Try standard formats
        for (String format : STANDARD_FORMATS) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(format);
                sdf.setLenient(false);
                return sdf.parse(s);
            } catch (ParseException ignored) {
            }
        }

        return null;
    }

    /**
     * Normalize any supported date string into standard ISO-8601 UTC representation
     * (e.g. "2026-10-26T00:00:00.000Z"). Returns original string if unparseable.
     */
    public static String normalizeToIso(String s) {
        if (s == null || s.trim().isEmpty()) {
            return null;
        }
        Date date = parseDate(s);
        if (date != null) {
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            return isoFormat.format(date);
        }
        return s.trim();
    }
}

