package com.wbill.home.util;


import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AmharicNormalizer {

    private static final Map<Character, Character> NORMALIZATION_MAP;

    // Static block to initialize the map of equivalent characters
    static {
        Map<Character, Character> map = new HashMap<>();
        // ሀ-family
        map.put('ሐ', 'ሀ'); map.put('ኀ', 'ሀ');
        map.put('ሑ', 'ሁ'); map.put('ኁ', 'ሁ');
        map.put('ሒ', 'ሂ'); map.put('ኂ', 'ሂ');
        map.put('ሓ', 'ሃ'); map.put('ኃ', 'ሃ');
        map.put('ሔ', 'ሄ'); map.put('ኄ', 'ሄ');
        map.put('ሕ', 'ህ'); map.put('ኅ', 'ህ');
        map.put('ሖ', 'ሆ'); map.put('ኆ', 'ሆ');

        // አ-family
        map.put('ዓ', 'አ'); map.put('ዐ', 'አ');
        map.put('ዑ', 'ኡ');
        map.put('ዒ', 'ኢ');
        map.put('ዔ', 'ኤ');
        map.put('ዕ', 'እ');
        map.put('ዖ', 'ኦ');

        // ሰ-family
        map.put('ሠ', 'ሰ');
        map.put('ሡ', 'ሱ');
        map.put('ሢ', 'ሲ');
        map.put('ሣ', 'ሳ');
        map.put('ሤ', 'ሴ');
        map.put('ሥ', 'ስ');
        map.put('ሦ', 'ሶ');

        // ጸ-family
        map.put('ፀ', 'ጸ');
        map.put('ፁ', 'ጹ');
        map.put('ፂ', 'ጺ');
        map.put('ፃ', 'ጻ');
        map.put('ፄ', 'ጼ');
        map.put('ፅ', 'ጽ');
        map.put('ፆ', 'ጾ');
        
        // Sometimes ዎ is used for ወ
        map.put('ዎ', 'ወ');

        NORMALIZATION_MAP = map;
    }

    /**
     * Normalizes an Amharic string by converting characters to a common base form.
     * @param input The string to normalize.
     * @return The normalized string.
     */
    public static String normalize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        StringBuilder normalized = new StringBuilder(input.length());
        for (char c : input.toCharArray()) {
            // If the character is in our map, append its base form. Otherwise, append the character as is.
            normalized.append(NORMALIZATION_MAP.getOrDefault(c, c));
        }
        return normalized.toString();
    }
}