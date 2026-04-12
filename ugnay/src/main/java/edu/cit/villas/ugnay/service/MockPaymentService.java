package edu.cit.villas.ugnay.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

/**
 * Mock Payment Service — simulates PayMongo sandbox flows.
 * Replace with real PayMongo API calls when secret key is available.
 */
@Service
public class MockPaymentService {

    public Map<String, Object> createPaymentIntent(Long sampleRequestId, double amount, String paymentMethod) {
        String mockPaymentId = "mock_pay_" + UUID.randomUUID().toString().substring(0, 8);
        String mockCheckoutUrl = "https://checkout.paymongo.com/mock/" + mockPaymentId;

        System.out.println("=== MOCK PAYMENT (Create Intent) ===");
        System.out.println("Request ID: " + sampleRequestId);
        System.out.println("Amount: ₱" + amount);
        System.out.println("Method: " + paymentMethod);
        System.out.println("Payment ID: " + mockPaymentId);
        System.out.println("Checkout URL: " + mockCheckoutUrl);
        System.out.println("====================================");

        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", mockPaymentId);
        result.put("checkoutUrl", mockCheckoutUrl);
        return result;
    }

    public Map<String, Object> confirmPayment(String paymentId) {
        System.out.println("=== MOCK PAYMENT (Confirm) ===");
        System.out.println("Payment ID: " + paymentId);
        System.out.println("Status: PAID (auto-confirmed)");
        System.out.println("==============================");

        Map<String, Object> payment = new HashMap<>();
        payment.put("id", paymentId);
        payment.put("status", "PAID");
        payment.put("amount", 0.0);

        Map<String, Object> result = new HashMap<>();
        result.put("payment", payment);
        return result;
    }

    public Map<String, Object> getPaymentByRequestId(Long sampleRequestId) {
        System.out.println("=== MOCK PAYMENT (Get by Request) ===");
        System.out.println("Request ID: " + sampleRequestId);
        System.out.println("=====================================");

        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", "mock_pay_" + sampleRequestId);
        result.put("status", "PAID");
        result.put("amount", 0.0);
        result.put("sampleRequestId", sampleRequestId);
        return result;
    }
}
