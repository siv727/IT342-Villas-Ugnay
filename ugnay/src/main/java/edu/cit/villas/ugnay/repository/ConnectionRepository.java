package edu.cit.villas.ugnay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.villas.ugnay.entity.Connection;
import edu.cit.villas.ugnay.entity.Manufacturer;
import edu.cit.villas.ugnay.entity.Vendor;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    List<Connection> findByVendor(Vendor vendor);

    List<Connection> findByManufacturer(Manufacturer manufacturer);

    Optional<Connection> findByVendorAndManufacturer(Vendor vendor, Manufacturer manufacturer);

    boolean existsByVendorAndManufacturer(Vendor vendor, Manufacturer manufacturer);

    long countByManufacturer(Manufacturer manufacturer);
}
