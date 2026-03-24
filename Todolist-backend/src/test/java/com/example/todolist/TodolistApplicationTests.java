package com.example.todolist;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
	"spring.datasource.url=jdbc:h2:mem:todolist-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
	"spring.datasource.driver-class-name=org.h2.Driver",
	"spring.datasource.username=sa",
	"spring.datasource.password=",
	"spring.jpa.hibernate.ddl-auto=create-drop",
	"app.cors.allowed-origin=http://localhost:3000",
	"app.security.basic.username=test-user",
	"app.security.basic.password=test-password"
})
class TodolistApplicationTests {
	@Test
	void contextLoads() {
	}
}