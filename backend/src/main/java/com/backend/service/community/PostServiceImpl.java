package com.backend.service.community;

import com.backend.domain.community.Post;
import com.backend.domain.community.PostLike;
import com.backend.dto.community.*;
import com.backend.repository.community.PostRepository;
import com.backend.repository.community.PostLikeRepository;
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
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {
    
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    
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
                .address(postCreateDTO.getAddress())
                .restaurantName(postCreateDTO.getRestaurantName())
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
        
        // 조회수 증가는 별도 엔드포인트로 처리
        // post.incrementViews();
        // postRepository.save(post);
        
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
        post.setAddress(postUpdateDTO.getAddress());
        post.setRestaurantName(postUpdateDTO.getRestaurantName());
        
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
    public PostDTO toggleLike(Long id, String userEmail) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        // 사용자가 이미 좋아요를 눌렀는지 확인
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserEmail(id, userEmail);
        
        if (existingLike.isPresent()) {
            // 이미 좋아요를 눌렀다면 취소
            log.info("사용자 {}가 게시글 {}의 좋아요를 취소했습니다.", userEmail, id);
            postLikeRepository.delete(existingLike.get());
            post.decrementLikes();
        } else {
            // 좋아요를 누르지 않았다면 추가
            log.info("사용자 {}가 게시글 {}에 좋아요를 눌렀습니다.", userEmail, id);
            PostLike newLike = PostLike.builder()
                    .post(post)
                    .userEmail(userEmail)
                    .build();
            postLikeRepository.save(newLike);
            post.incrementLikes();
        }
        
        Post updatedPost = postRepository.save(post);
        return PostDTO.fromEntity(updatedPost);
    }
    
    @Override
    @Transactional
    public void incrementViews(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
        
        // 조회수 증가
        post.incrementViews();
        postRepository.save(post);
        
        log.info("게시글 {} 조회수 증가 완료: {}", id, post.getViews());
    }
    
    @Override
    public Object getTodayRecommendation() {
        // 펀딩추천 카테고리에서 가장 인기 있는 게시글 찾기
        try {
            Post topFundingPost = postRepository.findByCategoryOrderByLikesDesc("펀딩추천")
                    .stream()
                    .findFirst()
                    .orElse(null);
            
            if (topFundingPost != null) {
                return Map.of(
                    "restaurantName", topFundingPost.getRestaurantName() != null ? topFundingPost.getRestaurantName() : "추천 펀딩",
                    "mentionCount", topFundingPost.getLikes(),
                    "description", "커뮤니티에서 추천된 펀딩을 확인해보세요!",
                    "imageUrl", topFundingPost.getImageUrl() != null ? topFundingPost.getImageUrl() : "/images/recommendation-placeholder.jpg"
                );
            }
        } catch (Exception e) {
            log.error("오늘의 펀딩 추천 조회 중 오류 발생", e);
        }
        
        // 기본값 반환
        return Map.of(
            "restaurantName", "추천 펀딩",
            "mentionCount", 0,
            "description", "커뮤니티에서 추천된 펀딩을 확인해보세요!",
            "imageUrl", "/images/recommendation-placeholder.jpg"
        );
    }

    @Override
    public Object getTodayHiddenRestaurant() {
        // 숨은 맛집추천 카테고리에서 가장 인기 있는 게시글 찾기
        try {
            Post topHiddenRestaurantPost = postRepository.findByCategoryOrderByLikesDesc("숨은 맛집추천")
                    .stream()
                    .findFirst()
                    .orElse(null);
            
            if (topHiddenRestaurantPost != null) {
                return Map.of(
                    "restaurantName", topHiddenRestaurantPost.getRestaurantName() != null ? topHiddenRestaurantPost.getRestaurantName() : "숨은 맛집",
                    "mentionCount", topHiddenRestaurantPost.getLikes(),
                    "description", "커뮤니티에서 추천된 숨은 맛집을 확인해보세요!",
                    "imageUrl", topHiddenRestaurantPost.getImageUrl() != null ? topHiddenRestaurantPost.getImageUrl() : "/images/restaurant-placeholder.jpg",
                    "address", topHiddenRestaurantPost.getAddress() != null ? topHiddenRestaurantPost.getAddress() : "주소 정보 없음"
                );
            }
        } catch (Exception e) {
            log.error("오늘의 숨은 맛집 추천 조회 중 오류 발생", e);
        }
        
        // 기본값 반환
        return Map.of(
            "restaurantName", "숨은 맛집",
            "mentionCount", 0,
            "description", "커뮤니티에서 추천된 숨은 맛집을 확인해보세요!",
            "imageUrl", "/images/restaurant-placeholder.jpg",
            "address", "주소 정보 없음"
        );
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