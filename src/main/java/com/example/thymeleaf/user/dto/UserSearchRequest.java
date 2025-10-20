package com.example.thymeleaf.user.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UserSearchRequest {
    private String email;
    private String firstName;
    private String lastName;
    private String username;
    private String phone;
}
