package edu.cit.villas.ugnay.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.villas.ugnay.dto.ApiResponse;
import edu.cit.villas.ugnay.entity.Manufacturer;
import edu.cit.villas.ugnay.service.ManufacturerService;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;

    public ManufacturerController(ManufacturerService manufacturerService) {
        this.manufacturerService = manufacturerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listManufacturers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Manufacturer> all = manufacturerService.getAllManufacturers();

        // Apply filters
        List<Manufacturer> filtered = all.stream()
                .filter(m -> {
                    if (category != null && !category.isBlank()) {
                        return m.getCategory().equalsIgnoreCase(category);
                    }
                    return true;
                })
                .filter(m -> {
                    if (q != null && !q.isBlank()) {
                        String lower = q.toLowerCase();
                        return m.getUser().getBusinessName().toLowerCase().contains(lower)
                                || m.getCategory().toLowerCase().contains(lower);
                    }
                    return true;
                })
                .collect(Collectors.toList());

        int total = filtered.size();
        int startIndex = Math.min((page - 1) * size, total);
        int endIndex = Math.min(startIndex + size, total);
        List<Manufacturer> paged = filtered.subList(startIndex, endIndex);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", paged.stream().map(this::toListMap).collect(Collectors.toList()));
        data.put("pagination", Map.of("page", page, "size", size, "total", total));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getManufacturer(@PathVariable Long id) {
        try {
            Manufacturer m = manufacturerService.getManufacturerById(id);
            return ResponseEntity.ok(ApiResponse.success(toDetailMap(m)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchManufacturers(
            @RequestParam String q,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city) {

        List<Manufacturer> all = manufacturerService.getAllManufacturers();
        String lower = q.toLowerCase();

        List<Manufacturer> results = all.stream()
                .filter(m -> m.getUser().getBusinessName().toLowerCase().contains(lower)
                        || m.getCategory().toLowerCase().contains(lower))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", results.stream().map(this::toListMap).collect(Collectors.toList()));
        data.put("pagination", Map.of("page", 1, "size", results.size(), "total", results.size()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private Map<String, Object> toListMap(Manufacturer m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getManufacturerId());
        map.put("businessName", m.getUser().getBusinessName());
        map.put("category", m.getCategory());
        map.put("businessAddress", m.getUser().getBusinessAddress());
        map.put("description", m.getUser().getDescription());
        return map;
    }

    private Map<String, Object> toDetailMap(Manufacturer m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getManufacturerId());
        map.put("businessName", m.getUser().getBusinessName());
        map.put("description", m.getUser().getDescription());
        map.put("businessAddress", m.getUser().getBusinessAddress());
        map.put("businessPermit", m.getUser().getBusinessPermit());
        map.put("category", m.getCategory());
        map.put("email", m.getUser().getEmail());
        return map;
    }
}
