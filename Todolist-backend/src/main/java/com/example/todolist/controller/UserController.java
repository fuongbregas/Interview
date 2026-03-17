package com.example.todolist.controller;

import com.example.todolist.controller.dto.UserDto.UpdateUserRequest;
import com.example.todolist.entity.UserEntity;
import com.example.todolist.service.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.example.todolist.controller.dto.UserDto.RegisterRequest;
import com.example.todolist.controller.dto.UserDto.LoginRequest;
import com.example.todolist.controller.dto.UserDto.LoginResponse;

import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("user")
public class UserController {
    @Autowired
    private UserService userService;

    @CrossOrigin
    @GetMapping("/getAllUsers")
    @ResponseBody
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @CrossOrigin
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserEntity created = userService.registerUser(request.getUserName(), request.getPassword());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @CrossOrigin
    @GetMapping("/getUserName")
    @ResponseBody
    public String getUsername(@RequestParam Long userId) {
        return userService.getUsernameFromUserId(userId);
    }


    @CrossOrigin
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody UpdateUserRequest request) {
        try {
            UserEntity created = userService.updateUser(request.getUserId(), request.getUserName(), request.getPassword());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @CrossOrigin
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            var result = userService.loginUser(request.getUserName(), request.getPassword());
            return ResponseEntity.ok(new LoginResponse(result.getUserId(), result.getToken()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}