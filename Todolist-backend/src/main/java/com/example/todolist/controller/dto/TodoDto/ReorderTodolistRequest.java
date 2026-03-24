package com.example.todolist.controller.dto.TodoDto;

import com.example.todolist.entity.TodolistEntity;
import lombok.Data;

import java.util.List;

@Data
public class ReorderTodolistRequest {
    String token;
    List<TodolistEntity> todolistEntityList;
}
