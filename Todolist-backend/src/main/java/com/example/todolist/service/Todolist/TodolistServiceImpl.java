package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.repository.TodolistRepository;
import com.example.todolist.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service("TodolistService")
public class TodolistServiceImpl implements TodolistService {
    @Autowired
    private TodolistRepository todolistRepository;
    @Autowired
    private TokenService tokenService;

    @Override
    public List<TodolistEntity> getTodoList(String token) {
        Long ownerId = requireOwnerId(token);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> updateTodo(Long todoId, String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder) {
        Long ownerId = requireOwnerId(token);
        TodolistEntity updatedEntity = verifyOwner(todoId, ownerId);
        updatedEntity.setTaskName(todoName);
        updatedEntity.setTaskDesc(todoDesc);
        updatedEntity.setTaskDate(dueDate);
        updatedEntity.setTaskOrder(taskOrder);
        todolistRepository.save(updatedEntity);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> deleteTodo(Long todoId, String token) {
        Long ownerId = requireOwnerId(token);
        TodolistEntity entity = verifyOwner(todoId, ownerId);
        todolistRepository.delete(entity);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> moveTodolist(String ownerToken, List<TodolistEntity> todolistEntityList) {
        Long ownerId = requireOwnerId(ownerToken);
        todolistRepository.saveAll(todolistEntityList);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> addTodo(String todoName, String todoDesc, LocalDate dueDate, String token, Long taskOrder) {
        Long ownerId = requireOwnerId(token);
        TodolistEntity newTodo = new TodolistEntity();
        newTodo.setOwnerId(ownerId);
        newTodo.setTaskName(todoName);
        newTodo.setTaskDesc(todoDesc);
        newTodo.setTaskDate(dueDate);
        newTodo.setTaskOrder(taskOrder);
        todolistRepository.save(newTodo);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    private Long requireOwnerId(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }
        return tokenService.validate(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));
    }

    private TodolistEntity verifyOwner(Long todoId, Long ownerId) {
        TodolistEntity entity = todolistRepository.findById(todoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));
        if (!Objects.equals(entity.getOwnerId(), ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Todo does not belong to this user");
        }
        return entity;
    }
}