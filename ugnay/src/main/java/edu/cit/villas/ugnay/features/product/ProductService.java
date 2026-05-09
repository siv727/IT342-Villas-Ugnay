package edu.cit.villas.ugnay.features.product;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.features.product.Product;
import edu.cit.villas.ugnay.features.product.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> getProductsByManufacturer(Manufacturer manufacturer, String category, Pageable pageable) {
        if (category != null && !category.isBlank()) {
            return productRepository.findByManufacturerAndCategory(manufacturer, category, pageable);
        }
        return productRepository.findByManufacturer(manufacturer, pageable);
    }

    public Page<Product> getAllProducts(String category, Pageable pageable) {
        if (category != null && !category.isBlank()) {
            return productRepository.findByCategory(category, pageable);
        }
        return productRepository.findAll(pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchByName(query);
    }

    @Transactional
    public Product createProduct(Manufacturer manufacturer, String name, String description,
                                  BigDecimal price, String unit, Integer stock,
                                  String category, List<String> imageUrls) {
        Product product = new Product();
        product.setManufacturer(manufacturer);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setUnit(unit);
        product.setStock(stock != null ? stock : 0);
        product.setCategory(category);
        product.setImageUrls(imageUrls);
        product.setActive(true);
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long productId, Manufacturer manufacturer, String name,
                                  String description, BigDecimal price, String unit,
                                  Integer stock, String category, List<String> imageUrls) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getManufacturer().getManufacturerId().equals(manufacturer.getManufacturerId())) {
            throw new IllegalArgumentException("You can only update your own products");
        }

        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        if (unit != null) product.setUnit(unit);
        if (stock != null) product.setStock(stock);
        if (category != null) product.setCategory(category);
        if (imageUrls != null) product.setImageUrls(imageUrls);

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long productId, Manufacturer manufacturer) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getManufacturer().getManufacturerId().equals(manufacturer.getManufacturerId())) {
            throw new IllegalArgumentException("You can only delete your own products");
        }

        productRepository.delete(product);
    }

    public long countByManufacturer(Manufacturer manufacturer) {
        return productRepository.findByManufacturerAndActiveTrue(manufacturer).size();
    }
}
