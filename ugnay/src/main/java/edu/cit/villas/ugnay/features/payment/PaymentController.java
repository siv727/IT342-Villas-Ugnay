package edu.cit.villas.ugnay.features.payment;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.villas.ugnay.features.email.EmailService;
import edu.cit.villas.ugnay.shared.dto.ApiResponse;
import edu.cit.villas.ugnay.features.samplerequest.RequestStatus;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequest;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestRepository;
import edu.cit.villas.ugnay.features.samplerequest.SampleRequestService;

/**
 * Payment Controller — PayMongo Checkout Session integration (sandbox).
 * Creates checkout sessions, verifies payments after redirect, and
 * updates sample request status + sends invoice emails.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PayMongoService payMongoService;
    private final SampleRequestService sampleRequestService;
    private final SampleRequestRepository sampleRequestRepository;
    private final EmailService emailService;

    public PaymentController(PayMongoService payMongoService,
                              SampleRequestService sampleRequestService,
                              SampleRequestRepository sampleRequestRepository,
                              EmailService emailService) {
        this.payMongoService = payMongoService;
        this.sampleRequestService = sampleRequestService;
        this.sampleRequestRepository = sampleRequestRepository;
        this.emailService = emailService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Object>> createCheckoutSession(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        try {
            Long sampleRequestId = ((Number) body.get("sampleRequestId")).longValue();
            String paymentMethod = (String) body.get("paymentMethod");

            SampleRequest request = sampleRequestService.getRequestById(sampleRequestId);
            double amount = request.getDeliveryFee() != null ? request.getDeliveryFee().doubleValue() : 0.0;

            if (amount <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("PAYMENT-002", "Delivery fee must be greater than 0", null));
            }

            long amountInCentavos = (long) (amount * 100);
            String description = "Ugnay Sample Request #" + sampleRequestId + " Delivery Fee";

            // Build success/cancel URLs
            String successUrl = "http://localhost:5173/payment/result?request_id=" + sampleRequestId;
            String cancelUrl = "http://localhost:5173/vendor/requests";

            Map<String, Object> session = payMongoService.createCheckoutSession(
                    amountInCentavos, description, successUrl, cancelUrl);

            // Store session ID on the sample request
            request.setPaymentSessionId((String) session.get("sessionId"));
            sampleRequestRepository.save(request);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("checkoutUrl", session.get("checkoutUrl"));
            result.put("sessionId", session.get("sessionId"));
            result.put("paymentId", session.get("sessionId")); // For backward compat with frontend
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PAYMENT-001", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PAYMENT-003", "Failed to create checkout session: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{sessionId}/confirm")
    public ResponseEntity<ApiResponse<Object>> confirmPayment(
            @AuthenticationPrincipal User user,
            @PathVariable String sessionId) {
        try {
            Map<String, Object> sessionData = payMongoService.retrieveCheckoutSession(sessionId);

            // Find the sample request by session ID
            SampleRequest request = sampleRequestRepository.findByPaymentSessionId(sessionId)
                    .orElse(null);

            String paymentStatus = (String) sessionData.get("paymentStatus");
            boolean isPaid = "paid".equalsIgnoreCase(paymentStatus);

            // Update sample request status if paid
            if (isPaid && request != null && request.getRequestStatus() != RequestStatus.PAID) {
                String paymentId = sessionData.get("paymentId") != null
                        ? (String) sessionData.get("paymentId") : sessionId;
                sampleRequestService.markAsPaid(request.getRequestId(), paymentId);
                // Reload after service update
                request = sampleRequestService.getRequestById(request.getRequestId());

                // Send invoice email to BOTH vendor and manufacturer
                double amount = request.getDeliveryFee() != null ? request.getDeliveryFee().doubleValue() : 0.0;
                String itemsSummary = "Sample Request #" + request.getRequestId();
                String vendorEmail = request.getVendor().getUser().getEmail();
                String manufacturerEmail = request.getManufacturer().getUser().getEmail();
                emailService.sendInvoiceEmail(vendorEmail, sessionId, itemsSummary, amount, "PayMongo Checkout");
                emailService.sendInvoiceEmail(manufacturerEmail, sessionId, itemsSummary, amount, "PayMongo Checkout");
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("payment", Map.of(
                    "id", sessionData.getOrDefault("paymentId", sessionId),
                    "status", isPaid ? "PAID" : "PENDING",
                    "amount", sessionData.getOrDefault("paidAmount", 0)
            ));
            data.put("sampleRequest", Map.of(
                    "id", request != null ? request.getRequestId() : "",
                    "status", request != null ? request.getRequestStatus().name() : "UNKNOWN"
            ));
            return ResponseEntity.ok(ApiResponse.success(data));

        } catch (Exception e) {
            System.err.println("Payment confirmation failed for session: " + sessionId);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PAYMENT-001", "Failed to verify payment: " + e.getMessage(), null));
        }
    }

    @GetMapping("/sample-request/{sampleRequestId}")
    public ResponseEntity<ApiResponse<Object>> getPaymentByRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long sampleRequestId) {
        try {
            SampleRequest request = sampleRequestService.getRequestById(sampleRequestId);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("paymentId", request.getPaymentId());
            result.put("sessionId", request.getPaymentSessionId());
            result.put("status", request.getRequestStatus().name());
            result.put("amount", request.getDeliveryFee() != null ? request.getDeliveryFee().doubleValue() : 0.0);
            result.put("sampleRequestId", sampleRequestId);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PAYMENT-001", e.getMessage(), null));
        }
    }

    /**
     * Confirm payment using sample request ID instead of session ID.
     * The frontend redirects here after PayMongo checkout.
     */
    @GetMapping("/confirm-by-request/{requestId}")
    public ResponseEntity<ApiResponse<Object>> confirmPaymentByRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId) {
        try {
            SampleRequest request = sampleRequestService.getRequestById(requestId);
            String sessionId = request.getPaymentSessionId();

            if (sessionId == null || sessionId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("PAYMENT-004", "No payment session found for this request", null));
            }

            // Delegate to the existing session-based confirm logic
            Map<String, Object> sessionData = payMongoService.retrieveCheckoutSession(sessionId);

            String paymentStatus = (String) sessionData.get("paymentStatus");
            boolean isPaid = "paid".equalsIgnoreCase(paymentStatus);

            if (isPaid && request.getRequestStatus() != RequestStatus.PAID) {
                String paymentId = sessionData.get("paymentId") != null
                        ? (String) sessionData.get("paymentId") : sessionId;
                sampleRequestService.markAsPaid(request.getRequestId(), paymentId);
                // Reload after service update
                request = sampleRequestService.getRequestById(request.getRequestId());

                // Send invoice email to BOTH vendor and manufacturer
                double amount = request.getDeliveryFee() != null ? request.getDeliveryFee().doubleValue() : 0.0;
                String itemsSummary = "Sample Request #" + request.getRequestId();
                String vendorEmail = request.getVendor().getUser().getEmail();
                String manufacturerEmail = request.getManufacturer().getUser().getEmail();
                emailService.sendInvoiceEmail(vendorEmail, sessionId, itemsSummary, amount, "PayMongo Checkout");
                emailService.sendInvoiceEmail(manufacturerEmail, sessionId, itemsSummary, amount, "PayMongo Checkout");
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("payment", Map.of(
                    "id", sessionData.getOrDefault("paymentId", sessionId),
                    "status", isPaid ? "PAID" : "PENDING",
                    "amount", sessionData.getOrDefault("paidAmount", 0)
            ));
            data.put("sampleRequest", Map.of(
                    "id", request.getRequestId(),
                    "status", request.getRequestStatus().name()
            ));
            return ResponseEntity.ok(ApiResponse.success(data));

        } catch (Exception e) {
            System.err.println("Payment confirmation by request failed: " + requestId);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PAYMENT-001", "Failed to verify payment: " + e.getMessage(), null));
        }
    }
}
