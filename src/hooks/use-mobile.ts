import * as React from "react"

const MOBILE_BREAKPOINT = 768

// 화면 폭이 기준을 넘나들 때마다 React에 알려 준다
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

// shadcn 원본은 effect 안에서 setState를 불러 lint(react-hooks/set-state-in-effect)에 걸린다.
// 그래서 브라우저 값을 읽는 React 공식 훅 useSyncExternalStore로 바꿨다 (서버에서는 false)
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
