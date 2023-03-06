import 'phaser'
import { GameConfig } from './config'
import { loadFont } from './helpers/load-font'

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
  }
}

window.addEventListener('load', () => {
  loadFont('coralWaves', 'assets/fonts/coral_waves.otf')
  const game = new Game(GameConfig)
})
