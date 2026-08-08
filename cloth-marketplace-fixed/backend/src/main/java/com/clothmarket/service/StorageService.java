package com.clothmarket.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    private Cloudinary cloudinary;

    private Cloudinary cloudinary() {
        if (cloudinary == null && cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            cloudinary = new Cloudinary(cloudinaryUrl);
        }
        return cloudinary;
    }

    public boolean isCloudEnabled() {
        System.out.println("DEBUG: cloudinaryUrl length = " + (cloudinaryUrl == null ? "NULL" : cloudinaryUrl.length()));
        System.out.println("DEBUG: cloudinaryUrl value = [" + cloudinaryUrl + "]");
        return cloudinary() != null;
    }

    @SuppressWarnings("unchecked")
    public String store(MultipartFile file, String folder) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID() + extension;

        if (isCloudEnabled()) {
            try {
                Map<String, Object> uploadResult = cloudinary().uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "resource_type", "auto",
                                "folder", "cloth-marketplace/" + folder,
                                "public_id", uniqueFilename
                        )
                );
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                System.out.println("DEBUG: Cloudinary upload FAILED: " + e.getMessage());
                e.printStackTrace();
                // fall through to local storage as backup so post creation doesn't break
            }
        }

        // Local disk fallback (dev only)
        String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + folder;
        File uploadDirectory = new File(uploadPath);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }
        Path filePath = Paths.get(uploadPath, uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + folder + "/" + uniqueFilename;
    }

    public void deleteLocalIfApplicable(String mediaUrl) {
        if (isCloudEnabled() || mediaUrl == null || mediaUrl.isBlank() || !mediaUrl.startsWith("/uploads/")) {
            return;
        }
        try {
            String relative = mediaUrl.substring(1);
            Path filePath = Paths.get(System.getProperty("user.dir"), relative.replace("/", File.separator));
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            System.out.println("Could not delete local media: " + mediaUrl);
        }
    }
}