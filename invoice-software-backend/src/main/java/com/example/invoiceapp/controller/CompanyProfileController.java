package com.example.invoiceapp.controller;

import com.example.invoiceapp.entity.CompanyProfile;
import com.example.invoiceapp.service.CompanyProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/company-profile")
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    public CompanyProfileController(CompanyProfileService companyProfileService) {
        this.companyProfileService = companyProfileService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public CompanyProfile getCompanyProfile() {
        return companyProfileService.getCompanyProfile();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CompanyProfile saveCompanyProfile(@RequestBody CompanyProfile companyProfile) {
        return companyProfileService.saveCompanyProfile(companyProfile);
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public CompanyProfile uploadLogo(@RequestParam("file") MultipartFile file) {
    return companyProfileService.uploadLogo(file);
}

@GetMapping("/logo")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public ResponseEntity<byte[]> getLogo() {
    CompanyProfile profile = companyProfileService.getCompanyProfile();

    if (profile == null || profile.getLogoImage() == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(profile.getLogoContentType()))
            .body(profile.getLogoImage());
}
}