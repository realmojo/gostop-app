import { Audio } from 'expo-av';

const sounds = {
  play: require('../../assets/sounds/play.mp3'),
  match: require('../../assets/sounds/match.mp3'),
  win: require('../../assets/sounds/win.mp3'),
  // 필요한 사운드 추가
};

const soundObjects = {};

export const loadSounds = async () => {
  try {
    for (const key in sounds) {
      const { sound } = await Audio.Sound.createAsync(sounds[key]);
      soundObjects[key] = sound;
    }
  } catch (error) {
    console.log('Error loading sounds:', error);
  }
};

export const playSound = async (key) => {
  try {
    const sound = soundObjects[key];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};

export const unloadSounds = async () => {
  for (const key in soundObjects) {
    await soundObjects[key].unloadAsync();
  }
};
