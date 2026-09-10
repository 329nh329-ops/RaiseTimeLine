package com.raisetimeline.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.raisetimeline.backend.dto.AuthResponse;
import com.raisetimeline.backend.dto.LoginRequest;
import com.raisetimeline.backend.dto.SignupRequest;
import com.raisetimeline.backend.entity.User;
import com.raisetimeline.backend.exception.EmailAlreadyExistsException;
import com.raisetimeline.backend.exception.InvalidCredentialsException;
import com.raisetimeline.backend.repository.UserRepository;
import com.raisetimeline.backend.security.JwtTokenProvider;
import com.raisetimeline.backend.security.RefreshTokenService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService() {
        return new AuthService(userRepository, passwordEncoder, jwtTokenProvider, refreshTokenService);
    }

    @Test
    void メール未登録なら新規ユーザーを作成できる() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = authService().signup(new SignupRequest("new@example.com", "password1", "newuser"));

        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("hashed");
        assertThat(user.getUsername()).isEqualTo("newuser");
    }

    @Test
    void メール登録済みなら例外を投げる() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService().signup(new SignupRequest("dup@example.com", "password1", "user")))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("このメールアドレスは既に登録されています");
    }

    @Test
    void 正しい認証情報でログインするとアクセストークンとリフレッシュトークンを返す() {
        User user = new User("login@example.com", "hashed", "user");
        when(userRepository.findByEmail("login@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "hashed")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(), anyString())).thenReturn("dummy-access-token");
        when(refreshTokenService.issue(any())).thenReturn("dummy-refresh-token");

        AuthResponse response = authService().login(new LoginRequest("login@example.com", "password1"));

        assertThat(response.accessToken()).isEqualTo("dummy-access-token");
        assertThat(response.refreshToken()).isEqualTo("dummy-refresh-token");
    }

    @Test
    void メールアドレスが存在しない場合はログインに失敗する() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService().login(new LoginRequest("unknown@example.com", "password1")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("メールアドレスまたはパスワードが正しくありません");
    }

    @Test
    void パスワードが一致しない場合はログインに失敗する() {
        User user = new User("login@example.com", "hashed", "user");
        when(userRepository.findByEmail("login@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass1", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService().login(new LoginRequest("login@example.com", "wrongpass1")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("メールアドレスまたはパスワードが正しくありません");
    }

    @Test
    void リフレッシュトークンが有効なら新しいアクセストークンを返す() {
        User user = new User("login@example.com", "hashed", "user");
        when(refreshTokenService.rotate("old-refresh-token"))
                .thenReturn(new RefreshTokenService.RotationResult(1L, "new-refresh-token"));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(any(), anyString())).thenReturn("new-access-token");

        AuthResponse response = authService().refresh("old-refresh-token");

        assertThat(response.accessToken()).isEqualTo("new-access-token");
        assertThat(response.refreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    void ログアウトするとリフレッシュトークンが失効する() {
        authService().logout("some-refresh-token");

        org.mockito.Mockito.verify(refreshTokenService).revoke("some-refresh-token");
    }
}
