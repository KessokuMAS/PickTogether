package com.backend.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.domain.community.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 카테고리별 게시글 조회
    Page<Post> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
    
    // 제목 또는 내용으로 검색
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    Page<Post> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // 조회수 높은 순으로 조회
    Page<Post> findAllByOrderByViewsDesc(Pageable pageable);
    
    // 좋아요 높은 순으로 조회
    Page<Post> findAllByOrderByLikesDesc(Pageable pageable);
    
    // 최신순으로 조회
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
} 