package com.example.invoiceapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping(value = {
            "/",
            "/login",
            "/dashboard",
            "/invoices",
            "/customers",
            "/products"
    })
    public String index() {
        return "forward:/index.html";
    }
}