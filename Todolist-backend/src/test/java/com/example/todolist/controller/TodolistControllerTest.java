package com.example.todolist.controller;

import com.example.todolist.controller.dto.TodoDto.AddTodolistRequest;
import com.example.todolist.controller.dto.TodoDto.DeleteTodoRequest;
import com.example.todolist.controller.dto.TodoDto.ReorderTodolistRequest;
import com.example.todolist.controller.dto.TodoDto.UpdateTodoRequest;
import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.service.Todolist.TodolistService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TodolistControllerTest {

    @Mock
    private TodolistService todolistService;

    @InjectMocks
    private TodolistController todolistController;

    @Test
    void reorderTodoWorks() {
        TodolistEntity todo = new TodolistEntity();
        todo.setId(1L);
        todo.setOwnerId(1L);

        ReorderTodolistRequest request = new ReorderTodolistRequest();
        request.setOwnerId(1L);
        request.setTodolistEntityList(List.of(todo));

        when(todolistService.moveTodolist(1L, request.getTodolistEntityList())).thenReturn(List.of(todo));

        ResponseEntity<?> response = todolistController.reorderTodo(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(todo), response.getBody());
    }

    @Test
    void reorderTodoErrorWhenException() {
        ReorderTodolistRequest request = new ReorderTodolistRequest();
        request.setOwnerId(1L);
        request.setTodolistEntityList(List.of());

        when(todolistService.moveTodolist(1L, request.getTodolistEntityList()))
                .thenThrow(new RuntimeException("failed"));

        ResponseEntity<?> response = todolistController.reorderTodo(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to move todo", response.getBody());
    }

    @Test
    void addTodoOk() {
        AddTodolistRequest request = new AddTodolistRequest();
        request.setTodoName("Workout");
        request.setTodoDesc("from home");
        request.setDueDate(LocalDate.of(2026, 3, 20));
        request.setOwnerId(1L);
        request.setTaskOrder(100L);

        TodolistEntity todo = new TodolistEntity();
        todo.setId(2L);

        when(todolistService.addTodo("Workout", "from home", request.getDueDate(), 1L, 100L))
                .thenReturn(List.of(todo));

        ResponseEntity<?> response = todolistController.addTodo(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(todo), response.getBody());
    }

    @Test
    void addTodoErrorWhenException() {
        AddTodolistRequest request = new AddTodolistRequest();
        request.setTodoName("Workout");
        request.setTodoDesc("from home");
        request.setDueDate(LocalDate.of(2026, 3, 20));
        request.setOwnerId(1L);
        request.setTaskOrder(100L);

        when(todolistService.addTodo("Workout", "from home", request.getDueDate(), 1L, 100L))
                .thenThrow(new RuntimeException("failed"));

        ResponseEntity<?> response = todolistController.addTodo(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to add todo", response.getBody());
    }

    @Test
    void updateTodoOk() {
        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setTodoId(3L);
        request.setTodoName("Updated");
        request.setTodoDesc("Updated desc");
        request.setDueDate(LocalDate.of(2026, 3, 21));
        request.setOwnerId(1L);
        request.setTaskOrder(200L);

        TodolistEntity todo = new TodolistEntity();
        todo.setId(3L);

        when(todolistService.updateTodo(3L, "Updated", "Updated desc", request.getDueDate(), 1L, 200L))
                .thenReturn(List.of(todo));

        ResponseEntity<?> response = todolistController.updateTodo(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(todo), response.getBody());
    }

    @Test
    void updateTodoErrorWhenException() {
        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setTodoId(3L);
        request.setTodoName("Updated");
        request.setTodoDesc("Updated desc");
        request.setDueDate(LocalDate.of(2026, 3, 21));
        request.setOwnerId(1L);
        request.setTaskOrder(200L);

        when(todolistService.updateTodo(3L, "Updated", "Updated desc", request.getDueDate(), 1L, 200L))
                .thenThrow(new RuntimeException("failed"));

        ResponseEntity<?> response = todolistController.updateTodo(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to update todo", response.getBody());
    }

    @Test
    void getTodoByOwnerOk() {
        TodolistEntity todo = new TodolistEntity();
        todo.setId(4L);

        when(todolistService.getTodoList(1L)).thenReturn(List.of(todo));

        ResponseEntity<List<TodolistEntity>> response = todolistController.getTodoByOwner(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(todo), response.getBody());
    }

    @Test
    void deleteTodoOk() {
        DeleteTodoRequest request = new DeleteTodoRequest();
        request.setTodoId(5L);
        request.setUserId(1L);

        TodolistEntity todo = new TodolistEntity();
        todo.setId(6L);

        when(todolistService.deleteTodo(5L, 1L)).thenReturn(List.of(todo));

        ResponseEntity<?> response = todolistController.deleteTodo(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(todo), response.getBody());
    }

    @Test
    void deleteTodoErrorWhenException() {
        DeleteTodoRequest request = new DeleteTodoRequest();
        request.setTodoId(5L);
        request.setUserId(1L);

        when(todolistService.deleteTodo(5L, 1L)).thenThrow(new RuntimeException("failed"));

        ResponseEntity<?> response = todolistController.deleteTodo(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to delete todo", response.getBody());
    }
}