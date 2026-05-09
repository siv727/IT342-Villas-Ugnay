package edu.cit.villas.ugnay.features.connection;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.villas.ugnay.features.connection.Connection;
import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.shared.entity.Vendor;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    List<Connection> findByVendor(Vendor vendor);

    List<Connection> findByManufacturer(Manufacturer manufacturer);

    Optional<Connection> findByVendorAndManufacturer(Vendor vendor, Manufacturer manufacturer);

    boolean existsByVendorAndManufacturer(Vendor vendor, Manufacturer manufacturer);

    long countByManufacturer(Manufacturer manufacturer);
}
