package com.example.thymeleaf.user.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String gender;
    private String phone;
    private LocalDate birthDate;
    private LocalDateTime createdAt;

    public void updateId(Long id) {
        this.id = id;
    }
}
