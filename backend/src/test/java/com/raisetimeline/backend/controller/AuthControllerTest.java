package com.raisetimeline.backend.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.raisetimeline.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    void サインアップに成功すると201とユーザー情報が返る() throws Exception {
        String body = objectMapper.writeValueAsString(new SignupRequestFixture("new@example.com", "password1", "newuser"));

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new@example.com"))
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void メールアドレスが重複していると409エラーになる() throws Exception {
        String body = objectMapper.writeValueAsString(new SignupRequestFixture("dup@example.com", "password1", "user1"));
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        String body2 = objectMapper.writeValueAsString(new SignupRequestFixture("dup@example.com", "password2", "user2"));
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body2))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("このメールアドレスは既に登録されています"));
    }

    @Test
    void パスワードが8文字未満だと400エラーになる() throws Exception {
        String body = objectMapper.writeValueAsString(new SignupRequestFixture("short@example.com", "pass1", "user"));

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("8文字以上")));
    }

    @Test
    void ログインに成功するとJWTが返る() throws Exception {
        String signupBody = objectMapper.writeValueAsString(new SignupRequestFixture("login@example.com", "password1", "loginuser"));
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signupBody))
                .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginRequestFixture("login@example.com", "password1"));
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void パスワードが誤っているとログインに失敗する() throws Exception {
        String signupBody = objectMapper.writeValueAsString(new SignupRequestFixture("wrongpw@example.com", "password1", "user"));
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signupBody))
                .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginRequestFixture("wrongpw@example.com", "wrongpass1"));
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("メールアドレスまたはパスワードが正しくありません"));
    }

    @Test
    void トークンなしで保護されたエンドポイントにアクセスすると401になる() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 正しいトークンで保護されたエンドポイントにアクセスできる() throws Exception {
        String signupBody = objectMapper.writeValueAsString(new SignupRequestFixture("me@example.com", "password1", "meuser"));
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signupBody))
                .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginRequestFixture("me@example.com", "password1"));
        String loginResponse = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(loginResponse).get("token").asText();

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@example.com"))
                .andExpect(jsonPath("$.username").value("meuser"));
    }

    @Test
    void 不正なトークンで保護されたエンドポイントにアクセスすると401になる() throws Exception {
        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized());
    }

    private record SignupRequestFixture(String email, String password, String username) {
    }

    private record LoginRequestFixture(String email, String password) {
    }
}
