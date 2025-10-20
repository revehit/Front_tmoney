package com.example.thymeleaf.user.service.impl;

import com.example.thymeleaf.common.PageData;
import com.example.thymeleaf.user.dto.UserDto;
import com.example.thymeleaf.user.dto.UserSearchRequest;
import java.util.List;

public interface UserService {

    PageData<UserDto> search(UserSearchRequest req, int page, int size, String sort, String dir);

    long count(UserSearchRequest req);

    List<UserDto> selectPage(UserSearchRequest req, int offset, int limit, String sort, String dir);

    UserDto selectOne(Long id);

    UserDto insertOne(UserDto u);

    UserDto updateOne(UserDto u);

    void deleteOne(Long id);
}
