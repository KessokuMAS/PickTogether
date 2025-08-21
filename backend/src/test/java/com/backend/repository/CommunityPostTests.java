package com.backend.repository;

import com.backend.domain.community.Post;
import com.backend.repository.community.PostRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Commit;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootTest
public class CommunityPostTests {
    
    @Autowired
    private PostRepository postRepository;
    
    @Test
    @Transactional
    @Commit
    public void insertCommunityPostsByCategory() {
        System.out.println("[INFO] 커뮤니티 게시글 테스트 데이터를 생성합니다...");
        
        // 기존 데이터 개수 확인
        long existingCount = postRepository.count();
        System.out.println("[INFO] 기존 게시글 개수: " + existingCount);
        
        // 기존 데이터가 있으면 삭제
        if (existingCount > 0) {
            System.out.println("[INFO] 기존 게시글 데이터를 삭제합니다...");
            postRepository.deleteAll();
            postRepository.flush();
            System.out.println("[INFO] 기존 게시글 데이터 삭제 완료");
        }
        
        // 카테고리 정의
        String[] categories = {"일반", "펀딩추천", "후기", "숨은 맛집추천", "질문"};
        
        // 작성자 목록
        String[] authors = {
            "김철수", "이영희", "박민수", "최지영", "정현우",
            "한소영", "오준석", "임수진", "강동현", "윤미래",
            "서준혁", "노예린", "조성민", "배수지", "홍길동"
        };
        
        // 샘플 제목과 내용 템플릿
        String[][] titleContentTemplates = {
            // 일반 카테고리
            {
                "오늘 날씨 너무 좋네요!", "봄이 오는 걸 느낄 수 있어서 기분이 좋습니다. 다들 좋은 하루 보내세요!",
                "주말 계획 있으신가요?", "이번 주말에 뭐 하실 예정인가요? 추천해주실 만한 곳이 있다면 공유해주세요.",
                "새로운 취미 시작했어요", "요즘 요리에 빠져있습니다. 간단한 레시피부터 시작해서 점점 실력이 늘고 있어요!",
                "오늘의 일상 공유", "평범한 하루였지만 소소한 행복을 느꼈던 순간들을 공유해봅니다.",
                "좋은 책 추천해주세요", "요즘 읽을 만한 책을 찾고 있어요. 장르는 상관없으니 추천 부탁드립니다!"
            },
            // 펀딩추천 카테고리
            {
                "이 가게 펀딩 꼭 성공했으면!", "정말 맛있는 곳인데 펀딩이 잘 안되고 있어서 아쉬워요. 많은 분들이 참여해주셨으면 좋겠습니다.",
                "숨은 맛집 펀딩 추천드려요", "동네에서 유명한 맛집인데 펀딩을 시작했네요. 정말 맛있으니 꼭 참여해보세요!",
                "가족 운영 식당 펀딩", "3대째 이어온 전통 있는 식당입니다. 코로나로 어려움을 겪고 있어서 펀딩을 시작했어요.",
                "신메뉴 개발 펀딩 참여했어요", "새로운 메뉴 개발을 위한 펀딩에 참여했습니다. 기대가 되네요!",
                "지역 특색 음식점 펀딩", "우리 지역만의 특별한 음식을 파는 곳이에요. 많은 관심 부탁드립니다."
            },
            // 후기 카테고리
            {
                "펀딩 참여 후기입니다", "지난달에 참여한 펀딩 결과가 나왔는데 정말 만족스러워요! 음식도 맛있고 서비스도 좋았습니다.",
                "이 식당 정말 추천해요!", "펀딩으로 알게 된 식당인데 음식이 정말 맛있어요. 사장님도 친절하시고 분위기도 좋습니다.",
                "펀딩 성공한 가게 다녀왔어요", "펀딩이 성공한 후 처음 방문했는데 기대 이상이었습니다. 앞으로도 자주 갈 것 같아요.",
                "실망스러웠던 경험", "기대를 많이 했는데 생각보다 아쉬웠어요. 그래도 사장님이 노력하시는 모습이 보여서 응원합니다.",
                "재방문 의사 100%", "한 번 가봤는데 너무 좋아서 벌써 세 번째 방문이에요. 단골이 될 것 같습니다!"
            },
            // 숨은 맛집추천 카테고리
            {
                "동네 숨은 보석 같은 곳", "집 근처에 있는 작은 식당인데 정말 맛있어요. 아직 많이 알려지지 않아서 더 특별한 것 같아요.",
                "골목길 맛집 발견!", "우연히 들어간 골목길 식당이 대박이었어요. 현지인들만 아는 진짜 맛집입니다.",
                "할머니가 운영하시는 집밥 맛집", "정말 집밥 같은 따뜻한 음식을 파시는 곳이에요. 마음도 따뜻해지는 곳입니다.",
                "숨어있는 이탈리안 레스토랑", "주택가에 숨어있는 이탈리안 레스토랑인데 파스타가 정말 맛있어요!",
                "현지인 추천 맛집", "현지 친구가 추천해준 곳인데 관광객들은 잘 모르는 진짜 맛집이에요."
            },
            // 질문 카테고리
            {
                "펀딩 참여 방법이 궁금해요", "처음 펀딩에 참여해보려고 하는데 어떻게 하는 건가요? 자세한 방법 알려주세요.",
                "이 지역 맛집 아시는 분?", "출장으로 이 지역에 왔는데 맛있는 곳 추천해주실 수 있나요?",
                "펀딩 성공률이 궁금합니다", "보통 펀딩 성공률이 어느 정도 되나요? 참여할 때 참고하고 싶어요.",
                "배달 가능한 곳 있나요?", "집에서 멀지 않은 곳 중에 배달 가능한 펀딩 참여 식당이 있을까요?",
                "단체 예약 가능한지 궁금해요", "회사 회식으로 이용하고 싶은데 단체 예약이 가능한 곳이 있나요?"
            }
        };
        
        // 주소 샘플
        String[] addresses = {
            "서울특별시 강남구 테헤란로 123",
            "서울특별시 마포구 홍대입구역 근처",
            "서울특별시 종로구 인사동길 45",
            "서울특별시 용산구 이태원로 67",
            "서울특별시 송파구 잠실역 2번 출구",
            "부산광역시 해운대구 해운대해변로 89",
            "대구광역시 중구 동성로 12",
            "인천광역시 남동구 구월동 34",
            "광주광역시 서구 상무지구 56",
            "대전광역시 유성구 대학로 78"
        };
        
        // 식당 이름 샘플
        String[] restaurantNames = {
            "할머니 손맛 식당", "청춘 떡볶이", "바다향 횟집", "산골 정식당",
            "도시 양꼬치", "전통 한정식", "이탈리아 파스타", "프랑스 비스트로",
            "일본 라멘집", "중국 마라탕", "인도 커리하우스", "멕시코 타코집",
            "태국 팟타이", "베트남 쌀국수", "터키 케밥", "그리스 요리점"
        };
        
        Random random = new Random();
        List<Post> batchList = new ArrayList<>();
        int totalCreated = 0;
        
        // 각 카테고리마다 50개씩 생성
        for (int categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
            String category = categories[categoryIndex];
            String[] templates = titleContentTemplates[categoryIndex];
            
            System.out.println("[INFO] " + category + " 카테고리 게시글 50개 생성 시작...");
            
            for (int i = 0; i < 50; i++) {
                // 템플릿에서 랜덤하게 선택 (제목과 내용 쌍)
                int templateIndex = (i / 10) % (templates.length / 2); // 10개씩 같은 템플릿 사용
                String baseTitle = templates[templateIndex * 2];
                String baseContent = templates[templateIndex * 2 + 1];
                
                // 제목과 내용에 번호 추가하여 유니크하게 만들기
                String title = baseTitle + " #" + (i + 1);
                String content = baseContent + " (게시글 번호: " + (totalCreated + i + 1) + ")";
                
                // 작성자 랜덤 선택
                String author = authors[random.nextInt(authors.length)];
                
                // 숨은 맛집추천 카테고리인 경우 주소와 식당명 추가
                String address = null;
                String restaurantName = null;
                if ("숨은 맛집추천".equals(category)) {
                    address = addresses[random.nextInt(addresses.length)];
                    restaurantName = restaurantNames[random.nextInt(restaurantNames.length)];
                }
                
                // 랜덤한 생성 시간 (최근 30일 내)
                LocalDateTime createdAt = LocalDateTime.now()
                    .minusDays(random.nextInt(30))
                    .minusHours(random.nextInt(24))
                    .minusMinutes(random.nextInt(60));
                
                // 조회수와 좋아요 수 랜덤 생성
                int views = random.nextInt(500) + 1; // 1~500
                int likes = random.nextInt(views / 2 + 1); // 조회수의 절반 이하
                
                Post post = Post.builder()
                    .title(title)
                    .content(content)
                    .category(category)
                    .author(author)
                    .address(address)
                    .restaurantName(restaurantName)
                    .views(views)
                    .likes(likes)
                    .createdAt(createdAt)
                    .updatedAt(createdAt)
                    .build();
                
                batchList.add(post);
                
                // 배치 크기가 20에 도달하면 저장
                if (batchList.size() >= 20) {
                    postRepository.saveAll(batchList);
                    postRepository.flush();
                    batchList.clear();
                    System.out.println("[INFO] " + category + " 카테고리 - " + (i + 1) + "개 게시글 저장 완료");
                }
            }
            
            totalCreated += 50;
            System.out.println("[INFO] " + category + " 카테고리 50개 게시글 생성 완료");
        }
        
        // 남은 데이터 저장
        if (!batchList.isEmpty()) {
            postRepository.saveAll(batchList);
            postRepository.flush();
        }
        
        // 최종 결과 확인
        long finalCount = postRepository.count();
        System.out.println("[INFO] 게시글 생성 완료!");
        System.out.println("[INFO] 총 생성된 게시글 수: " + finalCount);
        
        // 카테고리별 개수 확인
        for (String category : categories) {
            long categoryCount = postRepository.countByCategory(category);
            System.out.println("[INFO] " + category + " 카테고리: " + categoryCount + "개");
        }
    }
    
    @Test
    @Transactional
    @Commit
    public void insertDetailedCommunityPosts() {
        System.out.println("[INFO] 상세한 커뮤니티 게시글 테스트 데이터를 생성합니다...");
        
        // 기존 데이터 삭제
        postRepository.deleteAll();
        postRepository.flush();
        
        String[] categories = {"일반", "펀딩추천", "후기", "숨은 맛집추천", "질문"};
        Random random = new Random();
        List<Post> allPosts = new ArrayList<>();
        
        // 각 카테고리별 상세 데이터
        for (int categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
            String category = categories[categoryIndex];
            
            for (int i = 0; i < 50; i++) {
                String title = generateTitle(category, i + 1);
                String content = generateContent(category, i + 1);
                String author = generateAuthor(i);
                
                // 생성 시간을 다양하게 (최근 60일 내)
                LocalDateTime createdAt = LocalDateTime.now()
                    .minusDays(random.nextInt(60))
                    .minusHours(random.nextInt(24))
                    .minusMinutes(random.nextInt(60))
                    .minusSeconds(random.nextInt(60));
                
                Post post = Post.builder()
                    .title(title)
                    .content(content)
                    .category(category)
                    .author(author)
                    .address(category.equals("숨은 맛집추천") ? generateAddress(i) : null)
                    .restaurantName(category.equals("숨은 맛집추천") ? generateRestaurantName(i) : null)
                    .views(random.nextInt(1000) + 1)
                    .likes(random.nextInt(100))
                    .createdAt(createdAt)
                    .updatedAt(createdAt)
                    .build();
                
                allPosts.add(post);
            }
        }
        
        // 배치로 저장
        int batchSize = 50;
        for (int i = 0; i < allPosts.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, allPosts.size());
            List<Post> batch = allPosts.subList(i, endIndex);
            postRepository.saveAll(batch);
            postRepository.flush();
            System.out.println("[INFO] " + (i + batch.size()) + "/" + allPosts.size() + " 게시글 저장 완료");
        }
        
        System.out.println("[INFO] 총 " + allPosts.size() + "개의 상세 게시글 생성 완료!");
    }
    
    private String generateTitle(String category, int index) {
        return switch (category) {
            case "일반" -> "일상 이야기 #" + index + " - " + getRandomFromArray(new String[]{
                "오늘의 기분", "소소한 일상", "생각 정리", "하루 마무리", "새로운 시작"
            });
            case "펀딩추천" -> "펀딩 추천 #" + index + " - " + getRandomFromArray(new String[]{
                "꼭 성공했으면 하는 펀딩", "숨은 맛집 펀딩", "지역 맛집 살리기", "전통 음식점 펀딩", "신메뉴 개발 펀딩"
            });
            case "후기" -> "펀딩 후기 #" + index + " - " + getRandomFromArray(new String[]{
                "만족스러운 경험", "기대 이상이었던 곳", "재방문 의사 있는 곳", "아쉬웠던 점", "추천하고 싶은 곳"
            });
            case "숨은 맛집추천" -> "숨은 맛집 #" + index + " - " + getRandomFromArray(new String[]{
                "동네 숨은 보석", "골목길 맛집", "현지인 추천", "가족 운영 식당", "전통 있는 곳"
            });
            case "질문" -> "질문 #" + index + " - " + getRandomFromArray(new String[]{
                "펀딩 관련 궁금한 점", "맛집 추천 요청", "지역 정보 문의", "이용 방법 질문", "경험담 요청"
            });
            default -> "게시글 #" + index;
        };
    }
    
    private String generateContent(String category, int index) {
        String baseContent = switch (category) {
            case "일반" -> "오늘도 평범하지만 소중한 하루를 보냈습니다. 작은 것에서 행복을 찾는 것이 중요한 것 같아요. ";
            case "펀딩추천" -> "정말 좋은 가게인데 펀딩이 필요한 상황이에요. 많은 분들이 관심 가져주시면 좋겠습니다. ";
            case "후기" -> "펀딩에 참여한 후 직접 방문해봤는데 정말 만족스러웠어요. 음식도 맛있고 서비스도 좋았습니다. ";
            case "숨은 맛집추천" -> "우연히 발견한 맛집인데 정말 맛있어서 공유하고 싶어요. 아직 많이 알려지지 않은 곳이에요. ";
            case "질문" -> "궁금한 점이 있어서 질문드려요. 경험 있으신 분들의 조언을 구합니다. ";
            default -> "커뮤니티 게시글 내용입니다. ";
        };
        
        return baseContent + "게시글 번호 " + index + "번으로 테스트 데이터입니다. " +
               "더 많은 내용을 추가하여 실제 게시글처럼 보이도록 작성했습니다. " +
               "여러분의 많은 관심과 참여 부탁드립니다!";
    }
    
    private String generateAuthor(int index) {
        String[] authors = {
            "김철수", "이영희", "박민수", "최지영", "정현우", "한소영", "오준석", "임수진", 
            "강동현", "윤미래", "서준혁", "노예린", "조성민", "배수지", "홍길동", "신짱구",
            "맹구", "유리", "훈이", "철수"
        };
        return authors[index % authors.length];
    }
    
    private String generateAddress(int index) {
        String[] addresses = {
            "서울특별시 강남구 테헤란로 " + (100 + index),
            "서울특별시 마포구 홍대입구역 " + (index + 1) + "번 출구",
            "서울특별시 종로구 인사동길 " + (50 + index),
            "부산광역시 해운대구 해운대해변로 " + (200 + index),
            "대구광역시 중구 동성로 " + (10 + index),
            "인천광역시 남동구 구월동 " + (300 + index) + "번지",
            "광주광역시 서구 상무지구 " + (400 + index) + "번지",
            "대전광역시 유성구 대학로 " + (500 + index),
            "울산광역시 남구 삼산로 " + (600 + index),
            "경기도 수원시 영통구 월드컵로 " + (700 + index)
        };
        return addresses[index % addresses.length];
    }
    
    private String generateRestaurantName(int index) {
        String[] prefixes = {"할머니", "전통", "옛날", "고향", "정통", "명품", "특별한", "숨은", "진짜", "최고"};
        String[] foods = {"한식당", "중식당", "일식당", "양식당", "분식집", "카페", "베이커리", "치킨집", "피자집", "족발집"};
        
        String prefix = prefixes[index % prefixes.length];
        String food = foods[index % foods.length];
        return prefix + " " + food;
    }
    
    private String getRandomFromArray(String[] array) {
        Random random = new Random();
        return array[random.nextInt(array.length)];
    }
} 