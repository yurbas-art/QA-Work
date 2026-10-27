import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE = 'https://dks-st.ru';
const pageDuration = new Trend('page_duration', true);
const errorRate = new Rate('errors');

const params = { headers: { 'User-Agent': 'k6-student-load-test' } };

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // разогрев
    { duration: '1m',  target: 10 },  // рабочая нагрузка
    { duration: '30s', target: 20 },  // пик
    { duration: '30s', target: 0 },   // спад
  ],
  thresholds: {
    http_req_failed:   ['rate<0.02'],   // ошибок < 2%
    http_req_duration: ['p(95)<2000'],  // 95% запросов быстрее 2 с
    errors:            ['rate<0.02'],
  },
};

const PAGES = [
  '/',
  '/catalog',
  '/catalog/metalloprokat/armatura',
  '/catalog/metalloprokat/truby-stalnye',
  '/catalog/metalloprokat/list-stalnoj',
  '/uslugi',
  '/uslugi/rezka-metalla',
  '/contacts',
  '/oplata-i-dostavka',
  '/sale',
];

export default function () {
  group('Главная', () => {
    const res = http.get(`${BASE}/`, params);
    const ok = check(res, {
      'status 200': (r) => r.status === 200,
      'содержит «металлопрокат»': (r) => r.body.toLowerCase().includes('металлопрокат'),
    });
    errorRate.add(!ok);
    pageDuration.add(res.timings.duration, { page: 'home' });
  });
  sleep(Math.random() * 2 + 1);

  group('Случайная страница', () => {
    const path = PAGES[Math.floor(Math.random() * PAGES.length)];
    const res = http.get(`${BASE}${path}`, params);
    const ok = check(res, {
      'status 200': (r) => r.status === 200,
      'время < 3 с': (r) => r.timings.duration < 3000,
    });
    errorRate.add(!ok);
    pageDuration.add(res.timings.duration, { page: path });
  });
  sleep(Math.random() * 3 + 1);
}
