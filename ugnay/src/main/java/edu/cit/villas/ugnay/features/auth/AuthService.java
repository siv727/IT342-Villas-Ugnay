package edu.cit.villas.ugnay.features.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.villas.ugnay.features.auth.login.LoginRequest;
import edu.cit.villas.ugnay.features.auth.register.RegistrationRequest;
import edu.cit.villas.ugnay.features.email.EmailService;
import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.shared.entity.Vendor;
import edu.cit.villas.ugnay.shared.repository.ManufacturerRepository;
import edu.cit.villas.ugnay.shared.repository.UserRepository;
import edu.cit.villas.ugnay.shared.repository.VendorRepository;
import edu.cit.villas.ugnay.shared.util.InputSanitizer;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       ManufacturerRepository manufacturerRepository,
                       VendorRepository vendorRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       TokenBlacklistService tokenBlacklistService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.manufacturerRepository = manufacturerRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.emailService = emailService;
    }

    public JwtService getJwtService() {
        return jwtService;
    }

    public RefreshTokenService getRefreshTokenService() {
        return refreshTokenService;
    }

    @Transactional
    public User registerUser(RegistrationRequest request) {
        // Sanitize and validate all inputs
        String email = InputSanitizer.sanitizeEmail(request.getEmail());
        String businessName = InputSanitizer.sanitizeBusinessName(request.getBusinessName());
        String businessAddress = InputSanitizer.sanitizeAddress(request.getBusinessAddress());
        String businessPermit = InputSanitizer.sanitizeOptionalText(request.getBusinessPermit(), "Business permit", 255);
        String description = InputSanitizer.sanitizeOptionalText(request.getDescription(), "Description", 2000);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        validatePassword(request.getPassword());

        // Validate role
        String role = request.getRole();
        InputSanitizer.requireNotBlank(role, "Role");
        role = role.trim().toUpperCase();
        if (!"MANUFACTURER".equals(role) && !"VENDOR".equals(role)) {
            throw new IllegalArgumentException("Role must be either 'MANUFACTURER' or 'VENDOR'.");
        }

        // Create user
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBusinessName(businessName);
        user.setBusinessAddress(businessAddress);
        user.setBusinessPermit(businessPermit);
        user.setDescription(description);
        user.setAuthProvider("LOCAL");

        // Persist PSGC codes if provided
        if (request.getRegionCode() != null) user.setRegionCode(request.getRegionCode());
        if (request.getProvinceCode() != null) user.setProvinceCode(request.getProvinceCode());
        if (request.getCityCode() != null) user.setCityCode(request.getCityCode());
        if (request.getBarangayCode() != null) user.setBarangayCode(request.getBarangayCode());
        if (request.getStreetAddress() != null) user.setStreetAddress(request.getStreetAddress());

        user = userRepository.save(user);

        // Create role-specific profile
        if ("MANUFACTURER".equals(role)) {
            String category = InputSanitizer.sanitizeCategory(request.getCategory());
            Manufacturer manufacturer = new Manufacturer();
            manufacturer.setUser(user);
            manufacturer.setCategory(category);
            manufacturerRepository.save(manufacturer);
        } else {
            String type = InputSanitizer.sanitizeVendorType(request.getType());
            Vendor vendor = new Vendor();
            vendor.setUser(user);
            vendor.setType(type);
            vendorRepository.save(vendor);
        }

        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(email, businessName, role);

        return user;
    }

    /**
     * Authenticate or create a user via Google OAuth.
     * Returns null if the user is new and no role was provided (needs role selection).
     */
    @Transactional
    public User authenticateWithGoogle(String email, String name, String pictureUrl, String role) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Returning user — update profile picture if changed
            User user = existingUser.get();
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicture())) {
                user.setProfilePicture(pictureUrl);
                userRepository.save(user);
            }
            return user;
        }

        // New user — need a role to complete registration
        if (role == null || role.isBlank()) {
            return null; // Signal that role selection is needed
        }

        role = role.trim().toUpperCase();
        if (!"MANUFACTURER".equals(role) && !"VENDOR".equals(role)) {
            throw new IllegalArgumentException("Role must be either 'MANUFACTURER' or 'VENDOR'.");
        }

        // Create new user with Google auth
        User user = new User();
        user.setEmail(email);
        user.setBusinessName(name != null ? name : email.split("@")[0]);
        user.setBusinessAddress(""); // Will be set during profile completion
        user.setAuthProvider("GOOGLE");
        user.setProfilePicture(pictureUrl);
        // Google users don't have a local password — generate a random one
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        user = userRepository.save(user);

        // Create role-specific profile
        if ("MANUFACTURER".equals(role)) {
            Manufacturer manufacturer = new Manufacturer();
            manufacturer.setUser(user);
            manufacturer.setCategory("General");
            manufacturerRepository.save(manufacturer);
        } else {
            Vendor vendor = new Vendor();
            vendor.setUser(user);
            vendor.setType("RETAIL");
            vendorRepository.save(vendor);
        }

        // Send welcome email
        emailService.sendWelcomeEmail(email, user.getBusinessName(), role);

        return user;
    }

    private void validatePassword(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.length() < 8) {
            errors.add("at least 8 characters");
        }
        if (!Pattern.compile("[A-Z]").matcher(password != null ? password : "").find()) {
            errors.add("one uppercase letter");
        }
        if (!Pattern.compile("[a-z]").matcher(password != null ? password : "").find()) {
            errors.add("one lowercase letter");
        }
        if (!Pattern.compile("[0-9]").matcher(password != null ? password : "").find()) {
            errors.add("one digit");
        }
        if (!Pattern.compile("[^a-zA-Z0-9]").matcher(password != null ? password : "").find()) {
            errors.add("one special character");
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(
                "Password does not meet the required criteria. It must have "
                + String.join(", ", errors.subList(0, errors.size() - 1))
                + (errors.size() > 1 ? ", and " + errors.get(errors.size() - 1) : errors.get(0))
                + "."
            );
        }
    }

    public User authenticate(LoginRequest request) {
        String email = InputSanitizer.sanitizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    public String getUserRole(User user) {
        if (manufacturerRepository.existsByUser(user)) {
            return "MANUFACTURER";
        } else if (vendorRepository.existsByUser(user)) {
            return "VENDOR";
        }
        return "UNKNOWN";
    }

    public User verifyRefreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        refreshToken = refreshTokenService.verifyExpiration(refreshToken);
        return refreshToken.getUser();
    }

    public void logout(String accessToken) {
        Instant expiry = jwtService.extractExpiration(accessToken).toInstant();
        tokenBlacklistService.blacklistToken(accessToken, expiry);

        String email = jwtService.extractEmail(accessToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        refreshTokenService.deleteByUser(user);
    }
}