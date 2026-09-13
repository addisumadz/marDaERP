package com.wbill.home.springjwt.payload.response;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Integer id; // Changed from Long to Integer
    private String username;
    private String name;
    private List<String> roles;
    private List<String> permittedPages;

    public JwtResponse(String accessToken, Integer id, String username, String name, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.name = name;
        this.roles = roles;
    }

    public JwtResponse(String accessToken, Integer id, String username, String name, List<String> roles, List<String> permittedPages) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.permittedPages = permittedPages;
    }

    public String getAccessToken() {
        return token;
    }

    public void setAccessToken(String accessToken) {
        this.token = accessToken;
    }

    public String getTokenType() {
        return type;
    }

    public void setTokenType(String tokenType) {
        this.type = tokenType;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getPermittedPages() {
        return permittedPages;
    }

    public void setPermittedPages(List<String> permittedPages) {
        this.permittedPages = permittedPages;
    }
}

