package com.example.todolist.controller.dto.UserDto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RegisterRequest {
    @JsonAlias({"userName", "username"})
    private String userName;
    private String password;
}