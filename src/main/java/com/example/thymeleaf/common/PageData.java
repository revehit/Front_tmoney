package com.example.thymeleaf.common;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PageData<T> {
    private List<T> content;
    private int page;
    private int size;
    private long total;

    public long getTotalPages() { return (total + size - 1) / size; }
    public boolean isHasPrev() { return page > 0; }
    public boolean isHasNext() { return page + 1 < getTotalPages(); }
}
