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

/**
 * STEP 5 FIX: Pehle sab files "uploads/" folder me local disk pe save hoti
 * thi. Render/Heroku jaise free hosts pe disk ephemeral hoti hai - restart
 * ya redeploy hote hi saari uploaded images/videos/voice-notes gayab ho
 * jaati thi.
 *
 * Ab agar CLOUDINARY_URL env var set hai, files Cloudinary (persistent cloud
 * storage) par jaati hain aur ek permanent HTTPS URL milta hai. Agar
 * CLOUDINARY_URL set nahi hai (local dev), local disk fallback chalta hai
 * jaisa pehle tha - taaki bina Cloudinary account ke bhi local test kar sako.
 */
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
        return cloudinary() != null;
    }

    /**
     * @param file       file to store
     * @param folder     logical folder, e.g. "posts", "profiles", "voice"
     * @return public URL to access the stored file
     */
    @SuppressWarnings("unchecked")
    public String store(MultipartFile file, String folder) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID() + extension;

        if (isCloudEnabled()) {
            Map<String, Object> uploadResult = cloudinary().uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "folder", "cloth-marketplace/" + folder,
                            "public_id", uniqueFilename
                    )
            );
            return (String) uploadResult.get("secure_url");
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

    /**
     * Best-effort delete. For local files only (Cloudinary cleanup is optional
     * and not required for correctness, so it's skipped here to keep this
     * simple - can be added later with cloudinary().uploader().destroy(...)).
     */
    public void deleteLocalIfApplicable(String mediaUrl) {
        if (isCloudEnabled() || mediaUrl == null || mediaUrl.isBlank() || !mediaUrl.startsWith("/uploads/")) {
            return;
        }
        try {
            String relative = mediaUrl.substring(1); // drop leading slash
            Path filePath = Paths.get(System.getProperty("user.dir"), relative.replace("/", File.separator));
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            System.out.println("Could not delete local media: " + mediaUrl);
        }
    }
}
