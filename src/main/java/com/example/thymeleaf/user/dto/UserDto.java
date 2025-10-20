package com.example.thymeleaf.user.dto;

import com.example.thymeleaf.user.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserDto {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String gender;
    private String phone;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    private LocalDateTime createdAt;

    public UserDto from(User user){
        return new UserDto(
            user.getId(),
            user.getUsername(),
            user.getPassword(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getGender(),
            user.getPhone(),
            user.getBirthDate(),
            user.getCreatedAt()
        );
    }

}
