package com.wbill.home.security;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter to provide transparent backward compatibility during the API prefix migration.
 * Any incoming request to /api/card_managenment/* is forwarded internally to /api/mardaerp/*
 * so that legacy clients, cached apps, or integrations continue working seamlessly.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LegacyApiAliasFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LegacyApiAliasFilter.class);

    private static final String LEGACY_PREFIX = "/api/card_managenment";
    private static final String NEW_PREFIX = "/api/mardaerp";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String pathWithinApp = requestUri.substring(contextPath.length());

        if (pathWithinApp.startsWith(LEGACY_PREFIX)) {
            String targetPath = pathWithinApp.replaceFirst("^" + LEGACY_PREFIX, NEW_PREFIX);
            log.debug("[API-ALIAS] Rewriting legacy request {} -> {}", pathWithinApp, targetPath);
            request.getRequestDispatcher(targetPath).forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
