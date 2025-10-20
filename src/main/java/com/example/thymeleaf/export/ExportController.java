package com.example.thymeleaf.export;



import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/export")
public class ExportController {

    private final ExportProviderRegistry registry;

    public ExportController(ExportProviderRegistry registry) {
        this.registry = registry;
    }

    @GetMapping("/xlsx")
    public ResponseEntity<StreamingResponseBody> exportXlsx(
            @RequestParam String provider,
            @RequestParam Map<String, String> allParams
    ) {
        String title = capitalize(provider);
        String file  = title + "-" + LocalDate.now() + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        // filename & filename* (RFC 5987)
        String encoded = URLEncoder.encode(file, StandardCharsets.UTF_8).replace("+", "%20");
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file + "\"; filename*=UTF-8''" + encoded);

        StreamingResponseBody body = makeBody(title, registry.get(provider), allParams);

        return ResponseEntity.ok().headers(headers).body(body);
    }

    private static <T> StreamingResponseBody makeBody(
            String title,
            ExportProvider<T> provider,
            Map<String, String> params
    ) {
        return os -> {
            try {
                ExcelWriter.write(title, provider.columns(), provider.stream(params), os);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return "Export";
        return s.substring(0,1).toUpperCase() + s.substring(1);
    }
}
