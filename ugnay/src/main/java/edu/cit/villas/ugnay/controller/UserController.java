package edu.cit.villas.ugnay.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.villas.ugnay.dto.ApiResponse;
import edu.cit.villas.ugnay.entity.User;
import edu.cit.villas.ugnay.repository.UserRepository;

/**
 * User Profile Controller — matches frontend profileApi.ts endpoints.
 * GET /api/user/{id}  — get user profile
 * PUT /api/user/{id}  — update user profile
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            return ResponseEntity.ok(toProfileMap(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            if (!currentUser.getUserId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("AUTH-003", "You can only update your own profile", null));
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (body.containsKey("businessName")) user.setBusinessName((String) body.get("businessName"));
            if (body.containsKey("businessAddress")) user.setBusinessAddress((String) body.get("businessAddress"));
            if (body.containsKey("businessPermit")) user.setBusinessPermit((String) body.get("businessPermit"));
            if (body.containsKey("description")) user.setDescription((String) body.get("description"));

            User saved = userRepository.save(user);
            return ResponseEntity.ok(toProfileMap(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    private Map<String, Object> toProfileMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", user.getUserId());
        map.put("email", user.getEmail());
        map.put("businessName", user.getBusinessName());
        map.put("businessAddress", user.getBusinessAddress());
        map.put("businessPermit", user.getBusinessPermit());
        map.put("description", user.getDescription());
        return map;
    }
}
