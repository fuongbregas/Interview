package com.example.todolist.controller.dto.UserDto;

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
