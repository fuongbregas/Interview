package com.example.todolist.service.Todolist;

import com.example.todolist.entity.TodolistEntity;
import com.example.todolist.repository.TodolistRepository;
import com.example.todolist.security.TokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TodolistServiceImplTest {

    @Mock
    private TodolistRepository todolistRepository;
    @Mock
    private TokenService tokenService;

    @InjectMocks
    private TodolistServiceImpl todolistService;

    @Test
    void testGetTodoList() {
        Long ownerId = 1L;
        TodolistEntity todo = new TodolistEntity();
        todo.setId(10L);
        todo.setOwnerId(ownerId);
        todo.setTaskName("Task A");

        when(tokenService.validate("token")).thenReturn(Optional.of(1L));
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId)).thenReturn(List.of(todo));

        List<TodolistEntity> result = todolistService.getTodoList("token");

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        verify(todolistRepository).findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
    }

    @Test
    void testGetTodoListWhenRepositoryFails() {
        Long ownerId = 1L;
        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId))
                .thenThrow(new RuntimeException("db error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> todolistService.getTodoList("token"));

        assertEquals("db error", ex.getMessage());
    }

    @Test
    void testAddTodo() {
        Long ownerId = 1L;
        Long taskOrder = 100L;
        LocalDate dueDate = LocalDate.of(2026, 3, 20);

        TodolistEntity saved = new TodolistEntity();
        saved.setId(1L);
        saved.setOwnerId(ownerId);
        saved.setTaskOrder(taskOrder);
        saved.setTaskName("Interview preparation");
        saved.setTaskDesc("Finish test");
        saved.setTaskDate(dueDate);

        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.save(any(TodolistEntity.class))).thenReturn(saved);
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId)).thenReturn(List.of(saved));

        List<TodolistEntity> result = todolistService.addTodo(
                "Interview preparation",
                "Finish test",
                dueDate,
                "token",
                taskOrder
        );

        ArgumentCaptor<TodolistEntity> captor = ArgumentCaptor.forClass(TodolistEntity.class);
        verify(todolistRepository).save(captor.capture());
        TodolistEntity toSave = captor.getValue();

        assertEquals(ownerId, toSave.getOwnerId());
        assertEquals(taskOrder, toSave.getTaskOrder());
        assertEquals("Interview preparation", toSave.getTaskName());
        assertEquals("Finish test", toSave.getTaskDesc());
        assertEquals(dueDate, toSave.getTaskDate());

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void testAddTodoWhenSaveFails() {
        when(tokenService.validate("token")).thenReturn(Optional.of(1L));
        when(todolistRepository.save(any(TodolistEntity.class))).thenThrow(new RuntimeException("insert failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> todolistService.addTodo("Task", "Desc", LocalDate.of(2026, 3, 20), "token", 100L));

        assertEquals("insert failed", ex.getMessage());
    }

    @Test
    void testUpdateTodo() {
        Long ownerId = 1L;
        Long todoId = 2L;
        Long taskOrder = 200L;
        LocalDate dueDate = LocalDate.of(2026, 3, 21);

        TodolistEntity existing = new TodolistEntity();
        existing.setId(todoId);
        existing.setOwnerId(ownerId);

        TodolistEntity updated = new TodolistEntity();
        updated.setId(todoId);
        updated.setOwnerId(ownerId);
        updated.setTaskOrder(taskOrder);
        updated.setTaskName("Updated task");
        updated.setTaskDesc("Updated desc");
        updated.setTaskDate(dueDate);
        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findById(todoId)).thenReturn(Optional.of(existing));
        when(todolistRepository.save(any(TodolistEntity.class))).thenReturn(updated);
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId)).thenReturn(List.of(updated));

        List<TodolistEntity> result = todolistService.updateTodo(
                todoId,
                "Updated task",
                "Updated desc",
                dueDate,
                "token",
                taskOrder
        );

        ArgumentCaptor<TodolistEntity> captor = ArgumentCaptor.forClass(TodolistEntity.class);
        verify(todolistRepository).save(captor.capture());
        TodolistEntity toSave = captor.getValue();

        assertEquals(todoId, toSave.getId());
        assertEquals(ownerId, toSave.getOwnerId());
        assertEquals(taskOrder, toSave.getTaskOrder());
        assertEquals("Updated task", toSave.getTaskName());
        assertEquals("Updated desc", toSave.getTaskDesc());
        assertEquals(dueDate, toSave.getTaskDate());

        assertEquals(1, result.size());
        assertEquals(todoId, result.get(0).getId());
    }

    @Test
    void testUpdateTodoWhenSaveFails() {
        Long ownerId = 1L;
        TodolistEntity existing = new TodolistEntity();
        existing.setId(2L);
        existing.setOwnerId(ownerId);

        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(todolistRepository.save(any(TodolistEntity.class))).thenThrow(new RuntimeException("update failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> todolistService.updateTodo(2L, "Updated", "Updated desc", LocalDate.of(2026, 3, 21), "token", 200L));

        assertEquals("update failed", ex.getMessage());
    }

    @Test
    void testDeleteTodo() {
        Long ownerId = 1L;
        Long todoId = 3L;

        TodolistEntity toDelete = new TodolistEntity();
        toDelete.setId(todoId);
        toDelete.setOwnerId(ownerId);

        TodolistEntity remaining = new TodolistEntity();
        remaining.setId(9L);
        remaining.setOwnerId(ownerId);

        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findById(todoId)).thenReturn(Optional.of(toDelete));
        doNothing().when(todolistRepository).delete(toDelete);
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId)).thenReturn(List.of(remaining));

        List<TodolistEntity> result = todolistService.deleteTodo(todoId, "token");

        verify(todolistRepository).delete(toDelete);
        verify(todolistRepository).findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
        assertEquals(1, result.size());
        assertEquals(9L, result.get(0).getId());
    }

    @Test
    void testDeleteTodoWhenDeleteFails() {
        Long ownerId = 1L;
        TodolistEntity toDelete = new TodolistEntity();
        toDelete.setId(3L);
        toDelete.setOwnerId(ownerId);

        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findById(3L)).thenReturn(Optional.of(toDelete));
        doThrow(new RuntimeException("delete failed")).when(todolistRepository).delete(toDelete);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> todolistService.deleteTodo(3L, "token"));

        assertEquals("delete failed", ex.getMessage());
    }

    @Test
    void testMoveTodolist() {
        Long ownerId = 1L;

        TodolistEntity todo1 = new TodolistEntity();
        todo1.setId(1L);
        todo1.setOwnerId(ownerId);
        todo1.setTaskOrder(200L);

        TodolistEntity todo2 = new TodolistEntity();
        todo2.setId(2L);
        todo2.setOwnerId(ownerId);
        todo2.setTaskOrder(100L);

        List<TodolistEntity> payload = List.of(todo1, todo2);
        when(todolistRepository.saveAll(payload)).thenReturn(payload);
        when(todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(ownerId)).thenReturn(payload);
        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));

        List<TodolistEntity> result = todolistService.moveTodolist("token", payload);

        verify(todolistRepository).saveAll(payload);
        verify(todolistRepository).findAllByOwnerIdOrderByTaskOrderDesc(ownerId);
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(2L, result.get(1).getId());
    }

    @Test
    void testMoveTodolistWhenSaveAllFails() {
        Long ownerId = 1L;

        TodolistEntity todo = new TodolistEntity();
        todo.setId(1L);
        todo.setOwnerId(ownerId);
        List<TodolistEntity> payload = List.of(todo);
        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.saveAll(payload)).thenThrow(new RuntimeException("reorder failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> todolistService.moveTodolist("token", payload));

        assertEquals("reorder failed", ex.getMessage());
    }

    @Test
    void testMoveTodolistWhenTokenBlank() {
        TodolistEntity todo = new TodolistEntity();
        todo.setId(1L);
        List<TodolistEntity> payload = List.of(todo);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> todolistService.moveTodolist("   ", payload));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Missing token", ex.getReason());
        verifyNoInteractions(tokenService, todolistRepository);
    }

    @Test
    void testMoveTodolistWhenTokenNull() {
        TodolistEntity todo = new TodolistEntity();
        todo.setId(1L);
        List<TodolistEntity> payload = List.of(todo);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> todolistService.moveTodolist(null, payload));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Missing token", ex.getReason());
        verifyNoInteractions(tokenService, todolistRepository);
    }

    @Test
    void testGetTodoListWhenTokenInvalid() {
        when(tokenService.validate("bad-token")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> todolistService.getTodoList("bad-token"));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid token", ex.getReason());
    }

    @Test
    void testDeleteTodoWhenTodoBelongsToAnotherOwner() {
        Long ownerId = 1L;
        Long todoId = 3L;

        TodolistEntity foreignTodo = new TodolistEntity();
        foreignTodo.setId(todoId);
        foreignTodo.setOwnerId(2L);

        when(tokenService.validate("token")).thenReturn(Optional.of(ownerId));
        when(todolistRepository.findById(todoId)).thenReturn(Optional.of(foreignTodo));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> todolistService.deleteTodo(todoId, "token"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Todo does not belong to this user", ex.getReason());
    }

}