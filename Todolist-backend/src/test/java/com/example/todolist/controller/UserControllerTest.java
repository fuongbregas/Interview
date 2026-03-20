package com.example.todolist.controller;

import com.example.todolist.controller.dto.UserDto.LoginRequest;
import com.example.todolist.controller.dto.UserDto.LoginResponse;
import com.example.todolist.controller.dto.UserDto.RegisterRequest;
import com.example.todolist.controller.dto.UserDto.UpdateUserRequest;
import com.example.todolist.entity.UserEntity;
import com.example.todolist.service.User.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void getAllUsers() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUserName("alice");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        List<UserEntity> result = userController.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("alice", result.get(0).getUserName());
    }

    @Test
    void registerOk() {
        RegisterRequest request = new RegisterRequest();
        request.setUserName("alice");
        request.setPassword("secret");

        UserEntity created = new UserEntity();
        created.setId(1L);
        created.setUserName("alice");

        when(userService.registerUser("alice", "secret")).thenReturn(created);

        ResponseEntity<?> response = userController.register(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User created", response.getBody());
    }

    @Test
    void registerErrorWhenException() {
        RegisterRequest request = new RegisterRequest();
        request.setUserName("alice");
        request.setPassword("secret");

        when(userService.registerUser("alice", "secret"))
                .thenThrow(new RuntimeException("Username already exists"));

        ResponseEntity<?> response = userController.register(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Username already exists", response.getBody());
    }

    @Test
    void getUsernameOk() {
        when(userService.getUsernameFromUserId(1L)).thenReturn("alice");

        String result = userController.getUsername(1L);

        assertEquals("alice", result);
    }

    @Test
    void updateOk() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUserId(1L);
        request.setUserName("alice");
        request.setPassword("new-secret");

        UserEntity updated = new UserEntity();
        updated.setId(1L);
        updated.setUserName("alice");

        when(userService.updateUser(1L, "alice", "new-secret")).thenReturn(updated);

        ResponseEntity<?> response = userController.update(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updated, response.getBody());
    }

    @Test
    void updateErrorWhenException() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUserId(1L);
        request.setUserName("alice");
        request.setPassword("new-secret");

        when(userService.updateUser(1L, "alice", "new-secret"))
                .thenThrow(new RuntimeException("Failed to update profile"));

        ResponseEntity<?> response = userController.update(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to update profile", response.getBody());
    }

    @Test
    void loginOk() {
        LoginRequest request = new LoginRequest();
        request.setUserName("alice");
        request.setPassword("secret");

        com.example.todolist.service.User.LoginResponse serviceResponse =
                new com.example.todolist.service.User.LoginResponse(1L, "token-123");
        when(userService.loginUser("alice", "secret")).thenReturn(serviceResponse);

        ResponseEntity<?> response = userController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertInstanceOf(LoginResponse.class, response.getBody());
        LoginResponse body = (LoginResponse) response.getBody();
        assertEquals(1L, body.getUserId());
        assertEquals("token-123", body.getToken());
    }

    @Test
    void loginErrorWhenException() {
        LoginRequest request = new LoginRequest();
        request.setUserName("alice");
        request.setPassword("wrong");

        when(userService.loginUser("alice", "wrong"))
                .thenThrow(new RuntimeException("Login failed"));

        ResponseEntity<?> response = userController.login(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Login failed", response.getBody());
    }
}