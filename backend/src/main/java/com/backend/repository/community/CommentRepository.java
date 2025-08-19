package com.backend.repository.community;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.domain.community.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 게시글 ID로 댓글 목록 조회
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    
    // 게시글 ID로 댓글 개수 조회
    long countByPostId(Long postId);
} 