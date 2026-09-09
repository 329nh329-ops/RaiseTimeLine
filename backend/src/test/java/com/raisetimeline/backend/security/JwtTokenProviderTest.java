package com.raisetimeline.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-for-unit-test-min-32-bytes-long";

    @Test
    void 発行したトークンからユーザーIDを取り出せる() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 60_000L);

        String token = provider.generateToken(42L, "user@example.com");

        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(42L);
    }

    @Test
    void 期限切れのトークンは無効と判定される() throws InterruptedException {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 1L);

        String token = provider.generateToken(1L, "user@example.com");
        Thread.sleep(10);

        assertThat(provider.validateToken(token)).isFalse();
    }

    @Test
    void 不正な文字列はトークンとして無効と判定される() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 60_000L);

        assertThat(provider.validateToken("not-a-valid-jwt")).isFalse();
    }

    @Test
    void 異なる秘密鍵で署名されたトークンは無効と判定される() {
        JwtTokenProvider issuer = new JwtTokenProvider(SECRET, 60_000L);
        JwtTokenProvider verifier = new JwtTokenProvider("different-secret-key-for-unit-test-32bytes", 60_000L);

        String token = issuer.generateToken(1L, "user@example.com");

        assertThat(verifier.validateToken(token)).isFalse();
    }
}
