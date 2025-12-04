import { CARDS } from '../constants/cards';

export const shuffleDeck = () => {
  const deck = [...CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const dealCards = (deck) => {
  const playerHand = deck.slice(0, 10);
  const computerHand = deck.slice(10, 20);
  const field = deck.slice(20, 28);
  const remainingDeck = deck.slice(28);

  return {
    playerHand: playerHand.sort((a, b) => a.month - b.month),
    computerHand: computerHand.sort((a, b) => a.month - b.month),
    field,
    remainingDeck,
  };
};

export const initialGameState = () => {
  const deck = shuffleDeck();
  const { playerHand, computerHand, field, remainingDeck } = dealCards(deck);
  return {
    playerHand,
    computerHand,
    field,
    remainingDeck,
    playerCaptured: [],
    computerCaptured: [],
    currentTurn: 'player', // 'player' or 'computer'
    gameStatus: 'playing', // 'playing', 'ended', 'waitingForDecision'
    lastAction: null,
    scores: { player: 0, computer: 0 },
    prevScores: { player: 0, computer: 0 },
    goCount: { player: 0, computer: 0 },
    winner: null,
  };
};

const captureCards = (card, field) => {
  const matches = field.filter(c => c.month === card.month);
  
  if (matches.length === 0) {
     return { captured: [], newField: [...field, card], matched: false };
  } else if (matches.length === 1) {
     // 1장 매칭: 2장 획득
     return { captured: [card, matches[0]], newField: field.filter(c => c.id !== matches[0].id), matched: true };
  } else if (matches.length === 2) {
     // 2장 매칭: 선택해야 하지만 첫 번째 것 획득 (나머지 1장은 바닥에 남음)
     return { captured: [card, matches[0]], newField: field.filter(c => c.id !== matches[0].id), matched: true };
  } else if (matches.length >= 3) {
     // 3장 매칭 (뻑 등): 모두 획득 (4장)
     return { captured: [card, ...matches], newField: field.filter(c => c.month !== card.month), matched: true };
  }
  return { captured: [], newField: [...field, card], matched: false };
};

const stealJunk = (fromCards, count) => {
  let stolen = [];
  let remaining = [...fromCards];
  
  for (let i = 0; i < count; i++) {
    // 피(junk)나 쌍피(double_junk)를 찾음. 쌍피도 1장으로 취급하여 뺏어옴.
    const junkIndex = remaining.findIndex(c => c.type === 'junk' || c.type === 'double_junk');
    if (junkIndex !== -1) {
      stolen.push(remaining[junkIndex]);
      remaining.splice(junkIndex, 1);
    } else {
      break; // 피가 없으면 못 뺏음
    }
  }
  return { stolen, remaining };
};

export const playTurn = (gameState, cardIndex, options = {}) => {
  const { 
    playerHand, computerHand, field, remainingDeck, 
    playerCaptured, computerCaptured, currentTurn,
    prevScores, goCount, shakeCount
  } = gameState;

  let { isBomb = false, isShake = false } = options; // options에서 isBomb, isShake 가져옴

  let hand = currentTurn === 'player' ? [...playerHand] : [...computerHand];
  let card = hand[cardIndex]; // 낼 카드
  
  let currentField = [...field];
  let turnCaptured = [];
  let isPpeok = false;
  let stealCount = 0;
  let events = [];
  let newShakeCount = { ...shakeCount };

  // AI Logic for Bomb/Shake (Computer's Turn)
  if (currentTurn === 'computer' && !isBomb && !isShake) {
    const handByMonth = hand.reduce((acc, c) => {
      acc[c.month] = acc[c.month] || [];
      acc[c.month].push(c);
      return acc;
    }, {});

    let bombMonth = null;
    let shakeMonth = null;

    for (const month in handByMonth) {
      if (handByMonth[month].length >= 3) {
        const fieldMatches = currentField.filter(c => c.month === parseInt(month));
        if (fieldMatches.length > 0) {
          bombMonth = parseInt(month);
          break; // Bomb is prioritized
        } else {
          shakeMonth = parseInt(month);
        }
      }
    }

    if (bombMonth !== null) {
      isBomb = true;
      cardIndex = hand.findIndex(c => c.month === bombMonth); // Select one card of the bomb month
      card = hand[cardIndex];
    } else if (shakeMonth !== null) {
      isShake = true;
      cardIndex = hand.findIndex(c => c.month === shakeMonth); // Select one card of the shake month
      card = hand[cardIndex];
    }
  }

  // 흔들기/폭탄 처리
  if (isBomb) {
    events.push('폭탄!');
    newShakeCount[currentTurn] += 2; // 폭탄은 흔들기 2번 효과 (점수 2배)
    
    // 패에서 해당 월의 카드 3장 모두 제거
    const bombCards = hand.filter(c => c.month === card.month);
    hand = hand.filter(c => c.month !== card.month);
    
    // 바닥에서 해당 월의 카드 모두 제거 (폭탄은 바닥의 같은 월 카드 모두 가져옴)
    const fieldMatches = currentField.filter(c => c.month === card.month);
    currentField = currentField.filter(c => c.month !== card.month);
    
    // 획득 패에 추가
    turnCaptured = [...bombCards, ...fieldMatches];
    
    // 피 뺏기
    stealCount++;
  } else {
    if (isShake) {
      events.push('흔들기!');
      newShakeCount[currentTurn] += 1; // 점수 2배
    }
    
    // 1. 패에서 카드 제거 (일반)
    hand.splice(cardIndex, 1);
  }

  // 2. 낸 카드와 바닥 패 매칭 확인 (폭탄이 아닐 때만)
  let step1 = { captured: [], newField: currentField, matched: false };
  if (!isBomb) {
    step1 = captureCards(card, currentField);
    currentField = step1.newField;
    turnCaptured = [...turnCaptured, ...step1.captured];
  }
  
  // 3. 덱에서 카드 뒤집기
  if (remainingDeck.length === 0) {
      return { ...gameState, gameStatus: 'ended', winner: null, lastAction: 'No more cards' };
  }
  
  const newDeck = [...remainingDeck];
  const drawnCard = newDeck.shift();

  // 뻑 체크: Step 1에서 매칭되었는데, 뒤집은 카드도 같은 월일 경우 (폭탄이 아닐 때만)
  if (!isBomb && step1.matched && drawnCard.month === card.month) {
    isPpeok = true;
    events.push('뻑!');
    // 낸 카드, 매칭된 카드, 뒤집은 카드 모두 바닥으로
    // step1에서 가져오려던 것들을 다시 바닥으로
    currentField = [...step1.newField, ...step1.captured, drawnCard];
    turnCaptured = []; // 뻑이면 이번 턴 획득 없음
  } else {
    // 뻑이 아님 -> Step 1 결과 확정 (이미 위에서 처리됨)
    // 4. 뒤집은 카드와 바닥 패 매칭 확인
    const step2 = captureCards(drawnCard, currentField);
    
    // 쪽 체크: Step 1 매칭 실패(바닥에 둠), Step 2에서 그 낸 카드를 매칭 (폭탄이 아닐 때만)
    if (!isBomb && !step1.matched && step2.matched && step2.captured.some(c => c.id === card.id)) {
      events.push('쪽!');
      stealCount++;
    }

    // 따닥 체크: Step 1 매칭 성공, Step 2 매칭 성공 (서로 다른 월) (폭탄이 아닐 때만)
    if (!isBomb && step1.matched && step2.matched) {
      events.push('따닥!');
      stealCount++;
    }

    currentField = step2.newField;
    turnCaptured = [...turnCaptured, ...step2.captured];
  }

  // 쓸 체크: 바닥에 남은 패가 없을 때 (뻑 아닐 때만)
  if (!isPpeok && currentField.length === 0 && turnCaptured.length > 0) {
    events.push('쓸!');
    stealCount++;
  }

  // 5. 획득한 패 추가 및 피 뺏기 처리
  let newPlayerCaptured = [...playerCaptured];
  let newComputerCaptured = [...computerCaptured];
  let opponentCaptured = currentTurn === 'player' ? newComputerCaptured : newPlayerCaptured;
  let myCaptured = currentTurn === 'player' ? newPlayerCaptured : newComputerCaptured;

  // 이번 턴 획득 패 추가
  myCaptured = [...myCaptured, ...turnCaptured];

  // 상대방 피 뺏기
  if (stealCount > 0) {
    const { stolen, remaining } = stealJunk(opponentCaptured, stealCount);
    opponentCaptured = remaining;
    myCaptured = [...myCaptured, ...stolen];
    if (stolen.length > 0) events.push(`피 ${stolen.length}장 뺏음`);
  }

  // 다시 할당
  if (currentTurn === 'player') {
    newPlayerCaptured = myCaptured;
    newComputerCaptured = opponentCaptured;
  } else {
    newComputerCaptured = myCaptured;
    newPlayerCaptured = opponentCaptured;
  }

  // 점수 계산 (흔들기 배수 적용)
  const playerScore = calculateScore(newPlayerCaptured, newShakeCount.player);
  const computerScore = calculateScore(newComputerCaptured, newShakeCount.computer);
  
  const currentScore = currentTurn === 'player' ? playerScore : computerScore;
  const oldScore = prevScores[currentTurn];

  // 고/스톱 조건 확인
  let status = 'playing';
  let nextTurn = currentTurn === 'player' ? 'computer' : 'player';
  let winner = null;
  const isHandEmpty = hand.length === 0 && (currentTurn === 'player' ? computerHand.length === 0 : playerHand.length === 0);

  let actionText = `${currentTurn === 'player' ? '나' : '컴'}: ${card.month}월`;
  if (events.length > 0) actionText += ` (${events.join(', ')})`;

  // 최종 점수 계산 (박 적용) 함수
  const calculateFinalScore = (winner, winnerScore, loserCaptured) => {
      let finalScore = winnerScore;
      let reasons = [];

      // 1. 광박: 승자가 광으로 점수가 났는데(3광 이상), 패자가 광이 하나도 없는 경우
      // (단, 승자가 광 점수가 없으면 광박 아님)
      // calculateScore 함수 내에서 광 점수 별도 리턴이 없어서 재계산 필요하거나 구조 변경 필요.
      // 여기서는 간단히 승자의 광 개수로 판단.
      const winnerBrights = (winner === 'player' ? newPlayerCaptured : newComputerCaptured).filter(c => c.type === 'bright').length;
      const loserBrights = loserCaptured.filter(c => c.type === 'bright').length;
      
      if (winnerBrights >= 3 && loserBrights === 0) {
          finalScore *= 2;
          reasons.push('광박');
      }

      // 2. 피박: 승자가 피로 점수가 났는데(피 10장 이상), 패자의 피가 5장(맞고 기준 7장) 미만인 경우
      // 고스톱(3인)은 5장, 맞고(2인)는 7장 기준. 여기서는 맞고 룰(7장) 적용.
      // 승자의 피 점수 확인: 피 개수 10장 이상이어야 함.
      const winnerJunks = (winner === 'player' ? newPlayerCaptured : newComputerCaptured);
      const winnerJunkCount = winnerJunks.filter(c => c.type === 'junk').length + winnerJunks.filter(c => c.type === 'double_junk').length * 2;
      
      const loserJunks = loserCaptured;
      const loserJunkCount = loserJunks.filter(c => c.type === 'junk').length + loserJunks.filter(c => c.type === 'double_junk').length * 2;

      if (winnerJunkCount >= 10 && loserJunkCount < 7) { // 맞고 기준 피박 7장 미만
          finalScore *= 2;
          reasons.push('피박');
      }

      // 3. 고박: (이건 승자가 독박 쓰는 경우라 여기서 계산하기 복잡, 일단 제외하거나 별도 처리)
      // 맞고에서는 고박(독박) 개념이 승자가 뒤집히는 것.
      // 여기서는 승자가 결정된 후 점수 뻥튀기만 계산.

      return { finalScore, reasons };
  };

  if (currentScore >= 3 && currentScore > oldScore) {
    if (currentTurn === 'player') {
      status = 'waitingForDecision';
      nextTurn = currentTurn; 
    } else {
      const comGoCount = goCount.computer;
      let shouldGo = true;
      if (comGoCount >= 3) shouldGo = Math.random() > 0.5;
      
      if (shouldGo) {
        const newGoCount = { ...goCount, computer: comGoCount + 1 };
        const newPrevScores = { ...prevScores, computer: currentScore };
        return {
          playerHand: playerHand, 
          computerHand: hand,
          field: currentField,
          remainingDeck: newDeck,
          playerCaptured: newPlayerCaptured,
          computerCaptured: newComputerCaptured,
          currentTurn: 'player', 
          gameStatus: isHandEmpty ? 'ended' : 'playing',
          lastAction: `컴퓨터 GO! (${comGoCount + 1}고)`,
          scores: { player: playerScore, computer: computerScore },
          prevScores: newPrevScores,
          goCount: newGoCount,
          shakeCount: newShakeCount,
          winner: isHandEmpty ? 'computer' : null,
        };
      } else {
        // 컴퓨터 스톱 -> 승리
        let baseScore = computerScore;
        let multiplier = 1;
        let bonusPoints = 0;
        let reasons = [];

        // 고 점수 계산
        const comGoCount = goCount.computer;
        if (comGoCount > 0) {
          if (comGoCount === 1) {
            bonusPoints += 1;
            reasons.push('1고 +1점');
          } else if (comGoCount === 2) {
            bonusPoints += 2;
            reasons.push('2고 +2점');
          } else {
            bonusPoints += comGoCount;
            const goMultiplier = Math.pow(2, comGoCount - 2);
            multiplier *= goMultiplier;
            reasons.push(`${comGoCount}고 +${comGoCount}점 x${goMultiplier}`);
          }
        }

        // 박 계산
        const { finalScore: scoredWithBak, reasons: bakReasons } = calculateFinalScore('computer', baseScore, newPlayerCaptured);
        
        // 박 배수 추출 (calculateFinalScore가 이미 baseScore에 곱했으므로 역산)
        const bakMultiplier = scoredWithBak / baseScore;
        if (bakMultiplier > 1) {
          multiplier *= bakMultiplier;
          reasons.push(...bakReasons);
        }

        const finalScore = (baseScore + bonusPoints) * multiplier;
        const reasonText = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';
        
        return {
          ...gameState,
          playerHand: playerHand,
          computerHand: hand,
          field: currentField,
          remainingDeck: newDeck,
          playerCaptured: newPlayerCaptured,
          computerCaptured: newComputerCaptured,
          gameStatus: 'ended',
          winner: 'computer',
          lastAction: `컴퓨터 스톱! 승리!${reasonText} 총 ${finalScore}점`,
          scores: { player: playerScore, computer: finalScore },
          shakeCount: newShakeCount,
        };
      }
    }
  } else if (isHandEmpty) {
    status = 'ended';
    if (playerScore > computerScore) winner = 'player';
    else if (computerScore > playerScore) winner = 'computer';
    else winner = 'draw';
  }

  return {
    playerHand: currentTurn === 'player' ? hand : playerHand,
    computerHand: currentTurn === 'computer' ? hand : computerHand,
    field: currentField,
    remainingDeck: newDeck,
    playerCaptured: newPlayerCaptured,
    computerCaptured: newComputerCaptured,
    currentTurn: nextTurn,
    gameStatus: status,
    lastAction: actionText,
    scores: { player: playerScore, computer: computerScore },
    prevScores: status === 'waitingForDecision' ? prevScores : { ...prevScores, [currentTurn]: currentScore },
    goCount,
    shakeCount: newShakeCount,
    winner,
  };
};

export const handleGoStopDecision = (gameState, isGo) => {
  const { currentTurn, scores, goCount, prevScores, playerCaptured, computerCaptured, shakeCount } = gameState;
  
  if (isGo) {
    const newGoCount = { ...goCount, [currentTurn]: goCount[currentTurn] + 1 };
    const newPrevScores = { ...prevScores, [currentTurn]: scores[currentTurn] };
    const isHandEmpty = gameState.playerHand.length === 0 && gameState.computerHand.length === 0;
    
    return {
      ...gameState,
      gameStatus: isHandEmpty ? 'ended' : 'playing',
      currentTurn: currentTurn === 'player' ? 'computer' : 'player',
      goCount: newGoCount,
      prevScores: newPrevScores,
      lastAction: `${currentTurn} GO! (${newGoCount[currentTurn]}고)`,
      winner: isHandEmpty ? currentTurn : null,
    };
  } else {
    // Stop -> 승리
    // 최종 점수 계산
    const loserCaptured = currentTurn === 'player' ? computerCaptured : playerCaptured;
    const winnerCaptured = currentTurn === 'player' ? playerCaptured : computerCaptured;
    
    let baseScore = scores[currentTurn];
    let multiplier = 1;
    let bonusPoints = 0;
    let reasons = [];

    // 1. 고 점수 계산
    const myGoCount = goCount[currentTurn];
    if (myGoCount > 0) {
      if (myGoCount === 1) {
        bonusPoints += 1;
        reasons.push('1고 +1점');
      } else if (myGoCount === 2) {
        bonusPoints += 2;
        reasons.push('2고 +2점');
      } else {
        // 3고 이상: 점수 추가 + 배수 적용
        bonusPoints += myGoCount;
        const goMultiplier = Math.pow(2, myGoCount - 2);
        multiplier *= goMultiplier;
        reasons.push(`${myGoCount}고 +${myGoCount}점 x${goMultiplier}`);
      }
    }

    // 2. 박 계산
    const winnerBrights = winnerCaptured.filter(c => c.type === 'bright').length;
    const loserBrights = loserCaptured.filter(c => c.type === 'bright').length;
    if (winnerBrights >= 3 && loserBrights === 0) {
        multiplier *= 2;
        reasons.push('광박 x2');
    }

    const winnerJunks = winnerCaptured;
    const winnerJunkCount = winnerJunks.filter(c => c.type === 'junk').length + winnerJunks.filter(c => c.type === 'double_junk').length * 2;
    const loserJunks = loserCaptured;
    const loserJunkCount = loserJunks.filter(c => c.type === 'junk').length + loserJunks.filter(c => c.type === 'double_junk').length * 2;

    if (winnerJunkCount >= 10 && loserJunkCount < 7) {
        multiplier *= 2;
        reasons.push('피박 x2');
    }

    // 3. 멍박 (열끗 7장 이상으로 났는데 상대가 열끗 0장)
    const winnerAnimals = winnerCaptured.filter(c => c.type === 'animal').length;
    const loserAnimals = loserCaptured.filter(c => c.type === 'animal').length;
    if (winnerAnimals >= 7 && loserAnimals === 0) {
        multiplier *= 2;
        reasons.push('멍박 x2');
    }

    // 4. 흔들기 배수는 이미 calculateScore에 포함되어 있음
    // shakeCount가 있으면 reasons에 추가만
    if (shakeCount[currentTurn] > 0) {
        const shakeMultiplier = Math.pow(2, shakeCount[currentTurn]);
        reasons.push(`흔들기 x${shakeMultiplier} (이미 적용됨)`);
    }

    // 최종 점수 = (기본점수 + 고보너스) x 배수
    const finalScore = (baseScore + bonusPoints) * multiplier;

    const reasonText = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';

    return {
      ...gameState,
      gameStatus: 'ended',
      winner: currentTurn,
      lastAction: `${currentTurn === 'player' ? '나' : '컴퓨터'} STOP! 승리!${reasonText} 총 ${finalScore}점`,
      scores: { ...scores, [currentTurn]: finalScore },
    };
  }
};

export const calculateScore = (capturedCards, shakeCount = 0) => {
  let score = 0;
  let isMungtunguri = false; // 멍텅구리 따블 여부
  
  // 1. 광 (Bright)
  const brights = capturedCards.filter(c => c.type === 'bright');
  if (brights.length === 5) {
    score += 15; // 오광
  } else if (brights.length === 4) {
    score += 4; // 사광
  } else if (brights.length === 3) {
    // 비광(12월)이 포함되어 있는지 확인
    const hasRainBright = brights.some(c => c.month === 12);
    if (hasRainBright) {
      score += 2; // 비3광
    } else {
      score += 3; // 3광
    }
  }

  // 2. 열끗 (Animal)
  const animals = capturedCards.filter(c => c.type === 'animal');
  if (animals.length >= 5) {
    score += 1 + (animals.length - 5);
  }
  
  // 고도리 (2월, 4월, 8월 열끗)
  const godoriCards = animals.filter(c => [2, 4, 8].includes(c.month));
  if (godoriCards.length === 3) {
    score += 5;
  }

  // 멍텅구리 따블 (열끗 7장 이상)
  if (animals.length >= 7) {
    isMungtunguri = true;
  }

  // 3. 띠 (Ribbon)
  const ribbons = capturedCards.filter(c => c.type === 'ribbon');
  if (ribbons.length >= 5) {
    score += 1 + (ribbons.length - 5);
  }

  // 홍단 (1, 2, 3월), 청단 (6, 9, 10월), 초단 (4, 5, 7월)
  const hongDan = ribbons.filter(c => [1, 2, 3].includes(c.month));
  const cheongDan = ribbons.filter(c => [6, 9, 10].includes(c.month));
  const choDan = ribbons.filter(c => [4, 5, 7].includes(c.month));

  if (hongDan.length === 3) score += 3;
  if (cheongDan.length === 3) score += 3;
  if (choDan.length === 3) score += 3;

  // 4. 피 (Junk)
  const junks = capturedCards.filter(c => c.type === 'junk');
  const doubleJunks = capturedCards.filter(c => c.type === 'double_junk');
  
  // 쌍피는 2장으로 계산
  const junkCount = junks.length + (doubleJunks.length * 2);
  
  // 국진(9월) 열끗을 쌍피로 쓸 수 있는 룰은 복잡하므로 일단 제외하거나, 
  // 여기서는 단순히 열끗으로만 계산. (실제 게임에선 선택 가능)
  
  if (junkCount >= 10) {
    score += 1 + (junkCount - 10);
  }

  // --- 배수 적용 ---
  
  // 1. 멍텅구리 따블 (점수 2배)
  if (score > 0 && isMungtunguri) {
    score *= 2;
  }

  // 2. 흔들기 배수 적용 (흔들기 1회당 2배)
  if (score > 0 && shakeCount > 0) {
    score *= Math.pow(2, shakeCount);
  }

  // 3. 광박, 피박, 고박 등은 상대방 점수 계산 시 적용해야 하므로 
  // 여기서는 '내 점수'만 계산하고, 최종 승패 결정 시 비교하여 처리해야 함.
  // 현재 구조상 calculateScore는 순수 획득 점수만 계산함.
  // 박 처리는 playTurn의 승리 조건이나 별도 함수에서 처리 필요.

  return score;
};
