package com.backend.controller.community;

import com.backend.dto.community.*;
import com.backend.service.community.PostService;
import com.backend.service.community.CommentService;
import com.backend.dto.community.CommentUpdateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
@Slf4j
public class CommunityController {
    
    private final PostService postService;
    private final CommentService commentService;
    
    // 게시글 생성
    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        
        log.info("게시글 생성 요청: title={}, category={}, imageFile={}", 
                title, category, imageFile != null ? imageFile.getOriginalFilename() : "없음");
        
        PostCreateDTO postCreateDTO = PostCreateDTO.builder()
                .title(title)
                .content(content)
                .category(category)
                .author(author)
                .imageFile(imageFile)
                .build();
        
        PostDTO createdPost = postService.createPost(postCreateDTO);
        return ResponseEntity.ok(createdPost);
    }
    
    // 게시글 조회 (조회수 증가)
    @GetMapping("/posts/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PostDTO> getPost(@PathVariable("id") Long id) {
        log.info("게시글 조회 요청: ID {}", id);
        PostDTO post = postService.getPost(id);
        return ResponseEntity.ok(post);
    }
    
    // 게시글 목록 조회 (페이징)
    @GetMapping("/posts")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<PostDTO>> getPosts(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        log.info("게시글 목록 조회 요청: page={}, size={}, sort={}", page, size, sortBy);
        Page<PostDTO> posts = postService.getPosts(pageable);
        return ResponseEntity.ok(posts);
    }
    
    // 카테고리별 게시글 조회
    @GetMapping("/posts/category/{category}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<PostDTO>> getPostsByCategory(
            @PathVariable("category") String category,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        log.info("카테고리별 게시글 조회 요청: category={}, page={}, size={}", category, page, size);
        Page<PostDTO> posts = postService.getPostsByCategory(category, pageable);
        return ResponseEntity.ok(posts);
    }
    
    // 키워드로 게시글 검색
    @GetMapping("/posts/search")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<PostDTO>> searchPosts(
            @RequestParam(name = "keyword") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        log.info("게시글 검색 요청: keyword={}, page={}, size={}", keyword, page, size);
        Page<PostDTO> posts = postService.searchPosts(keyword, pageable);
        return ResponseEntity.ok(posts);
    }
    
    // 게시글 수정
    @PutMapping(value = "/posts/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        
        log.info("게시글 수정 요청: ID {}, title={}, category={}, imageFile={}", 
                id, title, category, imageFile != null ? imageFile.getOriginalFilename() : "없음");
        
        PostUpdateDTO postUpdateDTO = PostUpdateDTO.builder()
                .title(title)
                .content(content)
                .category(category)
                .imageFile(imageFile)
                .build();
        
        PostDTO updatedPost = postService.updatePost(id, postUpdateDTO);
        return ResponseEntity.ok(updatedPost);
    }
    
    // 게시글 삭제
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
        log.info("게시글 삭제 요청: ID {}", id);
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
    
    // 게시글 좋아요
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<PostDTO> likePost(@PathVariable("id") Long id) {
        log.info("게시글 좋아요 요청: ID {}", id);
        PostDTO likedPost = postService.likePost(id);
        return ResponseEntity.ok(likedPost);
    }

    // 댓글 목록 조회
    @GetMapping("/posts/{postId}/comments")
    @PreAuthorize("permitAll()")
    public ResponseEntity<java.util.List<CommentDTO>> getComments(@PathVariable("postId") Long postId) {
        log.info("[댓글] 목록 조회 요청 - postId={}", postId);
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    // 댓글 작성
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable("postId") Long postId,
            @RequestBody CommentCreateDTO dto) {
        dto.setPostId(postId);
        log.info("[댓글] 작성 요청 - postId={}, author={}, authorEmail={}", postId, dto.getAuthor(), dto.getAuthorEmail());
        CommentDTO saved = commentService.addComment(dto);
        log.info("[댓글] 작성 성공 - commentId={}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    // 댓글 삭제
    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @RequestParam(value = "authorEmail", required = false) String authorEmail,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        // 인증 사용자 이메일을 꺼내서 전달(프론트에서 보내는 방식 우선 적용)
        String requesterEmail = null;
        try {
            requesterEmail = (String) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
        } catch (Exception ignored) {}
        // 1) 프론트에서 authorEmail을 헤더로 보낸 경우
        String headerEmail = null;
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                headerEmail = attrs.getRequest().getHeader("X-Author-Email");
            }
        } catch (Exception ignored) {}
        if (headerEmail != null && !headerEmail.isBlank()) {
            requesterEmail = headerEmail;
        }

        // 2) 쿼리스트링(authorEmail) 우선 사용
        if (authorEmail != null && !authorEmail.isBlank()) {
            requesterEmail = authorEmail;
        }

        // 3) 바디(authorEmail) 사용
        if ((requesterEmail == null || requesterEmail.isBlank()) && body != null) {
            Object val = body.get("authorEmail");
            if (val instanceof String s && !s.isBlank()) {
                requesterEmail = s;
            }
        }

        log.info("[댓글] 삭제 요청 - postId={}, commentId={}, requesterEmail={}", postId, commentId, requesterEmail);
        commentService.deleteComment(commentId, requesterEmail);
        log.info("[댓글] 삭제 성공 - commentId={}", commentId);
        return ResponseEntity.noContent().build();
    }

    // 댓글 수정
    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @RequestBody CommentUpdateDTO dto) {
        String requesterEmail = null;
        try {
            requesterEmail = (String) org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
        } catch (Exception ignored) {}
        String headerEmail = null;
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                headerEmail = attrs.getRequest().getHeader("X-Author-Email");
            }
        } catch (Exception ignored) {}
        if (headerEmail != null && !headerEmail.isBlank()) {
            requesterEmail = headerEmail;
        }

        log.info("[댓글] 수정 요청 - postId={}, commentId={}, requesterEmail={} ", postId, commentId, requesterEmail);
        CommentDTO updated = commentService.updateComment(commentId, requesterEmail, dto.getContent());
        log.info("[댓글] 수정 성공 - commentId={}", updated.getId());
        return ResponseEntity.ok(updated);
    }
} 