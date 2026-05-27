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

/**
 * File Upload Controller — Supabase Storage integration.
 * Matches frontend fileApi.ts endpoints.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final SupabaseStorageService storageService;

    public FileController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Object>> uploadFile(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam("context") String context) {
        try {
            Map<String, Object> fileData = storageService.uploadFile(file, context);

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
            Map<String, Object> fileData = storageService.getFile(id);
            return ResponseEntity.ok(ApiResponse.success(fileData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }
}
