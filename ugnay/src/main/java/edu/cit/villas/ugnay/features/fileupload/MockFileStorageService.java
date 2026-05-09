package edu.cit.villas.ugnay.features.fileupload;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

/**
 * Mock File Storage Service — simulates Cloudinary / Supabase Storage uploads.
 * Replace with real file storage integration when API keys are available.
 */
@Service
public class MockFileStorageService {

    public Map<String, Object> uploadFile(String originalFilename, String context) {
        String mockFileId = UUID.randomUUID().toString();
        String mockUrl = "https://storage.mock.ugnay.com/" + context.toLowerCase() + "/" + mockFileId;

        System.out.println("=== MOCK FILE UPLOAD ===");
        System.out.println("File: " + originalFilename);
        System.out.println("Context: " + context);
        System.out.println("Generated ID: " + mockFileId);
        System.out.println("Mock URL: " + mockUrl);
        System.out.println("========================");

        Map<String, Object> fileData = new HashMap<>();
        fileData.put("id", mockFileId);
        fileData.put("url", mockUrl);
        fileData.put("fileName", originalFilename);
        fileData.put("fileType", guessContentType(originalFilename));
        return fileData;
    }

    public Map<String, Object> getFile(String fileId) {
        System.out.println("=== MOCK FILE GET ===");
        System.out.println("File ID: " + fileId);
        System.out.println("=====================");

        Map<String, Object> fileData = new HashMap<>();
        fileData.put("id", fileId);
        fileData.put("url", "https://storage.mock.ugnay.com/files/" + fileId);
        fileData.put("fileName", "mock_file_" + fileId);
        fileData.put("fileType", "application/octet-stream");
        return fileData;
    }

    private String guessContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }
}
