import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { initialGameState, playTurn, handleGoStopDecision } from './src/utils/gameEngine';
import Card from './src/components/Card';
import { loadSounds, playSound } from './src/utils/SoundManager';

export default function App() {
  const [game, setGame] = useState(null);
  const [animatingCard, setAnimatingCard] = useState(null);
  const cardAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSounds();
    startNewGame();
  }, []);

  useEffect(() => {
    if (game && game.currentTurn === 'computer' && game.gameStatus === 'playing') {
      const timer = setTimeout(() => {
        // 컴퓨터 AI: 폭탄/흔들기 가능하면 사용
        const { computerHand, field } = game;
        let played = false;

        // 1. 폭탄 체크
        for (let i = 0; i < computerHand.length; i++) {
          const card = computerHand[i];
          const sameMonthCards = computerHand.filter(c => c.month === card.month);
          const fieldMatch = field.find(c => c.month === card.month);
          
          if (sameMonthCards.length === 3 && fieldMatch) {
             handlePlayCard(i, { isBomb: true });
             played = true;
             break;
          }
        }

        if (!played) {
          // 2. 흔들기 체크 (단순 구현: 3장 있으면 무조건 흔들고 냄)
          for (let i = 0; i < computerHand.length; i++) {
            const card = computerHand[i];
            const sameMonthCards = computerHand.filter(c => c.month === card.month);
            if (sameMonthCards.length === 3) {
               handlePlayCard(i, { isShake: true });
               played = true;
               break;
            }
          }
        }

        if (!played) {
          const randomIndex = Math.floor(Math.random() * game.computerHand.length);
          handlePlayCard(randomIndex);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (game && game.gameStatus === 'ended') {
        let message = "게임이 종료되었습니다.";
        if (game.winner) {
            message = `${game.winner === 'player' ? '당신' : '컴퓨터'}의 승리!`;
        } else {
            message = "무승부 (나가리)";
        }
        Alert.alert("게임 종료", message, [{ text: "새 게임", onPress: startNewGame }]);
    }
  }, [game]);

  const startNewGame = () => {
    setGame(initialGameState());
  };

  const onDecision = (isGo) => {
    const newGameState = handleGoStopDecision(game, isGo);
    setGame(newGameState);
  };

  const handlePlayCard = (index, options = {}) => {
    if (!game || game.gameStatus !== 'playing') return;

    // 플레이어 턴일 때만 사용자 입력 검증
    if (game.currentTurn === 'player' && !options.isBomb && !options.isShake) {
        const card = game.playerHand[index];
        const sameMonthCards = game.playerHand.filter(c => c.month === card.month);
        const fieldMatch = game.field.find(c => c.month === card.month);

        // 폭탄 조건: 패에 3장, 바닥에 1장
        if (sameMonthCards.length === 3 && fieldMatch) {
            Alert.alert("폭탄!", "폭탄을 쓰시겠습니까?", [
                { text: "아니오", onPress: () => processPlay(index, {}) },
                { text: "네 (폭탄)", onPress: () => processPlay(index, { isBomb: true }) }
            ]);
            return;
        }

        // 흔들기 조건: 패에 3장, 바닥에 없음 (또는 있어도 폭탄 안 쓸 때)
        if (sameMonthCards.length === 3) {
             Alert.alert("흔들기", "흔드시겠습니까?", [
                { text: "아니오", onPress: () => processPlay(index, {}) },
                { text: "네 (흔들기)", onPress: () => processPlay(index, { isShake: true }) }
            ]);
            return;
        }
    }
    
    processPlay(index, options);
  };

  const processPlay = (index, options) => {
    const cardToPlay = game.currentTurn === 'player' ? game.playerHand[index] : game.computerHand[index];
    
    // 애니메이션 시작
    setAnimatingCard({ card: cardToPlay, isPlayer: game.currentTurn === 'player' });
    cardAnimation.setValue(0);
    
    Animated.spring(cardAnimation, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start(() => {
      // 애니메이션 완료 후 실제 게임 로직 실행
      setAnimatingCard(null);
      playSound('play');
      const newGameState = playTurn(game, index, options);
      setGame(newGameState);
    });
  };

  const renderCaptured = (cards) => {
    // 카드를 타입별로 분류
    const brights = cards.filter(c => c.type === 'bright').sort((a, b) => a.month - b.month);
    const animals = cards.filter(c => c.type === 'animal').sort((a, b) => a.month - b.month);
    const ribbons = cards.filter(c => c.type === 'ribbon').sort((a, b) => a.month - b.month);
    const junks = cards.filter(c => c.type === 'junk').sort((a, b) => a.month - b.month);
    const doubleJunks = cards.filter(c => c.type === 'double_junk').sort((a, b) => a.month - b.month);
    
    const renderCardGroup = (groupCards) => (
      <View style={styles.cardGroup}>
        {groupCards.map((card, index) => (
          <View key={index} style={{ marginRight: -35, marginBottom: -15 }}>
            <Card id={card.id} month={card.month} type={card.type} scale={0.5} />
          </View>
        ))}
      </View>
    );

    return (
      <View style={styles.capturedContainer}>
        {/* 광 (1) */}
        <View style={[styles.capturedColumn, { flex: 1 }]}>
          {/* <Text style={styles.columnTitle}>광</Text> */}
          {renderCardGroup(brights)}
        </View>
        
        {/* 열끗 + 띠 (4) */}
        <View style={[styles.capturedColumn, { flex: 4 }]}>
          <View style={styles.subColumn}>
            {/* <Text style={styles.columnTitle}>열끗</Text> */}
            {renderCardGroup(animals)}
          </View>
          <View style={styles.subColumn}>
            {/* <Text style={styles.columnTitle}>띠</Text> */}
            {renderCardGroup(ribbons)}
          </View>
        </View>
        
        {/* 피 + 쌍피 (5) */}
        <View style={[styles.capturedColumn, { flex: 5 }]}>
          {/* <Text style={styles.columnTitle}>피</Text> */}
          <View style={styles.cardGroup}>
            {[...junks, ...doubleJunks].map((card, index) => (
              <View key={index} style={{ marginRight: -35, marginBottom: -15 }}>
                <Card id={card.id} month={card.month} type={card.type} scale={0.5} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (!game) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>고스톱</Text>
          <Text style={styles.lastAction}>{game.lastAction || "게임 시작"}</Text>
        </View>
        <View style={styles.scoreBoard}>
           <Text style={styles.scoreText}>나: {game.scores?.player || 0}점</Text>
           <Text style={styles.scoreText}>컴: {game.scores?.computer || 0}점</Text>
        </View>
        <TouchableOpacity onPress={startNewGame} style={styles.button}>
          <Text style={styles.buttonText}>재시작</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        {/* Computer Section */}
        <View style={styles.section}>
          <View style={styles.rowHeader}>
             <Text style={styles.sectionTitle}>Computer ({game.computerHand.length}) {game.currentTurn === 'computer' && '🤔'}</Text>
             <Text style={styles.capturedCount}>획득: {game.computerCaptured.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
            {game.computerHand.map((card, index) => (
              <View key={index} style={{ marginRight: -20 }}> 
                <Card isBack />
              </View>
            ))}
          </ScrollView>
          <View style={styles.scoreDisplayContainer}>
            <Text style={styles.scoreDisplayText}>점수: {game.scores?.computer || 0}점</Text>
          </View>
          {renderCaptured(game.computerCaptured)}
        </View>

        {/* Field Section */}
        <View style={[styles.section, styles.fieldSection]}>
          <Text style={styles.sectionTitle}>Field ({game.field.length})</Text>
          <View style={styles.fieldGrid}>
            {game.field.map((card, index) => (
              <View key={index} style={{ margin: 2 }}>
                <Card id={card.id} month={card.month} type={card.type} />
              </View>
            ))}
          </View>
        </View>

        {/* Player Section */}
        <View style={styles.section}>
          <View style={styles.scoreDisplayContainer}>
            <Text style={styles.scoreDisplayText}>점수: {game.scores?.player || 0}점</Text>
          </View>
          {renderCaptured(game.playerCaptured)}
          <View style={styles.rowHeader}>
            <Text style={styles.sectionTitle}>My Hand {game.currentTurn === 'player' && '👈'}</Text>
            <Text style={styles.capturedCount}>획득: {game.playerCaptured.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
            {game.playerHand.map((card, index) => (
              <TouchableOpacity 
                key={index} 
                style={{ marginRight: -20 }}
                onPress={() => game.currentTurn === 'player' && handlePlayCard(index)}
                activeOpacity={game.currentTurn === 'player' ? 0.7 : 1}
              >
                <Card id={card.id} month={card.month} type={card.type} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* 애니메이션 카드 오버레이 */}
      {animatingCard && (
        <Animated.View
          style={[
            styles.animatedCardOverlay,
            {
              opacity: cardAnimation.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [1, 1, 0.8],
              }),
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: animatingCard.isPlayer ? [200, 0] : [-200, 0], // 플레이어면 아래에서, 컴퓨터면 위에서
                  }),
                },
                {
                  translateX: cardAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 20, 0], // 약간의 곡선 효과
                  }),
                },
                {
                  rotate: cardAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['0deg', '5deg', '0deg'], // 회전 효과
                  }),
                },
                {
                  scale: cardAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1], // 살짝 커졌다 원래대로
                  }),
                },
              ],
            },
          ]}
        >
          <Card id={animatingCard.card.id} month={animatingCard.card.month} type={animatingCard.card.type} />
        </Animated.View>
      )}
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#34495e',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  lastAction: {
    fontSize: 12,
    color: '#f39c12',
    marginTop: 2,
  },
  scoreBoard: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreText: {
    color: '#f1c40f',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameArea: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 5,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  fieldSection: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  sectionTitle: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  capturedCount: {
    color: '#95a5a6',
    fontSize: 12,
  },
  cardRow: {
    flexDirection: 'row',
    overflow: 'visible',
    minHeight: 80,
  },
  capturedContainer: {
    flexDirection: 'row',
    height: 100,
    marginBottom: 5,
    gap: 5,
  },
  capturedColumn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
    padding: 5,
  },
  subColumn: {
    flex: 1,
    marginBottom: 5,
  },
  columnTitle: {
    color: '#ecf0f1',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  cardGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  animatedCardOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -40,
    zIndex: 1000,
  },
  scoreDisplayContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreDisplayText: {
    color: '#f1c40f',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
