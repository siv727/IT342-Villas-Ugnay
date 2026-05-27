package edu.cit.villas.ugnay.features.samplerequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.villas.ugnay.shared.dto.ApiResponse;
import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.features.samplerequest.RequestStatus;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequest;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestItem;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.shared.entity.Vendor;
import edu.cit.villas.ugnay.shared.repository.ManufacturerRepository;
import edu.cit.villas.ugnay.shared.repository.VendorRepository;
import edu.cit.villas.ugnay.features.discovery.ManufacturerService;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestService;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestService.SampleRequestItemInput;

@RestController
@RequestMapping("/api/sample-requests")
public class SampleRequestController {

    private static final Logger log = LoggerFactory.getLogger(SampleRequestController.class);

    private final SampleRequestService sampleRequestService;
    private final ManufacturerService manufacturerService;
    private final ManufacturerRepository manufacturerRepository;
    private final VendorRepository vendorRepository;

    public SampleRequestController(SampleRequestService sampleRequestService,
                                    ManufacturerService manufacturerService,
                                    ManufacturerRepository manufacturerRepository,
                                    VendorRepository vendorRepository) {
        this.sampleRequestService = sampleRequestService;
        this.manufacturerService = manufacturerService;
        this.manufacturerRepository = manufacturerRepository;
        this.vendorRepository = vendorRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createRequest(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        try {
            log.info("=== CREATE SAMPLE REQUEST ===");
            log.info("User: {}", user != null ? user.getUsername() : "NULL");
            log.info("Body: {}", body);

            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

            Long manufacturerId = ((Number) body.get("manufacturerId")).longValue();
            Manufacturer manufacturer = manufacturerService.getManufacturerById(manufacturerId);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemMaps = (List<Map<String, Object>>) body.get("items");
            List<SampleRequestItemInput> items = new ArrayList<>();
            for (Map<String, Object> itemMap : itemMaps) {
                Long productId = ((Number) itemMap.get("productId")).longValue();
                Integer quantity = ((Number) itemMap.get("quantity")).intValue();
                items.add(new SampleRequestItemInput(productId, quantity));
            }

            log.info("Items count: {}", items.size());
            SampleRequest request = sampleRequestService.createRequest(vendor, manufacturer, items);
            log.info("=== REQUEST SAVED, ID: {} ===", request.getRequestId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toDetailMap(request)));
        } catch (IllegalArgumentException e) {
            log.warn("CREATE REQUEST VALIDATION ERROR: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        } catch (Exception e) {
            log.error("CREATE REQUEST ERROR", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status) {
        try {
            List<SampleRequest> requests;

            // Check if user is vendor or manufacturer and return appropriate requests
            if (vendorRepository.existsByUser(user)) {
                Vendor vendor = vendorRepository.findByUser(user).orElseThrow();
                requests = sampleRequestService.getRequestsByVendor(vendor, status);
            } else if (manufacturerRepository.existsByUser(user)) {
                Manufacturer manufacturer = manufacturerRepository.findByUser(user).orElseThrow();
                requests = sampleRequestService.getRequestsByManufacturer(manufacturer, status);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("AUTH-003", "No vendor or manufacturer profile found", null));
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("items", requests.stream().map(this::toListMap).toList());
            data.put("pagination", Map.of("page", 1, "size", requests.size(), "total", requests.size()));

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getRequest(@PathVariable Long id) {
        try {
            SampleRequest request = sampleRequestService.getRequestById(id);
            return ResponseEntity.ok(ApiResponse.success(toDetailMap(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Object>> approveRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Manufacturer profile not found"));

            BigDecimal deliveryFee = new BigDecimal(body.get("deliveryFee").toString());
            SampleRequest request = sampleRequestService.approveRequest(id, manufacturer, deliveryFee);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("status", request.getRequestStatus().name());
            data.put("deliveryFee", request.getDeliveryFee());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Object>> rejectRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Manufacturer profile not found"));

            String reason = body != null ? (String) body.get("reason") : null;
            SampleRequest request = sampleRequestService.rejectRequest(id, manufacturer, reason);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("status", request.getRequestStatus().name());
            data.put("reason", request.getRejectionReason());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Object>> cancelRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

            SampleRequest request = sampleRequestService.cancelRequest(id, vendor);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("status", request.getRequestStatus().name());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Object>> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Manufacturer profile not found"));

            RequestStatus newStatus = RequestStatus.valueOf(((String) body.get("status")).toUpperCase());
            String trackingNumber = (String) body.get("trackingNumber");

            SampleRequest request = sampleRequestService.updateStatus(id, manufacturer, newStatus, trackingNumber);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("status", request.getRequestStatus().name());
            data.put("trackingNumber", request.getTrackingNumber());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Object>> completeRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

            SampleRequest request = sampleRequestService.completeRequest(id, vendor);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("status", request.getRequestStatus().name());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/delivery-proof")
    public ResponseEntity<ApiResponse<Object>> updateDeliveryProof(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Manufacturer profile not found"));

            String proofUrl = (String) body.get("deliveryProofUrl");
            SampleRequest request = sampleRequestService.updateDeliveryProofUrl(id, manufacturer, proofUrl);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", request.getRequestId());
            data.put("deliveryProofUrl", request.getDeliveryProofUrl());
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS-001", e.getMessage(), null));
        }
    }

    // --- Mapping helpers ---

    private Map<String, Object> toListMap(SampleRequest r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getRequestId());
        map.put("vendorId", r.getVendor() != null ? r.getVendor().getVendorId() : null);
        map.put("vendorName", r.getVendor() != null && r.getVendor().getUser() != null ? r.getVendor().getUser().getBusinessName() : null);
        map.put("vendorEmail", r.getVendor() != null && r.getVendor().getUser() != null ? r.getVendor().getUser().getEmail() : null);
        map.put("manufacturerId", r.getManufacturer() != null ? r.getManufacturer().getManufacturerId() : null);
        map.put("items", r.getItems().stream().map(this::toItemMap).toList());
        map.put("status", r.getRequestStatus().name());
        map.put("deliveryFee", r.getDeliveryFee());
        map.put("trackingNumber", r.getTrackingNumber());
        map.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        return map;
    }

    private Map<String, Object> toDetailMap(SampleRequest r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getRequestId());
        map.put("vendorId", r.getVendor() != null ? r.getVendor().getVendorId() : null);
        map.put("vendorName", r.getVendor() != null && r.getVendor().getUser() != null ? r.getVendor().getUser().getBusinessName() : null);
        map.put("vendorEmail", r.getVendor() != null && r.getVendor().getUser() != null ? r.getVendor().getUser().getEmail() : null);
        map.put("manufacturerId", r.getManufacturer() != null ? r.getManufacturer().getManufacturerId() : null);
        map.put("items", r.getItems().stream().map(this::toItemMap).toList());
        map.put("status", r.getRequestStatus().name());
        map.put("deliveryFee", r.getDeliveryFee());
        map.put("paymentId", r.getPaymentId());
        map.put("trackingNumber", r.getTrackingNumber());
        map.put("deliveryProofUrl", r.getDeliveryProofUrl());
        map.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        map.put("updatedAt", r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null);
        return map;
    }

    private Map<String, Object> toItemMap(SampleRequestItem item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("productId", item.getProduct().getProductId());
        map.put("productName", item.getProduct().getName());
        map.put("quantity", item.getQuantity());
        return map;
    }
}
