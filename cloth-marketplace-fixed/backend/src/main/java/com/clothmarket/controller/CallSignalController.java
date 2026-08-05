package com.clothmarket.controller;

import com.clothmarket.dto.CallSignal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CallSignalController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/call/signal")
    public void handleCallSignal(CallSignal signal) {
        // Signal ko seedha target user ke private topic pe relay kar do.
        // Database mein kuch save nahi karna — ye sirf WebRTC signaling ke liye pass-through hai.
        messagingTemplate.convertAndSend("/topic/call/" + signal.getToUserId(), signal);
    }
}