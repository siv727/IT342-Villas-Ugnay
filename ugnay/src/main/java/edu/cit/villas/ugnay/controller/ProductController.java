package edu.cit.villas.ugnay.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import edu.cit.villas.ugnay.dto.ApiResponse;
import edu.cit.villas.ugnay.entity.Manufacturer;
import edu.cit.villas.ugnay.entity.Product;
import edu.cit.villas.ugnay.entity.User;
import edu.cit.villas.ugnay.service.ManufacturerService;
import edu.cit.villas.ugnay.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ManufacturerService manufacturerService;

    public ProductController(ProductService productService, ManufacturerService manufacturerService) {
        this.productService = productService;
        this.manufacturerService = manufacturerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getProducts(
            @RequestParam(required = false) Long manufacturerId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);
            Page<Product> productPage;

            if (manufacturerId != null) {
                Manufacturer manufacturer = manufacturerService.getManufacturerById(manufacturerId);
                productPage = productService.getProductsByManufacturer(manufacturer, category, pageable);
            } else {
                // Return all products (for vendor browsing)
                productPage = productService.getAllProducts(category, pageable);
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("items", productPage.getContent().stream().map(this::toMap).collect(Collectors.toList()));
            data.put("pagination", Map.of("page", page, "size", size, "total", productPage.getTotalElements()));

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    /** Returns products for the authenticated manufacturer */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Object>> getMyProducts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Manufacturer manufacturer = manufacturerService.getManufacturerByUser(user);
            Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);
            Page<Product> productPage = productService.getProductsByManufacturer(manufacturer, category, pageable);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("items", productPage.getContent().stream().map(this::toMap).collect(Collectors.toList()));
            data.put("pagination", Map.of("page", page, "size", size, "total", productPage.getTotalElements()));

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getProduct(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(ApiResponse.success(toDetailMap(product)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProducts(q);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", products.stream().map(this::toMap).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createProduct(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerService.getManufacturerByUser(user);

            String name = (String) body.get("name");
            String description = (String) body.get("description");
            BigDecimal price = new BigDecimal(body.get("price").toString());
            String unit = (String) body.get("unit");
            Integer stock = body.get("stock") != null ? ((Number) body.get("stock")).intValue() : 0;
            String category = (String) body.get("category");
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) body.get("imageUrls");

            Product product = productService.createProduct(manufacturer, name, description,
                    price, unit, stock, category, imageUrls);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toDetailMap(product)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateProduct(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Manufacturer manufacturer = manufacturerService.getManufacturerByUser(user);

            String name = (String) body.get("name");
            String description = (String) body.get("description");
            BigDecimal price = body.get("price") != null ? new BigDecimal(body.get("price").toString()) : null;
            String unit = (String) body.get("unit");
            Integer stock = body.get("stock") != null ? ((Number) body.get("stock")).intValue() : null;
            String category = (String) body.get("category");
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) body.get("imageUrls");

            Product product = productService.updateProduct(id, manufacturer, name, description,
                    price, unit, stock, category, imageUrls);
            return ResponseEntity.ok(ApiResponse.success(toDetailMap(product)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteProduct(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            Manufacturer manufacturer = manufacturerService.getManufacturerByUser(user);
            productService.deleteProduct(id, manufacturer);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Product deleted successfully")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALID-001", e.getMessage(), null));
        }
    }

    private Map<String, Object> toMap(Product p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getProductId());
        map.put("manufacturerId", p.getManufacturer().getManufacturerId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("unit", p.getUnit());
        map.put("imageUrl", p.getImageUrls() != null && !p.getImageUrls().isEmpty() ? p.getImageUrls().get(0) : null);
        map.put("imageUrls", p.getImageUrls());
        map.put("category", p.getCategory());
        map.put("stock", p.getStock());
        map.put("active", true);
        return map;
    }

    private Map<String, Object> toDetailMap(Product p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getProductId());
        map.put("manufacturerId", p.getManufacturer().getManufacturerId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("unit", p.getUnit());
        map.put("imageUrls", p.getImageUrls());
        map.put("category", p.getCategory());
        map.put("stock", p.getStock());
        return map;
    }
}
