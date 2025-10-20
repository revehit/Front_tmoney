package com.example.thymeleaf.export;

import com.example.thymeleaf.user.dto.UserDto;
import com.example.thymeleaf.user.dto.UserSearchRequest;
import com.example.thymeleaf.user.mapper.UserMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserQueryService {

    private final UserMapper mapper;

    public List<UserDto> findForExport(UserSearchRequest req, String sort, String dir, Integer limit) {
        final int safeLimit = (limit == null || limit <= 0) ? 10_000 : limit; // 안전 상한
        final int offset = 0;
        return mapper.search(req, offset, safeLimit, sort, dir);
    }


    public long count(UserSearchRequest req) {
        return mapper.count(req);
    }
}
