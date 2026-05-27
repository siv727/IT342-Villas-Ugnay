package edu.cit.villas.ugnay.features.auth.register;

import lombok.Data;

@Data
public class RegistrationRequest {
    private String email;
    private String password;
    private String businessName;
    private String businessAddress;
    private String businessPermit;
    private String description;

    // "MANUFACTURER" or "VENDOR"
    private String role;

    // For Manufacturer
    private String category;

    // For Vendor: "RETAIL" or "FOOD"
    private String type;

    // PSGC location codes (optional)
    private String regionCode;
    private String provinceCode;
    private String cityCode;
    private String barangayCode;

    // Street, Phase, Zone, etc.
    private String streetAddress;
}