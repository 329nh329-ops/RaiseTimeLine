package com.raisetimeline.backend.security;

import com.raisetimeline.backend.entity.RefreshToken;
import com.raisetimeline.backend.exception.InvalidRefreshTokenException;
import com.raisetimeline.backend.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

    private static final String INVALID_REFRESH_TOKEN_MESSAGE = "リフレッシュトークンが無効です";
    private static final int TOKEN_BYTE_LENGTH = 64;

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long expirationMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.jwt.refresh-expiration-ms}") long expirationMs
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.expirationMs = expirationMs;
    }

    @Transactional
    public String issue(Long userId) {
        String rawToken = generateRawToken();
        RefreshToken refreshToken = new RefreshToken(userId, hash(rawToken), Instant.now().plusMillis(expirationMs));
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public RotationResult rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN_MESSAGE));

        if (existing.isExpired()) {
            refreshTokenRepository.delete(existing);
            throw new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        Long userId = existing.getUserId();
        refreshTokenRepository.delete(existing);
        return new RotationResult(userId, issue(userId));
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.deleteByTokenHash(hash(rawToken));
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256アルゴリズムが利用できません", e);
        }
    }

    public record RotationResult(Long userId, String rawToken) {
    }
}
