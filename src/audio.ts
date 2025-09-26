import { Howl, Howler } from 'howler';
import type { Settings } from './types';

const samples: Record<string, string> = {
  step: 'data:audio/wav;base64,UklGRuQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YcQAAACAgICAf39/f3+/v7+/gICAf39/f4CAgICAgH9/f3+AgIB/f39/gICAgIB/f3+/v7+/gICAgH9/f3+AgICAgH9/f3+AgICAf39/f4CAgH9/f3+AgICAf39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=',
  swing: 'data:audio/wav;base64,UklGRnIAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YbAAAAAAgICAf39/f39/f39/f39/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=',
  pistol: 'data:audio/wav;base64,UklGRmIAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YbQAAAAA////////AAD///8AAP///wAA////AAD///8AAP///wAA////AAD///8AAP///wAA////AAD///8AAP///wAA////AAD///8AAP///wAA////AAD///8AAP///wAA////AAD///8AAP///wAA',
  pickup: 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YbwAAAAAgICAf4CAgICAgICAgICAgH9/f39/f39/f3+AgICAgICAf39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=',
  hurt: 'data:audio/wav;base64,UklGRlAAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YboAAAAAgICAgIB/f3+AgICAgICAgICAgICAf39/f39/f39/f4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI='
};

const sounds: Record<string, Howl> = {};

export function initAudio(settings: Settings) {
  Howler.volume(settings.volume);
  Object.entries(samples).forEach(([key, src]) => {
    sounds[key] = new Howl({ src: [src], volume: 1 });
  });
}

export function updateVolume(settings: Settings) {
  Howler.volume(settings.volume);
}

export function play(name: keyof typeof samples) {
  const sound = sounds[name];
  if (sound) {
    sound.play();
  }
}
