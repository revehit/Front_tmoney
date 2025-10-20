package com.example.thymeleaf.export;

import lombok.Getter;

import java.util.function.Function;

@Getter
public class ExportColumn<T> {
    private final String header;
    private final Function<T, String> extractor;

    public ExportColumn(String header, Function<T, String> extractor) {
        this.header = header;
        this.extractor = extractor;
    }
}
