package com.example.todolist;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
	"app.security.basic.username=test-user",
	"app.security.basic.password=test-password"
})
class TodolistApplicationTests {
	@Test
	void contextLoads() {
	}
}