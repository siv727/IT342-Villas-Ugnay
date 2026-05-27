package edu.cit.villas.ugnay.features.samplerequest;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequest;
import edu.cit.villas.ugnay.features.samplerequest.RequestStatus;
import edu.cit.villas.ugnay.shared.entity.Vendor;

@Repository
public interface SampleRequestRepository extends JpaRepository<SampleRequest, Long> {

    List<SampleRequest> findByVendorOrderByCreatedAtDesc(Vendor vendor);

    List<SampleRequest> findByManufacturerOrderByCreatedAtDesc(Manufacturer manufacturer);

    List<SampleRequest> findByVendorAndRequestStatusOrderByCreatedAtDesc(Vendor vendor, RequestStatus status);

    List<SampleRequest> findByManufacturerAndRequestStatusOrderByCreatedAtDesc(Manufacturer manufacturer, RequestStatus status);

    long countByManufacturer(Manufacturer manufacturer);

    long countByVendor(Vendor vendor);

    long countByManufacturerAndRequestStatus(Manufacturer manufacturer, RequestStatus status);

    long countByVendorAndRequestStatus(Vendor vendor, RequestStatus status);

    Optional<SampleRequest> findByPaymentSessionId(String paymentSessionId);
}
