package com.example.todolist.controller.dto.TodoDto;

import lombok.Data;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class AddTodolistRequest {
    private String todoName;
    private String todoDesc;

    @JsonProperty("dueDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private String token;
    private Long taskOrder;
}
