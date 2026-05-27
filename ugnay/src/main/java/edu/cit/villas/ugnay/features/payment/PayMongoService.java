package edu.cit.villas.ugnay.features.payment;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * PayMongo Service — creates Checkout Sessions and verifies payments
 * via the PayMongo Sandbox API.
 *
 * Uses the Checkout Session API for simplicity:
 * - Supports GCash, Card, and Bank Transfer in a single hosted page
 * - PayMongo handles all payment UI and PCI compliance
 */
@Service
public class PayMongoService {

    private final String apiUrl;
    private final String secretKey;
    private final RestTemplate restTemplate;

    public PayMongoService(
            @Value("${application.paymongo.api-url}") String apiUrl,
            @Value("${application.paymongo.secret-key}") String secretKey) {
        this.apiUrl = apiUrl;
        this.secretKey = secretKey;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a PayMongo Checkout Session.
     *
     * @param amountInCentavos Amount in centavos (e.g. 10000 = ₱100.00)
     * @param description      Description for the payment
     * @param successUrl       URL to redirect to after successful payment
     * @param cancelUrl        URL to redirect to if payment is cancelled
     * @return Map with checkoutUrl and sessionId
     */
    public Map<String, Object> createCheckoutSession(long amountInCentavos, String description,
                                                      String successUrl, String cancelUrl) {
        String url = apiUrl + "/checkout_sessions";

        // Build request body per PayMongo API spec
        Map<String, Object> lineItem = new LinkedHashMap<>();
        lineItem.put("currency", "PHP");
        lineItem.put("amount", amountInCentavos);
        lineItem.put("name", description);
        lineItem.put("quantity", 1);

        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("send_email_receipt", false);
        attributes.put("show_description", true);
        attributes.put("show_line_items", true);
        attributes.put("description", description);
        attributes.put("line_items", List.of(lineItem));
        attributes.put("payment_method_types", List.of("gcash", "card"));
        attributes.put("success_url", successUrl);
        attributes.put("cancel_url", cancelUrl);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("attributes", attributes);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("data", data);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, buildHeaders());

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                (Class<Map<String, Object>>) (Class<?>) Map.class);

        Map<String, Object> responseBody = response.getBody();
        @SuppressWarnings("unchecked")
        Map<String, Object> responseData = (Map<String, Object>) responseBody.get("data");
        @SuppressWarnings("unchecked")
        Map<String, Object> responseAttributes = (Map<String, Object>) responseData.get("attributes");

        String sessionId = (String) responseData.get("id");
        String checkoutUrl = (String) responseAttributes.get("checkout_url");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sessionId", sessionId);
        result.put("checkoutUrl", checkoutUrl);

        System.out.println("=== PAYMONGO CHECKOUT SESSION CREATED ===");
        System.out.println("Session ID: " + sessionId);
        System.out.println("Checkout URL: " + checkoutUrl);
        System.out.println("Amount: ₱" + (amountInCentavos / 100.0));
        System.out.println("==========================================");

        return result;
    }

    /**
     * Retrieve a Checkout Session to check payment status.
     *
     * @param sessionId The checkout session ID
     * @return Map with payment status details
     */
    public Map<String, Object> retrieveCheckoutSession(String sessionId) {
        String url = apiUrl + "/checkout_sessions/" + sessionId;

        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders());

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity,
                (Class<Map<String, Object>>) (Class<?>) Map.class);

        Map<String, Object> responseBody = response.getBody();
        System.out.println("=== PAYMONGO RETRIEVE SESSION RAW RESPONSE ===");
        System.out.println(responseBody);
        System.out.println("===============================================");

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
        @SuppressWarnings("unchecked")
        Map<String, Object> attributes = (Map<String, Object>) data.get("attributes");

        @SuppressWarnings("unchecked")
        List<Object> payments = (List<Object>) attributes.get("payments");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sessionId", sessionId);
        result.put("status", attributes.get("status"));

        if (payments != null && !payments.isEmpty()) {
            // PayMongo may return payment objects directly or wrapped in { "data": ... }
            @SuppressWarnings("unchecked")
            Map<String, Object> firstPaymentRaw = (Map<String, Object>) payments.get(0);
            Map<String, Object> firstPayment = firstPaymentRaw;

            // If wrapped in "data", unwrap it
            if (firstPaymentRaw.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> unwrapped = (Map<String, Object>) firstPaymentRaw.get("data");
                firstPayment = unwrapped;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> paymentAttributes = (Map<String, Object>) firstPayment.get("attributes");

            result.put("paymentId", firstPayment.get("id"));
            if (paymentAttributes != null) {
                result.put("paymentStatus", paymentAttributes.get("status"));
                result.put("paidAmount", paymentAttributes.get("amount"));
            }
        }

        // Also check the top-level session status for "paid"
        String sessionStatus = (String) attributes.get("status");
        if ("paid".equalsIgnoreCase(sessionStatus) && !result.containsKey("paymentStatus")) {
            result.put("paymentStatus", "paid");
        }

        System.out.println("Parsed payment result: " + result);
        return result;
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        // PayMongo uses Basic Auth: secret key as username, blank password
        String auth = secretKey + ":";
        String encodedAuth = Base64.getEncoder()
                .encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);

        return headers;
    }
}
