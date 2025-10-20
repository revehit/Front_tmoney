package com.example.thymeleaf.user.controller;

import com.example.thymeleaf.common.PageData;
import com.example.thymeleaf.user.dto.UserDto;
import com.example.thymeleaf.user.dto.UserSearchRequest;
import com.example.thymeleaf.user.service.impl.UserService;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    // 전체 페이지
    @GetMapping
    public String page(
            @ModelAttribute UserSearchRequest req,                 // q, email, firstName, lastName, username, phone
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String dir,
            Model model
    ) {
        PageData<UserDto> contents = userService.search(req, page, size, sort, dir);

        model.addAttribute("pageData", contents);
        // 화면 유지용
        model.addAttribute("req", req);
        model.addAttribute("page", page);
        model.addAttribute("size", size);
        model.addAttribute("sort", sort);
        model.addAttribute("dir", dir);
        return "user/index";
    }

    @GetMapping(path="/new", produces = MediaType.TEXT_HTML_VALUE)
    public String newForm(Model model) {
        model.addAttribute("user", new UserDto());
        return "user/form :: form";
    }

    @GetMapping(path="/{id}/edit", produces = MediaType.TEXT_HTML_VALUE)
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("user", userService.selectOne(id));
        return "user/form :: form";
    }

    // 생성
    @PostMapping(produces = MediaType.TEXT_HTML_VALUE)
    public String create(@ModelAttribute UserDto form, Model model) {
        UserDto userDto = userService.insertOne(form);
        model.addAttribute("u", userDto);
        return "user/row :: row";
    }

    // 수정
    @PutMapping(path="/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public String update(@PathVariable Long id, @ModelAttribute UserDto form, Model model) {
        UserDto saved = userService.updateOne(form);
        model.addAttribute("u", saved);
        return "user/row :: row";
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteOne(id);
        return ResponseEntity.ok().build();
    }
}
