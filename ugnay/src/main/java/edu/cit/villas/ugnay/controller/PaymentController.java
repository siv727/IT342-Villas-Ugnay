package edu.cit.villas.ugnay.controller;

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

import edu.cit.villas.ugnay.dto.ApiResponse;
import edu.cit.villas.ugnay.entity.SampleRequest;
import edu.cit.villas.ugnay.entity.User;
import edu.cit.villas.ugnay.service.MockPaymentService;
import edu.cit.villas.ugnay.service.SampleRequestService;

/**
 * Payment Controller — mock PayMongo integration.
 * Matches frontend paymentApi.ts endpoints.
 * Replace MockPaymentService calls with real PayMongo API when keys are available.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final MockPaymentService mockPaymentService;
    private final SampleRequestService sampleRequestService;

    public PaymentController(MockPaymentService mockPaymentService,
                              SampleRequestService sampleRequestService) {
        this.mockPaymentService = mockPaymentService;
        this.sampleRequestService = sampleRequestService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Object>> createPaymentIntent(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        try {
            Long sampleRequestId = ((Number) body.get("sampleRequestId")).longValue();
            String paymentMethod = (String) body.get("paymentMethod");

            SampleRequest request = sampleRequestService.getRequestById(sampleRequestId);
            double amount = request.getDeliveryFee() != null ? request.getDeliveryFee().doubleValue() : 0.0;

            Map<String, Object> result = mockPaymentService.createPaymentIntent(sampleRequestId, amount, paymentMethod);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PAYMENT-001", e.getMessage(), null));
        }
    }

    @GetMapping("/{paymentId}/confirm")
    public ResponseEntity<ApiResponse<Object>> confirmPayment(
            @AuthenticationPrincipal User user,
            @PathVariable String paymentId) {
        try {
            Map<String, Object> paymentResult = mockPaymentService.confirmPayment(paymentId);

            // In a real implementation, you would look up the request by paymentId.
            // For mock, return the confirmation result directly.
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("payment", paymentResult.get("payment"));
            data.put("sampleRequest", Map.of("id", "", "status", "PAID"));
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PAYMENT-001", e.getMessage(), null));
        }
    }

    @GetMapping("/sample-request/{sampleRequestId}")
    public ResponseEntity<ApiResponse<Object>> getPaymentByRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long sampleRequestId) {
        try {
            Map<String, Object> result = mockPaymentService.getPaymentByRequestId(sampleRequestId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PAYMENT-001", e.getMessage(), null));
        }
    }
}
