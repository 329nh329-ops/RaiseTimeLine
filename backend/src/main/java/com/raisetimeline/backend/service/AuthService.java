package com.raisetimeline.backend.service;

import com.raisetimeline.backend.dto.LoginRequest;
import com.raisetimeline.backend.dto.SignupRequest;
import com.raisetimeline.backend.entity.User;
import com.raisetimeline.backend.exception.EmailAlreadyExistsException;
import com.raisetimeline.backend.exception.InvalidCredentialsException;
import com.raisetimeline.backend.repository.UserRepository;
import com.raisetimeline.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "メールアドレスまたはパスワードが正しくありません";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public User signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("このメールアドレスは既に登録されています");
        }
        User user = new User(request.email(), passwordEncoder.encode(request.password()), request.username());
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        return jwtTokenProvider.generateToken(user.getId(), user.getEmail());
    }
}
