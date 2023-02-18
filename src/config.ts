import { BootScene } from './scenes/boot-scene'
import { GameScene } from './scenes/game-scene'
import { HUDScene } from './scenes/hud-scene'
import { MenuScene } from './scenes/menu-scene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Darkwing Duck',
  url: '',
  version: '0.1',
  width: 160,
  height: 140,
  zoom: 5,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, MenuScene, HUDScene, GameScene],
  input: {
    keyboard: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 460 },
      debug: false,
    },
  },
  backgroundColor: '#f8f8f8',
  render: { pixelArt: true, antialias: false },
}
