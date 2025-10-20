package com.example.thymeleaf;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@Controller
public class TestController {
    @GetMapping({"/", "/index"})
    public String home() {
        //return "page/dashboard/index";
        return "page/main/index";
    }

    // @GetMapping("/page/join/{view}")
    // public String join(@PathVariable String view) {
    //     return "page/join/" + view;
    // }

// =========================================== //
    @GetMapping("/page/dashboard/index")
    public String dashboard() {
        return "page/dashboard/index";
    }

    @GetMapping("/page/guide/{view}")
    public String guide(@PathVariable String view) {
        return "page/guide/" + view;
    }

    @GetMapping("/page/menu1/{view}")
    public String menu1(@PathVariable String view) {
        return "page/menu1/" + view;
    }

    @GetMapping("/component/{view}")
    public String component(@PathVariable String view) {
        return "component/" + view;
    }

    /* ─────────────────────────────────────────────────────────────
       [옵션] “리다이렉트만 하면 된다” 요구 대응용: /go/** 로 들어오면 동일 경로로 리다이렉트
       예) /go/page/guide/page3  -> redirect:/page/guide/page3
       ───────────────────────────────────────────────────────────── */
    

    @GetMapping("/go/page/guide/{view}")
    public String goGuide(@PathVariable String view) {
        return "redirect:/page/guide/" + view;
    }

    @GetMapping("/go/page/dashboard/index")
    public String goDashboard() {
        return "redirect:/page/dashboard/index";
    }

    @GetMapping("/go/menu1/{view}")
    public String goMenu1(@PathVariable String view) {
        return "redirect:/menu1/" + view;
    }

    @GetMapping("/go/component/{view}")
    public String goComponent(@PathVariable String view) {
        return "redirect:/component/" + view;
    }
}
