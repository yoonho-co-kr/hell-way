# hell-way

서울 지하철 혼잡도 데이터를 이용해 시간대별 혼잡도를 색으로 표시하는 데모 프로젝트입니다.

## 시작하기

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속하면 지도를 확인할 수 있습니다.

## 데이터 연동

- `data/seoul-subway-hourly-data.json`의 `records` 배열을 읽어 혼잡도를 표시합니다.
- `assets/seoul_metro_map_with_ids.svg` 내에 `data-station-id` 속성이 있어야 합니다.
- `stationId`가 매칭되는 원형 노드에 혼잡도 색상이 적용됩니다.
