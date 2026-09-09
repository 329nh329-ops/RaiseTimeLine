package com.raisetimeline.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class SignupRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void 妥当な入力はバリデーションエラーにならない() {
        SignupRequest request = new SignupRequest("user@example.com", "password1", "user");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @CsvSource({
        "short1,パスワードは8文字以上で入力してください",
        "onlyletters,パスワードは英字と数字をそれぞれ1文字以上含めてください",
        "12345678,パスワードは英字と数字をそれぞれ1文字以上含めてください"
    })
    void パスワードが要件を満たさない場合はエラーになる(String password, String expectedMessage) {
        SignupRequest request = new SignupRequest("user@example.com", password, "user");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getMessage().equals(expectedMessage));
    }

    @Test
    void ユーザー名の前後に空白があるとエラーになる() {
        SignupRequest request = new SignupRequest("user@example.com", "password1", " user ");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getMessage().contains("前後に空白"));
    }

    @Test
    void メールアドレスの形式が不正だとエラーになる() {
        SignupRequest request = new SignupRequest("invalid-email", "password1", "user");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getMessage().equals("メールアドレスの形式が正しくありません"));
    }
}
