package com.clothmarket.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

/**
 * Post upload se pehle image ko NSFW/nude content ke liye check karta hai.
 * Agar unsafe content milta hai, exception throw karta hai jisse post
 * save hi nahi hota (feed me kabhi pahunchta hi nahi).
 */
@Service
public class ModerationService {

    @Value("${sightengine.api.user}")
    private String apiUser;

    @Value("${sightengine.api.secret}")
    private String apiSecret;

    @Value("${sightengine.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // In dono se upar ki value aane par content block hoga (0 = safe, 1 = definitely unsafe)
    private static final double NUDITY_THRESHOLD = 0.5;

    public void checkImage(MultipartFile file) {
        if (apiUser == null || apiUser.isBlank()) {
            // Agar configure nahi hai to check skip kar do (fail-open, taaki
            // app poori tarah break na ho) - production me isse fail-closed
            // banane ka socho (yaani agar moderation na chale to upload hi
            // reject kar do), abhi MVP ke liye fail-open rakha hai.
            System.out.println("Moderation not configured, skipping NSFW check.");
            return;
        }

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (java.io.IOException e) {
            System.out.println("Could not read file for moderation check: " + e.getMessage());
            return; // fail-open: file read nahi ho payi to check skip karo
        }

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("media", new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });
        form.add("models", "nudity-2.1");
        form.add("api_user", apiUser);
        form.add("api_secret", apiSecret);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(form, headers);

        JsonNode response = restTemplate.postForObject(apiUrl, entity, JsonNode.class);

        if (response == null || !response.has("nudity")) {
            System.out.println("Moderation API unexpected response, allowing upload.");
            return;
        }

        JsonNode nudity = response.get("nudity");
        double sexualActivity = nudity.path("sexual_activity").asDouble(0);
        double sexualDisplay = nudity.path("sexual_display").asDouble(0);
        double erotica = nudity.path("erotica").asDouble(0);

        double maxScore = Math.max(sexualActivity, Math.max(sexualDisplay, erotica));

        if (maxScore >= NUDITY_THRESHOLD) {
            throw new RuntimeException("Yeh image community guidelines follow nahi karti aur upload nahi ki ja sakti.");
        }
    }
}
//this is only for commit
//i am doing commit operation