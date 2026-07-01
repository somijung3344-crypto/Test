# 영진전문대학교 회원관리 데이터베이스 설계서 (Database Design)

이 문서는 영진전문대학교 회원가입 페이지에 적용되는 데이터베이스(DB) 테이블 구조와 명세를 정의합니다. 

현재는 프론트엔드(HTML/CSS/JS)로만 구성되어 있어 실제 DB 연결은 없지만, 추후 RDBMS(MySQL, MariaDB, PostgreSQL 등)를 도입하여 백엔드를 구축할 때 즉시 적용할 수 있도록 표준 SQL을 기준으로 설계했습니다.

---

## 1. 테이블 정의 (Table Definition)

- **테이블명**: `users` (또는 `member`)
- **설명**: 영진전문대학교 홈페이지 가입 회원 정보 저장 테이블
- **기본키 (Primary Key)**: `num` (일련번호)

---

## 2. 컬럼 상세 명세 (Column Specification)

| 번호 | 컬럼명 (Column Name) | 데이터 타입 (Data Type) | 제약 조건 (Constraints) | 설명 (Description) | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `num` | `INT` | PRIMARY KEY, AUTO_INCREMENT | 회원 고유 번호 (Number) | 고유 식별자 |
| **2** | `user_id` | `VARCHAR(30)` | UNIQUE, NOT NULL | 사용자 아이디 (ID) | 5~20자, 영문/숫자 |
| **3** | `password` | `VARCHAR(255)` | NOT NULL | 암호화된 비밀번호 (Password) | 해시 함수(예: BCrypt)로 암호화하여 저장 |
| **4** | `email` | `VARCHAR(100)` | UNIQUE, NOT NULL | 이메일 주소 (Email) | 이메일 형식 검증 필요 |
| **5** | `phone_number` | `VARCHAR(15)` | NOT NULL | 전화번호 (Phone Number) | `010-XXXX-XXXX` 형식 |
| **6** | `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | 가입 일시 | 가입일 기록용 |

---

## 3. SQL 테이블 생성 스크립트 (DDL - Data Definition Language)

데이터베이스 관리 도구(MySQL/MariaDB 등)에서 실행하여 테이블을 생성할 수 있는 SQL 쿼리입니다.

```sql
CREATE DATABASE IF NOT EXISTS yju_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yju_db;

CREATE TABLE IF NOT EXISTS `users` (
    `num` INT AUTO_INCREMENT COMMENT '회원 고유 일련번호',
    `user_id` VARCHAR(30) NOT NULL UNIQUE COMMENT '사용자 아이디 (5~20자)',
    `password` VARCHAR(255) NOT NULL COMMENT '해싱된 암호 (BCrypt)',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '사용자 이메일',
    `phone_number` VARCHAR(15) NOT NULL COMMENT '전화번호 (010-XXXX-XXXX)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일시',
    PRIMARY KEY (`num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영진전문대학교 가입회원 테이블';
```

---

## 4. 데이터 삽입 예시 (DML - Data Manipulation Language)

사용자 가입 시 실행되는 예시 `INSERT` 쿼리입니다. 비밀번호는 보안상 원문 그대로 저장하지 않고, 안전하게 단방향 암호화(Hashing)된 값으로 입력해야 합니다.

```sql
-- 예시 회원 데이터 삽입 (비밀번호는 'yju12345!'의 BCrypt 해시값 예시)
INSERT INTO `users` (`user_id`, `password`, `email`, `phone_number`)
VALUES (
    'yju_student',
    '$2a$12$e0MYzXyDx1k6m0iU7.w.cOuH29sX23i8U12YJUtpP7qX3.1y2u2C.', -- 암호화된 비밀번호
    'student@g.yju.ac.kr',
    '010-1234-5678'
);
```

---

## 5. 보안 및 설계 고려사항 (Security & Design Notes)

1. **비밀번호 단방향 암호화 필수**
   사용자의 비밀번호는 DB 노출 시에도 안전하도록 반드시 솔트(Salt)가 포함된 단방향 해시 알고리즘인 **BCrypt** 또는 **Argon2**를 사용하여 암호화 후 저장해야 합니다.

2. **Unique 제약조건 활용**
   - `user_id`와 `email`에 `UNIQUE` 제약조건을 적용하여 중복 가입을 방지합니다.
   - 가입을 요청받는 백엔드 로직에서는 데이터베이스에 쿼리를 날리기 전에 중복 체크 API를 통해 중복 여부를 미리 검사하는 것이 바람직합니다.
