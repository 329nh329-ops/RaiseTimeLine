package com.raisetimeline.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.raisetimeline.backend.entity.RefreshToken;
import com.raisetimeline.backend.exception.InvalidRefreshTokenException;
import com.raisetimeline.backend.repository.RefreshTokenRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService service() {
        return new RefreshTokenService(refreshTokenRepository, 60_000L);
    }

    @Test
    void 発行するとDBに保存されランダムな文字列が返る() {
        RefreshTokenService service = service();

        String token = service.issue(1L);

        assertThat(token).isNotBlank();
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void 有効なトークンをローテーションすると旧レコードが削除され新しいトークンが発行される() {
        RefreshTokenService service = service();
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        String rawToken = service.issue(5L);
        verify(refreshTokenRepository).save(captor.capture());
        RefreshToken stored = captor.getValue();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(stored));

        RefreshTokenService.RotationResult result = service.rotate(rawToken);

        assertThat(result.userId()).isEqualTo(5L);
        assertThat(result.rawToken()).isNotBlank();
        verify(refreshTokenRepository).delete(stored);
    }

    @Test
    void 存在しないトークンをローテーションしようとすると例外を投げる() {
        RefreshTokenService service = service();
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.rotate("unknown-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void 期限切れのトークンをローテーションしようとすると例外を投げ削除される() {
        RefreshTokenService service = service();
        RefreshToken expired = new RefreshToken(1L, "hash", Instant.now().minusSeconds(1));
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> service.rotate("expired-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(refreshTokenRepository).delete(expired);
    }

    @Test
    void 失効させるとトークンハッシュで削除される() {
        RefreshTokenService service = service();

        service.revoke("some-raw-token");

        ArgumentCaptor<String> hashCaptor = ArgumentCaptor.forClass(String.class);
        verify(refreshTokenRepository).deleteByTokenHash(hashCaptor.capture());
        assertThat(hashCaptor.getValue()).isNotBlank();
    }
}
