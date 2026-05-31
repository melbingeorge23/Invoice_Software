package com.example.invoiceapp.controller;

import com.example.invoiceapp.entity.Product;
import com.example.invoiceapp.service.ProductService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;


@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
@PreAuthorize("hasRole('ADMIN')")
public Product createProduct(@RequestBody Product product) {
    return productService.createProduct(product);
}

    @GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public List<Product> getAllProducts() {
    return productService.getAllProducts();
}

    @PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
    return productService.updateProduct(id, product);
}

    @DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public String deleteProduct(@PathVariable Long id) {
    productService.deleteProduct(id);
    return "Product deleted successfully";
}
}