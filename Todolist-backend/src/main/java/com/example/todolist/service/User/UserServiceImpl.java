package com.example.todolist.service.User;

import com.example.todolist.entity.UserEntity;
import com.example.todolist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.todolist.security.TokenService;

import java.util.List;

@Service("UserService")
public class UserServiceImpl implements UserService{
    @Autowired private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Autowired
    private TokenService tokenService;

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public UserEntity updateUser(Long userId, String userName, String password) {
        if (userName == null || userName.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password must be provided");
        }

        UserEntity updatedUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Failed to update profile"));
        updatedUser.setUserName(userName);
        updatedUser.setHash(passwordEncoder.encode(password));
        return userRepository.save(updatedUser);
    }

    @Override
    public UserEntity registerUser(String userName, String password) {
        if (userName == null || userName.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password must be provided");
        }

        // check duplicate username
        List<UserEntity> existing = userRepository.findByUserName(userName);
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("Username already exists");
        }

        UserEntity entity = new UserEntity();
        entity.setUserName(userName);
        String hashed = passwordEncoder.encode(password);
        entity.setHash(hashed);
        return userRepository.save(entity);
    }

    @Override
    public LoginResponse loginUser(String userName, String password) {
        if (userName == null || userName.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password must be provided");
        }
        List<UserEntity> userList = userRepository.findByUserName(userName);
        if (userList.size() != 1) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        UserEntity entity = userList.get(0);
        if (!passwordEncoder.matches(password, entity.getHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = tokenService.createTokenFor(entity.getId());
        return new LoginResponse(entity.getId(), token);
    }

    @Override
    public String getUsernameFromUserId(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getUserName();
    }
}
