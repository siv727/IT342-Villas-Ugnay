package edu.cit.villas.ugnay.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.villas.ugnay.entity.Manufacturer;
import edu.cit.villas.ugnay.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByManufacturer(Manufacturer manufacturer, Pageable pageable);

    Page<Product> findByManufacturerAndCategory(Manufacturer manufacturer, String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchByName(@Param("query") String query);

    List<Product> findByManufacturerAndActiveTrue(Manufacturer manufacturer);

    Page<Product> findByCategory(String category, Pageable pageable);
}
