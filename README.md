# Together Coding
일대다 코딩 수업을 위한 실시간 코드 공유 서비스

## 프로젝트 설계 및 제작

![설계도](https://user-images.githubusercontent.com/86250281/174433138-1a92a6f7-ce52-4ed1-98ba-f5f814034fda.png)

### Front-End UI/UX 구성도

![Together- coding  (2)](https://user-images.githubusercontent.com/86250281/174433219-80307771-5c58-4c5c-b5bc-79192a8c629d.jpg)

### Front-End 컴포넌트 구성도
<img src="https://user-images.githubusercontent.com/86250281/174433238-e3e0317b-5a67-49b6-88f6-b8c94df630f5.png" width="50%" height="600px">

## 구현 및 개발 내용

![main](https://user-images.githubusercontent.com/86250281/174434555-78471269-3ee6-4642-84c8-08e659aac6f1.png)
![로그인 회원가입](https://user-images.githubusercontent.com/86250281/174434557-d7c12830-a4e7-43d7-8ee0-6c33855c3b55.png)

### 내 정보 페이지 
강의를 개설하고, 내가 교수자인 강의와 참가중인 강의를 확인 할 수 있습니다.  

![내정보 페이지](https://user-images.githubusercontent.com/86250281/174434653-47fa62e6-e517-4501-9b74-2f85f31abba8.png)

![강의 개설](https://user-images.githubusercontent.com/86250281/174434743-c6114efb-fba4-4ba1-a757-29d3137f72a4.png)  
(강의 개설하기)

### 교수자의 메인 페이지

1주차 수업, 2주차 수업과 같이 레슨을 추가 할 수 있습니다.  

![렐스는](https://user-images.githubusercontent.com/86250281/174434829-33ba5681-9360-49eb-b659-065beafb4133.png)

### 강의 관리

강의 관련 정보들을 수정, 강의를 종료시킬수 있습니다.

![강의 관리](https://user-images.githubusercontent.com/86250281/174434857-509d3b82-a418-4c4d-ad19-0539a37d849f.png)

### 템플릿 업로드 & 다운로드

수업에 필요한 자료들을 업로드, 다운로드 할수 있습니다.

![템플릿 업롣;ㅡ 다운로드](https://user-images.githubusercontent.com/86250281/174434880-d93a145a-3407-4cf9-ac21-937e3b4c070f.png)

### 참여자 추가

수업에 참가시킬 학생들을 추가 할 수 있습니다.  
![참여자 추가](https://user-images.githubusercontent.com/86250281/174434917-1fa78596-18c4-4da3-8b62-1a32bfc7606f.png)

### 웹 IDE

교수자나 학생이 수업에 입장하면 나타나는 페이지 입니다. 코드 에디터는 microsoft의 오픈소스 `Monaco Editor`를 사용하였습니다.
UI는 goormIDE를 참고 하였습니다.

![ide](https://user-images.githubusercontent.com/86250281/174434952-08f42c02-06f8-4faa-935c-131a049337d1.png)

### 유저 현황

유저의 온&오프라인 여부를 실시간으로 확인 가능하며, 유저의 Read, Write, Exec 권한을 제어 할 수 있습니다. 또한 다른 유저의 프로젝트에 접근 할 수 있습니다.

![유저현황 최종](https://user-images.githubusercontent.com/86250281/174435012-1dffee67-b5c1-4790-997b-5606a7d9727b.png)

### 파일 관리

각각의 파일을 CRUD 할 수 있습니다.

![ㅇㄹㅇㄹㅇㄹㅇㄹㅇㄹㅇㄹㅇ](https://user-images.githubusercontent.com/86250281/174435028-fb99a27b-08d9-42b5-b760-6db7df44b6cc.png)

### 파일 열기

각각의 파일을 열수 있습니다.

![파일 열기](https://user-images.githubusercontent.com/86250281/174435075-e51ec8ea-12b3-4697-a1f6-fff6f922c7d2.png)

### 파일 실행

하단의 터미널 창에서 파일을 실행시킨 결과를 확인 할 수 있습니다.

![파일 실행](https://user-images.githubusercontent.com/86250281/174435102-64367651-1e72-45c7-8054-4932f67483df.png)

### 실시간 코드 수정 , 커서 위치 공유

![ezgif com-gif-maker (18)](https://user-images.githubusercontent.com/86250281/174435138-956a7670-4640-44ac-bcee-f6db74362c5a.gif)

### 질문 생성

학생은 질문하고 싶은 라인에 커서를 위치시키고 F8을 누르면 질문을 생성하는 창이 생깁니다.

![학생 질문](https://user-images.githubusercontent.com/86250281/174435161-3cd49362-0b08-4d38-8120-133d0629f518.png)

### 질문 확인

교수자는 수업 중 들어온 질문을 확인 할 수 있고, 질문 내용의 파일 제목을 클릭하면 해당 파일로 이동합니다.

![질문 확인](https://user-images.githubusercontent.com/86250281/174435175-3243ec30-c932-4f19-814b-9e57c1e37147.png)

***

## 사용한 기술

* React.js
* CSS(Sass)
* socket.io
* xterm.js
* Monaco Editor

## Reference

* https://ide.goorm.io/
* https://microsoft.github.io/monaco-editor/api/index.html
* https://www.npmjs.com/package/@monaco-editor/react
* https://socket.io/

## Contributor

* [a2tt](https://github.com/a2tt)  
* [권순용 (boyfromthewell)](https://github.com/boyfromthewell)

***

> 데모 영상 링크 : https://youtu.be/znzmxhIVmqs




