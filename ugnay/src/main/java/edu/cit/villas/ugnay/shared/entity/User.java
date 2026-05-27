package edu.cit.villas.ugnay.shared.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @Column(name = "business_address", nullable = false, columnDefinition = "TEXT")
    private String businessAddress;

    @Column(name = "business_permit", length = 255)
    private String businessPermit;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String password;

    @Column(name = "auth_provider", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'LOCAL'")
    private String authProvider = "LOCAL";

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    @Column(name = "region_code", length = 20)
    private String regionCode;

    @Column(name = "province_code", length = 20)
    private String provinceCode;

    @Column(name = "city_code", length = 20)
    private String cityCode;

    @Column(name = "barangay_code", length = 20)
    private String barangayCode;

    @Column(name = "street_address", length = 500)
    private String streetAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Manufacturer manufacturer;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Vendor vendor;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // UserDetails implementation
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}