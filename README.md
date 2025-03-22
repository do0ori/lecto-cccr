# 🚀 CCCR Lecture Automation - Lecto

CCCR 아카데미의 아직 수강하지 않은 미완료 강의들을 모두 찾아 자동으로 순차 실행해주는 크롬 확장 프로그램입니다.

## 📥 Installation

1. 최신 [release](https://github.com/do0ori/lecto-cccr/releases) ZIP 파일 다운로드 후 압축 해제
2. 크롬 브라우저의 주소 창에 `chrome://extensions`를 입력해서 확장 프로그램 페이지로 이동
3. 페이지 상단의 "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭하고, 확장 프로그램 폴더 선택
   ![image](https://github.com/user-attachments/assets/075cc118-00eb-40f4-acd4-19d8dd7b447b)

## 📖 Usage

1. CCCR 아카데미 강의 수강 페이지에서 강의목차 항목에 다음과 같이 버튼이 생성됩니다.

    - Lecto 설치 전

        ![image](https://github.com/user-attachments/assets/7e657fe6-6947-4207-a538-dae439a2ad0d)

    - Lecto 설치 후

        ![image](https://github.com/user-attachments/assets/0146d95b-b806-4da0-946e-b88407347d02)

2. 모든 강의를 수강 완료하여 미완료 강의가 존재하지 않으면 버튼이 비활성화됩니다.

    - 모두 수강 완료한 경우

        ![image](https://github.com/user-attachments/assets/b1be45a0-64af-4c4c-b76e-0abeea48b059)

3. 자동 수강 버튼을 클릭하면 Lecto가 미완료 강의를 찾아 순차 실행합니다.

    - 강의는 새 탭에서 음소거로 실행됩니다.
    - Lecto가 실행 중인 경우

        ![image](https://github.com/user-attachments/assets/5ad4d0f4-a852-496a-9b1e-a6fb297a9b54)

    - 멈추기 버튼을 눌러 실행을 중지할 수 있습니다.
    - 오른쪽의 설정 아이콘을 클릭하면 설정창이 열리고 설정창 외부를 클릭하면 닫힙니다.

        ![image](https://github.com/user-attachments/assets/c7b94fc3-668d-42a9-ae63-7fc2b75f93ac)

        - **web notification**

            ![image](https://github.com/user-attachments/assets/0ca41857-1afb-4365-8f2a-91cd01c486a5)

            - 모든 미완료 강의들을 수강 완료하면 웹 알림을 보냅니다.
            - 소리가 없습니다.

        - **discord notification**

            ![image](https://github.com/user-attachments/assets/24196732-7fe9-4410-a3b6-0bb0e609b88a)

            - 모든 미완료 강의들을 수강 완료하면 디스코드 메시지를 보냅니다.
            - 메시지를 받고자하는 디스코드 채널의 Webhook URL을 입력한 후 전송 버튼을 눌러 테스트 메시지를 보내볼 수 있습니다.

                ![image](https://github.com/user-attachments/assets/7e14ca81-34bf-40a7-944a-07d460a921b8)

4. 강의 수강이 완료되면 편하게 2배속으로 들으며 공부합니다. 😄

## 🤝 Contributions

버그를 발견하거나 새로운 기능을 제안하는 것은 언제나 환영입니다! [이슈](https://github.com/do0ori/lecto-cccr/issues)를 작성해주세요.
