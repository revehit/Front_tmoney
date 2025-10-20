package com.example.thymeleaf.export;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ExportProviderRegistry {

    private final Map<String, ExportProvider<?>> providers;

    public ExportProviderRegistry(List<ExportProvider<?>> list) {
        this.providers = list.stream()
                .collect(Collectors.toUnmodifiableMap(ExportProvider::name, p -> p));
    }

    @SuppressWarnings("unchecked")
    public <T> ExportProvider<T> get(String name) {
        ExportProvider<?> p = providers.get(name);
        if (p == null) throw new IllegalArgumentException("Unknown provider: " + name);
        return (ExportProvider<T>) p; // 캡처는 호출 지점(makeBody)에서 안전하게 처리
    }
}