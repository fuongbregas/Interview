package com.example.todolist.repository;

import com.example.todolist.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUserName() {
        UserEntity alice = new UserEntity();
        alice.setUserName("alice");
        alice.setHash("hash-a");

        UserEntity bob = new UserEntity();
        bob.setUserName("bob");
        bob.setHash("hash-b");

        userRepository.save(alice);
        userRepository.save(bob);

        List<UserEntity> result = userRepository.findByUserName("alice");

        assertEquals(1, result.size());
        assertEquals("alice", result.get(0).getUserName());
        assertEquals("hash-a", result.get(0).getHash());
    }

    @Test
    void findByUserNameNotFound() {
        UserEntity alice = new UserEntity();
        alice.setUserName("alice");
        alice.setHash("hash-a");
        userRepository.save(alice);

        List<UserEntity> result = userRepository.findByUserName("charlie");

        assertTrue(result.isEmpty());
    }
}
