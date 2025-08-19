package com.backend.service.specialty;

import com.backend.dto.specialty.NongsaroApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class NongsaroApiServiceImpl implements NongsaroApiService {
    
    @Value("${nongsaro.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    private static final String BASE_URL = "http://api.nongsaro.go.kr/service/localSpcprd";
    
    @Override
    public List<NongsaroApiResponse.Item> getSidoList() {
        String url = BASE_URL + "/selectAreaSidoLst?apiKey=" + apiKey;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String xmlResponse = response.getBody();
            log.info("시도 목록 API 응답: {}", xmlResponse);
            
            return parseSidoListFromXml(xmlResponse);
            
        } catch (Exception e) {
            log.error("시도 목록 조회 실패: {}", e.getMessage());
        }
        return new ArrayList<>();
    }
    
    // XML 응답을 정규식으로 파싱
    private List<NongsaroApiResponse.Item> parseSidoListFromXml(String xml) {
        List<NongsaroApiResponse.Item> items = new ArrayList<>();
        
        if (xml == null || xml.isEmpty()) {
            return items;
        }
        
        try {
            // <item> 태그 내의 내용을 찾기
            Pattern itemPattern = Pattern.compile("<item>(.*?)</item>", Pattern.DOTALL);
            Matcher itemMatcher = itemPattern.matcher(xml);
            
            while (itemMatcher.find()) {
                String itemContent = itemMatcher.group(1);
                
                NongsaroApiResponse.Item item = new NongsaroApiResponse.Item();
                
                // 각 필드 추출
                item.setAreaCode(extractXmlValue(itemContent, "areaCode"));
                item.setAreaNm(extractXmlValue(itemContent, "areaNm"));
                
                items.add(item);
            }
            
            log.info("파싱된 시도 개수: {}", items.size());
            
        } catch (Exception e) {
            log.error("XML 파싱 실패: {}", e.getMessage());
        }
        
        return items;
    }
    
    // XML 태그에서 값 추출 (CDATA 처리 포함)
    private String extractXmlValue(String xml, String tagName) {
        Pattern pattern = Pattern.compile("<" + tagName + ">(.*?)</" + tagName + ">");
        Matcher matcher = pattern.matcher(xml);
        if (matcher.find()) {
            String value = matcher.group(1).trim();
            // CDATA 태그 제거
            value = value.replaceAll("<!\\[CDATA\\[(.*?)\\]\\]>", "$1");
            return value;
        }
        return "";
    }
    
    @Override
    public List<NongsaroApiResponse.Item> getSigunguList(String sidoNm) {
        String url = BASE_URL + "/selectAreaSigunguLst?apiKey=" + apiKey + "&sDoNm=" + sidoNm;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String xmlResponse = response.getBody();
            log.info("시군구 목록 API 응답: {}", xmlResponse);
            
            return parseSigunguListFromXml(xmlResponse);
            
        } catch (Exception e) {
            log.error("시군구 목록 조회 실패: {}", e.getMessage());
        }
        return new ArrayList<>();
    }
    
    // 시군구 목록 XML 파싱
    private List<NongsaroApiResponse.Item> parseSigunguListFromXml(String xml) {
        List<NongsaroApiResponse.Item> items = new ArrayList<>();
        
        if (xml == null || xml.isEmpty()) {
            return items;
        }
        
        try {
            // <item> 태그 내의 내용을 찾기
            Pattern itemPattern = Pattern.compile("<item>(.*?)</item>", Pattern.DOTALL);
            Matcher itemMatcher = itemPattern.matcher(xml);
            
            while (itemMatcher.find()) {
                String itemContent = itemMatcher.group(1);
                
                NongsaroApiResponse.Item item = new NongsaroApiResponse.Item();
                
                // 각 필드 추출
                item.setAreaCode(extractXmlValue(itemContent, "areaCode"));
                item.setAreaNm(extractXmlValue(itemContent, "areaNm"));
                
                items.add(item);
            }
            
            log.info("파싱된 시군구 개수: {}", items.size());
            
        } catch (Exception e) {
            log.error("XML 파싱 실패: {}", e.getMessage());
        }
        
        return items;
    }
    
    @Override
    public List<NongsaroApiResponse.Item> getLocalSpecialtyList(String searchText, String areaNm, 
                                                              String areaCode, int pageNo, int numOfRows) {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL + "/localSpcprdLst?apiKey=" + apiKey);
        
        if (searchText != null && !searchText.trim().isEmpty()) {
            urlBuilder.append("&sText=").append(searchText);
        }
        if (areaNm != null && !areaNm.trim().isEmpty()) {
            urlBuilder.append("&sAreaNm=").append(areaNm);
        }
        if (areaCode != null && !areaCode.trim().isEmpty()) {
            urlBuilder.append("&sAreaCode=").append(areaCode);
        }
        if (pageNo > 0) {
            urlBuilder.append("&pageNo=").append(pageNo);
        }
        if (numOfRows > 0) {
            urlBuilder.append("&numOfRows=").append(numOfRows);
        }
        
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(urlBuilder.toString(), String.class);
            String xmlResponse = response.getBody();
            log.info("지역특산물 목록 API 응답: {}", xmlResponse);
            
            return parseLocalSpecialtyListFromXml(xmlResponse);
            
        } catch (Exception e) {
            log.error("지역특산물 목록 조회 실패: {}", e.getMessage());
        }
        return new ArrayList<>();
    }
    
    // 지역특산물 목록 XML 파싱
    private List<NongsaroApiResponse.Item> parseLocalSpecialtyListFromXml(String xml) {
        List<NongsaroApiResponse.Item> items = new ArrayList<>();
        
        if (xml == null || xml.isEmpty()) {
            return items;
        }
        
        try {
            // <item> 태그 내의 내용을 찾기
            Pattern itemPattern = Pattern.compile("<item>(.*?)</item>", Pattern.DOTALL);
            Matcher itemMatcher = itemPattern.matcher(xml);
            
            while (itemMatcher.find()) {
                String itemContent = itemMatcher.group(1);
                
                NongsaroApiResponse.Item item = new NongsaroApiResponse.Item();
                
                // 각 필드 추출
                item.setCntntsNo(extractXmlValue(itemContent, "cntntsNo"));
                item.setCntntsSj(extractXmlValue(itemContent, "cntntsSj"));
                item.setAreaNm(extractXmlValue(itemContent, "areaNm"));
                item.setImgUrl(extractXmlValue(itemContent, "imgUrl"));
                item.setSvcDt(extractXmlValue(itemContent, "svcDt"));
                item.setLinkUrl(extractXmlValue(itemContent, "linkUrl"));
                item.setAreaCode(extractXmlValue(itemContent, "areaCode"));
                
                items.add(item);
            }
            
            log.info("파싱된 지역특산물 개수: {}", items.size());
            
        } catch (Exception e) {
            log.error("XML 파싱 실패: {}", e.getMessage());
        }
        
        return items;
    }
} 