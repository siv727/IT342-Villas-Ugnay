package edu.cit.villas.ugnay.features.psgc;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * PSGC Controller — proxies Philippine geographic location data.
 * Public endpoints (no auth needed) for use during registration.
 */
@RestController
@RequestMapping("/api/psgc")
public class PsgcController {

    private final PsgcService psgcService;

    public PsgcController(PsgcService psgcService) {
        this.psgcService = psgcService;
    }

    @GetMapping("/regions")
    public ResponseEntity<List<Map<String, Object>>> getRegions() {
        return ResponseEntity.ok(psgcService.getRegions());
    }

    @GetMapping("/regions/{regionCode}/provinces")
    public ResponseEntity<List<Map<String, Object>>> getProvinces(@PathVariable String regionCode) {
        return ResponseEntity.ok(psgcService.getProvinces(regionCode));
    }

    @GetMapping("/provinces/{provinceCode}/cities-municipalities")
    public ResponseEntity<List<Map<String, Object>>> getCitiesMunicipalities(@PathVariable String provinceCode) {
        return ResponseEntity.ok(psgcService.getCitiesMunicipalities(provinceCode));
    }

    @GetMapping("/cities-municipalities/{cityCode}/barangays")
    public ResponseEntity<List<Map<String, Object>>> getBarangays(@PathVariable String cityCode) {
        return ResponseEntity.ok(psgcService.getBarangays(cityCode));
    }
}
