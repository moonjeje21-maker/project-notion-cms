import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 도구 버튼이 접힌 사이드바의 사용자 메뉴를 가리지 않도록 오른쪽 아래로 옮긴다
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
