# ILKA Boat Acquisition Radar

Веб-подборщик лодок для Nikita и Zhenya: сравнивает предложения не по цене объявления, а по полной экономике получения **жилого актива**.

## Что решает

Для каждого объявления показывает:
- **ОТМЕСТИ** — hard gate провален;
- **ПАУЗА** — не хватает критических данных;
- **ТОРГОВАТЬСЯ** — лодка интересна только ниже рассчитанного walk-away;
- **BUY ZONE / РАССМАТРИВАТЬ** — экономика проходит текущий сценарий.

## Обязательный жилой минимум

- минимум 2 приватные каюты;
- минимум 6 спальных/комфортных мест;
- после покупки/доставки на лодке можно жить.

Готовый красивый интерьер не обязателен. Косметику, интерьер, батареи, solar и другие улучшения можно делать уже после заселения.

## Главные расчёты

- **Cost-to-Habitable** = ask + due diligence + выбранная логистика + обязательный ремонт + overlap housing.
- **LOCAL / SEA / ROAD** — выбирается самый дешёвый подтверждённо возможный путь.
- **Downside housing cost/month** — считает quick-sale, а не оптимистичную продажу.
- **Walk-away price** — максимальная цена покупки при текущем бюджете и downside-модели.
- **Margin of safety** = walk-away − ask.
- **DIY economics** = cash + shadow cost нашего времени против ожидаемого market-value uplift.
- **Max price vs rent** — потолок покупки, при котором downside не проигрывает аренде.

## Базовые условия

- квартира: 3100–3200 PLN/мес;
- рабочий midpoint: 3150 PLN/мес;
- target: <= 1000 USD/мес all-in;
- первый горизонт: 12 месяцев;
- shadow-rate DIY по умолчанию: 31.40 PLN/ч, редактируется;
- монетизация лодки не используется для спасения базовой housing-экономики.

## Источники и история цен

Карточка предложения хранит:
- source site;
- URL;
- дату наблюдения;
- seller type;
- location;
- current ask;
- комментарий.

Новые цены и комментарии собираются через GitHub issue #2. Проверенные коммерческие факты продвигаются в versioned EVIDENCE; старая цена не должна исчезать.

## Marina EVIDENCE

Приложение читает current marina artifact через:

`ARTIFACT_INDEX.json → ilka.research.marina-offers → evidence file`

То есть цены марин больше не должны поддерживаться отдельно внутри `app.js`.

## Запуск

Нужен статический HTTP-сервер, потому что браузер блокирует загрузку JSON EVIDENCE из `file://`.

Например:

```bash
python3 -m http.server 8080
```

Затем открыть:

`http://localhost:8080/`

## Файлы

- `calculator-core.js` — чистая расчётная логика;
- `app.js` — UI/state/evidence loading;
- `index.html` — экран Acquisition Radar;
- `styles.css` — интерфейс;
- `tests/calculator-core.test.js` — расчётные тесты.

## Текущее состояние MP_DSL

- PRODUCT v1.1 — APPROVED
- DOMAIN v1.2 — APPROVED
- Result v0.4 — G6_VALIDATION / REVIEW (browser smoke open)
- PR #1 — draft
- production deploy — не разрешён
