package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;

import java.time.LocalDate;
import java.util.List;

public interface TodolistService {
    List<TodolistEntity> moveTodolist(String ownerToken, List<TodolistEntity> todolistEntityList);
    List<TodolistEntity> addTodo(String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder);
    List<TodolistEntity> getTodoList(String token);

    List<TodolistEntity> updateTodo(Long todoId, String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder);

    List<TodolistEntity> deleteTodo(Long todoId, String token);
}
