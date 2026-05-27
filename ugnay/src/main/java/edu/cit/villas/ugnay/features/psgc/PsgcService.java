package edu.cit.villas.ugnay.features.psgc;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Proxies PSGC (Philippine Standard Geographic Code) API calls
 * with in-memory caching since geographic data rarely changes.
 */
@Service
public class PsgcService {

    private final String apiUrl;
    private final RestTemplate restTemplate;
    private final Map<String, List<Map<String, Object>>> cache = new ConcurrentHashMap<>();

    public PsgcService(@Value("${application.psgc.api-url}") String apiUrl) {
        this.apiUrl = apiUrl;
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> getRegions() {
        return cachedGet("regions", apiUrl + "/regions");
    }

    public List<Map<String, Object>> getProvinces(String regionCode) {
        return cachedGet("provinces-" + regionCode,
                apiUrl + "/regions/" + regionCode + "/provinces");
    }

    public List<Map<String, Object>> getCitiesMunicipalities(String provinceCode) {
        return cachedGet("cities-" + provinceCode,
                apiUrl + "/provinces/" + provinceCode + "/cities-municipalities");
    }

    public List<Map<String, Object>> getBarangays(String cityCode) {
        return cachedGet("barangays-" + cityCode,
                apiUrl + "/cities-municipalities/" + cityCode + "/barangays");
    }

    private List<Map<String, Object>> cachedGet(String cacheKey, String url) {
        return cache.computeIfAbsent(cacheKey, k -> {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody();
        });
    }
}
