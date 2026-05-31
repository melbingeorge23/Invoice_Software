package com.example.invoiceapp.controller;

import com.example.invoiceapp.dto.UserRequest;
import com.example.invoiceapp.entity.AppUser;
import com.example.invoiceapp.service.UserManagementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<AppUser> getAllUsers() {
        return userManagementService.getAllUsers();
    }

    @PostMapping
    public AppUser createUser(@RequestBody UserRequest request) {
        return userManagementService.createUser(request);
    }

    @PutMapping("/{id}")
    public AppUser updateUser(
            @PathVariable Long id,
            @RequestBody UserRequest request
    ) {
        return userManagementService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return "User deleted successfully";
    }
}