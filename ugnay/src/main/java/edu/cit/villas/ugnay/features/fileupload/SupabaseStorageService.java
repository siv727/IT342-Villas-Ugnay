package edu.cit.villas.ugnay.features.fileupload;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

/**
 * Supabase Storage Service — uploads files to a Supabase Storage bucket
 * via the REST API and returns public URLs.
 */
@Service
public class SupabaseStorageService {

    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${application.supabase.url}") String supabaseUrl,
            @Value("${application.supabase.service-key}") String serviceKey,
            @Value("${application.supabase.bucket}") String bucket) {
        this.supabaseUrl = supabaseUrl;
        this.serviceKey = serviceKey;
        this.bucket = bucket;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Upload a file to Supabase Storage.
     *
     * @param file    The multipart file to upload
     * @param context The context/folder: PRODUCT_IMAGE, DTI_CERT, DELIVERY_PROOF
     * @return Map with id, url, fileName, fileType
     */
    public Map<String, Object> uploadFile(MultipartFile file, String context) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String fileId = UUID.randomUUID().toString();
            String folderPath = mapContextToFolder(context);
            String storagePath = folderPath + "/" + fileId + extension;

            // Build the upload URL
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + storagePath;

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceKey);
            headers.set("apikey", serviceKey);
            headers.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            // Upload the file
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            // Construct the public URL
            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + storagePath;

            Map<String, Object> result = new HashMap<>();
            result.put("id", fileId);
            result.put("url", publicUrl);
            result.put("fileName", originalFilename);
            result.put("fileType", file.getContentType());

            System.out.println("File uploaded to Supabase: " + publicUrl);
            return result;

        } catch (Exception e) {
            System.err.println("Supabase upload failed: " + e.getMessage());
            throw new RuntimeException("Failed to upload file to Supabase Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Get public URL for a file by its storage path.
     */
    public Map<String, Object> getFile(String fileId) {
        // Since we store the public URL at upload time, this serves as a lookup helper
        String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/files/" + fileId;

        Map<String, Object> result = new HashMap<>();
        result.put("id", fileId);
        result.put("url", publicUrl);
        result.put("fileName", "file_" + fileId);
        result.put("fileType", "application/octet-stream");
        return result;
    }

    private String mapContextToFolder(String context) {
        if (context == null) return "files";
        return switch (context.toUpperCase()) {
            case "PRODUCT_IMAGE" -> "product-images";
            case "DTI_CERT" -> "dti-certs";
            case "DELIVERY_PROOF" -> "delivery-proofs";
            case "BUSINESS_PERMIT" -> "business-permits";
            default -> "files";
        };
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
