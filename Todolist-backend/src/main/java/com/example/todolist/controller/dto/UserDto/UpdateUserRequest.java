package com.example.todolist.controller.dto.UserDto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    String token;
    String userName;
    String password;
}
