package edu.cit.villas.ugnay.dto;

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
}