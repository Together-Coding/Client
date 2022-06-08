// FIXME 이 파일은 git 을 통해 공유되므로, 중요 인증 정보들은 다른 방식으로 불러와야 합니다.
//  dev/prod 환경에 따라 설정을 나눌 수 있으면 좋을 것 같습니다.

export const DEBUG = false;
export const WS_MONITOR = false;

export const API_URL = 'https://api.together-coding.com'
export const WS_URL = DEBUG ? 'http://localhost:8001' : 'https://ide-ws.together-coding.com'
export const RUNTIME_BRIDGE_URL = DEBUG ? 'https://bridge.together-coding.com' : 'https://bridge.together-coding.com'
export const RUNTIME_URL = 'https://runtime.together-coding.com/';
