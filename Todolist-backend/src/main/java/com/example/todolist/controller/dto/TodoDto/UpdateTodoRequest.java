package com.example.todolist.controller.dto.TodoDto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateTodoRequest {
    private Long todoId;
    private String todoName;
    private String todoDesc;

    @JsonProperty("dueDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private Long ownerId;
    private Long taskOrder;
}
