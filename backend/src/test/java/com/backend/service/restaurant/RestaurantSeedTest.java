package com.backend.service.restaurant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootTest
@TestPropertySource(properties = {
	// LOCAL INFILE 허용 (MariaDB/MySQL 드라이버 호환을 위해 둘 다 지정)
	"spring.datasource.url=jdbc:mariadb://localhost:3306/pickdb?allowLocalInfile=true&allowLoadLocalInfile=true"
})
public class RestaurantSeedTest {

	@Autowired
	private DataSource dataSource;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void seedFromCsvWithLoadDataLocalInfile() {
		// CSV 절대 경로 계산: 프로젝트 루트가 D:\\PickTogether 인 경우 backend 테스트 기준으로 ../csv 로 접근
		Path csvPath = Paths.get("..", "csv", "kakao_food_places.csv")
				.normalize()
				.toAbsolutePath();

		String csvAbsolutePath = csvPath.toString()
				.replace('\\', '/'); // 드라이버 호환을 위해 슬래시로 통일

		// 1) 세션/글로벌 local_infile 활성화 (권한 없으면 실패해도 진행)
		try { jdbcTemplate.execute("SET SESSION local_infile = 1"); } catch (Exception ignore) {}
		try { jdbcTemplate.execute("SET GLOBAL local_infile = 1"); } catch (Exception ignore) {}

		// 2) 기존 데이터 정리 (자식 → 부모 순)
		jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
		jdbcTemplate.execute("TRUNCATE TABLE restaurant_image");
		jdbcTemplate.execute("TRUNCATE TABLE restaurant");
		jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

		// 3) CSV 적재: 필수 아님 컬럼(funding_*)은 기본값 0으로 세팅
		String loadSqlLf = "LOAD DATA LOCAL INFILE '" + csvAbsolutePath + "'\n" +
				"INTO TABLE restaurant\n" +
				"CHARACTER SET utf8mb4\n" +
				"FIELDS TERMINATED BY ',' ENCLOSED BY '" + '"' + "' ESCAPED BY '" + '"' + "'\n" +
				"LINES TERMINATED BY '\\n'\n" +
				"IGNORE 1 LINES\n" +
				"(id, name, category_name, phone, road_address_name, x, y, place_url, distance)\n" +
				"SET funding_goal_amount = 0, funding_amount = 0";
		String loadSqlCrlf = loadSqlLf.replace("LINES TERMINATED BY '\\\\n'", "LINES TERMINATED BY '\\\\r\\\\n'");
		try {
			jdbcTemplate.execute(loadSqlLf);
		} catch (Exception e) {
			jdbcTemplate.execute(loadSqlCrlf);
		}

		// 4) ID를 1..45로 재매핑 (원본 id → 임시 테이블에 보관 후 업데이트)
		jdbcTemplate.execute("CREATE TEMPORARY TABLE t AS SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM restaurant LIMIT 45");
		jdbcTemplate.execute("UPDATE restaurant r JOIN t ON r.id = t.old_id SET r.id = t.new_id");
		jdbcTemplate.execute("DROP TEMPORARY TABLE t");

		// 5) 펀딩 금액 업데이트
		jdbcTemplate.execute("UPDATE restaurant SET funding_goal_amount = 500000, funding_amount = FLOOR(RAND() * 51) * 10000 WHERE id BETWEEN 1 AND 45");

		// 6) 레스토랑 이미지 생성 (메인 1장, 파일명: {id}.jpg)
		jdbcTemplate.execute("INSERT INTO restaurant_image (restaurant_id, image_url, is_main, sort_order) SELECT r.id, CONCAT(r.id, '.jpg'), TRUE, 0 FROM restaurant r WHERE r.id BETWEEN 1 AND 45");
	}
} 