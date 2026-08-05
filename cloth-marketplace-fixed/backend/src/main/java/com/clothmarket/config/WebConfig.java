package com.clothmarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // NOTE: CORS mapping moved to SecurityConfig's CorsConfigurationSource bean,
    // which reads allowed origins from the "allowed.origins" property/env var
    // (Step 4 fix). Keeping it in two places used to cause conflicting rules.

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Current directory ka absolute path nikaalein
        String rootPath = System.getProperty("user.dir");
        String uploadPath = "file:" + rootPath + "/uploads/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(0); // Cache issue khatam karne ke liye

        // Console mein check karne ke liye rasta print karein
        System.out.println("Spring is looking for files in: " + uploadPath);
    }

}
