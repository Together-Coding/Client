// FIXME 이 파일은 git 을 통해 공유되므로, 중요 인증 정보들은 다른 방식으로 불러와야 합니다.
//  dev/prod 환경에 따라 설정을 나눌 수 있으면 좋을 것 같습니다.

const DEBUG = true

export const API_URL = 'http://api.together-coding.com'
export const RUNTIME_BRIDGE_URL = DEBUG ? 'https://dev-bridge.together-coding.com' : 'https://bridge.together-coding.com'
