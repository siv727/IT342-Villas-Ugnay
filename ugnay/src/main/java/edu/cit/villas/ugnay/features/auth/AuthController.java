package edu.cit.villas.ugnay.features.auth;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import edu.cit.villas.ugnay.features.auth.login.LoginRequest;
import edu.cit.villas.ugnay.features.auth.login.LoginResponse;
import edu.cit.villas.ugnay.features.auth.register.RegistrationRequest;
import edu.cit.villas.ugnay.shared.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${application.security.jwt.expiration}")
    private long accessTokenExpiration;

    @Value("${application.security.jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    public AuthController(AuthService authService, GoogleOAuthService googleOAuthService) {
        this.authService = authService;
        this.googleOAuthService = googleOAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest req,
            HttpServletResponse response) {
        try {
            User user = authService.registerUser(req);
            String role = authService.getUserRole(user);
            setTokenCookies(response, user);
            return ResponseEntity.ok(new LoginResponse(user.getUserId(), role, "Registration successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req,
            HttpServletResponse response) {
        try {
            User user = authService.authenticate(req);
            String role = authService.getUserRole(user);
            setTokenCookies(response, user);
            return ResponseEntity.ok(new LoginResponse(user.getUserId(), role, "Login successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> body,
            HttpServletResponse response) {
        try {
            String idToken = body.get("idToken");
            String role = body.get("role"); // null for returning users

            if (idToken == null || idToken.isBlank()) {
                return ResponseEntity.badRequest().body("ID token is required");
            }

            // Verify the Google ID token
            GoogleIdToken.Payload payload = googleOAuthService.verifyIdToken(idToken);
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // Authenticate or create user
            User user = authService.authenticateWithGoogle(email, name, picture, role);

            if (user == null) {
                // New user, needs role selection
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("needsRole", true);
                result.put("email", email);
                result.put("name", name);
                result.put("message", "Please select your role to complete registration");
                return ResponseEntity.ok(result);
            }

            String userRole = authService.getUserRole(user);
            setTokenCookies(response, user);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("userId", user.getUserId());
            result.put("role", userRole);
            result.put("message", "Google authentication successful");
            result.put("needsRole", false);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request,
            HttpServletResponse response) {
        try {
            String refreshTokenStr = extractCookie(request, "refreshToken");
            if (refreshTokenStr == null) {
                return ResponseEntity.badRequest().body("Refresh token not found");
            }

            User user = authService.verifyRefreshToken(refreshTokenStr);
            String role = authService.getUserRole(user);

            String newAccessToken = authService.getJwtService()
                    .generateToken(user.getEmail(), user.getUserId());
            Cookie accessCookie = createCookie("accessToken", newAccessToken,
                    (int) (accessTokenExpiration / 1000), "/");
            response.addCookie(accessCookie);

            return ResponseEntity.ok(new LoginResponse(user.getUserId(), role, "Token refreshed"));
        } catch (IllegalArgumentException e) {
            clearTokenCookies(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
            HttpServletResponse response) {
        try {
            String accessToken = extractCookie(request, "accessToken");
            if (accessToken != null) {
                authService.logout(accessToken);
            }
        } catch (Exception e) {
            // Even if blacklisting fails, still clear cookies
        }
        clearTokenCookies(response);
        return ResponseEntity.ok("Logged out successfully");
    }

    // --- Cookie helper methods ---

    private void setTokenCookies(HttpServletResponse response, User user) {
        String accessToken = authService.getJwtService()
                .generateToken(user.getEmail(), user.getUserId());
        RefreshToken refreshToken = authService.getRefreshTokenService()
                .createRefreshToken(user);

        Cookie accessCookie = createCookie("accessToken", accessToken,
                (int) (accessTokenExpiration / 1000), "/");
        Cookie refreshCookie = createCookie("refreshToken", refreshToken.getToken(),
                (int) (refreshTokenExpiration / 1000), "/api/auth");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = createCookie("accessToken", "", 0, "/");
        Cookie refreshCookie = createCookie("refreshToken", "", 0, "/api/auth");
        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private Cookie createCookie(String name, String value, int maxAgeSeconds, String path) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath(path);
        cookie.setMaxAge(maxAgeSeconds);
        return cookie;
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}