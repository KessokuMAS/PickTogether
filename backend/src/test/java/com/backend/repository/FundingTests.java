package com.backend.repository;

import com.backend.domain.member.Funding;
import com.backend.domain.member.Funding.FundingStatus;
import com.backend.domain.member.Member;
import com.backend.domain.restaurant.Restaurant;
import com.backend.repository.member.FundingRepository;
import com.backend.repository.member.MemberRepository;
import com.backend.repository.restaurant.RestaurantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Commit;

import java.util.*;

@SpringBootTest
public class FundingTests {
    
    @Autowired
    private FundingRepository fundingRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Test
    @Transactional
    @Commit
    public void insertFundingTestData() {
        System.out.println("[INFO] Funding 테스트 데이터를 생성합니다...");
        
        // 기존 funding 데이터 개수 확인
        long existingCount = fundingRepository.count();
        System.out.println("[INFO] 기존 Funding 데이터 개수: " + existingCount);
        
        // 기존 데이터가 있으면 삭제
        if (existingCount > 0) {
            System.out.println("[INFO] 기존 Funding 데이터를 삭제합니다...");
            fundingRepository.deleteAll();
            fundingRepository.flush();
            System.out.println("[INFO] 기존 Funding 데이터 삭제 완료");
        }
        
        // Member와 Restaurant 데이터 가져오기
        List<Member> members = memberRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll();
        
        if (members.isEmpty()) {
            System.out.println("[ERROR] Member 데이터가 없습니다. 먼저 Member 테스트 데이터를 생성해주세요.");
            return;
        }
        
        if (restaurants.isEmpty()) {
            System.out.println("[ERROR] Restaurant 데이터가 없습니다. 먼저 Restaurant 테스트 데이터를 생성해주세요.");
            return;
        }
        
        System.out.println("[INFO] Member 수: " + members.size());
        System.out.println("[INFO] Restaurant 수: " + restaurants.size());
        
        // 메뉴 정보 배열 (실제 구매 데이터와 같은 형태로 배열로 저장)
        String[] menuOptions = {
            "[{\"name\":\"김치찌개 세트\",\"price\":8000,\"quantity\":1}]",
            "[{\"name\":\"된장찌개 세트\",\"price\":7000,\"quantity\":1}]",
            "[{\"name\":\"부대찌개 세트\",\"price\":9000,\"quantity\":1}]",
            "[{\"name\":\"순두부찌개 세트\",\"price\":6000,\"quantity\":1}]",
            "[{\"name\":\"닭볶음탕 세트\",\"price\":12000,\"quantity\":1}]",
            "[{\"name\":\"제육볶음 세트\",\"price\":11000,\"quantity\":1}]",
            "[{\"name\":\"돼지갈비 세트\",\"price\":15000,\"quantity\":1}]",
            "[{\"name\":\"불고기 세트\",\"price\":13000,\"quantity\":1}]",
            "[{\"name\":\"비빔밥\",\"price\":9000,\"quantity\":1}]",
            "[{\"name\":\"김밥 세트\",\"price\":5000,\"quantity\":1}]"
        };
        
        // 결제 방법 배열
        String[] paymentMethods = {"kakaopay", "tosspay", "card"};
        
        // 상태 배열
        FundingStatus[] statuses = {FundingStatus.COMPLETED, FundingStatus.CANCELLED, FundingStatus.REFUNDED};
        
        // 천원 단위로 금액 생성 (5천원 ~ 3만원)
        List<Long> amounts = new ArrayList<>();
        for (long amount = 5000; amount <= 30000; amount += 1000) {
            amounts.add(amount);
        }
        
        List<Funding> fundingList = new ArrayList<>();
        Random random = new Random();
        
        System.out.println("[INFO] 1000개의 Funding 테스트 데이터를 생성합니다...");
        
        for (int i = 0; i < 1000; i++) {
            // 랜덤하게 Member와 Restaurant 선택
            Member randomMember = members.get(random.nextInt(members.size()));
            Restaurant randomRestaurant = restaurants.get(random.nextInt(restaurants.size()));
            
            // 랜덤하게 메뉴 선택
            String randomMenu = menuOptions[random.nextInt(menuOptions.length)];
            
            // 랜덤하게 금액 선택 (천원 단위)
            Long randomAmount = amounts.get(random.nextInt(amounts.size()));
            
            // 랜덤하게 결제 방법 선택
            String randomPaymentMethod = paymentMethods[random.nextInt(paymentMethods.length)];
            
            // 랜덤하게 상태 선택
            FundingStatus randomStatus = statuses[random.nextInt(statuses.length)];
            
            // 랜덤하게 SMS, 이메일 동의 여부 설정
            boolean randomSmsAgree = random.nextBoolean();
            boolean randomEmailAgree = random.nextBoolean();
            
            Funding funding = Funding.builder()
                .member(randomMember)
                .restaurant(randomRestaurant)
                .restaurantName(randomRestaurant.getName())
                .menuInfo(randomMenu)
                .totalAmount(randomAmount)
                .paymentMethod(randomPaymentMethod)
                .impUid(UUID.randomUUID().toString())
                .merchantUid(UUID.randomUUID().toString())
                .agreeSMS(randomSmsAgree)
                .agreeEmail(randomEmailAgree)
                .status(randomStatus)
                .createdAt(new java.util.Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime())
                .build();
            
            fundingList.add(funding);
            
            // 진행상황 출력 (100개마다)
            if ((i + 1) % 100 == 0) {
                System.out.println("[INFO] " + (i + 1) + "개 생성 완료");
            }
        }
        
        // 배치로 저장
        System.out.println("[INFO] 데이터베이스에 저장 중...");
        fundingRepository.saveAll(fundingList);
        fundingRepository.flush();
        
        // 저장된 데이터 개수 확인
        long savedCount = fundingRepository.count();
        System.out.println("[INFO] 저장 완료! 총 " + savedCount + "개의 Funding 데이터가 생성되었습니다.");
        
        // 샘플 데이터 출력
        System.out.println("\n[INFO] 생성된 데이터 샘플:");
        List<Funding> sampleFundings = fundingRepository.findAll().subList(0, Math.min(5, (int) savedCount));
        for (Funding sample : sampleFundings) {
            System.out.println("ID: " + sample.getId() + 
                             ", Member: " + sample.getMember().getEmail() + 
                             ", Restaurant: " + sample.getRestaurantName() + 
                             ", Menu: " + sample.getMenuInfo() + 
                             ", Amount: " + sample.getTotalAmount() + 
                             ", Status: " + sample.getStatus());
        }
    }
} 