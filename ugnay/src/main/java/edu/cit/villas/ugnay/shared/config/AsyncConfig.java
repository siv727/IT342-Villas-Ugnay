package edu.cit.villas.ugnay.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables @Async annotation support for async email sending.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
