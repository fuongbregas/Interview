package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.repository.TodolistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service("TodolistService")
public class TodolistServiceImpl implements TodolistService {
    @Autowired
    private TodolistRepository todolistRepository;

    @Override
    public List<TodolistEntity> getTodoList(Long ownerId) {
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> updateTodo(Long todoId, String todoName, String todoDesc, LocalDate dueDate, Long ownerId, Long taskOrder) {
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
    public List<TodolistEntity> deleteTodo(Long todoId, Long ownerId) {
        todolistRepository.deleteById(todoId);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Override
    public List<TodolistEntity> moveTodolist(Long owerId, List<TodolistEntity> todolistEntityList) {
        todolistRepository.saveAll(todolistEntityList);
        return todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(owerId);
    }

    @Override
    public List<TodolistEntity> addTodo(String todoName, String todoDesc, LocalDate dueDate, Long ownerId, Long taskOrder) {
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
