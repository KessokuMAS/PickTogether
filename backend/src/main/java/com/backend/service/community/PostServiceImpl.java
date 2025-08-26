package com.backend.service.community;

import com.backend.domain.community.Post;
import com.backend.dto.community.*;
import com.backend.repository.community.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {
    
    private final PostRepository postRepository;
    
    @Override
    @Transactional
    public PostDTO createPost(PostCreateDTO postCreateDTO) {
        String imageUrl = null;
        
        // 이미지 파일이 있으면 저장
        if (postCreateDTO.getImageFile() != null && !postCreateDTO.getImageFile().isEmpty()) {
            try {
                imageUrl = saveImageFile(postCreateDTO.getImageFile());
                log.info("이미지 파일 저장 완료: {}", imageUrl);
            } catch (IOException e) {
                log.error("이미지 파일 저장 실패", e);
                throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
            }
        }
        
        Post post = Post.builder()
                .title(postCreateDTO.getTitle())
                .content(postCreateDTO.getContent())
                .category(postCreateDTO.getCategory())
                .author(postCreateDTO.getAuthor() != null ? postCreateDTO.getAuthor() : "익명사용자")
                .imageUrl(imageUrl)
                .views(0)
                .likes(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Post savedPost = postRepository.save(post);
        return PostDTO.fromEntity(savedPost);
    }
    
    @Override
    @Transactional
    public PostDTO getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        // 조회수 증가
        post.incrementViews();
        postRepository.save(post);
        
        return PostDTO.fromEntity(post);
    }
    
    @Override
    public Page<PostDTO> getPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return posts.map(PostDTO::fromEntity);
    }
    
    @Override
    public Page<PostDTO> getPostsByCategory(String category, Pageable pageable) {
        if ("전체".equals(category)) {
            return getPosts(pageable);
        }
        Page<Post> posts = postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        return posts.map(PostDTO::fromEntity);
    }
    
    @Override
    public Page<PostDTO> searchPosts(String keyword, Pageable pageable) {
        Page<Post> posts = postRepository.findByKeyword(keyword, pageable);
        return posts.map(PostDTO::fromEntity);
    }
    
    @Override
    @Transactional
    public PostDTO updatePost(Long id, PostUpdateDTO postUpdateDTO) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        // 이미지 파일이 있으면 저장
        if (postUpdateDTO.getImageFile() != null && !postUpdateDTO.getImageFile().isEmpty()) {
            try {
                String imageUrl = saveImageFile(postUpdateDTO.getImageFile());
                post.setImageUrl(imageUrl);
                log.info("이미지 파일 업데이트 완료: {}", imageUrl);
            } catch (IOException e) {
                log.error("이미지 파일 업데이트 실패", e);
                throw new RuntimeException("이미지 파일 업데이트에 실패했습니다.", e);
            }
        }
        
        post.setTitle(postUpdateDTO.getTitle());
        post.setContent(postUpdateDTO.getContent());
        post.setCategory(postUpdateDTO.getCategory());
        
        Post updatedPost = postRepository.save(post);
        return PostDTO.fromEntity(updatedPost);
    }
    
    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        postRepository.delete(post);
    }
    
    @Override
    @Transactional
    public PostDTO likePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        post.incrementLikes();
        Post likedPost = postRepository.save(post);
        return PostDTO.fromEntity(likedPost);
    }
    
    @Override
    @Transactional
    public void incrementViews(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        post.incrementViews();
        postRepository.save(post);
    }
    
    /**
     * 이미지 파일을 저장하고 URL을 반환
     */
    private String saveImageFile(MultipartFile imageFile) throws IOException {
        // 프로젝트 루트 기준 업로드 디렉토리
        String projectRoot = System.getProperty("user.dir");
        // Windows 환경을 위한 경로 구분자 처리
        String uploadDir = projectRoot + File.separator + "uploads" + File.separator + "images";
        Path uploadPath = Paths.get(uploadDir);
        
        log.info("=== 이미지 저장 정보 ===");
        log.info("프로젝트 루트: {}", projectRoot);
        log.info("업로드 디렉토리: {}", uploadDir);
        log.info("업로드 경로: {}", uploadPath);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("업로드 디렉토리 생성 완료: {}", uploadPath);
        }
        
        // 파일명 생성 (중복 방지)
        String originalFilename = imageFile.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + fileExtension;
        
        // 파일 저장
        Path filePath = uploadPath.resolve(filename);
        Files.copy(imageFile.getInputStream(), filePath);
        
        log.info("이미지 파일 저장 완료: {}", filePath);
        log.info("이미지 URL: /images/{}", filename);
        log.info("========================");
        
        // URL 반환 (정적 리소스 경로)
        return "/images/" + filename;
    }
} 