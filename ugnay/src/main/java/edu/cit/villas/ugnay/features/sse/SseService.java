package edu.cit.villas.ugnay.features.sse;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * SSE Service — manages active SSE connections per user.
 * Each user can have multiple tabs/connections (CopyOnWriteArrayList).
 * Events are pushed to all connections for a given userId.
 */
@Service
public class SseService {

    // userId -> list of active emitters (supports multiple tabs)
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * Register a new SSE emitter for a user.
     * Timeout: 30 minutes (long-lived connection).
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 min

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // Clean up on completion, timeout, or error
        Runnable cleanup = () -> {
            CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
            if (userEmitters != null) {
                userEmitters.remove(emitter);
                if (userEmitters.isEmpty()) {
                    emitters.remove(userId);
                }
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"message\":\"SSE connection established\"}"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    /**
     * Push an event to a specific user (all their connections).
     */
    public void sendToUser(Long userId, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) return;

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                emitter.completeWithError(e);
                userEmitters.remove(emitter);
            }
        }
    }

    /**
     * Push an event to multiple users.
     */
    public void sendToUsers(java.util.List<Long> userIds, String eventName, Object data) {
        for (Long userId : userIds) {
            sendToUser(userId, eventName, data);
        }
    }
}
