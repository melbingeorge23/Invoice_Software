package com.example.invoiceapp.controller;

import com.example.invoiceapp.entity.Customer;
import com.example.invoiceapp.service.CustomerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;


@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
@PreAuthorize("hasRole('ADMIN')")
public Customer createCustomer(@RequestBody Customer customer) {
    return customerService.createCustomer(customer);
}

    @GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public List<Customer> getAllCustomers() {
    return customerService.getAllCustomers();
}

    @PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
    return customerService.updateCustomer(id, customer);
}

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public String deleteCustomer(@PathVariable Long id) {
    customerService.deleteCustomer(id);
    return "Customer deleted successfully";
}
}