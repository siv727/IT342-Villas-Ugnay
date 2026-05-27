package edu.cit.villas.ugnay.features.email;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email Service — sends real emails via Gmail SMTP using JavaMailSender.
 * All methods are @Async so email sending doesn't block API responses.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendWelcomeEmail(String recipientEmail, String businessName, String role) {
        String subject = "Welcome to Ugnay, " + businessName + "!";

        boolean isManufacturer = "MANUFACTURER".equalsIgnoreCase(role);
        String roleLabel = isManufacturer ? "Manufacturer" : "Vendor";
        String roleBadgeColor = isManufacturer ? "#0047AB" : "#50C878";
        String bulletPoints;

        if (isManufacturer) {
            bulletPoints = """
                            <li>List your products and manage your catalog</li>
                            <li>Receive and manage sample requests from vendors</li>
                            <li>Process payments and manage shipments</li>
                            <li>Grow your business with vendor connections</li>
                        """;
        } else {
            bulletPoints = """
                            <li>Discover manufacturers across the Philippines</li>
                            <li>Browse product catalogs</li>
                            <li>Request product samples</li>
                            <li>Track your orders end-to-end</li>
                        """;
        }

        String htmlContent = """
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: #0047AB; padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Ugnay</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">B2B Supply Chain Platform</p>
                    </div>
                    <div style="padding: 32px;">
                        <h2 style="color: #1a1a2e; margin: 0 0 16px;">Welcome, %s!</h2>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="background: %s; color: white; padding: 6px 18px; border-radius: 16px; font-size: 13px; font-weight: 600;">%s Account</span>
                        </div>
                        <p style="color: #6b7280; line-height: 1.6;">
                            Your account has been created successfully on Ugnay. Here's what you can do:
                        </p>
                        <ul style="color: #6b7280; line-height: 2;">
                            %s
                        </ul>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="http://localhost:5173/" style="background: #0047AB; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
                            This email was sent by Ugnay B2B Platform. If you didn't create this account, please ignore this email.
                        </p>
                    </div>
                </div>
                """.formatted(businessName, roleBadgeColor, roleLabel, bulletPoints);

        sendHtmlEmail(recipientEmail, subject, htmlContent);
    }

    @Async
    public void sendInvoiceEmail(String recipientEmail, String transactionId,
                                  String itemsSummary, double deliveryFee, String paymentMethod) {
        String subject = "Payment Receipt — " + transactionId;
        String htmlContent = """
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: #0047AB; padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Ugnay</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Payment Confirmation</p>
                    </div>
                    <div style="padding: 32px;">
                        <h2 style="color: #1a1a2e; margin: 0 0 16px;">Payment Received</h2>
                        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 16px 0;">
                            <table style="width: 100%%; color: #374151; font-size: 14px;">
                                <tr><td style="padding: 8px 0; color: #6b7280;">Transaction ID</td><td style="text-align: right; font-weight: 600;">%s</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Items</td><td style="text-align: right;">%s</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Delivery Fee</td><td style="text-align: right;">₱%.2f</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Payment Method</td><td style="text-align: right;">%s</td></tr>
                            </table>
                        </div>
                        <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
                            Your payment has been successfully processed. The manufacturer will prepare your sample order for shipment.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
                            This is an automated receipt from Ugnay B2B Platform.
                        </p>
                    </div>
                </div>
                """.formatted(transactionId, itemsSummary, deliveryFee, paymentMethod);

        sendHtmlEmail(recipientEmail, subject, htmlContent);
    }

    @Async
    public void sendStatusUpdateEmail(String recipientEmail, Long requestId, String newStatus) {
        String subject = "Request #" + requestId + " is now " + newStatus;
        String htmlContent = """
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: #0047AB; padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Ugnay</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Status Update</p>
                    </div>
                    <div style="padding: 32px;">
                        <h2 style="color: #1a1a2e; margin: 0 0 16px;">Order Status Updated</h2>
                        <p style="color: #6b7280; line-height: 1.6;">
                            Your sample request <strong>#%d</strong> has been updated to:
                        </p>
                        <div style="text-align: center; margin: 24px 0;">
                            <span style="background: #50C878; color: white; padding: 8px 24px; border-radius: 20px; font-weight: 600; font-size: 16px;">
                                %s
                            </span>
                        </div>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="http://localhost:5173/" style="background: #0047AB; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
                """.formatted(requestId, newStatus);

        sendHtmlEmail(recipientEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            System.out.println("Attempting to send email to: " + to + " | Subject: " + subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("ugnay.biz51273@gmail.com", "Ugnay Platform");
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error sending email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
