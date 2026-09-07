import type {
  AccrualScenario,
  Direction,
  Lifecycle,
  OperationReason,
  OperationStatus,
  PaymentType,
  PromoStatus,
  PromoSubtype,
  RidStatus,
} from './types'

export const t = {
  appName: 'Лояльность',
  appSub: 'Административная панель',

  nav: {
    search: 'Поиск',
    user: 'Пользователь',
    promos: 'Акции',
    segments: 'Сегменты',
    blocked: 'Заблокированные',
    exports: 'Экспорты',
  },

  common: {
    copy: 'Скопировать',
    copied: 'Скопировано',
    loading: 'Загрузка…',
    nothingFound: 'Ничего не найдено',
    reset: 'Сбросить',
    apply: 'Применить',
    export: 'Экспорт',
    all: 'Все',
    from: 'с',
    to: 'по',
    rows: 'строк',
    of: 'из',
    open: 'Открыть',
    back: 'Назад',
  },
} as const

export const directionLabel: Record<Direction, string> = {
  accrual: 'Начисление',
  redemption: 'Списание',
}

export const statusLabel: Record<OperationStatus, string> = {
  pending: 'В ожидании к начислению',
  credited: 'Начислено',
  debited: 'Списано',
  blocked: 'Заблокировано',
}

export const scenarioLabel: Record<AccrualScenario, string> = {
  purchase_base: 'Базовый (покупка)',
  promo: 'Акция',
  manual: 'Ручное',
  api: 'API',
  refund: 'Возврат списанных бонусов',
}

export const reasonLabel: Record<OperationReason, string> = {
  purchase_base: 'Покупка товара',
  promo: 'Выполнение задания акции',
  manual: 'Ручное начисление',
  api: 'Начисление внешней системой',
  refund_goods_returned: 'Возврат бонусов — возврат товара',
  refund_order_cancelled: 'Возврат бонусов — отмена заказа',
  refund_wrong_bank: 'Возврат бонусов — оплата не тем банком',
  redeem_purchase: 'Списание при покупке',
  expiration: 'Сгорание бонусов',
  clawback_goods_returned: 'Отзыв бонусов — возврат товара',
}

/** Группировка причин для фильтра */
export const reasonGroups: { group: string; reasons: OperationReason[] }[] = [
  { group: 'Начисления', reasons: ['purchase_base', 'promo', 'manual', 'api'] },
  {
    group: 'Возвраты списанных бонусов',
    reasons: ['refund_goods_returned', 'refund_order_cancelled', 'refund_wrong_bank'],
  },
  {
    group: 'Списания',
    reasons: ['redeem_purchase', 'expiration', 'clawback_goods_returned'],
  },
]

export const promoSubtypeLabel: Record<PromoSubtype, string> = {
  transactional: 'Транзакционная',
  behavioral: 'Поведенческая',
}

export const promoStatusLabel: Record<PromoStatus, string> = {
  draft: 'Черновик',
  active: 'Активна',
  paused: 'На паузе',
  finished: 'Завершена',
}

export const paymentTypeLabel: Record<PaymentType, string> = {
  true_bank: 'Внутренний банк МП',
  no_true_bank: 'Сторонний способ оплаты',
}

export const ridStatusLabel: Record<RidStatus, string> = {
  active: 'Активен',
  returned: 'Возврат',
  cancelled: 'Отменён',
}

export const lifecycleLabel: Record<Lifecycle, string> = {
  normal: 'В норме',
  expired: 'Сгорело',
  clawed_back: 'Отозвано',
  partially_reverted: 'Частично отозвано',
}
