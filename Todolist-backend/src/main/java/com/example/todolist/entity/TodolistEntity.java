package com.example.todolist.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(
    name = "todolist"
)
@Data
public class TodolistEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "task_description")
    private String taskDesc;

    @Column(name = "task_order", nullable = false)
    private Long taskOrder;

    @Column(name = "task_date", nullable = false)
    private LocalDate taskDate;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;
}