package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;

import java.time.LocalDate;
import java.util.List;

public interface TodolistService {
    List<TodolistEntity> moveTodolist(Long ownerId, List<TodolistEntity> todolistEntityList);
    List<TodolistEntity> addTodo(String todoName, String todoDesc, LocalDate dueDate, Long ownerId, Long taskOrder);
    List<TodolistEntity> getTodoList(Long ownerId);

    List<TodolistEntity> updateTodo(Long todoId, String todoName, String todoDesc, LocalDate dueDate, Long ownerId, Long taskOrder);

    List<TodolistEntity> deleteTodo(Long todoId, Long userId);
}
