package com.example.thymeleaf.file.service;

import java.io.File;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    private final Path rootLocation;
    public static final String ROOT_PATH = System.getProperty("user.dir")+ File.separator + "file";

    public FileStorageService() {
        this.rootLocation = Paths.get(ROOT_PATH).toAbsolutePath().normalize();
    }
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (Exception e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패: " + rootLocation, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("빈 파일은 업로드할 수 없습니다.");
        }

        // 원본 파일명 정리
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");

        // 경로 역참조 방지
        if (originalName.contains("..")) {
            throw new RuntimeException("유효하지 않은 파일명: " + originalName);
        }

        // 저장 파일명: UUID_원본이름
        String savedName = UUID.randomUUID() + "_" + originalName;

        try (InputStream in = file.getInputStream()) {
            Path destination = rootLocation.resolve(savedName).normalize();
            // 업로드 루트 밖으로 벗어나는 것 방지
            if (!destination.startsWith(rootLocation)) {
                throw new RuntimeException("저장 경로가 업로드 루트를 벗어납니다.");
            }
            Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
            return savedName;
        } catch (Exception e) {
            throw new RuntimeException("파일 저장 실패: " + originalName + " -> " + e.getMessage(), e);
        }
    }

    public String storeAll(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            return store(file);
        }
        return "";
    }

    public Path getUploadRoot() {
        return rootLocation;
    }


    public Resource loadAsResource(String filename) {
        // filename은 저장 때 만든 "UUID_원본" 형태가 들어옴
        try {
            Path file = rootLocation.resolve(filename).normalize();
            if (!file.startsWith(rootLocation)) throw new RuntimeException("잘못된 경로 접근");
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new RuntimeException("파일을 읽을 수 없습니다: " + filename);
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("잘못된 파일 경로: " + filename, e);
        }
    }


    public Stream<String> listFilenames() {
        try {
            // 루트 바로 아래 파일만 나열 (하위 폴더 탐색 X)
            return Files.list(rootLocation)
                    .filter(Files::isRegularFile) // 텍스트파일, 이미지파일, 워드파일처럼 데이터가 저장된 파일인지 검사
                    .map(p -> p.getFileName().toString());
        } catch (Exception e) {
            throw new RuntimeException("파일 목록 조회 실패", e);
        }
    }
    public void clearAll() {
        try {
            // 루트 바로 아래 파일만 삭제 (하위 폴더를 쓰고 있다면 walkFileTree로 변경)
            try (var stream = Files.list(rootLocation)) {
                stream.filter(Files::isRegularFile).forEach(p -> {
                    try { Files.deleteIfExists(p); } catch (Exception ignored) {}
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("업로드 파일 초기화 실패", e);
        }
    }
}
