package com.backend.service.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.backend.dto.community.PostCreateDTO;
import com.backend.dto.community.PostDTO;
import com.backend.dto.community.PostUpdateDTO;

public interface PostService {
    
    PostDTO createPost(PostCreateDTO postCreateDTO);
    
    PostDTO getPost(Long id);
    
    Page<PostDTO> getPosts(Pageable pageable);
    
    Page<PostDTO> getPostsByCategory(String category, Pageable pageable);
    
    Page<PostDTO> searchPosts(String keyword, Pageable pageable);
    
    PostDTO updatePost(Long id, PostUpdateDTO postUpdateDTO);
    
    void deletePost(Long id);
    
    PostDTO toggleLike(Long id, String userEmail);
    
    void incrementViews(Long id);
    
    Object getTodayRecommendation();
    
    Object getTodayHiddenRestaurant();
} 