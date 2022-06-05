const {io} = require('socket.io-client');


export class WSClient {
  constructor(url, token, options= null) {
    this.url = url;
    this.token = token;  // 인증 토큰
    this.socket = io(this.url, options || {});
    this.listen = false;

    this.authEventName = 'AUTHENTICATE';

    this.listenEvent();
  }

  send(...args) {
    this.socket.send(...args);
  }

  emit(...args) {
    this.socket.emit(...args);
  }

  on(...args) {
    this.socket.on(...args);
  }

  authenticate() {
    if (!this.token) return;

    this.socket.emit(this.authEventName, {
      token: this.token,
    })
  }

  listenEvent() {
    if (this.listen) return;
    this.listen = true;

    this.socket.on('disconnect', (reason) => {
      console.error('disconnect', reason);
    })
    this.socket.on('connect_error', () => {
      console.error('connection failed');
    })
  }
}

/**
 * 코드가 실행 될 Runtime 컨테이너에 SSH 연결을 하기 위해,
 * 해당 컨테이너의 SSH relay 서버에 웹소켓 연결을 합니다.
 * SSH relay 서버는 웹소켓을 통해 SSH 요청을 중개합니다.
 */
export class SSHClient extends WSClient {
  listenEvent() {
    super.listenEvent();
    this.socket.on('connect', () => {
      this.authenticate();
    })
  }
}
