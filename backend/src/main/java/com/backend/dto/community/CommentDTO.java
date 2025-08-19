package com.backend.dto.community;

import java.time.LocalDateTime;

import com.backend.domain.community.Comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    
    private Long id;
    private String content;
    private String author;
    private String authorEmail;
    private Long postId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static CommentDTO fromEntity(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(comment.getAuthor())
                .authorEmail(comment.getAuthorEmail())
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
} 