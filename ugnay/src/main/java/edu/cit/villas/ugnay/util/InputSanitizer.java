package edu.cit.villas.ugnay.util;

import java.util.regex.Pattern;

/**
 * Utility class for sanitizing and validating user input.
 * Prevents XSS, script injection, and enforces field-level rules.
 */
public final class InputSanitizer {

    private InputSanitizer() {}

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

    // Business name: letters, numbers, spaces, hyphens, apostrophes, periods, ampersands
    private static final Pattern BUSINESS_NAME_PATTERN = Pattern.compile("^[\\p{L}\\d &.'-]+$");

    // Basic email format
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    public static String stripHtml(String input) {
        if (input == null) return null;
        return HTML_TAG_PATTERN.matcher(input).replaceAll("").trim();
    }

    public static void requireNotBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required and cannot be blank.");
        }
    }

    public static String sanitizeBusinessName(String value) {
        String sanitized = stripHtml(value);
        requireNotBlank(sanitized, "Business name");

        if (sanitized.length() > 255) {
            throw new IllegalArgumentException("Business name must be 255 characters or fewer.");
        }

        if (!BUSINESS_NAME_PATTERN.matcher(sanitized).matches()) {
            throw new IllegalArgumentException(
                "Business name can only contain letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands."
            );
        }

        return sanitized;
    }

    public static String sanitizeEmail(String value) {
        String sanitized = stripHtml(value);
        requireNotBlank(sanitized, "Email");

        if (sanitized.length() > 255) {
            throw new IllegalArgumentException("Email must be 255 characters or fewer.");
        }

        if (!EMAIL_PATTERN.matcher(sanitized).matches()) {
            throw new IllegalArgumentException("Please provide a valid email address.");
        }

        return sanitized.toLowerCase();
    }

    public static String sanitizeAddress(String value) {
        String sanitized = stripHtml(value);
        requireNotBlank(sanitized, "Business address");

        if (sanitized.length() > 1000) {
            throw new IllegalArgumentException("Business address must be 1000 characters or fewer.");
        }

        return sanitized;
    }

    public static String sanitizeOptionalText(String value, String fieldName, int maxLength) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String sanitized = stripHtml(value);
        if (sanitized.length() > maxLength) {
            throw new IllegalArgumentException(fieldName + " must be " + maxLength + " characters or fewer.");
        }
        return sanitized;
    }

    public static String sanitizeCategory(String value) {
        String sanitized = stripHtml(value);
        requireNotBlank(sanitized, "Category");

        if (sanitized.length() > 100) {
            throw new IllegalArgumentException("Category must be 100 characters or fewer.");
        }

        return sanitized;
    }

    public static String sanitizeVendorType(String value) {
        requireNotBlank(value, "Vendor type");
        String upper = value.trim().toUpperCase();

        if (!"RETAIL".equals(upper) && !"FOOD".equals(upper)) {
            throw new IllegalArgumentException("Vendor type must be either 'RETAIL' or 'FOOD'.");
        }

        return upper;
    }
}