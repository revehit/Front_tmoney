DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL,   -- 로그인 ID
                       password VARCHAR(100) NOT NULL,         -- 암호(암호화 가정)
                       email VARCHAR(100) NOT NULL,     -- 이메일
                       first_name VARCHAR(50),                 -- 이름
                       last_name VARCHAR(50),                  -- 성
                       gender CHAR(1),                         -- 성별 (M/F)
                       birth_date DATE,                        -- 생년월일
                       phone VARCHAR(20),                      -- 전화번호
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);