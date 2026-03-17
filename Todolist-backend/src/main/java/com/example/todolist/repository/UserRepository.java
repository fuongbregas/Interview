package com.example.todolist.repository;

import com.example.todolist.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
	List<UserEntity> findByUserName(String userName);
}