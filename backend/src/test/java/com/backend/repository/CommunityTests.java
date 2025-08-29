package com.backend.repository;

import com.backend.domain.community.Post;
import com.backend.domain.community.Comment;
import com.backend.repository.community.PostRepository;
import com.backend.repository.community.CommentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Commit;

import java.time.LocalDateTime;
import java.util.*;

@SpringBootTest
public class CommunityTests {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Test
    @Transactional
    @Commit
    public void insertCommunityTestData() {
        System.out.println("[INFO] Community 테스트 데이터를 생성합니다...");
        
        // 기존 데이터 개수 확인
        long existingPostCount = postRepository.count();
        long existingCommentCount = commentRepository.count();
        System.out.println("[INFO] 기존 Post 데이터 개수: " + existingPostCount);
        System.out.println("[INFO] 기존 Comment 데이터 개수: " + existingCommentCount);
        
        // 기존 데이터가 있으면 삭제
        if (existingPostCount > 0 || existingCommentCount > 0) {
            System.out.println("[INFO] 기존 Community 데이터를 삭제합니다...");
            commentRepository.deleteAll();
            postRepository.deleteAll();
            commentRepository.flush();
            postRepository.flush();
            System.out.println("[INFO] 기존 Community 데이터 삭제 완료");
        }
        
        // 카테고리별 게시글 데이터 생성
        List<Post> postList = new ArrayList<>();
        Random random = new Random();
        
        System.out.println("[INFO] 25개의 Post 테스트 데이터를 생성합니다...");
        
        // 일반 카테고리 (5개)
        postList.addAll(createPostsByCategory("일반", 5, random));
        
        // 펀딩추천 카테고리 (5개)
        postList.addAll(createPostsByCategory("펀딩추천", 5, random));
        
        // 후기 카테고리 (5개)
        postList.addAll(createPostsByCategory("후기", 5, random));
        
        // 숨은 맛집추천 카테고리 (5개)
        postList.addAll(createPostsByCategory("숨은 맛집추천", 5, random));
        
        // 질문 카테고리 (5개)
        postList.addAll(createPostsByCategory("질문", 5, random));
        
        // 게시글 저장
        System.out.println("[INFO] Post 데이터를 데이터베이스에 저장 중...");
        postRepository.saveAll(postList);
        postRepository.flush();
        
        // 댓글 데이터 생성
        List<Comment> commentList = new ArrayList<>();
        System.out.println("[INFO] 35개의 Comment 테스트 데이터를 생성합니다...");
        
        commentList.addAll(createCommentsForPosts(postList, random));
        
        // 댓글 저장
        System.out.println("[INFO] Comment 데이터를 데이터베이스에 저장 중...");
        commentRepository.saveAll(commentList);
        commentRepository.flush();
        
        // 저장된 데이터 개수 확인
        long savedPostCount = postRepository.count();
        long savedCommentCount = commentRepository.count();
        System.out.println("[INFO] 저장 완료! 총 " + savedPostCount + "개의 Post와 " + savedCommentCount + "개의 Comment가 생성되었습니다.");
        
        // 샘플 데이터 출력
        System.out.println("\n[INFO] 생성된 Post 데이터 샘플:");
        List<Post> samplePosts = postRepository.findAll().subList(0, Math.min(5, (int) savedPostCount));
        for (Post sample : samplePosts) {
            System.out.println("ID: " + sample.getId() + 
                             ", Title: " + sample.getTitle() + 
                             ", Category: " + sample.getCategory() + 
                             ", Author: " + sample.getAuthor() + 
                             ", Views: " + sample.getViews() + 
                             ", Likes: " + sample.getLikes());
        }
        
        System.out.println("\n[INFO] 생성된 Comment 데이터 샘플:");
        List<Comment> sampleComments = commentRepository.findAll().subList(0, Math.min(5, (int) savedCommentCount));
        for (Comment sample : sampleComments) {
            System.out.println("ID: " + sample.getId() + 
                             ", Content: " + sample.getContent().substring(0, Math.min(20, sample.getContent().length())) + "..." +
                             ", Author: " + sample.getAuthor() + 
                             ", Post ID: " + sample.getPost().getId());
        }
    }
    
    private List<Post> createPostsByCategory(String category, int count, Random random) {
        List<Post> posts = new ArrayList<>();
        LocalDateTime baseTime = LocalDateTime.now().minusDays(5);
        
        for (int i = 0; i < count; i++) {
            PostData postData = getPostDataByCategory(category, i);
            
            Post post = Post.builder()
                .title(postData.title)
                .content(postData.content)
                .category(category)
                .author(postData.author)
                .imageUrl(postData.imageUrl)
                .views(random.nextInt(200) + 50)  // 50~249
                .likes(random.nextInt(50) + 10)   // 10~59
                .createdAt(baseTime.plusDays(i).plusHours(random.nextInt(24)).plusMinutes(random.nextInt(60)))
                .updatedAt(baseTime.plusDays(i).plusHours(random.nextInt(24)).plusMinutes(random.nextInt(60)))
                .build();
            
            posts.add(post);
        }
        
        return posts;
    }
    
    private List<Comment> createCommentsForPosts(List<Post> posts, Random random) {
        List<Comment> comments = new ArrayList<>();
        LocalDateTime baseTime = LocalDateTime.now().minusDays(5);
        
        for (Post post : posts) {
            // 각 게시글마다 1~3개의 댓글 생성
            int commentCount = random.nextInt(3) + 1;
            
            for (int i = 0; i < commentCount; i++) {
                CommentData commentData = getCommentDataByCategory(post.getCategory(), i);
                
                Comment comment = Comment.builder()
                    .content(commentData.content)
                    .author(commentData.author)
                    .authorEmail(commentData.authorEmail)
                    .post(post)
                    .createdAt(baseTime.plusDays(random.nextInt(5)).plusHours(random.nextInt(24)).plusMinutes(random.nextInt(60)))
                    .updatedAt(baseTime.plusDays(random.nextInt(5)).plusHours(random.nextInt(24)).plusMinutes(random.nextInt(60)))
                    .build();
                
                comments.add(comment);
            }
        }
        
        return comments;
    }
    
    private PostData getPostDataByCategory(String category, int index) {
        switch (category) {
            case "일반":
                return getGeneralPostData(index);
            case "펀딩추천":
                return getFundingPostData(index);
            case "후기":
                return getReviewPostData(index);
            case "숨은 맛집추천":
                return getHiddenRestaurantPostData(index);
            case "질문":
                return getQuestionPostData(index);
            default:
                return getGeneralPostData(index);
        }
    }
    
    private CommentData getCommentDataByCategory(String category, int index) {
        switch (category) {
            case "일반":
                return getGeneralCommentData(index);
            case "펀딩추천":
                return getFundingCommentData(index);
            case "후기":
                return getReviewCommentData(index);
            case "숨은 맛집추천":
                return getHiddenRestaurantCommentData(index);
            case "질문":
                return getQuestionCommentData(index);
            default:
                return getGeneralCommentData(index);
        }
    }
    
    // 일반 카테고리 게시글 데이터
    private PostData getGeneralPostData(int index) {
        String[] titles = {
            "맛집 탐방기 - 강남역 근처 숨은 맛집들",
            "서울 맛집 투어 후기 - 하루에 5곳 도전!",
            "집에서 만드는 간단한 맛집 메뉴 레시피",
            "맛집 사진 찍는 팁 공유",
            "맛집 예약 꿀팁 모음"
        };
        
        String[] contents = {
            "안녕하세요! 오늘은 강남역 근처에 숨겨진 맛집들을 소개해드릴게요. 특히 강남역 2번 출구 근처에 있는 작은 골목에 정말 맛있는 음식점들이 많더라고요. 추천 맛집: 1. 강남칼국수 - 정말 진한 육수와 쫄깃한 칼국수 2. 강남분식 - 학생들 사이에서 유명한 분식점 3. 강남치킨 - 양념치킨이 정말 맛있어요!",
            "친구들과 함께 서울 맛집 투어를 다녀왔어요. 하루에 5곳을 도전했는데 정말 힘들었지만 재미있었어요. 방문한 곳들: 1. 광장시장 빈대떡 2. 을지로 닭갈비 3. 홍대 떡볶이 4. 강남 족발 5. 이태원 케밥. 개인적으로는 광장시장 빈대떡이 가장 맛있었어요!",
            "오늘은 집에서 쉽게 만들 수 있는 맛집 메뉴 레시피를 공유해드릴게요. 1. 김치찌개 - 김치, 돼지고기, 두부만 있으면 됩니다 2. 된장찌개 - 된장, 채소, 두부로 간단하게 3. 계란볶음밥 - 남은 밥과 계란으로 완성!",
            "맛집에서 음식 사진을 예쁘게 찍는 팁을 공유해드릴게요. 1. 자연광 활용하기 2. 구도 잡기 - 3분할 법칙 3. 음식의 질감 살리기 4. 적절한 각도 찾기 5. 배경 정리하기. 이 팁들을 활용하면 SNS에 올릴 만한 예쁜 사진을 찍을 수 있어요!",
            "인기 맛집 예약하는 꿀팁을 모아봤어요. 1. 오픈 시간 직전에 전화하기 2. 평일 저녁보다는 평일 점심이 여유로워요 3. 온라인 예약 시스템 활용하기 4. 단체 예약은 일주일 전에 미리 하기 5. 예약 취소 정책 확인하기"
        };
        
        String[] authors = {"맛집탐험가", "맛집러버", "홈쿡마스터", "포토그래퍼", "예약고수"};
        
        return new PostData(titles[index], contents[index], authors[index], null);
    }
    
    // 펀딩추천 카테고리 게시글 데이터
    private PostData getFundingPostData(int index) {
        String[] titles = {
            "신촌 맛집 펀딩 프로젝트 - 함께 만들어요!",
            "홍대 디저트 카페 펀딩 - 달콤한 꿈을 현실로!",
            "강남 한식당 펀딩 - 전통의 맛을 현대적으로!",
            "이태원 세계음식 펀딩 - 글로벌 맛집 만들기",
            "종로 전통시장 맛집 펀딩 - 옛 맛을 지켜나가요"
        };
        
        String[] contents = {
            "신촌에 정말 맛있는 음식점을 만들고 싶어요. 현재 50% 펀딩이 완료되었고, 목표 금액은 1000만원입니다. 펀딩 참여자들에게는 오픈 후 무료 식사권과 VIP 멤버십을 제공할 예정입니다. 맛집 컨셉: 현대적인 한식과 퓨전 요리를 조합한 새로운 맛의 도전!",
            "홍대에 특별한 디저트 카페를 만들고 싶어요. 핵심 메뉴: 1. 수제 마카롱 2. 티라미수 3. 크로플 4. 스페셜티 커피. 현재 펀딩 진행률 70%, 목표 금액 800만원. 펀딩 참여자 특전: 오픈 후 1년간 20% 할인, 생일 케이크 무료 제공!",
            "강남에 전통 한식의 맛을 현대적으로 재해석한 한식당을 만들고 싶어요. 메뉴: 1. 현대적 불고기 2. 퓨전 비빔밥 3. 수제 김치 4. 특제 양념장. 펀딩 목표: 1500만원, 현재 진행률 45%. 특전: 오픈 후 VIP 멤버십, 시즌별 특별 메뉴 무료 체험!",
            "이태원에 세계 각국의 대표 음식을 맛볼 수 있는 글로벌 맛집을 만들고 싶어요. 메뉴: 1. 이탈리아 파스타 2. 태국 톰얌 3. 멕시코 타코 4. 인도 커리. 펀딩 목표: 2000만원, 현재 진행률 30%. 특전: 오픈 후 월 1회 무료 식사권, 요리 클래스 참여권!",
            "종로 전통시장에 옛 맛을 그대로 재현한 전통 맛집을 만들고 싶어요. 메뉴: 1. 순대 2. 빈대떡 3. 떡볶이 4. 어묵. 펀딩 목표: 500만원, 현재 진행률 80%. 특전: 오픈 후 전통 음식 만들기 체험, 시장 투어 가이드!"
        };
        
        String[] authors = {"신촌맛집창업가", "디저트메이커", "한식전문가", "글로벌셰프", "전통맛지킴이"};
        
        return new PostData(titles[index], contents[index], authors[index], null);
    }
    
    // 후기 카테고리 게시글 데이터
    private PostData getReviewPostData(int index) {
        String[] titles = {
            "강남역 맛집 후기 - 정말 맛있었어요!",
            "홍대 맛집 투어 후기 - 친구들과 함께!",
            "광장시장 맛집 후기 - 전통의 맛을 느껴요",
            "이태원 맛집 후기 - 세계 음식의 향연",
            "종로 맛집 후기 - 옛 맛을 그대로!"
        };
        
        String[] contents = {
            "오늘은 강남역 근처에 있는 맛집을 방문했는데 정말 맛있었어요! 특히 추천하는 메뉴는 김치찌개와 삼겹살입니다. 김치찌개의 김치 맛이 정말 진하고, 삼겹살은 고기가 정말 신선했어요. 서비스도 친절하고 가격도 합리적이었습니다. 다음에 또 방문하고 싶어요!",
            "친구들과 함께 홍대 맛집 투어를 다녀왔어요. 총 4곳을 방문했는데, 개인적으로는 홍대 떡볶이와 닭갈비가 가장 맛있었어요. 특히 닭갈비는 양념이 정말 맛있고 고기도 부드러웠어요. 떡볶이는 매운맛과 단맛이 조화롭게 어우러져서 정말 맛있었습니다. 다음에 또 가고 싶어요!",
            "광장시장에 있는 전통 맛집들을 방문했어요. 빈대떡, 마약김밥, 순대를 먹었는데 정말 맛있었어요. 특히 빈대떡은 바삭바삭하고 고소해서 정말 맛있었습니다. 마약김밥은 이름만큼 중독성 있는 맛이었고, 순대는 고기가 정말 신선했어요. 전통시장의 분위기도 정말 좋았습니다!",
            "이태원에 있는 세계 음식 맛집들을 방문했어요. 이탈리아 파스타, 태국 톰얌, 멕시코 타코를 먹었는데 정말 맛있었어요. 특히 이탈리아 파스타는 알덴테가 정말 완벽했고, 태국 톰얌은 신맛과 매운맛이 조화롭게 어우러져서 정말 맛있었습니다. 멕시코 타코는 고기와 채소의 조화가 정말 맛있었어요!",
            "종로에 있는 전통 맛집을 방문했어요. 순대, 빈대떡, 떡볶이를 먹었는데 정말 맛있었어요. 특히 순대는 고기가 정말 신선하고 양념도 맛있었어요. 빈대떡은 바삭바삭하고 고소해서 정말 맛있었고, 떡볶이는 매운맛과 단맛이 조화롭게 어우러져서 정말 맛있었습니다. 전통의 맛을 그대로 느낄 수 있어서 정말 좋았어요!"
        };
        
        String[] authors = {"맛집탐험가", "홍대러버", "전통맛러버", "세계음식러버", "전통맛지킴이"};
        
        return new PostData(titles[index], contents[index], authors[index], null);
    }
    
    // 숨은 맛집추천 카테고리 게시글 데이터
    private PostData getHiddenRestaurantPostData(int index) {
        String[] titles = {
            "강남역 숨은 맛집 - 골목 안에 숨어있는 보물!",
            "홍대 숨은 맛집 - 학생들만 아는 맛집!",
            "광장시장 숨은 맛집 - 시장 안쪽에 숨어있는 보물!",
            "이태원 숨은 맛집 - 골목 안에 숨어있는 세계 음식!",
            "종로 숨은 맛집 - 전통의 맛을 지켜나가는 곳!"
        };
        
        String[] contents = {
            "강남역 2번 출구에서 조금만 걸어가면 있는 작은 골목에 정말 맛있는 음식점이 있어요. 이름은 \"강남골목맛집\"인데, 특히 김치찌개와 삼겹살이 정말 맛있어요. 김치찌개의 김치 맛이 정말 진하고, 삼겹살은 고기가 정말 신선해요. 가격도 합리적이고 서비스도 친절합니다. 강남역에 오시면 꼭 방문해보세요!",
            "홍대에 있는 학생들만 아는 숨은 맛집을 소개해드릴게요. 이름은 \"홍대학생맛집\"인데, 특히 떡볶이와 닭갈비가 정말 맛있어요. 떡볶이는 매운맛과 단맛이 조화롭게 어우러져서 정말 맛있고, 닭갈비는 양념이 정말 맛있어요. 가격도 학생들이 부담없이 먹을 수 있을 정도로 합리적입니다!",
            "광장시장 안쪽에 있는 숨은 맛집을 소개해드릴게요. 이름은 \"광장숨은맛집\"인데, 특히 빈대떡과 마약김밥이 정말 맛있어요. 빈대떡은 바삭바삭하고 고소해서 정말 맛있고, 마약김밥은 이름만큼 중독성 있는 맛이에요. 시장의 분위기도 정말 좋고 가격도 합리적입니다!",
            "이태원 골목 안에 있는 숨은 세계 음식 맛집을 소개해드릴게요. 이름은 \"이태원숨은세계맛집\"인데, 특히 이탈리아 파스타와 태국 톰얌이 정말 맛있어요. 이탈리아 파스타는 알덴테가 정말 완벽하고, 태국 톰얌은 신맛과 매운맛이 조화롭게 어우러져서 정말 맛있어요. 세계 음식의 진수를 맛볼 수 있는 곳입니다!",
            "종로에 있는 전통의 맛을 지켜나가는 숨은 맛집을 소개해드릴게요. 이름은 \"종로전통숨은맛집\"인데, 특히 순대와 빈대떡이 정말 맛있어요. 순대는 고기가 정말 신선하고 양념도 맛있고, 빈대떡은 바삭바삭하고 고소해서 정말 맛있어요. 전통의 맛을 그대로 느낄 수 있는 곳입니다!"
        };
        
        String[] authors = {"강남맛집탐험가", "홍대맛집러버", "광장시장탐험가", "이태원세계음식러버", "종로전통맛지킴이"};
        
        return new PostData(titles[index], contents[index], authors[index], null);
    }
    
    // 질문 카테고리 게시글 데이터
    private PostData getQuestionPostData(int index) {
        String[] titles = {
            "강남역 근처 맛집 추천해주세요!",
            "홍대 맛집 투어 코스 추천 부탁드려요!",
            "광장시장 맛집 중에서 가장 맛있는 곳은?",
            "이태원 세계 음식 맛집 추천해주세요!",
            "종로 전통 맛집 중에서 추천하는 곳은?"
        };
        
        String[] contents = {
            "안녕하세요! 강남역 근처에 맛집을 찾고 있는데, 특히 한식이나 중식 맛집을 추천해주세요. 예산은 1인당 2만원 이하로 생각하고 있고, 친구들과 함께 갈 예정입니다. 분위기도 좋고 음식도 맛있는 곳을 찾고 있어요. 추천해주시면 감사하겠습니다!",
            "홍대에 맛집 투어를 계획하고 있는데, 하루에 4-5곳 정도 방문할 수 있는 코스를 추천해주세요. 특히 떡볶이, 닭갈비, 디저트 카페를 포함하고 싶어요. 이동 거리도 고려해서 효율적인 코스로 추천해주시면 감사하겠습니다!",
            "광장시장에 있는 맛집들 중에서 가장 맛있는 곳을 추천해주세요. 빈대떡, 마약김밥, 순대 등을 먹고 싶은데, 각각 어떤 가게가 가장 맛있는지 알려주세요. 가격도 합리적이고 음식도 맛있는 곳을 찾고 있어요!",
            "이태원에 있는 세계 음식 맛집을 추천해주세요. 특히 이탈리아, 태국, 멕시코 음식을 먹고 싶은데, 각각 어떤 가게가 가장 맛있는지 알려주세요. 분위기도 좋고 음식도 맛있는 곳을 찾고 있어요. 예산은 1인당 3만원 이하로 생각하고 있습니다!",
            "종로에 있는 전통 맛집 중에서 추천하는 곳을 알려주세요. 순대, 빈대떡, 떡볶이 등을 먹고 싶은데, 각각 어떤 가게가 가장 맛있는지 알려주세요. 전통의 맛을 그대로 느낄 수 있고 가격도 합리적인 곳을 찾고 있어요!"
        };
        
        String[] authors = {"강남맛집찾는사람", "홍대투어계획자", "광장시장탐험가", "이태원세계음식러버", "종로전통맛찾는사람"};
        
        return new PostData(titles[index], contents[index], authors[index], null);
    }
    
    // 일반 카테고리 댓글 데이터
    private CommentData getGeneralCommentData(int index) {
        String[] contents = {
            "정말 맛있어 보이네요! 다음에 가보고 싶어요.",
            "강남역 근처 맛집 정말 많죠! 저도 추천해드릴게요.",
            "사진도 정말 예쁘게 찍혔네요!"
        };
        
        String[] authors = {"맛집러버", "강남맛집전문가", "포토그래퍼"};
        String[] emails = {"foodlover@email.com", "gangnamfood@email.com", "photographer@email.com"};
        
        return new CommentData(contents[index], authors[index], emails[index]);
    }
    
    // 펀딩추천 카테고리 댓글 데이터
    private CommentData getFundingCommentData(int index) {
        String[] contents = {
            "펀딩 프로젝트 정말 멋져요! 응원합니다!",
            "언제 오픈할 예정인가요?",
            "정말 기대되네요!"
        };
        
        String[] authors = {"펀딩서포터", "맛집러버", "맛집러버"};
        String[] emails = {"fundingsupporter@email.com", "foodlover@email.com", "foodlover@email.com"};
        
        return new CommentData(contents[index], authors[index], emails[index]);
    }
    
    // 후기 카테고리 댓글 데이터
    private CommentData getReviewCommentData(int index) {
        String[] contents = {
            "정말 맛있어 보이네요! 다음에 가보고 싶어요.",
            "저도 그곳 가봤는데 정말 맛있었어요!",
            "정말 재미있었을 것 같아요!"
        };
        
        String[] authors = {"맛집탐험가", "맛집러버", "맛집러버"};
        String[] emails = {"explorer@email.com", "foodlover@email.com", "foodlover@email.com"};
        
        return new CommentData(contents[index], authors[index], emails[index]);
    }
    
    // 숨은 맛집추천 카테고리 댓글 데이터
    private CommentData getHiddenRestaurantCommentData(int index) {
        String[] contents = {
            "정말 기대되네요!",
            "정말 맛있어 보이네요!",
            "정말 기대되네요!"
        };
        
        String[] authors = {"맛집탐험가", "맛집러버", "맛집탐험가"};
        String[] emails = {"explorer@email.com", "foodlover@email.com", "explorer@email.com"};
        
        return new CommentData(contents[index], authors[index], emails[index]);
    }
    
    // 질문 카테고리 댓글 데이터
    private CommentData getQuestionCommentData(int index) {
        String[] contents = {
            "추천해드릴게요!",
            "추천해드릴게요!",
            "추천해드릴게요!"
        };
        
        String[] authors = {"맛집전문가", "맛집전문가", "맛집전문가"};
        String[] emails = {"food@email.com", "food@email.com", "food@email.com"};
        
        return new CommentData(contents[index], authors[index], emails[index]);
    }
    
    // 데이터 클래스들
    private static class PostData {
        String title, content, author, imageUrl;
        
        PostData(String title, String content, String author, String imageUrl) {
            this.title = title;
            this.content = content;
            this.author = author;
            this.imageUrl = imageUrl;
        }
    }
    
    private static class CommentData {
        String content, author, authorEmail;
        
        CommentData(String content, String author, String authorEmail) {
            this.content = content;
            this.author = author;
            this.authorEmail = authorEmail;
        }
    }
} 