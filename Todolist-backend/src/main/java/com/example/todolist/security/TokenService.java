package com.example.todolist.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {
    private final Map<String, Long> tokenToUser = new ConcurrentHashMap<>();

    public String createTokenFor(Long userId) {
        String token = UUID.randomUUID().toString();
        tokenToUser.put(token, userId);
        return token;
    }

    public Optional<Long> validate(String token) {
        return Optional.ofNullable(tokenToUser.get(token));
    }

    public void revoke(String token) {
        tokenToUser.remove(token);
    }
}
