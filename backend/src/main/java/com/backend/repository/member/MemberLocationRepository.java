package com.backend.repository.member;

import com.backend.domain.member.Member;
import com.backend.domain.member.MemberLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberLocationRepository extends JpaRepository<MemberLocation, Long> {
    List<MemberLocation> findByMember_Email(String email);
    List<MemberLocation> findByMember(Member member);

}
