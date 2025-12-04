import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

// 스프라이트 시트의 전체 크기와 개별 카드의 크기를 정의합니다.
// 새로 처리된 이미지: 840x1002 (간격 제거됨)
// 가로 8장, 세로 6장
const SPRITE_COLS = 8;
const SPRITE_ROWS = 6;

// 화면에 표시할 카드의 크기
export const CARD_WIDTH = 50;
export const CARD_HEIGHT = 80;

// 원본 스프라이트 이미지의 실제 크기
// 새 이미지: 840x1002, 각 카드: 105x167
const ORIGINAL_CARD_WIDTH = 105; 
const ORIGINAL_CARD_HEIGHT = 167;
const TOTAL_WIDTH = ORIGINAL_CARD_WIDTH * SPRITE_COLS;  // 840
const TOTAL_HEIGHT = ORIGINAL_CARD_HEIGHT * SPRITE_ROWS; // 1002


const Card = ({ id, month, type, isBack = false, style, scale = 1 }) => {
  if (isBack) {
    return (
      <View style={[styles.cardContainer, styles.cardBack, style, { transform: [{ scale }] }]}>
        <View style={styles.backPattern} />
      </View>
    );
  }

  // 보너스 카드 렌더링
  if (type === 'bonus_junk_2' || type === 'bonus_junk_3') {
    const points = type === 'bonus_junk_2' ? '2' : '3';
    return (
      <View style={[styles.cardContainer, styles.bonusCard, style, { transform: [{ scale }] }]}>
        <Text style={styles.bonusText}>보너스</Text>
        <Text style={styles.bonusPoints}>{points}점</Text>
      </View>
    );
  }

  // 카드 ID(0~47)를 기반으로 스프라이트 시트 내의 좌표 계산
  // ID 순서가 1월(4장) -> 2월(4장) ... 순서라고 가정
  const col = id % SPRITE_COLS;
  const row = Math.floor(id / SPRITE_COLS);

  const left = -col * CARD_WIDTH;
  const top = -row * CARD_HEIGHT;

  return (
    <View style={[styles.cardContainer, style, { transform: [{ scale }] }]}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/hwatu_card_image.webp')}
          style={{
            width: CARD_WIDTH * SPRITE_COLS,
            height: CARD_HEIGHT * SPRITE_ROWS,
            transform: [{ translateX: left }, { translateY: top }],
          }}
          resizeMode="stretch"
        />
      </View>
      {/* 디버깅용 텍스트 (이미지가 정확하지 않을 때 확인용) */}
      {/* <Text style={styles.debugText}>{month}.{type}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  cardBack: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPattern: {
    width: '80%',
    height: '80%',
    backgroundColor: '#c0392b',
    borderRadius: 2,
  },
  bonusCard: {
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1c40f',
  },
  bonusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bonusPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  debugText: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 8,
    color: '#000',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default Card;
