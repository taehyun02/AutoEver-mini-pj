# 1단계: 빌드
FROM node:18-slim AS build-stage
WORKDIR /app
# pnpm 설치
RUN npm install -g pnpm

# 1. 설정 파일들 먼저 복사
COPY package.json pnpm-lock.yaml* ./

# 2. 패치 파일 폴더를 먼저 복사해야 pnpm install이 성공함
COPY patches ./patches 

# 3. 의존성 설치
RUN pnpm install --no-frozen-lockfile


# --- 네이버 지도 변수 추가 ---
ARG VITE_NAVER_MAP_ID
ARG VITE_NAVER_MAP_KEY
ENV VITE_NAVER_MAP_ID=$VITE_NAVER_MAP_ID
ENV VITE_NAVER_MAP_KEY=$VITE_NAVER_MAP_KEY

# 4. 나머지 소스 코드 복사 및 빌드
COPY . .
RUN pnpm run build

# 2단계: 실행 (동일)
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist/public/ /usr/share/nginx/html/

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]