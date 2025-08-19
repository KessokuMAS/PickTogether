#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
지역특산품 CSV 파일 정리 스크립트
- 이미지가 없는 상품 제거
- 음식과 관련없는 상품 제거
- 음식 관련 상품만 남김
"""

import csv
import re

def is_food_related(product_name):
    """상품명이 음식과 관련있는지 확인"""
    # 음식 관련 키워드
    food_keywords = [
        '쌀', '미', '벼', '한우', '소고기', '돼지고기', '닭고기', '오리고기',
        '사과', '배', '포도', '감', '자두', '참외', '수박', '메론', '딸기',
        '토마토', '오이', '고추', '배추', '무', '당근', '마늘', '양파', '부추',
        '멸치', '다시마', '미역', '어묵', '곰장어', '붕장어', '생갈치', '새우젓',
        '벌꿀', '꿀', '버섯', '표고', '느타리', '고구마', '감자', '옥수수',
        '인삼', '산양삼', '홍삼', '오미자', '약쑥', '순무', '단호박', '연근',
        '떡', '김', '찌개', '떡갈비', '채소', '과일', '해산물', '육류'
    ]
    
    # 제외할 키워드 (음식과 관련없음)
    exclude_keywords = [
        '화훼류', '관엽류', '화목류', '양봉', '난', '허브', '식용곤충',
        '풍난', '양난', '화훼', '관엽', '화목'
    ]
    
    product_name_lower = product_name.lower()
    
    # 제외 키워드가 포함되어 있으면 False
    for exclude in exclude_keywords:
        if exclude in product_name_lower:
            return False
    
    # 음식 키워드가 포함되어 있으면 True
    for keyword in food_keywords:
        if keyword in product_name_lower:
            return True
    
    return False

def clean_csv(input_file, output_file):
    """CSV 파일을 정리하여 음식 관련 상품만 남김"""
    
    cleaned_data = []
    removed_count = 0
    total_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        
        # 헤더 추가
        header = next(reader)
        cleaned_data.append(header)
        
        for row in reader:
            total_count += 1
            
            if len(row) >= 4:  # 최소 4개 컬럼이 있는지 확인
                product_name = row[1]  # 콘텐츠제목
                image_url = row[3]     # 이미지URL
                
                # 이미지가 있고 음식과 관련된 상품만 포함
                if image_url.strip() and is_food_related(product_name):
                    cleaned_data.append(row)
                else:
                    removed_count += 1
                    print(f"제거됨: {product_name} (이미지: {image_url})")
    
    # 정리된 데이터를 새 파일에 저장
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(cleaned_data)
    
    return len(cleaned_data) - 1, removed_count, total_count

def main():
    input_file = "src/test/java/com/backend/repository/local_specialty_20250818.csv"
    output_file = "src/test/java/com/backend/repository/local_specialty_cleaned.csv"
    
    print("지역특산품 CSV 파일 정리 시작...")
    print(f"입력 파일: {input_file}")
    print(f"출력 파일: {output_file}")
    print("-" * 50)
    
    try:
        kept_count, removed_count, total_count = clean_csv(input_file, output_file)
        
        print("-" * 50)
        print("정리 완료!")
        print(f"원본 데이터: {total_count}개")
        print(f"보존된 데이터: {kept_count}개")
        print(f"제거된 데이터: {removed_count}개")
        print(f"정리율: {((kept_count / total_count) * 100):.1f}%")
        
    except FileNotFoundError:
        print(f"오류: {input_file} 파일을 찾을 수 없습니다.")
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main() 