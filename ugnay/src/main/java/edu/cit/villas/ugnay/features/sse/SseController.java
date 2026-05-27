package edu.cit.villas.ugnay.features.sse;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import edu.cit.villas.ugnay.shared.entity.User;

/**
 * SSE Controller — clients subscribe to real-time events.
 * GET /api/sse/subscribe — authenticated, returns text/event-stream
 */
@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal User user) {
        System.out.println("SSE: User #" + user.getUserId() + " subscribed");
        return sseService.subscribe(user.getUserId());
    }
}
