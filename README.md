# hell-way

서울 지하철 혼잡도 데이터를 이용해 시간대별 혼잡도를 색으로 표시하는 데모 프로젝트입니다.

## 시작하기

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속하면 지도를 확인할 수 있습니다.

## 데이터 연동

- `data/seoul-subway-hourly-data.json`의 `records` 배열을 읽어 혼잡도를 표시합니다.
- `assets/subway.svg` 내 역 원형의 `data-name` 또는 `id`가 JSON의 `stationName`/`stationId`와 매칭되어야 합니다.
- 각 역은 왼쪽 원(승차), 오른쪽 원(하차)로 색상이 적용됩니다.
- 데이터는 `ride`(승차)와 `alight`(하차) 혼잡도 필드를 포함해야 하며 전체 역이 포함되어야 합니다.
