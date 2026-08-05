package com.clothmarket.dto;

import lombok.Data;

@Data
public class CallSignal {
    private String type;       // call-invite, call-answer, call-reject, call-end, ice-candidate
    private Long fromUserId;
    private Long toUserId;
    private String fromUserName;
    private String callType;   // "audio" or "video"
    private Object payload;    // SDP offer/answer or ICE candidate JSON
}