package com.example.todolist.service.User;

import com.example.todolist.entity.UserEntity;
import com.example.todolist.repository.UserRepository;
import com.example.todolist.security.TokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void testUpdateExistingUser() {
        Long userId = 1L;
        String userName = "alice";
        String rawPassword = "new-password";

        UserEntity existing = new UserEntity();
        existing.setId(userId);
        existing.setUserName("old-name");
        existing.setHash("old-hash");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenService.validate("token")).thenReturn(Optional.of(1L));

        UserEntity result = userService.updateUser("token", userName, rawPassword);

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity saved = captor.getValue();

        assertEquals(userId, saved.getId());
        assertEquals(userName, saved.getUserName());
        assertNotEquals(rawPassword, saved.getHash());
        assertTrue(new BCryptPasswordEncoder().matches(rawPassword, saved.getHash()));
        assertEquals(saved.getId(), result.getId());
        assertEquals(saved.getUserName(), result.getUserName());
    }

    @Test
    void testUpdateUserWhenInputIsBlank() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUser("token", "", ""));

        assertEquals("Username and password must be provided", ex.getMessage());
        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateUserWhenUserNotFound() {
        when(tokenService.validate("token")).thenReturn(Optional.of(99L));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUser("token", "alice", "secret"));

        assertEquals("Failed to update profile", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testGetAllUsers() {
        UserEntity user1 = new UserEntity();
        user1.setId(1L);
        user1.setUserName("alice");

        UserEntity user2 = new UserEntity();
        user2.setId(2L);
        user2.setUserName("bob");

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        List<UserEntity> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals("alice", result.get(0).getUserName());
        assertEquals("bob", result.get(1).getUserName());
        verify(userRepository).findAll();
    }

    @Test
    void testRegisterUserWhenInputIsBlank() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.registerUser("", ""));

        assertEquals("Username and password must be provided", ex.getMessage());
        verify(userRepository, never()).findByUserName(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUserWhenUsernameAlreadyExists() {
        UserEntity existing = new UserEntity();
        existing.setId(1L);
        existing.setUserName("alice");
        when(userRepository.findByUserName("alice")).thenReturn(List.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.registerUser("alice", "secret"));

        assertEquals("Username already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUserSuccess() {
        when(userRepository.findByUserName("alice")).thenReturn(List.of());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity result = userService.registerUser("alice", "secret");

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity saved = captor.getValue();

        assertEquals("alice", saved.getUserName());
        assertNotEquals("secret", saved.getHash());
        assertTrue(new BCryptPasswordEncoder().matches("secret", saved.getHash()));
        assertEquals("alice", result.getUserName());
    }

    @Test
    void testLoginUserWhenInputIsBlank() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginUser("", ""));

        assertEquals("Username and password must be provided", ex.getMessage());
        verify(userRepository, never()).findByUserName(any());
    }

    @Test
    void testLoginUserWhenUserNotFound() {
        when(userRepository.findByUserName("alice")).thenReturn(List.of());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginUser("alice", "secret"));

        assertEquals("Invalid credentials", ex.getMessage());
        verify(tokenService, never()).createTokenFor(any());
    }

    @Test
    void testLoginUserWhenPasswordDoesNotMatch() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUserName("alice");
        user.setHash(new BCryptPasswordEncoder().encode("correct-password"));
        when(userRepository.findByUserName("alice")).thenReturn(List.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginUser("alice", "wrong-password"));

        assertEquals("Invalid credentials", ex.getMessage());
        verify(tokenService, never()).createTokenFor(any());
    }

    @Test
    void testLoginUserSuccess() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUserName("alice");
        user.setHash(new BCryptPasswordEncoder().encode("secret"));
        when(userRepository.findByUserName("alice")).thenReturn(List.of(user));
        when(tokenService.createTokenFor(1L)).thenReturn("token-123");

        LoginResponse result = userService.loginUser("alice", "secret");

        assertEquals("token-123", result.getToken());
        verify(tokenService).createTokenFor(1L);
    }

    @Test
    void testGetUsernameFromTokenSuccess() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUserName("alice");
        when(tokenService.validate("token")).thenReturn(Optional.of(1L));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        String result = userService.getUsernameFromToken("token");

        assertEquals("alice", result);
    }

    @Test
    void testGetUsernameFromTokenWhenNotFound() {
        when(tokenService.validate("token")).thenReturn(Optional.of(999L));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.getUsernameFromToken("token"));

        assertEquals("User not found", ex.getMessage());
    }
}