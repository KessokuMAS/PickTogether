package com.backend.repository;

import com.backend.domain.specialty.LocalSpecialty;
import com.backend.repository.specialty.LocalSpecialtyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Commit;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
public class LocalSpecialtyTests {
    
    @Autowired
    private LocalSpecialtyRepository localSpecialtyRepository;
    
    @Test
    @Transactional
    @Commit
    public void insertLocalSpecialtiesFromCsv() {
        System.out.println("[INFO] CSV 파일에서 지역특산물 데이터를 읽어와서 DB에 저장합니다...");
        
        // 기존 데이터 개수 확인
        long existingCount = localSpecialtyRepository.count();
        System.out.println("[INFO] 기존 데이터 개수: " + existingCount);
        
        // 기존 데이터가 있으면 삭제
        if (existingCount > 0) {
            System.out.println("[INFO] 기존 데이터를 삭제합니다...");
            localSpecialtyRepository.deleteAll();
            localSpecialtyRepository.flush(); // 강제로 flush 실행
            System.out.println("[INFO] 기존 데이터 삭제 완료");
        }
        
        String csvFilePath = "src/test/java/com/backend/repository/local_specialty_filtered.csv";
        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;
        int totalLines = 0;
        
        // 배치 처리를 위한 리스트
        List<LocalSpecialty> batchList = new ArrayList<>();
        final int BATCH_SIZE = 50; // 배치 크기를 줄여서 안정성 향상
        
        try (BufferedReader br = new BufferedReader(new FileReader(csvFilePath))) {
            // 헤더 건너뛰기
            String header = br.readLine();
            System.out.println("[INFO] CSV 헤더: " + header);
            
            String line;
            while ((line = br.readLine()) != null) {
                totalLines++;
                
                try {
                    // CSV 파싱 (쉼표로 구분, 따옴표 처리)
                    String[] values = parseCsvLine(line);
                    
                    if (values.length < 10) {
                        System.out.println("[WARN] 데이터 컬럼 수 부족 (라인 " + totalLines + "): " + line);
                        errorCount++;
                        continue;
                    }
                    
                    String cntntsNo = values[0].replaceAll("\"", "").trim();
                    String cntntsSj = values[1].replaceAll("\"", "").trim();
                    String areaNm = values[2].replaceAll("\"", "").trim();
                    String imgUrl = values[3].replaceAll("\"", "").trim();
                    String svcDtStr = values[4].replaceAll("\"", "").trim();
                    String linkUrl = values[5].replaceAll("\"", "").trim();
                    String areaCode = values[6].replaceAll("\"", "").trim();
                    String sidoNm = values[7].replaceAll("\"", "").trim();
                    String sigunguNm = values[8].replaceAll("\"", "").trim();
                    String createdAtStr = values[9].replaceAll("\"", "").trim();
                    
                    // 필수 필드 검증
                    if (cntntsNo.isEmpty() || cntntsSj.isEmpty()) {
                        System.out.println("[WARN] 필수 필드 누락 (라인 " + totalLines + "): " + cntntsSj);
                        errorCount++;
                        continue;
                    }
                    
                    // 날짜 파싱
                    LocalDate svcDt = null;
                    LocalDate createdAt = null;
                    
                    try {
                        if (!svcDtStr.isEmpty()) {
                            svcDt = LocalDate.parse(svcDtStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        }
                    } catch (Exception e) {
                        System.out.println("[WARN] 서비스일자 파싱 실패 (라인 " + totalLines + "): " + svcDtStr + " - " + e.getMessage());
                    }
                    
                    try {
                        if (!createdAtStr.isEmpty()) {
                            createdAt = LocalDate.parse(createdAtStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        }
                    } catch (Exception e) {
                        System.out.println("[WARN] 수집일자 파싱 실패 (라인 " + totalLines + "): " + createdAtStr + " - " + e.getMessage());
                    }
                    
                    // LocalSpecialty 엔티티 생성
                    LocalSpecialty specialty = LocalSpecialty.builder()
                        .cntntsNo(cntntsNo)
                        .cntntsSj(cntntsSj)
                        .areaNm(areaNm)
                        .imgUrl(imgUrl.isEmpty() ? null : imgUrl)
                        .svcDt(svcDt)
                        .linkUrl(linkUrl.isEmpty() ? null : linkUrl)
                        .areaCode(areaCode)
                        .sidoNm(sidoNm)
                        .sigunguNm(sigunguNm)
                        .createdAt(createdAt != null ? createdAt : LocalDate.now())
                        .fundingGoalAmount(500000L) // 펀딩 목표 금액 50만원 고정
                        .fundingAmount((long) ((10 + (int)(Math.random() * 36)) * 10000)) // 10만원 ~ 45만원 (만원 단위)
                        .build();
                    
                    // 배치 리스트에 추가
                    batchList.add(specialty);
                    
                    // 배치 크기에 도달하면 DB에 저장
                    if (batchList.size() >= BATCH_SIZE) {
                        try {
                            localSpecialtyRepository.saveAll(batchList);
                            localSpecialtyRepository.flush(); // 배치 저장 후 flush
                            successCount += batchList.size();
                            System.out.println("[INFO] 배치 저장 완료: " + successCount + "개 (총 " + totalLines + "개 중)");
                            batchList.clear();
                            
                            // 진행상황 확인
                            if (successCount % 200 == 0) {
                                System.out.println("[INFO] 진행상황: " + successCount + "개 저장 완료");
                            }
                            
                        } catch (Exception e) {
                            System.err.println("[ERROR] 배치 저장 실패: " + e.getMessage());
                            // 개별 저장으로 폴백
                            for (LocalSpecialty item : batchList) {
                                try {
                                    localSpecialtyRepository.save(item);
                                    successCount++;
                                } catch (Exception ex) {
                                    System.err.println("[ERROR] 개별 저장 실패: " + item.getCntntsSj() + " - " + ex.getMessage());
                                    errorCount++;
                                }
                            }
                            batchList.clear();
                        }
                    }
                    
                } catch (Exception e) {
                    System.out.println("[ERROR] 데이터 처리 실패 (라인 " + totalLines + "): " + line + " - " + e.getMessage());
                    errorCount++;
                }
            }
            
            // 남은 배치 처리
            if (!batchList.isEmpty()) {
                try {
                    localSpecialtyRepository.saveAll(batchList);
                    localSpecialtyRepository.flush(); // 마지막 배치 저장 후 flush
                    successCount += batchList.size();
                    System.out.println("[INFO] 마지막 배치 저장 완료: " + batchList.size() + "개");
                } catch (Exception e) {
                    System.err.println("[ERROR] 마지막 배치 저장 실패: " + e.getMessage());
                    // 개별 저장으로 폴백
                    for (LocalSpecialty item : batchList) {
                        try {
                            localSpecialtyRepository.save(item);
                            successCount++;
                        } catch (Exception ex) {
                            System.err.println("[ERROR] 개별 저장 실패: " + item.getCntntsSj() + " - " + ex.getMessage());
                            errorCount++;
                        }
                    }
                }
            }
            
            System.out.println("=".repeat(60));
            System.out.println("[INFO] CSV 데이터 저장 완료!");
            System.out.println("[INFO] 총 라인 수: " + totalLines);
            System.out.println("[INFO] 성공: " + successCount + "개");
            System.out.println("[INFO] 건너뜀: " + skipCount + "개");
            System.out.println("[INFO] 오류: " + errorCount + "개");
            // 최종 flush 후 count 조회
            localSpecialtyRepository.flush();
            long finalCount = localSpecialtyRepository.count();
            System.out.println("[INFO] DB 총 데이터 수: " + finalCount);
            System.out.println("=".repeat(60));
            
        } catch (IOException e) {
            System.err.println("[ERROR] CSV 파일 읽기 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * CSV 라인을 파싱하는 메서드 (쉼표와 따옴표 처리)
     */
    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        
        result.add(current.toString());
        return result.toArray(new String[0]);
    }
} 