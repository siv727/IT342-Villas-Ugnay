package edu.cit.villas.ugnay.features.email;

import org.springframework.stereotype.Service;

/**
 * Mock Email Service — logs actions to console.
 * Replace with Gmail SMTP (JavaMailSender) when API keys are available.
 */
@Service
public class MockEmailService {

    public void sendWelcomeEmail(String recipientEmail, String businessName) {
        System.out.println("=== MOCK EMAIL ===");
        System.out.println("To: " + recipientEmail);
        System.out.println("Subject: Welcome to Ugnay, " + businessName + "!");
        System.out.println("Body: Your account has been created successfully.");
        System.out.println("==================");
    }

    public void sendInvoiceEmail(String recipientEmail, String transactionId,
                                  String itemsSummary, double deliveryFee, String paymentMethod) {
        System.out.println("=== MOCK EMAIL (Invoice) ===");
        System.out.println("To: " + recipientEmail);
        System.out.println("Subject: Payment Receipt — " + transactionId);
        System.out.println("Items: " + itemsSummary);
        System.out.println("Delivery Fee: ₱" + deliveryFee);
        System.out.println("Method: " + paymentMethod);
        System.out.println("============================");
    }

    public void sendStatusUpdateEmail(String recipientEmail, Long requestId, String newStatus) {
        System.out.println("=== MOCK EMAIL (Status Update) ===");
        System.out.println("To: " + recipientEmail);
        System.out.println("Subject: Request #" + requestId + " is now " + newStatus);
        System.out.println("==================================");
    }
}
