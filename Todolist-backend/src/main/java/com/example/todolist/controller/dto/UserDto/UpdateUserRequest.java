package com.example.todolist.controller.dto.UserDto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    Long userId;
    String userName;
    String password;
}
