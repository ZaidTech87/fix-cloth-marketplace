package com.clothmarket.service;

import com.clothmarket.dto.ChatbotRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChatbotService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String model;

    @Value("${groq.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            Tum "Cloth Marketplace" app ke liye ek helpful assistant ho.
            Tumhara kaam sirf DO cheezon me madad karna hai:

            1. WEBSITE KAISE USE KAREIN:
               - Signup: mobile number aur password se account banta hai
               - Post banane ke liye: "Create Post" pe jaakar image/video, price, quantity daalo
               - Chat: kisi bhi user ki profile pe jaakar "Message" button se text/voice chat kar sakte ho
               - Call: chat screen me phone/video icon se voice ya video call kar sakte ho
               - Profile: apni profile image "Profile" page se update kar sakte ho

            2. TEXTILE/CLOTH INDUSTRY KNOWLEDGE:
               - Fabric types (cotton, polyester, silk, linen, wool, etc.), unke pros/cons
               - Quality check tips (fabric ki quality kaise pehchane)
               - Basic pricing/costing guidance for cloth business
               - Fabric care instructions (washing, storage)

            RULES:
            - Agar koi sawal in dono topics se bilkul related nahi hai (jaise movies,
              politics, coding, general knowledge), to politely mana karo:
              "Main sirf website aur textile se related sawalon me help kar sakta hoon."
            - Jawab hamesha short aur clear rakho (max 3-4 lines jab tak zaroorat na ho)
            - Hindi/English jis bhasha me user poochhe, usi me jawab do
            """;

    public String getReply(ChatbotRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return "Chatbot abhi configure nahi hua hai. Admin se contact karein.";
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 500);

        ArrayNode messages = body.putArray("messages");

        // Groq (OpenAI format) me system prompt bhi messages array ke andar
        // "system" role ke saath jaata hai (Anthropic ki tarah alag field nahi hota)
        ObjectNode systemMsg = messages.addObject();
        systemMsg.put("role", "system");
        systemMsg.put("content", SYSTEM_PROMPT);

        if (request.getHistory() != null) {
            for (ChatbotRequest.ChatTurn turn : request.getHistory()) {
                ObjectNode msgNode = messages.addObject();
                msgNode.put("role", turn.getRole());
                msgNode.put("content", turn.getContent());
            }
        }

        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", request.getMessage());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

        try {
            JsonNode response = restTemplate.postForObject(apiUrl, entity, JsonNode.class);
            return response.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            System.out.println("Chatbot API error: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, abhi jawab nahi de pa raha. Thodi der baad try karein.";
        }
    }
}