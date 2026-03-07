package edu.cit.villas.ugnay.service;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.villas.ugnay.entity.BlacklistedToken;
import edu.cit.villas.ugnay.repository.BlacklistedTokenRepository;

@Service
public class TokenBlacklistService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public TokenBlacklistService(BlacklistedTokenRepository blacklistedTokenRepository) {
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @Transactional
    public void blacklistToken(String token, Instant expiryDate) {
        if (!blacklistedTokenRepository.existsByToken(token)) {
            blacklistedTokenRepository.save(new BlacklistedToken(token, expiryDate));
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void purgeExpiredTokens() {
        blacklistedTokenRepository.deleteExpiredTokens(Instant.now());
    }
}