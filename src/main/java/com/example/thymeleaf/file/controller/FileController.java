// src/main/java/com/example/thymeleaf/file/controller/FileController.java
package com.example.thymeleaf.file.controller;

import com.example.thymeleaf.file.service.FileStorageService;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService storageService;

    /** 최초 진입 화면 */
    @GetMapping("/file/upload")
    public String uploadForm(Model model) {
        List<String> existing = storageService.listFilenames().collect(Collectors.toList());
        model.addAttribute("savedFiles", existing);
        model.addAttribute("uploadRoot", storageService.getUploadRoot().toString());
        return "upload/file";
    }

    /** 업로드 (AJAX/일반 둘 다 허용) */
    @PostMapping("/file/upload")
    public String handleFileUpload(@RequestParam(name = "file", required = false) MultipartFile file) {
        storageService.storeAll(file);
        // AJAX일 땐 JS가 /file/list를 다시 호출 → 여기선 빈 204처럼 동작시키려면 redirect 없이 fragment도 가능
        return "redirect:/file/upload"; // 일반 폼 제출 대비
    }

    /** 선택 삭제 (AJAX/일반 둘 다 허용) */
    @PostMapping("/file/delete")
    public String deleteSelected(@RequestParam(name = "filenames", required = false) List<String> filenames) {
        if (filenames != null) {
            filenames.forEach(name -> {
                try { Files.deleteIfExists(storageService.getUploadRoot().resolve(name).normalize()); }
                catch (Exception ignored) {}
            });
        }
        return "redirect:/file/upload";
    }

    /** 전체 삭제 (AJAX/일반 둘 다 허용) */
    @PostMapping("/file/reset")
    public String resetAll() {
        storageService.clearAll();
        return "redirect:/file/upload";
    }

    /** inline 보기 */
    @GetMapping("/file/view/{filename}")
    @ResponseBody
    public org.springframework.http.ResponseEntity<Resource> view(@PathVariable String filename) {
        Resource file = storageService.loadAsResource(filename);
        MediaType mediaType = MediaTypeFactory.getMediaType(file).orElse(MediaType.APPLICATION_OCTET_STREAM);
        ContentDisposition disposition = ContentDisposition.inline().filename(filename, StandardCharsets.UTF_8).build();
        return org.springframework.http.ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(mediaType)
                .body(file);
    }

    /** 다운로드 */
    @GetMapping("/file/download/{filename}")
    @ResponseBody
    public org.springframework.http.ResponseEntity<Resource> download(@PathVariable String filename) {
        Resource file = storageService.loadAsResource(filename);
        MediaType mediaType = MediaTypeFactory.getMediaType(file).orElse(MediaType.APPLICATION_OCTET_STREAM);
        ContentDisposition disposition = ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build();
        return org.springframework.http.ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(mediaType)
                .body(file);
    }
    @GetMapping("/file/list")
    @ResponseBody
    public List<String> listJson() {
        return storageService.listFilenames().collect(Collectors.toList());
    }
}
