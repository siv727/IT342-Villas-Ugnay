package edu.cit.villas.ugnay.features.samplerequest;

import edu.cit.villas.ugnay.features.email.MockEmailService;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.features.product.Product;
import edu.cit.villas.ugnay.features.samplerequest.RequestStatus;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequest;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestItem;
import edu.cit.villas.ugnay.shared.entity.Vendor;
import edu.cit.villas.ugnay.features.product.ProductRepository;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestRepository;

@Service
public class SampleRequestService {

    private final SampleRequestRepository sampleRequestRepository;
    private final ProductRepository productRepository;
    private final MockEmailService mockEmailService;

    public SampleRequestService(SampleRequestRepository sampleRequestRepository,
                                 ProductRepository productRepository,
                                 MockEmailService mockEmailService) {
        this.sampleRequestRepository = sampleRequestRepository;
        this.productRepository = productRepository;
        this.mockEmailService = mockEmailService;
    }

    @Transactional
    public SampleRequest createRequest(Vendor vendor, Manufacturer manufacturer,
                                        List<SampleRequestItemInput> itemInputs) {
        SampleRequest request = new SampleRequest();
        request.setVendor(vendor);
        request.setManufacturer(manufacturer);
        request.setRequestStatus(RequestStatus.PENDING);

        for (SampleRequestItemInput input : itemInputs) {
            Product product = productRepository.findById(input.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + input.productId()));

            SampleRequestItem item = new SampleRequestItem();
            item.setSampleRequest(request);
            item.setProduct(product);
            item.setQuantity(input.quantity());
            request.getItems().add(item);
        }

        SampleRequest saved = sampleRequestRepository.save(request);

        mockEmailService.sendStatusUpdateEmail(
                manufacturer.getUser().getEmail(),
                saved.getRequestId(),
                "PENDING — New request from " + vendor.getUser().getBusinessName()
        );

        return saved;
    }

    public List<SampleRequest> getRequestsByVendor(Vendor vendor, String status) {
        if (status != null && !status.isBlank()) {
            return sampleRequestRepository.findByVendorAndRequestStatusOrderByCreatedAtDesc(
                    vendor, RequestStatus.valueOf(status.toUpperCase()));
        }
        return sampleRequestRepository.findByVendorOrderByCreatedAtDesc(vendor);
    }

    public List<SampleRequest> getRequestsByManufacturer(Manufacturer manufacturer, String status) {
        if (status != null && !status.isBlank()) {
            return sampleRequestRepository.findByManufacturerAndRequestStatusOrderByCreatedAtDesc(
                    manufacturer, RequestStatus.valueOf(status.toUpperCase()));
        }
        return sampleRequestRepository.findByManufacturerOrderByCreatedAtDesc(manufacturer);
    }

    public SampleRequest getRequestById(Long id) {
        return sampleRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sample request not found"));
    }

    @Transactional
    public SampleRequest approveRequest(Long requestId, Manufacturer manufacturer, BigDecimal deliveryFee) {
        SampleRequest request = getRequestById(requestId);
        validateManufacturerOwnership(request, manufacturer);
        validateStatusTransition(request, RequestStatus.PENDING, "approve");

        request.setRequestStatus(RequestStatus.APPROVED);
        request.setDeliveryFee(deliveryFee);
        SampleRequest saved = sampleRequestRepository.save(request);

        mockEmailService.sendStatusUpdateEmail(
                request.getVendor().getUser().getEmail(), requestId, "APPROVED");

        return saved;
    }

    @Transactional
    public SampleRequest rejectRequest(Long requestId, Manufacturer manufacturer, String reason) {
        SampleRequest request = getRequestById(requestId);
        validateManufacturerOwnership(request, manufacturer);
        validateStatusTransition(request, RequestStatus.PENDING, "reject");

        request.setRequestStatus(RequestStatus.REJECTED);
        request.setRejectionReason(reason);
        SampleRequest saved = sampleRequestRepository.save(request);

        mockEmailService.sendStatusUpdateEmail(
                request.getVendor().getUser().getEmail(), requestId, "REJECTED");

        return saved;
    }

    @Transactional
    public SampleRequest cancelRequest(Long requestId, Vendor vendor) {
        SampleRequest request = getRequestById(requestId);

        if (!request.getVendor().getVendorId().equals(vendor.getVendorId())) {
            throw new IllegalArgumentException("Only the requesting vendor can cancel");
        }

        if (request.getRequestStatus() != RequestStatus.PENDING
                && request.getRequestStatus() != RequestStatus.APPROVED) {
            throw new IllegalArgumentException("Can only cancel PENDING or APPROVED requests");
        }

        request.setRequestStatus(RequestStatus.CANCELLED);
        return sampleRequestRepository.save(request);
    }

    @Transactional
    public SampleRequest updateStatus(Long requestId, Manufacturer manufacturer,
                                       RequestStatus newStatus, String trackingNumber) {
        SampleRequest request = getRequestById(requestId);
        validateManufacturerOwnership(request, manufacturer);

        // Validate status transitions
        switch (newStatus) {
            case SHIPPED:
                if (request.getRequestStatus() != RequestStatus.PAID) {
                    throw new IllegalArgumentException("Can only ship PAID requests");
                }
                if (trackingNumber != null) {
                    request.setTrackingNumber(trackingNumber);
                }
                break;
            case DELIVERED:
                if (request.getRequestStatus() != RequestStatus.SHIPPED) {
                    throw new IllegalArgumentException("Can only mark SHIPPED requests as delivered");
                }
                break;
            case COMPLETED:
                if (request.getRequestStatus() != RequestStatus.DELIVERED) {
                    throw new IllegalArgumentException("Can only complete DELIVERED requests");
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid status transition to: " + newStatus);
        }

        request.setRequestStatus(newStatus);
        SampleRequest saved = sampleRequestRepository.save(request);

        mockEmailService.sendStatusUpdateEmail(
                request.getVendor().getUser().getEmail(), requestId, newStatus.name());

        return saved;
    }

    @Transactional
    public SampleRequest markAsPaid(Long requestId, String paymentId) {
        SampleRequest request = getRequestById(requestId);

        if (request.getRequestStatus() != RequestStatus.APPROVED) {
            throw new IllegalArgumentException("Can only pay APPROVED requests");
        }

        request.setRequestStatus(RequestStatus.PAID);
        request.setPaymentId(paymentId);
        return sampleRequestRepository.save(request);
    }

    private void validateManufacturerOwnership(SampleRequest request, Manufacturer manufacturer) {
        if (!request.getManufacturer().getManufacturerId().equals(manufacturer.getManufacturerId())) {
            throw new IllegalArgumentException("You can only manage your own requests");
        }
    }

    private void validateStatusTransition(SampleRequest request, RequestStatus expectedCurrent, String action) {
        if (request.getRequestStatus() != expectedCurrent) {
            throw new IllegalArgumentException(
                    "Cannot " + action + " a request with status: " + request.getRequestStatus());
        }
    }

    // Record for conveying item input from controller
    public record SampleRequestItemInput(Long productId, Integer quantity) {}
}
