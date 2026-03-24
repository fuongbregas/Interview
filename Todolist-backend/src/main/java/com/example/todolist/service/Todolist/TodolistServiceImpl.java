package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.repository.TodolistRepository;
import com.example.todolist.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service("TodolistService")
public class TodolistServiceImpl implements TodolistService {
    @Autowired
    private TodolistRepository todolistRepository;
    @Autowired
    private TokenService tokenService;

    @Override
    public List<TodolistEntity> getTodoList(String token) {
        Long ownerId = tokenService.validate(token).orElse(null);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> updateTodo(Long todoId, String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder) {
        Long ownerId = tokenService.validate(token).orElse(null);
        TodolistEntity updatedEntity = new TodolistEntity();
        updatedEntity.setId(todoId);
        updatedEntity.setTaskName(todoName);
        updatedEntity.setTaskDesc(todoDesc);
        updatedEntity.setTaskDate(dueDate);
        updatedEntity.setOwnerId(ownerId);
        updatedEntity.setTaskOrder(taskOrder);
        todolistRepository.save(updatedEntity);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> deleteTodo(Long todoId, String token) {
        todolistRepository.deleteById(todoId);
        Long ownerId = tokenService.validate(token).orElse(null);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> moveTodolist(String ownerToken, List<TodolistEntity> todolistEntityList) {
        Long ownerId = tokenService.validate(ownerToken).orElse(null);
        todolistRepository.saveAll(todolistEntityList);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> addTodo(String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder) {
        Long ownerId = tokenService.validate(token).orElse(null);
        TodolistEntity newTodo = new TodolistEntity();
        newTodo.setOwnerId(ownerId);
        newTodo.setTaskName(todoName);
        newTodo.setTaskDesc(todoDesc);
        newTodo.setTaskDate(dueDate);
        newTodo.setTaskOrder(taskOrder);
        todolistRepository.save(newTodo);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }
}
