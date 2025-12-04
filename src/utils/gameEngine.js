import { CARDS } from "../constants/cards";

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

// 총통 체크: 같은 월의 패 4장을 모두 가지고 있는지 확인
const checkChongtong = (hand) => {
  const monthCount = {};

  // 보너스 카드는 제외 (month가 0)
  hand.forEach((card) => {
    if (card.month > 0) {
      monthCount[card.month] = (monthCount[card.month] || 0) + 1;
    }
  });

  // 4장이 있는 월 찾기
  for (const month in monthCount) {
    if (monthCount[month] === 4) {
      return parseInt(month);
    }
  }

  return null;
};

export const initialGameState = () => {
  const deck = shuffleDeck();
  const { playerHand, computerHand, field, remainingDeck } = dealCards(deck);

  // 보너스 카드가 Field에 있으면 먼저 시작하는 플레이어가 가져감
  const bonusCards = field.filter(
    (c) => c.type === "bonus_junk_2" || c.type === "bonus_junk_3"
  );
  const filteredField = field.filter(
    (c) => c.type !== "bonus_junk_2" && c.type !== "bonus_junk_3"
  );

  let lastAction = null;
  let initialPlayerScore = 0;

  if (bonusCards.length > 0) {
    const bonusNames = bonusCards.map((c) => c.name).join(", ");
    lastAction = `보너스 카드 획득: ${bonusNames}`;

    // 보너스 점수 계산
    bonusCards.forEach((card) => {
      if (card.type === "bonus_junk_2") initialPlayerScore += 2;
      if (card.type === "bonus_junk_3") initialPlayerScore += 3;
    });
  }

  // 자연뻑 체크: 초기 배치 시 같은 월 3장이 깔린 경우
  const checkNaturalPpeok = (field) => {
    const monthCount = {};
    field.forEach((card) => {
      if (card.month > 0) {
        // 보너스 카드 제외
        monthCount[card.month] = (monthCount[card.month] || 0) + 1;
      }
    });
    for (const month in monthCount) {
      if (monthCount[month] >= 3) {
        return parseInt(month);
      }
    }
    return null;
  };

  const naturalPpeokMonth = checkNaturalPpeok(filteredField);
  let ppeokStack = null; // 뻑 무더기: { month: number, cards: Card[], createdBy: 'player' | 'computer' | 'natural' }

  if (naturalPpeokMonth !== null) {
    // 자연뻑: 같은 월 3장을 뻑 무더기로 분리
    const ppeokCards = filteredField.filter(
      (c) => c.month === naturalPpeokMonth
    );
    ppeokStack = {
      month: naturalPpeokMonth,
      cards: ppeokCards,
      createdBy: "natural",
    };
    filteredField = filteredField.filter((c) => c.month !== naturalPpeokMonth);
    lastAction = `자연뻑! (${naturalPpeokMonth}월 3장)`;
  }

  // 총통 체크
  const playerChongtong = checkChongtong(playerHand);
  const computerChongtong = checkChongtong(computerHand);

  if (playerChongtong !== null) {
    return {
      playerHand,
      computerHand,
      field: filteredField,
      remainingDeck,
      playerCaptured: bonusCards,
      computerCaptured: [],
      currentTurn: "player",
      gameStatus: "ended",
      lastAction: `플레이어 총통! (${playerChongtong}월 4장)`,
      scores: { player: 10, computer: 0 },
      prevScores: { player: 0, computer: 0 },
      goCount: { player: 0, computer: 0 },
      shakeCount: { player: 0, computer: 0 },
      ppeokCount: { player: 0, computer: 0 },
      ppeokStack: ppeokStack,
      consecutivePpeok: { player: 0, computer: 0 }, // 연속 뻑 카운트
      isFirstTtakdak: { player: true, computer: true },
      isFirstJjok: { player: true, computer: true }, // 첫쪽 체크용
      winner: "player",
    };
  }

  if (computerChongtong !== null) {
    return {
      playerHand,
      computerHand,
      field: filteredField,
      remainingDeck,
      playerCaptured: bonusCards,
      computerCaptured: [],
      currentTurn: "player",
      gameStatus: "ended",
      lastAction: `컴퓨터 총통! (${computerChongtong}월 4장)`,
      scores: { player: initialPlayerScore, computer: 10 },
      prevScores: { player: 0, computer: 0 },
      goCount: { player: 0, computer: 0 },
      shakeCount: { player: 0, computer: 0 },
      ppeokCount: { player: 0, computer: 0 },
      ppeokStack: ppeokStack,
      consecutivePpeok: { player: 0, computer: 0 },
      isFirstTtakdak: { player: true, computer: true },
      isFirstJjok: { player: true, computer: true },
      winner: "computer",
    };
  }

  return {
    playerHand,
    computerHand,
    field: filteredField,
    remainingDeck,
    playerCaptured: bonusCards, // 보너스 카드를 플레이어가 획득
    computerCaptured: [],
    currentTurn: "player", // 'player' or 'computer'
    gameStatus: "playing", // 'playing', 'ended', 'waitingForDecision'
    lastAction: lastAction,
    scores: { player: initialPlayerScore, computer: 0 },
    prevScores: { player: 0, computer: 0 },
    goCount: { player: 0, computer: 0 },
    shakeCount: { player: 0, computer: 0 },
    ppeokCount: { player: 0, computer: 0 },
    ppeokStack: ppeokStack, // 뻑 무더기
    consecutivePpeok: { player: 0, computer: 0 }, // 연속 뻑 카운트 (첫뻑, 연뻑 체크용)
    isFirstTtakdak: { player: true, computer: true }, // 첫따닥 체크용
    isFirstJjok: { player: true, computer: true }, // 첫쪽 체크용
    winner: null,
  };
};

const captureCards = (card, field, selectedCardId = null) => {
  const matches = field.filter((c) => c.month === card.month);

  if (matches.length === 0) {
    return { captured: [], newField: [...field, card], matched: false };
  } else if (matches.length === 1) {
    // 1장 매칭: 2장 획득
    return {
      captured: [card, matches[0]],
      newField: field.filter((c) => c.id !== matches[0].id),
      matched: true,
    };
  } else if (matches.length === 2) {
    // 2장 매칭: 선택 필요
    if (selectedCardId === null) {
      // 선택이 필요함
      return {
        needsSelection: true,
        choices: matches,
        playedCard: card,
        matched: false,
      };
    } else {
      // 선택된 카드로 획득
      const selectedCard = matches.find((c) => c.id === selectedCardId);
      return {
        captured: [card, selectedCard],
        newField: field.filter((c) => c.id !== selectedCard.id),
        matched: true,
      };
    }
  } else if (matches.length >= 3) {
    // 3장 매칭 (뻑 등): 모두 획득 (4장)
    return {
      captured: [card, ...matches],
      newField: field.filter((c) => c.month !== card.month),
      matched: true,
    };
  }
  return { captured: [], newField: [...field, card], matched: false };
};

const stealJunk = (fromCards, count) => {
  let stolen = [];
  let remaining = [...fromCards];

  for (let i = 0; i < count; i++) {
    // 피(junk), 쌍피(double_junk), 보너스 피를 찾음. 쌍피도 1장으로 취급하여 뺏어옴.
    const junkIndex = remaining.findIndex(
      (c) =>
        c.type === "junk" ||
        c.type === "double_junk" ||
        c.type === "bonus_junk_2" ||
        c.type === "bonus_junk_3"
    );
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
    playerHand,
    computerHand,
    field,
    remainingDeck,
    playerCaptured,
    computerCaptured,
    currentTurn,
    prevScores,
    goCount,
    shakeCount = { player: 0, computer: 0 },
    ppeokCount = { player: 0, computer: 0 },
    ppeokStack = null,
    consecutivePpeok = { player: 0, computer: 0 },
    isFirstTtakdak = { player: true, computer: true },
    isFirstJjok = { player: true, computer: true },
  } = gameState;

  let {
    isBomb = false,
    isShake = false,
    selectedCardId = null,
    isDeckSelection = false,
    step1Captured = [],
    deckCard = null,
    playedCard = null,
  } = options; // options에서 추가 정보 가져옴

  let hand = currentTurn === "player" ? [...playerHand] : [...computerHand];
  let card = isDeckSelection ? playedCard : hand[cardIndex]; // 낼 카드 (덱 선택 시에는 저장된 카드 사용)

  let currentField = [...field];
  let turnCaptured = isDeckSelection ? [...step1Captured] : [];
  let isPpeok = false;
  let stealCount = 0;
  let events = [];
  let newShakeCount = { ...shakeCount };
  let newPpeokCount = { ...ppeokCount };
  let newConsecutivePpeok = { ...consecutivePpeok };
  let newIsFirstTtakdak = { ...isFirstTtakdak };
  let newIsFirstJjok = { ...isFirstJjok };
  let currentPpeokStack = ppeokStack; // 뻑 무더기 관리
  let isSelfPpeok = false; // 자뻑 여부
  let isTtakdak = false; // 따닥 여부

  // AI Logic for Bomb/Shake (Computer's Turn)
  if (currentTurn === "computer" && !isBomb && !isShake) {
    const handByMonth = hand.reduce((acc, c) => {
      acc[c.month] = acc[c.month] || [];
      acc[c.month].push(c);
      return acc;
    }, {});

    let bombMonth = null;
    let shakeMonth = null;

    for (const month in handByMonth) {
      if (handByMonth[month].length >= 3) {
        const fieldMatches = currentField.filter(
          (c) => c.month === parseInt(month)
        );
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
      cardIndex = hand.findIndex((c) => c.month === bombMonth); // Select one card of the bomb month
      card = hand[cardIndex];
    } else if (shakeMonth !== null) {
      isShake = true;
      cardIndex = hand.findIndex((c) => c.month === shakeMonth); // Select one card of the shake month
      card = hand[cardIndex];
    }
  }

  // 보너스 카드 처리
  const isBonusCard =
    card.type === "bonus_junk_2" || card.type === "bonus_junk_3";
  if (isBonusCard) {
    events.push("보너스 카드!");

    // 1. 패에서 보너스 카드 제거
    hand.splice(cardIndex, 1);

    // 2. 보너스 카드는 자동으로 자신이 획득
    turnCaptured = [card];

    // 3. 상대방 피 1장 뺏기
    stealCount = 1;

    // 4. 덱에서 카드 뒤집기 (보너스 카드는 바닥에 놓이지 않음)
    if (remainingDeck.length === 0) {
      return {
        ...gameState,
        gameStatus: "ended",
        winner: null,
        lastAction: "No more cards",
      };
    }

    const newDeck = [...remainingDeck];
    const drawnCard = newDeck.shift();

    // 뻑 무더기 먹기 체크: 뒷패에서 같은 월이 나온 경우
    if (currentPpeokStack && drawnCard.month === currentPpeokStack.month) {
      events.push("뻑 먹음!");
      turnCaptured = [...turnCaptured, ...currentPpeokStack.cards];

      // 자뻑 체크 (자연뻑은 제외)
      if (
        currentPpeokStack.createdBy === currentTurn &&
        currentPpeokStack.createdBy !== "natural"
      ) {
        isSelfPpeok = true;
        events.push("자뻑!");
        stealCount += 4;
      } else {
        stealCount += 2;
      }

      newConsecutivePpeok[currentTurn] = 0;
      currentPpeokStack = null;
    }

    // 뒤집은 카드와 바닥 패 매칭 확인
    const step2 = captureCards(drawnCard, currentField, selectedCardId);

    // 선택이 필요한 경우 (덱 카드가 2장 매칭)
    if (step2.needsSelection) {
      if (currentTurn === "computer") {
        const randomChoice =
          step2.choices[Math.floor(Math.random() * step2.choices.length)];
        const finalStep2 = captureCards(
          drawnCard,
          currentField,
          randomChoice.id
        );
        currentField = finalStep2.newField;
        turnCaptured = [...turnCaptured, ...finalStep2.captured];
      } else {
        // 플레이어는 선택 모달 표시 (보너스 카드는 이미 제거됨)
        return {
          ...gameState,
          playerHand: currentTurn === "player" ? hand : playerHand,
          computerHand: currentTurn === "computer" ? hand : computerHand,
          needsSelection: true,
          selectionChoices: step2.choices,
          pendingPlay: {
            cardIndex: -1,
            options: {
              ...options,
              isBonusCard: true,
              bonusCaptured: turnCaptured,
              bonusStealCount: stealCount,
            },
          },
          ppeokStack: currentPpeokStack,
          consecutivePpeok: newConsecutivePpeok,
          isFirstTtakdak: newIsFirstTtakdak,
          isFirstJjok: newIsFirstJjok,
        };
      }
    } else {
      currentField = step2.newField;
      turnCaptured = [...turnCaptured, ...step2.captured];
    }

    // 획득한 패 추가 및 피 뺏기 처리
    let newPlayerCaptured = [...playerCaptured];
    let newComputerCaptured = [...computerCaptured];
    let opponentCaptured =
      currentTurn === "player" ? newComputerCaptured : newPlayerCaptured;
    let myCaptured =
      currentTurn === "player" ? newPlayerCaptured : newComputerCaptured;

    myCaptured = [...myCaptured, ...turnCaptured];

    // 상대방 피 뺏기
    const { stolen, remaining } = stealJunk(opponentCaptured, stealCount);
    opponentCaptured = remaining;
    myCaptured = [...myCaptured, ...stolen];
    if (stolen.length > 0) events.push(`피 ${stolen.length}장 뺏음`);

    if (currentTurn === "player") {
      newPlayerCaptured = myCaptured;
      newComputerCaptured = opponentCaptured;
    } else {
      newComputerCaptured = myCaptured;
      newPlayerCaptured = opponentCaptured;
    }

    const playerScore = calculateScore(newPlayerCaptured, newShakeCount.player);
    const computerScore = calculateScore(
      newComputerCaptured,
      newShakeCount.computer
    );

    const actionText = `${
      currentTurn === "player" ? "나" : "컴"
    }: 보너스 카드 (${events.join(", ")})`;

    return {
      playerHand: currentTurn === "player" ? hand : playerHand,
      computerHand: currentTurn === "computer" ? hand : computerHand,
      field: currentField,
      remainingDeck: newDeck,
      playerCaptured: newPlayerCaptured,
      computerCaptured: newComputerCaptured,
      currentTurn: currentTurn === "player" ? "computer" : "player",
      gameStatus: "playing",
      lastAction: actionText,
      scores: { player: playerScore, computer: computerScore },
      prevScores,
      goCount,
      shakeCount: newShakeCount,
      ppeokStack: currentPpeokStack,
      consecutivePpeok: newConsecutivePpeok,
      isFirstTtakdak: newIsFirstTtakdak,
      isFirstJjok: newIsFirstJjok,
      winner: null,
    };
  }

  // 흔들기/폭탄 처리
  if (isBomb) {
    events.push("폭탄!");
    newShakeCount[currentTurn] += 2; // 폭탄은 흔들기 2번 효과 (점수 2배)

    // 패에서 해당 월의 카드 3장 모두 제거
    const bombCards = hand.filter((c) => c.month === card.month);
    hand = hand.filter((c) => c.month !== card.month);

    // 바닥에서 해당 월의 카드 모두 제거 (폭탄은 바닥의 같은 월 카드 모두 가져옴)
    const fieldMatches = currentField.filter((c) => c.month === card.month);
    currentField = currentField.filter((c) => c.month !== card.month);

    // 획득 패에 추가
    turnCaptured = [...bombCards, ...fieldMatches];

    // 피 뺏기
    stealCount++;
  } else {
    if (isShake) {
      events.push("흔들기!");
      newShakeCount[currentTurn] += 1; // 점수 2배
    }

    // 1. 패에서 카드 제거 (일반) - 아래 로직으로 이동됨
    // hand.splice(cardIndex, 1);
  }

  // 2. 낸 카드와 바닥 패 매칭 확인 (폭탄이 아닐 때만)
  let step1 = { captured: [], newField: currentField, matched: false };

  if (isDeckSelection) {
    // 덱 선택 모드: step1 상태 복원
    if (step1Captured.length > 0) {
      step1.matched = true;
      step1.captured = step1Captured;

      // currentField 업데이트: step1Captured에 있는 카드들(바닥 카드들) 제거
      // playedCard는 손패에서 나온 것이므로 제외
      const capturedIds = step1Captured.map((c) => c.id);
      currentField = currentField.filter((c) => !capturedIds.includes(c.id));
    }

    // 손패에서 낸 카드 제거
    if (playedCard) {
      hand = hand.filter((c) => c.id !== playedCard.id);
    }

    turnCaptured = [...turnCaptured, ...step1.captured];
  } else if (!isBomb) {
    step1 = captureCards(card, currentField, selectedCardId);

    // 선택이 필요한 경우
    if (step1.needsSelection) {
      // 컴퓨터는 자동으로 랜덤 선택
      if (currentTurn === "computer") {
        const randomChoice =
          step1.choices[Math.floor(Math.random() * step1.choices.length)];
        step1 = captureCards(card, currentField, randomChoice.id);
      } else {
        // 플레이어는 선택 모달 표시
        return {
          ...gameState,
          needsSelection: true,
          selectionChoices: step1.choices,
          pendingPlay: { cardIndex, options: { ...options, isBomb, isShake } },
        };
      }
    }

    currentField = step1.newField;
    turnCaptured = [...turnCaptured, ...step1.captured];

    // 손패에서 낸 카드 제거
    hand.splice(cardIndex, 1);
  } else {
    // 폭탄인 경우 손패 제거는 위에서 처리됨
  }

  // 3. 덱에서 카드 뒤집기
  let drawnCard;
  let newDeck;

  if (isDeckSelection) {
    drawnCard = deckCard;
    newDeck = [...remainingDeck];
  } else {
    if (remainingDeck.length === 0) {
      return {
        ...gameState,
        gameStatus: "ended",
        winner: null,
        lastAction: "No more cards",
      };
    }

    newDeck = [...remainingDeck];
    drawnCard = newDeck.shift();
  }

  // 뒤집은 카드가 보너스 카드인지 체크
  const isDrawnBonus =
    drawnCard.type === "bonus_junk_2" || drawnCard.type === "bonus_junk_3";

  if (isDrawnBonus) {
    // 보너스 카드 획득
    events.push("덱 보너스!");
    turnCaptured = [...turnCaptured, drawnCard];
    stealCount++; // 상대방 피 1장 뺏기

    // 한 장 더 뒤집기
    if (newDeck.length === 0) {
      // 덱이 비었으면 보너스만 획득하고 종료
    } else {
      const secondDrawnCard = newDeck.shift();

      // 두 번째 뒤집은 카드도 보너스인지 체크 (연속 보너스)
      const isSecondDrawnBonus =
        secondDrawnCard.type === "bonus_junk_2" ||
        secondDrawnCard.type === "bonus_junk_3";

      if (isSecondDrawnBonus) {
        events.push("연속 보너스!");
        turnCaptured = [...turnCaptured, secondDrawnCard];
        stealCount++; // 추가로 피 1장 더 뺏기

        // 또 한 장 더 뒤집기
        if (newDeck.length > 0) {
          const thirdDrawnCard = newDeck.shift();

          // 세 번째도 보너스면 그냥 획득만 (무한 루프 방지)
          if (
            thirdDrawnCard.type === "bonus_junk_2" ||
            thirdDrawnCard.type === "bonus_junk_3"
          ) {
            events.push("3연속 보너스!");
            turnCaptured = [...turnCaptured, thirdDrawnCard];
            stealCount++;
          } else {
            // 일반 카드면 매칭 처리
            const step2 = captureCards(thirdDrawnCard, currentField);
            currentField = step2.newField;
            turnCaptured = [...turnCaptured, ...step2.captured];
          }
        }
      } else {
        // 두 번째 카드가 일반 카드면 매칭 처리
        // 뻑 체크: Step 1에서 매칭되었는데, 두 번째 뒤집은 카드도 같은 월일 경우
        if (!isBomb && step1.matched && secondDrawnCard.month === card.month) {
          isPpeok = true;
          events.push("뻑!");

          // 뻑 카운트 증가
          newPpeokCount[currentTurn]++;
          if (newPpeokCount[currentTurn] >= 3) {
            events.push("3뻑!");
          }

          // 연속 뻑 체크 (첫뻑, 연뻑, 삼연뻑)
          newConsecutivePpeok[currentTurn]++;
          if (newConsecutivePpeok[currentTurn] === 1) {
            events.push("첫뻑!");
          } else if (newConsecutivePpeok[currentTurn] === 2) {
            events.push("연뻑!");
          } else if (newConsecutivePpeok[currentTurn] >= 3) {
            events.push("삼연뻑!");
          }

          // 뻑 무더기 생성: 낸 카드, 매칭된 카드들, 뒤집은 카드, 보너스 카드 모두 포함
          const ppeokCards = [...step1.captured, secondDrawnCard];
          // 보너스 카드도 뻑 무더기에 포함
          const bonusCards = turnCaptured.filter(
            (c) => c.type === "bonus_junk_2" || c.type === "bonus_junk_3"
          );
          ppeokCards.push(...bonusCards);

          currentPpeokStack = {
            month: card.month,
            cards: ppeokCards,
            createdBy: currentTurn,
          };

          currentField = step1.newField; // 매칭된 카드들은 뻑 무더기로 이동
          turnCaptured = []; // 뻑이면 이번 턴 획득 없음
        } else {
          // 뻑 무더기 먹기 체크: 뒷패에서 같은 월이 나온 경우
          if (
            currentPpeokStack &&
            secondDrawnCard.month === currentPpeokStack.month
          ) {
            events.push("뻑 먹음!");
            turnCaptured = [...turnCaptured, ...currentPpeokStack.cards];

            // 자뻑 체크
            if (currentPpeokStack.createdBy === currentTurn) {
              isSelfPpeok = true;
              events.push("자뻑!");
              stealCount += 4;
            } else {
              stealCount += 2;
            }

            newConsecutivePpeok[currentTurn] = 0;
            currentPpeokStack = null;
          }

          const step2 = captureCards(secondDrawnCard, currentField);

          // 쪽 체크: Step 1 매칭 실패(바닥에 둠), Step 2에서 그 낸 카드를 매칭
          // 마지막 턴에서는 쪽 인정하지 않음
          const isLastTurnForJjok =
            hand.length === 0 ||
            (currentTurn === "player"
              ? computerHand.length === 0
              : playerHand.length === 0);

          if (
            !isBomb &&
            !isLastTurnForJjok &&
            !step1.matched &&
            step2.matched &&
            step2.captured.some((c) => c.id === card.id)
          ) {
            // 첫쪽 체크
            if (newIsFirstJjok[currentTurn]) {
              events.push("첫쪽!");
              newIsFirstJjok[currentTurn] = false;
            } else {
              events.push("쪽!");
            }
            stealCount++; // 피 1장씩 받기
          }

          // 따닥 체크: 바닥에 같은 월 2장, 손패에서 같은 월 1장, 덱에서 같은 월 1장 = 총 4장 같은 월
          if (!isBomb && step1.matched && step2.matched) {
            // Step 1과 Step 2가 모두 같은 월인지 확인
            const step1Month = step1.captured[0]?.month;
            const step2Month = step2.captured[0]?.month;
            const cardMonth = card.month;
            const secondDrawnCardMonth = secondDrawnCard.month;

            // 모든 카드가 같은 월이고, 총 4장인지 확인
            if (
              step1Month === step2Month &&
              step1Month === cardMonth &&
              step1Month === secondDrawnCardMonth &&
              step1.captured.length === 2 && // 바닥 2장 + 손패 1장
              step2.captured.length === 1
            ) {
              // 덱 1장
              isTtakdak = true;

              // 첫따닥 체크
              if (newIsFirstTtakdak[currentTurn]) {
                events.push("첫따닥!");
                newIsFirstTtakdak[currentTurn] = false;
              } else {
                events.push("따닥!");
              }

              stealCount += 2; // 피 2장 뺏기
            }
          }

          currentField = step2.newField;
          turnCaptured = [...turnCaptured, ...step2.captured];
        }
      }
    }
  } else {
    // 일반 카드 처리 (기존 로직)
    // 뻑 체크: Step 1에서 매칭되었는데, 뒤집은 카드도 같은 월일 경우 (폭탄이 아닐 때만)
    if (!isBomb && step1.matched && drawnCard.month === card.month) {
      isPpeok = true;
      events.push("뻑!");

      // 뻑 카운트 증가
      newPpeokCount[currentTurn]++;
      if (newPpeokCount[currentTurn] >= 3) {
        events.push("3뻑!");
      }

      // 연속 뻑 체크 (첫뻑, 연뻑, 삼연뻑)
      newConsecutivePpeok[currentTurn]++;
      if (newConsecutivePpeok[currentTurn] === 1) {
        events.push("첫뻑!");
      } else if (newConsecutivePpeok[currentTurn] === 2) {
        events.push("연뻑!");
      } else if (newConsecutivePpeok[currentTurn] >= 3) {
        events.push("삼연뻑!");
      }

      // 뻑 무더기 생성: 낸 카드, 매칭된 카드들, 뒤집은 카드 모두 포함
      const ppeokCards = [...step1.captured, drawnCard];
      currentPpeokStack = {
        month: card.month,
        cards: ppeokCards,
        createdBy: currentTurn,
      };

      currentField = step1.newField; // 매칭된 카드들은 뻑 무더기로 이동
      turnCaptured = []; // 뻑이면 이번 턴 획득 없음
    } else {
      // 뻑이 아님 -> Step 1 결과 확정 (이미 위에서 처리됨)

      // 뻑 무더기 먹기 체크: 뒷패에서 같은 월이 나온 경우
      if (currentPpeokStack && drawnCard.month === currentPpeokStack.month) {
        // 뻑 무더기 먹기
        events.push("뻑 먹음!");
        turnCaptured = [...turnCaptured, ...currentPpeokStack.cards];

        // 자뻑 체크: 자신이 낸 뻑을 자신이 먹음 (자연뻑은 제외)
        if (
          currentPpeokStack.createdBy === currentTurn &&
          currentPpeokStack.createdBy !== "natural"
        ) {
          isSelfPpeok = true;
          events.push("자뻑!");
          stealCount += 4; // 자뻑은 2장씩 4장 뺏기
        } else {
          stealCount += 2; // 일반 뻑 먹기는 피 2장 뺏기
        }

        // 연속 뻑 카운트 초기화 (뻑을 먹으면 연속이 끊김)
        newConsecutivePpeok[currentTurn] = 0;
        currentPpeokStack = null;
      }

      // 마지막 1장 체크: 손패가 1장 남았을 때 뻑 무더기 먹기 가능
      if (currentPpeokStack && hand.length === 1) {
        events.push("마지막 패로 뻑 먹음!");
        turnCaptured = [...turnCaptured, ...currentPpeokStack.cards];

        // 자뻑 체크 (자연뻑은 제외)
        if (
          currentPpeokStack.createdBy === currentTurn &&
          currentPpeokStack.createdBy !== "natural"
        ) {
          isSelfPpeok = true;
          events.push("자뻑!");
          stealCount += 4;
        } else {
          stealCount += 2;
        }

        newConsecutivePpeok[currentTurn] = 0;
        currentPpeokStack = null;
      }

      // 4. 뒤집은 카드와 바닥 패 매칭 확인
      let step2 = captureCards(drawnCard, currentField);

      // 덱에서 뒤집은 카드가 2장 매칭되어 선택이 필요한 경우
      if (step2.needsSelection) {
        if (currentTurn === "computer") {
          // 컴퓨터는 랜덤 선택
          const randomChoice =
            step2.choices[Math.floor(Math.random() * step2.choices.length)];
          step2 = captureCards(drawnCard, currentField, randomChoice.id);
        } else {
          // 플레이어는 선택 모달 표시
          // 주의: 여기서 리턴하면 턴이 중단되므로, 상태를 저장하고 모달을 띄워야 함
          // 하지만 구조상 여기서 리턴하면 step1의 결과(turnCaptured 등)가 유실될 수 있음
          // 따라서 step1의 결과를 포함하여 pendingPlay를 설정해야 함

          // step1에서 획득한 카드가 있다면 임시 저장 필요
          // 하지만 복잡하므로, 덱에서 뒤집은 카드의 선택은
          // '쪽' 상황이 아니므로(바닥에 2장 있으니까),
          // 단순히 첫 번째 카드를 선택하거나, 아니면 모달을 띄우고 다시 이 지점으로 돌아와야 함.

          // 여기서는 편의상 플레이어도 덱 카드는 자동 선택(첫 번째)하거나,
          // 또는 모달을 띄우도록 구조를 변경해야 함.

          // 올바른 구현: 모달 띄우기
          return {
            ...gameState,
            playerHand: currentTurn === "player" ? hand : playerHand,
            computerHand: currentTurn === "computer" ? hand : computerHand,
            field: currentField, // step1이 반영된 필드
            remainingDeck: newDeck,
            playerCaptured: playerCaptured, // 아직 이번 턴 획득 반영 전
            computerCaptured: computerCaptured,
            needsSelection: true,
            selectionChoices: step2.choices,
            ppeokStack: currentPpeokStack,
            consecutivePpeok: newConsecutivePpeok,
            isFirstTtakdak: newIsFirstTtakdak,
            isFirstJjok: newIsFirstJjok,
            // pendingPlay에 step1의 획득 정보를 저장해야 함
            pendingPlay: {
              cardIndex: -1, // 이미 냄
              options: {
                ...options,
                step1Captured: turnCaptured, // step1에서 획득한 카드들
                deckCard: drawnCard, // 덱에서 뒤집은 카드
                isDeckSelection: true, // 덱 카드 선택임 표시
              },
            },
          };
        }
      }

      // 쪽 체크: Step 1 매칭 실패(바닥에 둠), Step 2에서 그 낸 카드를 매칭
      // 마지막 턴에서는 쪽 인정하지 않음
      const isLastTurnForJjok =
        hand.length === 0 ||
        (currentTurn === "player"
          ? computerHand.length === 0
          : playerHand.length === 0);

      if (
        !isBomb &&
        !isLastTurnForJjok &&
        !step1.matched &&
        step2.matched &&
        step2.captured.some((c) => c.id === card.id)
      ) {
        // 첫쪽 체크
        if (newIsFirstJjok[currentTurn]) {
          events.push("첫쪽!");
          newIsFirstJjok[currentTurn] = false;
        } else {
          events.push("쪽!");
        }
        stealCount++; // 피 1장씩 받기
      }

      // 따닥 체크: 바닥에 같은 월 2장, 손패에서 같은 월 1장, 덱에서 같은 월 1장 = 총 4장 같은 월
      // 마지막 턴에서는 따닥 인정하지 않음
      const isLastTurn =
        hand.length === 0 ||
        (currentTurn === "player"
          ? computerHand.length === 0
          : playerHand.length === 0);

      if (!isBomb && !isLastTurn && step1.matched && step2.matched) {
        // Step 1과 Step 2가 모두 같은 월인지 확인
        const step1Month = step1.captured[0]?.month;
        const step2Month = step2.captured[0]?.month;
        const cardMonth = card.month;
        const drawnCardMonth = drawnCard.month;

        // 모든 카드가 같은 월이고, 총 4장인지 확인
        // Step 1: 바닥에 같은 월 2장이 있을 때, 손패에서 같은 월 1장을 내면 선택 필요
        // step1.captured = [손패카드, 선택한바닥카드] (2장, 같은 월)
        // Step 2: 덱에서 같은 월 1장이 나와서 나머지 바닥카드와 매칭
        // step2.captured = [덱카드, 나머지바닥카드] (2장, 같은 월)
        // 총 4장이 같은 월이어야 함

        // step1.captured와 step2.captured가 모두 존재하고, 모든 카드가 같은 월인지 확인
        if (
          step1.captured &&
          step2.captured &&
          step1.captured.length >= 1 &&
          step2.captured.length >= 1 &&
          step1Month === step2Month &&
          step1Month === cardMonth &&
          step1Month === drawnCardMonth
        ) {
          // 바닥에 같은 월 2장이 있었는지 확인 (step1에서 선택이 필요했거나, step1.captured + step2.captured에 바닥카드 2장이 포함)
          const allCaptured = [...step1.captured, ...step2.captured];
          const sameMonthCards = allCaptured.filter(
            (c) => c.month === step1Month
          );

          // 총 4장이 같은 월이고, 바닥에서 온 카드가 2장인지 확인
          if (sameMonthCards.length === 4) {
            isTtakdak = true;

            // 첫따닥 체크
            if (newIsFirstTtakdak[currentTurn]) {
              events.push("첫따닥!");
              newIsFirstTtakdak[currentTurn] = false;
            } else {
              events.push("따닥!");
            }

            stealCount += 2; // 피 2장 뺏기
          }
        }
      }

      currentField = step2.newField;
      turnCaptured = [...turnCaptured, ...step2.captured];

      // 뻑이 발생하지 않았으면 연속 뻑 카운트 초기화
      if (!isPpeok) {
        newConsecutivePpeok[currentTurn] = 0;
      }
    }
  }

  // 쓸 체크: 바닥에 남은 패가 없을 때 (뻑 아닐 때만)
  if (!isPpeok && currentField.length === 0 && turnCaptured.length > 0) {
    events.push("쓸!");
    stealCount++;
  }

  // 5. 획득한 패 추가 및 피 뺏기 처리
  let newPlayerCaptured = [...playerCaptured];
  let newComputerCaptured = [...computerCaptured];
  let opponentCaptured =
    currentTurn === "player" ? newComputerCaptured : newPlayerCaptured;
  let myCaptured =
    currentTurn === "player" ? newPlayerCaptured : newComputerCaptured;

  // 이번 턴 획득 패 추가
  myCaptured = [...myCaptured, ...turnCaptured];

  // 뻑 먹기 체크 (같은 월 4장 획득 시) - 뻑 무더기를 먹은 경우는 제외
  if (!isSelfPpeok && !events.includes("뻑 먹음!")) {
    const capturedMonths = turnCaptured.map((c) => c.month);
    const monthCounts = {};
    capturedMonths.forEach((m) => {
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });

    let atePpeok = false;
    for (const m in monthCounts) {
      if (monthCounts[m] === 4 && parseInt(m) !== 0) {
        // 보너스 카드는 제외
        atePpeok = true;
        break;
      }
    }

    if (atePpeok) {
      events.push("뻑 먹음!");
      stealCount += 2; // 뻑 먹으면 피 2장 뺏기
    }
  }

  // 3뻑 승리 체크
  if (newPpeokCount[currentTurn] >= 3) {
    const actionText = `${currentTurn === "player" ? "나" : "컴"}: 3뻑 승리!`;
    return {
      playerHand: currentTurn === "player" ? hand : playerHand,
      computerHand: currentTurn === "computer" ? hand : computerHand,
      field: currentField,
      remainingDeck: newDeck,
      playerCaptured: newPlayerCaptured,
      computerCaptured: newComputerCaptured,
      currentTurn: currentTurn,
      gameStatus: "ended",
      lastAction: actionText,
      scores: {
        player: currentTurn === "player" ? 10 : 0,
        computer: currentTurn === "computer" ? 10 : 0,
      },
      prevScores,
      goCount,
      shakeCount: newShakeCount,
      ppeokCount: newPpeokCount,
      ppeokStack: currentPpeokStack,
      consecutivePpeok: newConsecutivePpeok,
      isFirstTtakdak: newIsFirstTtakdak,
      isFirstJjok: newIsFirstJjok,
      winner: currentTurn,
    };
  }

  // 상대방 피 뺏기
  if (stealCount > 0) {
    const { stolen, remaining } = stealJunk(opponentCaptured, stealCount);
    opponentCaptured = remaining;
    myCaptured = [...myCaptured, ...stolen];
    if (stolen.length > 0) events.push(`피 ${stolen.length}장 뺏음`);
  }

  // 다시 할당
  if (currentTurn === "player") {
    newPlayerCaptured = myCaptured;
    newComputerCaptured = opponentCaptured;
  } else {
    newComputerCaptured = myCaptured;
    newPlayerCaptured = opponentCaptured;
  }

  // 점수 계산 (흔들기 배수 적용)
  const playerScore = calculateScore(newPlayerCaptured, newShakeCount.player);
  const computerScore = calculateScore(
    newComputerCaptured,
    newShakeCount.computer
  );

  const currentScore = currentTurn === "player" ? playerScore : computerScore;
  const oldScore = prevScores[currentTurn];

  // 고/스톱 조건 확인
  let status = "playing";
  let nextTurn = currentTurn === "player" ? "computer" : "player";
  let winner = null;
  const isHandEmpty =
    hand.length === 0 &&
    (currentTurn === "player"
      ? computerHand.length === 0
      : playerHand.length === 0);

  let actionText = `${currentTurn === "player" ? "나" : "컴"}: ${card.month}월`;
  if (events.length > 0) actionText += ` (${events.join(", ")})`;

  // 최종 점수 계산 (박 적용) 함수
  const calculateFinalScore = (winner, winnerScore, loserCaptured) => {
    let finalScore = winnerScore;
    let reasons = [];

    // 1. 광박: 승자가 광으로 점수가 났는데(3광 이상), 패자가 광이 하나도 없는 경우
    // (단, 승자가 광 점수가 없으면 광박 아님)
    // calculateScore 함수 내에서 광 점수 별도 리턴이 없어서 재계산 필요하거나 구조 변경 필요.
    // 여기서는 간단히 승자의 광 개수로 판단.
    const winnerBrights = (
      winner === "player" ? newPlayerCaptured : newComputerCaptured
    ).filter((c) => c.type === "bright").length;
    const loserBrights = loserCaptured.filter(
      (c) => c.type === "bright"
    ).length;

    if (winnerBrights >= 3 && loserBrights === 0) {
      finalScore *= 2;
      reasons.push("광박");
    }

    // 2. 피박: 승자가 피로 점수가 났는데(피 10장 이상), 패자의 피가 5장(맞고 기준 7장) 미만인 경우
    // 고스톱(3인)은 5장, 맞고(2인)는 7장 기준. 여기서는 맞고 룰(7장) 적용.
    // 승자의 피 점수 확인: 피 개수 10장 이상이어야 함.
    const winnerJunks =
      winner === "player" ? newPlayerCaptured : newComputerCaptured;
    const winnerJunkCount =
      winnerJunks.filter((c) => c.type === "junk").length +
      winnerJunks.filter((c) => c.type === "double_junk").length * 2 +
      winnerJunks.filter((c) => c.type === "bonus_junk_2").length +
      winnerJunks.filter((c) => c.type === "bonus_junk_3").length;

    const loserJunks = loserCaptured;
    const loserJunkCount =
      loserJunks.filter((c) => c.type === "junk").length +
      loserJunks.filter((c) => c.type === "double_junk").length * 2 +
      loserJunks.filter((c) => c.type === "bonus_junk_2").length +
      loserJunks.filter((c) => c.type === "bonus_junk_3").length;

    if (winnerJunkCount >= 10 && loserJunkCount < 7) {
      // 맞고 기준 피박 7장 미만
      finalScore *= 2;
      reasons.push("피박");
    }

    // 3. 고박: (이건 승자가 독박 쓰는 경우라 여기서 계산하기 복잡, 일단 제외하거나 별도 처리)
    // 맞고에서는 고박(독박) 개념이 승자가 뒤집히는 것.
    // 여기서는 승자가 결정된 후 점수 뻥튀기만 계산.

    return { finalScore, reasons };
  };

  if (currentScore >= 7 && currentScore > oldScore) {
    if (currentTurn === "player") {
      // 패가 없으면 자동 스톱
      if (hand.length === 0) {
        // 플레이어 스톱 -> 승리
        let baseScore = playerScore;
        let multiplier = 1;
        let bonusPoints = 0;
        let reasons = [];

        // 고 점수 계산
        const myGoCount = goCount.player;
        if (myGoCount > 0) {
          if (myGoCount === 1) {
            bonusPoints += 1;
            reasons.push("1고 +1점");
          } else if (myGoCount === 2) {
            bonusPoints += 2;
            reasons.push("2고 +2점");
          } else {
            bonusPoints += myGoCount;
            const goMultiplier = Math.pow(2, myGoCount - 2);
            multiplier *= goMultiplier;
            reasons.push(`${myGoCount}고 +${myGoCount}점 x${goMultiplier}`);
          }
        }

        // 박 계산
        const { finalScore: scoredWithBak, reasons: bakReasons } =
          calculateFinalScore("player", baseScore, newComputerCaptured);

        // 박 배수 추출
        const bakMultiplier = scoredWithBak > 0 ? scoredWithBak / baseScore : 1;
        if (bakMultiplier > 1) {
          multiplier *= bakMultiplier;
          reasons.push(...bakReasons);
        }

        const finalScore = (baseScore + bonusPoints) * multiplier;
        const reasonText = reasons.length > 0 ? ` (${reasons.join(", ")})` : "";

        return {
          ...gameState,
          playerHand: hand,
          computerHand: computerHand,
          field: currentField,
          remainingDeck: newDeck,
          playerCaptured: newPlayerCaptured,
          computerCaptured: newComputerCaptured,
          gameStatus: "ended",
          winner: "player",
          lastAction: `마지막 패 스톱! 승리!${reasonText} 총 ${finalScore}점`,
          scores: { player: finalScore, computer: computerScore },
          shakeCount: newShakeCount,
          ppeokCount: newPpeokCount,
          ppeokStack: currentPpeokStack,
          consecutivePpeok: newConsecutivePpeok,
          isFirstTtakdak: newIsFirstTtakdak,
          isFirstJjok: newIsFirstJjok,
        };
      } else {
        status = "waitingForDecision";
        nextTurn = currentTurn;
      }
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
          currentTurn: "player",
          gameStatus: isHandEmpty ? "ended" : "playing",
          lastAction: `컴퓨터 GO! (${comGoCount + 1}고)`,
          scores: { player: playerScore, computer: computerScore },
          prevScores: newPrevScores,
          goCount: newGoCount,
          shakeCount: newShakeCount,
          ppeokCount: newPpeokCount,
          ppeokStack: currentPpeokStack,
          consecutivePpeok: newConsecutivePpeok,
          isFirstTtakdak: newIsFirstTtakdak,
          isFirstJjok: newIsFirstJjok,
          winner: isHandEmpty ? "computer" : null,
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
            reasons.push("1고 +1점");
          } else if (comGoCount === 2) {
            bonusPoints += 2;
            reasons.push("2고 +2점");
          } else {
            bonusPoints += comGoCount;
            const goMultiplier = Math.pow(2, comGoCount - 2);
            multiplier *= goMultiplier;
            reasons.push(`${comGoCount}고 +${comGoCount}점 x${goMultiplier}`);
          }
        }

        // 박 계산
        const { finalScore: scoredWithBak, reasons: bakReasons } =
          calculateFinalScore("computer", baseScore, newPlayerCaptured);

        // 박 배수 추출 (calculateFinalScore가 이미 baseScore에 곱했으므로 역산)
        const bakMultiplier = scoredWithBak / baseScore;
        if (bakMultiplier > 1) {
          multiplier *= bakMultiplier;
          reasons.push(...bakReasons);
        }

        const finalScore = (baseScore + bonusPoints) * multiplier;
        const reasonText = reasons.length > 0 ? ` (${reasons.join(", ")})` : "";

        return {
          ...gameState,
          playerHand: playerHand,
          computerHand: hand,
          field: currentField,
          remainingDeck: newDeck,
          playerCaptured: newPlayerCaptured,
          computerCaptured: newComputerCaptured,
          gameStatus: "ended",
          winner: "computer",
          lastAction: `컴퓨터 스톱! 승리!${reasonText} 총 ${finalScore}점`,
          scores: { player: playerScore, computer: finalScore },
          shakeCount: newShakeCount,
          ppeokCount: newPpeokCount,
          ppeokStack: currentPpeokStack,
          consecutivePpeok: newConsecutivePpeok,
          isFirstTtakdak: newIsFirstTtakdak,
          isFirstJjok: newIsFirstJjok,
        };
      }
    }
  } else if (isHandEmpty) {
    status = "ended";
    if (playerScore > computerScore) winner = "player";
    else if (computerScore > playerScore) winner = "computer";
    else winner = "draw";
  }

  return {
    playerHand: currentTurn === "player" ? hand : playerHand,
    computerHand: currentTurn === "computer" ? hand : computerHand,
    field: currentField,
    remainingDeck: newDeck,
    playerCaptured: newPlayerCaptured,
    computerCaptured: newComputerCaptured,
    currentTurn: nextTurn,
    gameStatus: status,
    lastAction: actionText,
    scores: { player: playerScore, computer: computerScore },
    prevScores:
      status === "waitingForDecision"
        ? prevScores
        : { ...prevScores, [currentTurn]: currentScore },
    goCount,
    shakeCount: newShakeCount,
    ppeokCount: newPpeokCount,
    ppeokStack: currentPpeokStack,
    consecutivePpeok: newConsecutivePpeok,
    isFirstTtakdak: newIsFirstTtakdak,
    isFirstJjok: newIsFirstJjok,
    winner,
  };
};

export const handleGoStopDecision = (gameState, isGo) => {
  const {
    currentTurn,
    scores,
    goCount,
    prevScores,
    playerCaptured,
    computerCaptured,
    shakeCount = { player: 0, computer: 0 },
  } = gameState;

  if (isGo) {
    const newGoCount = { ...goCount, [currentTurn]: goCount[currentTurn] + 1 };
    const newPrevScores = { ...prevScores, [currentTurn]: scores[currentTurn] };
    const isHandEmpty =
      gameState.playerHand.length === 0 && gameState.computerHand.length === 0;

    return {
      ...gameState,
      gameStatus: isHandEmpty ? "ended" : "playing",
      currentTurn: currentTurn === "player" ? "computer" : "player",
      goCount: newGoCount,
      prevScores: newPrevScores,
      lastAction: `${currentTurn} GO! (${newGoCount[currentTurn]}고)`,
      winner: isHandEmpty ? currentTurn : null,
    };
  } else {
    // Stop -> 승리
    // 최종 점수 계산
    const loserCaptured =
      currentTurn === "player" ? computerCaptured : playerCaptured;
    const winnerCaptured =
      currentTurn === "player" ? playerCaptured : computerCaptured;

    let baseScore = scores[currentTurn];
    let multiplier = 1;
    let bonusPoints = 0;
    let reasons = [];

    // 1. 고 점수 계산
    const myGoCount = goCount[currentTurn];
    if (myGoCount > 0) {
      if (myGoCount === 1) {
        bonusPoints += 1;
        reasons.push("1고 +1점");
      } else if (myGoCount === 2) {
        bonusPoints += 2;
        reasons.push("2고 +2점");
      } else {
        // 3고 이상: 점수 추가 + 배수 적용
        bonusPoints += myGoCount;
        const goMultiplier = Math.pow(2, myGoCount - 2);
        multiplier *= goMultiplier;
        reasons.push(`${myGoCount}고 +${myGoCount}점 x${goMultiplier}`);
      }
    }

    // 2. 박 계산
    const winnerBrights = winnerCaptured.filter(
      (c) => c.type === "bright"
    ).length;
    const loserBrights = loserCaptured.filter(
      (c) => c.type === "bright"
    ).length;
    if (winnerBrights >= 3 && loserBrights === 0) {
      multiplier *= 2;
      reasons.push("광박 x2");
    }

    const winnerJunks = winnerCaptured;
    const winnerJunkCount =
      winnerJunks.filter((c) => c.type === "junk").length +
      winnerJunks.filter((c) => c.type === "double_junk").length * 2 +
      winnerJunks.filter((c) => c.type === "bonus_junk_2").length +
      winnerJunks.filter((c) => c.type === "bonus_junk_3").length;
    const loserJunks = loserCaptured;
    const loserJunkCount =
      loserJunks.filter((c) => c.type === "junk").length +
      loserJunks.filter((c) => c.type === "double_junk").length * 2 +
      loserJunks.filter((c) => c.type === "bonus_junk_2").length +
      loserJunks.filter((c) => c.type === "bonus_junk_3").length;

    if (winnerJunkCount >= 10 && loserJunkCount < 7) {
      multiplier *= 2;
      reasons.push("피박 x2");
    }

    // 3. 멍박 (열끗 7장 이상으로 났는데 상대가 열끗 0장)
    const winnerAnimals = winnerCaptured.filter(
      (c) => c.type === "animal"
    ).length;
    const loserAnimals = loserCaptured.filter(
      (c) => c.type === "animal"
    ).length;
    if (winnerAnimals >= 7 && loserAnimals === 0) {
      multiplier *= 2;
      reasons.push("멍박 x2");
    }

    // 4. 흔들기 배수는 이미 calculateScore에 포함되어 있음
    // shakeCount가 있으면 reasons에 추가만
    if (shakeCount[currentTurn] > 0) {
      const shakeMultiplier = Math.pow(2, shakeCount[currentTurn]);
      reasons.push(`흔들기 x${shakeMultiplier} (이미 적용됨)`);
    }

    // 최종 점수 = (기본점수 + 고보너스) x 배수
    const finalScore = (baseScore + bonusPoints) * multiplier;

    const reasonText = reasons.length > 0 ? ` (${reasons.join(", ")})` : "";

    return {
      ...gameState,
      gameStatus: "ended",
      winner: currentTurn,
      lastAction: `${
        currentTurn === "player" ? "나" : "컴퓨터"
      } STOP! 승리!${reasonText} 총 ${finalScore}점`,
      scores: { ...scores, [currentTurn]: finalScore },
    };
  }
};

export const calculateScore = (capturedCards, shakeCount = 0) => {
  let score = 0;
  let isMungtunguri = false; // 멍텅구리 따블 여부

  // 1. 광 (Bright)
  const brights = capturedCards.filter((c) => c.type === "bright");
  if (brights.length === 5) {
    score += 15; // 오광
  } else if (brights.length === 4) {
    score += 4; // 사광
  } else if (brights.length === 3) {
    // 비광(12월)이 포함되어 있는지 확인
    const hasRainBright = brights.some((c) => c.month === 12);
    if (hasRainBright) {
      score += 2; // 비3광
    } else {
      score += 3; // 3광
    }
  }

  // 2. 열끗 (Animal)
  const animals = capturedCards.filter((c) => c.type === "animal");
  if (animals.length >= 5) {
    score += 1 + (animals.length - 5);
  }

  // 고도리 (2월, 4월, 8월 열끗)
  const godoriCards = animals.filter((c) => [2, 4, 8].includes(c.month));
  if (godoriCards.length === 3) {
    score += 5;
  }

  // 멍텅구리 따블 (열끗 7장 이상)
  if (animals.length >= 7) {
    isMungtunguri = true;
  }

  // 3. 띠 (Ribbon)
  const ribbons = capturedCards.filter((c) => c.type === "ribbon");
  if (ribbons.length >= 5) {
    score += 1 + (ribbons.length - 5);
  }

  // 홍단 (1, 2, 3월), 청단 (6, 9, 10월), 초단 (4, 5, 7월)
  const hongDan = ribbons.filter((c) => [1, 2, 3].includes(c.month));
  const cheongDan = ribbons.filter((c) => [6, 9, 10].includes(c.month));
  const choDan = ribbons.filter((c) => [4, 5, 7].includes(c.month));

  if (hongDan.length === 3) score += 3;
  if (cheongDan.length === 3) score += 3;
  if (choDan.length === 3) score += 3;

  // 4. 피 (Junk)
  const junks = capturedCards.filter((c) => c.type === "junk");
  const doubleJunks = capturedCards.filter((c) => c.type === "double_junk");
  const bonusJunk2 = capturedCards.filter((c) => c.type === "bonus_junk_2");
  const bonusJunk3 = capturedCards.filter((c) => c.type === "bonus_junk_3");

  // 쌍피는 2장으로 계산, 보너스 피도 피 개수에 포함
  const junkCount =
    junks.length +
    doubleJunks.length * 2 +
    bonusJunk2.length +
    bonusJunk3.length;

  // 국진(9월) 열끗을 쌍피로 쓸 수 있는 룰은 복잡하므로 일단 제외하거나,
  // 여기서는 단순히 열끗으로만 계산. (실제 게임에선 선택 가능)

  if (junkCount >= 10) {
    score += 1 + (junkCount - 10);
  }

  // 보너스 피 추가 점수
  if (bonusJunk2.length > 0) {
    score += bonusJunk2.length * 2; // 2점 보너스
  }
  if (bonusJunk3.length > 0) {
    score += bonusJunk3.length * 3; // 3점 보너스
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
