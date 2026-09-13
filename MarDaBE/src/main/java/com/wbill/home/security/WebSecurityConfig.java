package com.wbill.home.security;

import com.wbill.home.service.Security.UserDetailsServiceImpl;
import com.wbill.home.service.jwt.AuthEntryPointJwt;
import com.wbill.home.service.jwt.AuthTokenFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.core.Ordered;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity // or @EnableGlobalMethodSecurity(prePostEnabled = true) for older Spring
                      // versions
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Value("${app.cors.allowed-origins:}")
    private String allowedOriginProps;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins;
        if (allowedOriginProps != null && !allowedOriginProps.isBlank()) {
            origins = Arrays.stream(allowedOriginProps.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        } else {
            origins = List.of(
                    "http://localhost:9000",
                    "http://localhost:3001",
                    "http://192.168.100.106:9000",
                    "http://192.168.8.104:9000",
                    "http://172.10.10.64:9000",
                    "http://196.190.220.35:9000",
                    "http://196.189.51.123:9000",
                    "http://196.189.51.78:9000",
                    "http://196.189.51.78",
                    "http://196.189.51.123",
                    "http://196.189.51.123:9000",
                    "http://196.190.220.35:3001",
                    "http://10.116.212.31:9000");
        }
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // How long the results of a preflight request can be cached

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS to all paths
        return new CorsFilter(source);
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration(CorsFilter corsFilter) {
        FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>(corsFilter);
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registrationBean;
    }

    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    // http
    // .csrf(csrf -> csrf.disable()) // Disable CSRF as you are using JWT
    // .exceptionHandling(exception ->
    // exception.authenticationEntryPoint(unauthorizedHandler))
    // .sessionManagement(session ->
    // session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    // .authorizeHttpRequests(auth -> auth
    // // 👇 IMPORTANT: Update paths to include /hims/api prefix
    // .requestMatchers(
    // "/api/auth/**",
    // "/api/card_managenment/**"
    //// "/hims/api/auth/**",
    //// "/hims/api/card_managenment/**"
    // // Add any other public Actuator endpoints if needed, e.g.,
    // "/actuator/health"
    // ).permitAll()
    // .anyRequest().authenticated() // All other requests need authentication
    // )
    // .authenticationProvider(authenticationProvider())
    // // Add CorsFilter before Spring Security's main filters
    // .addFilterBefore(corsFilter(), UsernamePasswordAuthenticationFilter.class)
    // // Add your JWT token filter before UsernamePasswordAuthenticationFilter
    // .addFilterBefore(authenticationJwtTokenFilter(),
    // UsernamePasswordAuthenticationFilter.class);
    //
    // return http.build();
    // }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ Public authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // ✅ Public legacy mobile (ZPI-compatible) endpoints - These use internal
                        // authentication
                        .requestMatchers("/Billing_Inventory/billing/**").permitAll()
                        // ✅ New Mobile App endpoint - Uses internal authentication mechanism
                        .requestMatchers("/mardamobileapp/billing/**").permitAll()
                        // 🔒 SECURITY: Cashier payments require JWT authentication
                        .requestMatchers(HttpMethod.PUT, "/api/card_managenment/*/cashier-payment").authenticated()
                        // ⚠️ LEGACY: Card management endpoints currently public for backward
                        // compatibility
                        // TODO: Review and restrict these endpoints in future security audit
                        .requestMatchers("/api/card_managenment/**").permitAll()
                        // ✅ HRMS Enterprise endpoints
                        .requestMatchers("/api/hrms/**").permitAll()
                        // ✅ Permit Spring Boot error endpoint
                        .requestMatchers("/error", "/error/**").permitAll()
                        // ✅ Permit health probe without authentication
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        // ✅ Allow all CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 🔒 SECURITY: All other requests require authentication
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}
