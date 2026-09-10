package com.raisetimeline.backend.service;

import com.raisetimeline.backend.dto.AuthResponse;
import com.raisetimeline.backend.dto.LoginRequest;
import com.raisetimeline.backend.dto.SignupRequest;
import com.raisetimeline.backend.entity.User;
import com.raisetimeline.backend.exception.EmailAlreadyExistsException;
import com.raisetimeline.backend.exception.InvalidCredentialsException;
import com.raisetimeline.backend.repository.UserRepository;
import com.raisetimeline.backend.security.JwtTokenProvider;
import com.raisetimeline.backend.security.RefreshTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "メールアドレスまたはパスワードが正しくありません";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public User signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("このメールアドレスは既に登録されています");
        }
        User user = new User(request.email(), passwordEncoder.encode(request.password()), request.username());
        return userRepository.save(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        String refreshToken = refreshTokenService.issue(user.getId());
        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshTokenService.RotationResult result = refreshTokenService.rotate(rawRefreshToken);
        User user = userRepository.findById(result.userId())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(accessToken, result.rawToken());
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }
}
