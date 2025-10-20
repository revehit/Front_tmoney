package com.example.thymeleaf.export;

import com.example.thymeleaf.user.dto.UserDto;
import com.example.thymeleaf.user.dto.UserSearchRequest;
import com.example.thymeleaf.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;


@RequiredArgsConstructor
@Component
public class UserExportProvider implements ExportProvider<UserDto> {
    private final StringUtils stringUtils;

    private final UserQueryService service;

    @Override public String name() { return "user"; }

    @Override
    public List<ExportColumn<UserDto>> columns() {
        return List.of(
                new ExportColumn<>("ID",        r -> String.valueOf(r.getId())),
                new ExportColumn<>("Username",  UserDto::getUsername),
                new ExportColumn<>("Email",     UserDto::getEmail),
                new ExportColumn<>("First",     UserDto::getFirstName),
                new ExportColumn<>("Last",      UserDto::getLastName),
                new ExportColumn<>("Phone",     UserDto::getPhone)
        );
    }


    @Override
    public Stream<UserDto> stream(Map<String, String> params) {
        UserSearchRequest req = new UserSearchRequest();
        req.setEmail(params.get("email"));
        req.setFirstName(params.get("firstName"));
        req.setLastName(params.get("lastName"));
        req.setUsername(params.get("username"));
        req.setPhone(params.get("phone"));

        String sort = stringUtils.defaultIfBlank(params.get("sort"), "id");
        String dir  = stringUtils.defaultIfBlank(params.get("dir"),  "asc");
        Integer limit =  10_000;


        List<UserDto> rows = service.findForExport(req, sort, dir, limit);
        return rows.stream();
    }

}