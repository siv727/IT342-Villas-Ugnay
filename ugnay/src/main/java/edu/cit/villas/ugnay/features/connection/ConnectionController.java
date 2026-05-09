package edu.cit.villas.ugnay.features.connection;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.villas.ugnay.shared.dto.ApiResponse;
import edu.cit.villas.ugnay.features.connection.Connection;
import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.shared.entity.Vendor;
import edu.cit.villas.ugnay.shared.repository.ManufacturerRepository;
import edu.cit.villas.ugnay.shared.repository.VendorRepository;
import edu.cit.villas.ugnay.features.connection.ConnectionService;
import edu.cit.villas.ugnay.features.discovery.ManufacturerService;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;
    private final ManufacturerService manufacturerService;
    private final VendorRepository vendorRepository;
    private final ManufacturerRepository manufacturerRepository;

    public ConnectionController(ConnectionService connectionService,
                                 ManufacturerService manufacturerService,
                                 VendorRepository vendorRepository,
                                 ManufacturerRepository manufacturerRepository) {
        this.connectionService = connectionService;
        this.manufacturerService = manufacturerService;
        this.vendorRepository = vendorRepository;
        this.manufacturerRepository = manufacturerRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> saveConnection(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        try {
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

            Long manufacturerId = ((Number) body.get("manufacturerId")).longValue();
            Manufacturer manufacturer = manufacturerService.getManufacturerById(manufacturerId);

            Connection connection = connectionService.saveConnection(vendor, manufacturer);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", connection.getConnectionId());
            data.put("vendorId", connection.getVendor().getVendorId());
            data.put("manufacturerId", connection.getManufacturer().getManufacturerId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getConnections(@AuthenticationPrincipal User user) {
        try {
            List<Connection> connections;
            boolean isManufacturer = false;

            if (vendorRepository.existsByUser(user)) {
                Vendor vendor = vendorRepository.findByUser(user).orElseThrow();
                connections = connectionService.getConnectionsByVendor(vendor);
            } else if (manufacturerRepository.existsByUser(user)) {
                Manufacturer manufacturer = manufacturerRepository.findByUser(user).orElseThrow();
                connections = connectionService.getConnectionsByManufacturer(manufacturer);
                isManufacturer = true;
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("AUTH-003", "No profile found", null));
            }

            final boolean showVendor = isManufacturer;
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("items", connections.stream().map(c -> toMap(c, showVendor)).collect(Collectors.toList()));
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SYSTEM-001", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> removeConnection(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

            connectionService.removeConnection(id, vendor);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Connection removed successfully")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    /**
     * @param showVendor if true, display vendor info (manufacturer is viewing).
     *                   if false, display manufacturer info (vendor is viewing).
     */
    private Map<String, Object> toMap(Connection c, boolean showVendor) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", c.getConnectionId());
        map.put("manufacturerId", c.getManufacturer().getManufacturerId());
        map.put("vendorId", c.getVendor().getVendorId());

        if (showVendor) {
            // Manufacturer is viewing — show vendor info
            map.put("businessName", c.getVendor().getUser().getBusinessName());
            map.put("category", c.getVendor().getType());
            map.put("businessAddress", c.getVendor().getUser().getBusinessAddress());
        } else {
            // Vendor is viewing — show manufacturer info
            map.put("businessName", c.getManufacturer().getUser().getBusinessName());
            map.put("category", c.getManufacturer().getCategory());
            map.put("businessAddress", c.getManufacturer().getUser().getBusinessAddress());
        }
        return map;
    }
}
