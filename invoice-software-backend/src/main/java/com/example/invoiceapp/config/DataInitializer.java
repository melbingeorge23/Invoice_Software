package com.example.invoiceapp.config;

import com.example.invoiceapp.entity.AppUser;
import com.example.invoiceapp.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUserIfNotExists(
                "Admin User",
                "admin@gmail.com",
                "admin123",
                "ADMIN"
        );

        createUserIfNotExists(
                "Staff User",
                "staff@gmail.com",
                "staff123",
                "STAFF"
        );
    }

    private void createUserIfNotExists(
            String name,
            String email,
            String rawPassword,
            String role
    ) {
        if (appUserRepository.findByEmail(email).isPresent()) {
            return;
        }

        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        appUserRepository.save(user);
    }
}