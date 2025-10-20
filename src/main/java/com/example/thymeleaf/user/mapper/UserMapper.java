package com.example.thymeleaf.user.mapper;

import com.example.thymeleaf.user.dto.UserDto;
import com.example.thymeleaf.user.dto.UserSearchRequest;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface UserMapper {

    List<UserDto> search(
            @Param("req") UserSearchRequest req,
            @Param("offset") int offset,
            @Param("limit") int limit,
            @Param("sort") String sort,
            @Param("dir") String dir
    );

    long count(@Param("req") UserSearchRequest req);

    UserDto findById(@Param("id") Long id);

    int insert(UserDto u);

    int update(UserDto u);

    int delete(@Param("id") Long id);
}
