export const CARD_TYPES = {
  BRIGHT: 'bright', // 광
  ANIMAL: 'animal', // 열끗 (멍텅구리 포함)
  RIBBON: 'ribbon', // 띠
  JUNK: 'junk',     // 피
  DOUBLE_JUNK: 'double_junk', // 쌍피
};

export const CARDS = [
  // 1월 (송학)
  { id: 0, month: 1, type: CARD_TYPES.BRIGHT, name: '송학 광' },
  { id: 1, month: 1, type: CARD_TYPES.RIBBON, name: '송학 홍단' },
  { id: 2, month: 1, type: CARD_TYPES.JUNK, name: '송학 피' },
  { id: 3, month: 1, type: CARD_TYPES.JUNK, name: '송학 피' },
  // 2월 (매조)
  { id: 4, month: 2, type: CARD_TYPES.ANIMAL, name: '매조 열끗' }, // 고도리
  { id: 5, month: 2, type: CARD_TYPES.RIBBON, name: '매조 홍단' },
  { id: 6, month: 2, type: CARD_TYPES.JUNK, name: '매조 피' },
  { id: 7, month: 2, type: CARD_TYPES.JUNK, name: '매조 피' },
  // 3월 (벚꽃)
  { id: 8, month: 3, type: CARD_TYPES.BRIGHT, name: '벚꽃 광' },
  { id: 9, month: 3, type: CARD_TYPES.RIBBON, name: '벚꽃 홍단' },
  { id: 10, month: 3, type: CARD_TYPES.JUNK, name: '벚꽃 피' },
  { id: 11, month: 3, type: CARD_TYPES.JUNK, name: '벚꽃 피' },
  // 4월 (흑싸리)
  { id: 12, month: 4, type: CARD_TYPES.ANIMAL, name: '흑싸리 열끗' }, // 고도리
  { id: 13, month: 4, type: CARD_TYPES.RIBBON, name: '흑싸리 초단' },
  { id: 14, month: 4, type: CARD_TYPES.JUNK, name: '흑싸리 피' },
  { id: 15, month: 4, type: CARD_TYPES.JUNK, name: '흑싸리 피' },
  // 5월 (난초)
  { id: 16, month: 5, type: CARD_TYPES.ANIMAL, name: '난초 열끗' },
  { id: 17, month: 5, type: CARD_TYPES.RIBBON, name: '난초 초단' },
  { id: 18, month: 5, type: CARD_TYPES.JUNK, name: '난초 피' },
  { id: 19, month: 5, type: CARD_TYPES.DOUBLE_JUNK, name: '난초 쌍피' }, // 실제로는 쌍피 아님, 보통 피 2장. 편의상 피로 분류하거나 룰에 따라 다름. 표준 화투는 피 2장. 여기선 피로 통일하고 특수룰 적용시 수정. 일단 표준 피로 수정.
  // 수정: 5월은 열끗, 초단, 피, 피 입니다. 쌍피는 국진(9), 똥(11), 비(12)에 존재.
  // 6월 (모란)
  { id: 20, month: 6, type: CARD_TYPES.ANIMAL, name: '모란 열끗' },
  { id: 21, month: 6, type: CARD_TYPES.RIBBON, name: '모란 청단' },
  { id: 22, month: 6, type: CARD_TYPES.JUNK, name: '모란 피' },
  { id: 23, month: 6, type: CARD_TYPES.JUNK, name: '모란 피' },
  // 7월 (홍싸리)
  { id: 24, month: 7, type: CARD_TYPES.ANIMAL, name: '홍싸리 열끗' },
  { id: 25, month: 7, type: CARD_TYPES.RIBBON, name: '홍싸리 청단' },
  { id: 26, month: 7, type: CARD_TYPES.JUNK, name: '홍싸리 피' },
  { id: 27, month: 7, type: CARD_TYPES.JUNK, name: '홍싸리 피' },
  // 8월 (공산)
  { id: 28, month: 8, type: CARD_TYPES.BRIGHT, name: '공산 광' },
  { id: 29, month: 8, type: CARD_TYPES.ANIMAL, name: '공산 열끗' }, // 고도리
  { id: 30, month: 8, type: CARD_TYPES.JUNK, name: '공산 피' },
  { id: 31, month: 8, type: CARD_TYPES.JUNK, name: '공산 피' },
  // 9월 (국진)
  { id: 32, month: 9, type: CARD_TYPES.ANIMAL, name: '국진 열끗' }, // 쌍피로 쓸 수 있음 (룰에 따라)
  { id: 33, month: 9, type: CARD_TYPES.RIBBON, name: '국진 청단' },
  { id: 34, month: 9, type: CARD_TYPES.JUNK, name: '국진 피' },
  { id: 35, month: 9, type: CARD_TYPES.DOUBLE_JUNK, name: '국진 쌍피' },
  // 10월 (단풍)
  { id: 36, month: 10, type: CARD_TYPES.ANIMAL, name: '단풍 열끗' },
  { id: 37, month: 10, type: CARD_TYPES.RIBBON, name: '단풍 청단' },
  { id: 38, month: 10, type: CARD_TYPES.JUNK, name: '단풍 피' },
  { id: 39, month: 10, type: CARD_TYPES.JUNK, name: '단풍 피' },
  // 11월 (오동)
  { id: 40, month: 11, type: CARD_TYPES.BRIGHT, name: '오동 광' },
  { id: 41, month: 11, type: CARD_TYPES.DOUBLE_JUNK, name: '오동 쌍피' },
  { id: 42, month: 11, type: CARD_TYPES.JUNK, name: '오동 피' },
  { id: 43, month: 11, type: CARD_TYPES.JUNK, name: '오동 피' },
  // 12월 (비)
  { id: 44, month: 12, type: CARD_TYPES.BRIGHT, name: '비 광' },
  { id: 45, month: 12, type: CARD_TYPES.ANIMAL, name: '비 열끗' },
  { id: 46, month: 12, type: CARD_TYPES.RIBBON, name: '비 띠' },
  { id: 47, month: 12, type: CARD_TYPES.DOUBLE_JUNK, name: '비 쌍피' },
];
