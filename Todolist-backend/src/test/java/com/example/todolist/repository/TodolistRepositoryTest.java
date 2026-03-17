package com.example.todolist.repository;

import com.example.todolist.entity.TodolistEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class TodolistRepositoryTest {

    @Autowired
    private TodolistRepository todolistRepository;

    @Test
    void findAllByOwnerIdOrderByTaskOrderDesc() {
        TodolistEntity owner1Low = new TodolistEntity();
        owner1Low.setOwnerId(1L);
        owner1Low.setTaskName("Owner1-Low");
        owner1Low.setTaskDesc("desc");
        owner1Low.setTaskOrder(100L);
        owner1Low.setTaskDate(LocalDate.of(2026, 3, 20));

        TodolistEntity owner1High = new TodolistEntity();
        owner1High.setOwnerId(1L);
        owner1High.setTaskName("Owner1-High");
        owner1High.setTaskDesc("desc");
        owner1High.setTaskOrder(300L);
        owner1High.setTaskDate(LocalDate.of(2026, 3, 20));

        TodolistEntity owner1Mid = new TodolistEntity();
        owner1Mid.setOwnerId(1L);
        owner1Mid.setTaskName("Owner1-Mid");
        owner1Mid.setTaskDesc("desc");
        owner1Mid.setTaskOrder(200L);
        owner1Mid.setTaskDate(LocalDate.of(2026, 3, 20));

        TodolistEntity owner2 = new TodolistEntity();
        owner2.setOwnerId(2L);
        owner2.setTaskName("Owner2");
        owner2.setTaskDesc("desc");
        owner2.setTaskOrder(999L);
        owner2.setTaskDate(LocalDate.of(2026, 3, 20));

        todolistRepository.saveAll(List.of(owner1Low, owner1High, owner1Mid, owner2));

        List<TodolistEntity> result = todolistRepository.findAllByOwnerIdOrderByTaskOrderDesc(1L);

        assertEquals(3, result.size());
        assertEquals(300L, result.get(0).getTaskOrder());
        assertEquals(200L, result.get(1).getTaskOrder());
        assertEquals(100L, result.get(2).getTaskOrder());
        assertEquals(1L, result.get(0).getOwnerId());
        assertEquals(1L, result.get(1).getOwnerId());
        assertEquals(1L, result.get(2).getOwnerId());
    }
}
