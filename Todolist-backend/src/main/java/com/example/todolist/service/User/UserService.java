package com.example.todolist.service.User;

import com.example.todolist.controller.dto.UserDto.LoginResponse;
import com.example.todolist.entity.UserEntity;

import java.util.List;

public interface UserService {
    List<UserEntity> getAllUsers();
    UserEntity updateUser(String token, String userName, String password);
    UserEntity registerUser(String userName, String password);
    LoginResponse loginUser(String userName, String password);
    String getUsernameFromToken(String token);
}
