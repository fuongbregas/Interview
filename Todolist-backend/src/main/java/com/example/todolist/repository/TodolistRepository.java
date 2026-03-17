package com.example.todolist.repository;

import com.example.todolist.entity.TodolistEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodolistRepository extends JpaRepository<TodolistEntity, Long> {
    List<TodolistEntity> findAllByOwnerIdOrderByTaskOrderDesc(Long ownerId);
}