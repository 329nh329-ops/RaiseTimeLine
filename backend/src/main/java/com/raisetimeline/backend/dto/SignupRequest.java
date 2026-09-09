package com.raisetimeline.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "メールアドレスを入力してください")
        @Email(message = "メールアドレスの形式が正しくありません")
        String email,

        @NotBlank(message = "パスワードを入力してください")
        @Size(min = 8, message = "パスワードは8文字以上で入力してください")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
                message = "パスワードは英字と数字をそれぞれ1文字以上含めてください"
        )
        String password,

        @NotBlank(message = "ユーザー名を入力してください")
        @Size(max = 30, message = "ユーザー名は30文字以内で入力してください")
        @Pattern(
                regexp = "(?s)^\\S(.*\\S)?$",
                message = "ユーザー名の前後に空白を含めることはできません"
        )
        @Pattern(
                regexp = "^[^\\p{Cntrl}]*$",
                message = "ユーザー名に制御文字を含めることはできません"
        )
        String username
) {
}
