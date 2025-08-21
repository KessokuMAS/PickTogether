package com.backend.repository.community;

import com.backend.domain.community.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // 특정 게시글에 특정 사용자가 좋아요를 눌렀는지 확인
    Optional<PostLike> findByPostIdAndUserEmail(Long postId, String userEmail);
    
    // 특정 게시글의 좋아요 개수
    long countByPostId(Long postId);
    
    // 특정 게시글의 좋아요 삭제
    void deleteByPostIdAndUserEmail(Long postId, String userEmail);
    
    // 특정 사용자가 좋아요한 게시글 ID 목록 조회
    @Query("SELECT pl.post.id FROM PostLike pl WHERE pl.userEmail = :userEmail")
    java.util.List<Long> findPostIdsByUserEmail(@Param("userEmail") String userEmail);
} 