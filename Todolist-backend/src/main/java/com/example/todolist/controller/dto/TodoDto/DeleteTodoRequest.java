package com.example.todolist.controller.dto.TodoDto;

import lombok.Data;

@Data
public class DeleteTodoRequest {
    private Long todoId;
    private Long userId;
}
