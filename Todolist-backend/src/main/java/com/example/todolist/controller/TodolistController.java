package com.example.todolist.controller;

import com.example.todolist.controller.dto.TodoDto.AddTodolistRequest;
import com.example.todolist.controller.dto.TodoDto.DeleteTodoRequest;
import com.example.todolist.controller.dto.TodoDto.ReorderTodolistRequest;
import com.example.todolist.controller.dto.TodoDto.UpdateTodoRequest;
import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.service.Todolist.TodolistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("todo")
public class TodolistController {
    @Autowired
    private TodolistService todolistService;

    @CrossOrigin
    @PostMapping("/moveTodolist")
    public ResponseEntity<?> reorderTodo(@RequestBody ReorderTodolistRequest request) {
        try {
            return ResponseEntity.ok(todolistService.moveTodolist(request.getToken(), request.getTodolistEntityList()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to move todo");
        }
    }

    @CrossOrigin
    @PostMapping("/addTodolist")
    public ResponseEntity<?> addTodo(@RequestBody AddTodolistRequest request) {
        try {
            return ResponseEntity.ok(todolistService.addTodo(request.getTodoName(), request.getTodoDesc(), request.getDueDate(), request.getToken(), request.getTaskOrder()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to add todo");
        }
    }

    @CrossOrigin
    @PutMapping("/updateTodo")
    public ResponseEntity<?> updateTodo(@RequestBody UpdateTodoRequest request) {
        try {
            return ResponseEntity.ok(todolistService.updateTodo(request.getTodoId(), request.getTodoName(), request.getTodoDesc(), request.getDueDate(), request.getToken(), request.getTaskOrder()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to update todo");
        }
    }

    @CrossOrigin
    @GetMapping("/getTodoList")
    public ResponseEntity<List<TodolistEntity>> getTodoByOwner(@RequestParam String token) {
        return ResponseEntity.ok(todolistService.getTodoList(token));
    }

    @CrossOrigin
    @DeleteMapping("/deleteTodo")
    public ResponseEntity<?> deleteTodo(@RequestBody DeleteTodoRequest request) {
        try {
            return ResponseEntity.ok(todolistService.deleteTodo(request.getTodoId(), request.getToken()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to delete todo");
        }
    }
}