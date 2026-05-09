package edu.cit.villas.ugnay.shared.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.shared.entity.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUser(User user);
    boolean existsByUser(User user);
}