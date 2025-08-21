package com.backend.dto.community;

import java.time.LocalDateTime;
import java.util.List;

import com.backend.domain.community.Post;
import com.backend.repository.community.PostLikeRepository;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    
    private Long id;
    private String title;
    private String content;
    private String category;
    private String author;
    private String imageUrl;
    private String address;
    private String restaurantName;
    private Integer views;
    private Integer likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer commentCount;
    private List<CommentDTO> comments;
    private Boolean isLiked;
    
    public static PostDTO fromEntity(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .author(post.getAuthor())
                .imageUrl(post.getImageUrl())
                .address(post.getAddress())
                .restaurantName(post.getRestaurantName())
                .views(post.getViews())
                .likes(post.getLikes())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(post.getComments().size())
                .comments(post.getComments().stream()
                        .map(CommentDTO::fromEntity)
                        .toList())
                .isLiked(false) // 기본값은 false
                .build();
    }
    
    public static PostDTO fromEntity(Post post, String userEmail, PostLikeRepository postLikeRepository) {
        boolean isLiked = postLikeRepository.findByPostIdAndUserEmail(post.getId(), userEmail).isPresent();
        
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .author(post.getAuthor())
                .imageUrl(post.getImageUrl())
                .address(post.getAddress())
                .restaurantName(post.getRestaurantName())
                .views(post.getViews())
                .likes(post.getLikes())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(post.getComments().size())
                .comments(post.getComments().stream()
                        .map(CommentDTO::fromEntity)
                        .toList())
                .isLiked(isLiked)
                .build();
    }
} 