package com.backend.domain.restaurant;

public enum ForOneStatus {
    PLANNED,   // 예정(노출 가능)
    ACTIVE,    // 진행중
    SUCCESS,   // 목표 달성
    FAILED,    // 미달성 종료
    PAUSED     // 운영 일시중지
}
