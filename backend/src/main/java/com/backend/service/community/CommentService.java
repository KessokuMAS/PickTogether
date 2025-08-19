package com.backend.service.community;

import java.util.List;

import com.backend.dto.community.CommentCreateDTO;
import com.backend.dto.community.CommentDTO;

public interface CommentService {

    List<CommentDTO> getComments(Long postId);

    CommentDTO addComment(CommentCreateDTO dto);

    void deleteComment(Long commentId, String requesterEmail);

    CommentDTO updateComment(Long commentId, String requesterEmail, String content);
}

