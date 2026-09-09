package com.raisetimeline.backend.dto;

import com.raisetimeline.backend.entity.User;

public record UserResponse(Long id, String email, String username, String bio, String iconImageUrl) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getUsername(), user.getBio(), user.getIconImageUrl());
    }
}
