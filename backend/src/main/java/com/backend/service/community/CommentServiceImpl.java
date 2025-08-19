package com.backend.service.community;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.domain.community.Comment;
import com.backend.domain.community.Post;
import com.backend.dto.community.CommentCreateDTO;
import com.backend.dto.community.CommentDTO;
import com.backend.repository.community.CommentRepository;
import com.backend.repository.community.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Override
    public List<CommentDTO> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentDTO addComment(CommentCreateDTO dto) {
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. ID: " + dto.getPostId()));

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .author(dto.getAuthor() != null ? dto.getAuthor() : "익명")
                .authorEmail(dto.getAuthorEmail())
                .post(post)
                .build();

        Comment saved = commentRepository.save(comment);
        return CommentDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String requesterEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. ID: " + commentId));

        if (comment.getAuthorEmail() == null || requesterEmail == null || !comment.getAuthorEmail().equalsIgnoreCase(requesterEmail)) {
            throw new SecurityException("댓글 작성자만 삭제할 수 있습니다.");
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public CommentDTO updateComment(Long commentId, String requesterEmail, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. ID: " + commentId));

        if (comment.getAuthorEmail() == null || requesterEmail == null || !comment.getAuthorEmail().equalsIgnoreCase(requesterEmail)) {
            throw new SecurityException("댓글 작성자만 수정할 수 있습니다.");
        }

        comment.setContent(content);
        Comment saved = commentRepository.save(comment);
        return CommentDTO.fromEntity(saved);
    }
}

