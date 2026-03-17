package com.example.todolist.service.User;

import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String token;

    public LoginResponse(Long userId, String token) {
        this.userId = userId;
        this.token = token;
    }
}