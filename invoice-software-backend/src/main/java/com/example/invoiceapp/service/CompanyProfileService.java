package com.example.invoiceapp.service;

import com.example.invoiceapp.entity.CompanyProfile;
import com.example.invoiceapp.repository.CompanyProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;

    public CompanyProfileService(CompanyProfileRepository companyProfileRepository) {
        this.companyProfileRepository = companyProfileRepository;
    }

    public CompanyProfile getCompanyProfile() {
        return companyProfileRepository.findAll()
                .stream()
                .findFirst()
                .orElse(null);
    }

    public CompanyProfile saveCompanyProfile(CompanyProfile companyProfile) {
        CompanyProfile existingProfile = getCompanyProfile();

        if (existingProfile != null) {
            existingProfile.setCompanyName(companyProfile.getCompanyName());
            
            existingProfile.setCompanyAddress(companyProfile.getCompanyAddress());
            existingProfile.setPhone(companyProfile.getPhone());
            existingProfile.setEmail(companyProfile.getEmail());
            existingProfile.setGstNumber(companyProfile.getGstNumber());
            existingProfile.setBankName(companyProfile.getBankName());
            existingProfile.setAccountNumber(companyProfile.getAccountNumber());
            existingProfile.setIfscCode(companyProfile.getIfscCode());
            existingProfile.setUpiId(companyProfile.getUpiId());

            return companyProfileRepository.save(existingProfile);
        }

        return companyProfileRepository.save(companyProfile);
    }

    public CompanyProfile uploadLogo(MultipartFile file) {
    try {
        CompanyProfile existingProfile = getCompanyProfile();

        if (existingProfile == null) {
            existingProfile = new CompanyProfile();
        }

        existingProfile.setLogoFileName(file.getOriginalFilename());
        existingProfile.setLogoContentType(file.getContentType());
        existingProfile.setLogoImage(file.getBytes());

        return companyProfileRepository.save(existingProfile);

    } catch (Exception e) {
        throw new RuntimeException("Failed to upload logo", e);
    }
}
}