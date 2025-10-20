package com.example.thymeleaf.util;

import org.springframework.stereotype.Component;

@Component
public class StringUtils {
    public String defaultIfBlank(String s, String def) {
        String t = trim(s);
        return (t == null) ? def : t;
    }
    public String trim(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
