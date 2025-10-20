package com.example.thymeleaf.export;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public interface ExportProvider<T> {
    String name();                                  // 예: "user"
    List<ExportColumn<T>> columns();                // 헤더/추출 정의
    Stream<T> stream(Map<String, String> params);   // 데이터 스트림 (필터/정렬/사이즈 반영)
}
