package edu.cit.villas.ugnay.features.fileupload;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.cit.villas.ugnay.shared.dto.ApiResponse;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.features.fileupload.MockFileStorageService;

/**
 * File Upload Controller — mock Cloudinary / Supabase Storage integration.
 * Matches frontend fileApi.ts endpoints.
 * Replace MockFileStorageService calls with real storage when keys are available.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final MockFileStorageService mockFileStorageService;

    public FileController(MockFileStorageService mockFileStorageService) {
        this.mockFileStorageService = mockFileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Object>> uploadFile(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam("context") String context) {
        try {
            String originalFilename = file.getOriginalFilename();
            Map<String, Object> fileData = mockFileStorageService.uploadFile(originalFilename, context);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("file", fileData);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getFile(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            Map<String, Object> fileData = mockFileStorageService.getFile(id);
            return ResponseEntity.ok(ApiResponse.success(fileData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }
}
