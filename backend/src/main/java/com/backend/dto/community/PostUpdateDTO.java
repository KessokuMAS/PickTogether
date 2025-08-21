package com.backend.dto.community;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateDTO {
    
    private String title;
    private String content;
    private String category;
    private MultipartFile imageFile;
    private String address;
    private String restaurantName;
} 