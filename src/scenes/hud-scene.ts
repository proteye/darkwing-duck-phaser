export class HUDScene extends Phaser.Scene {
  private textElements: Map<string, Phaser.GameObjects.BitmapText>
  private timer: Phaser.Time.TimerEvent

  constructor() {
    super({
      key: 'HUDScene',
    })
  }

  create(): void {
    this.textElements = new Map([
      ['LIVES', this.addText(0, 0, `LIVES ${this.registry.get('lives')}`)],
      ['TIMELABEL', this.addText(128, 0, `${this.registry.get('timeLabel')}`)],
      ['SCORE', this.addText(0, 8, `SCORE ${this.registry.get('score')}`)],
      ['TIME', this.addText(136, 8, `${this.registry.get('time')}`)],
    ])

    // create events
    const level = this.scene.get('GameScene')
    level.events.on('scoreChanged', this.updateScore, this)
    level.events.on('livesChanged', this.updateLives, this)

    // add timer
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true,
    })
  }

  private addText(x: number, y: number, value: string): Phaser.GameObjects.BitmapText {
    return this.add.bitmapText(x, y, 'font', value, 8)
  }

  private updateTime() {
    this.registry.values.time -= 1
    this.textElements.get('TIME').setText(`${this.registry.get('time')}`)
  }

  private updateScore() {
    this.textElements
      .get('SCORE')
      .setText(`${this.registry.get('score')}`)
      .setX(40 - 8 * (this.registry.get('score').toString().length - 1))
  }

  private updateLives() {
    this.textElements.get('LIVES').setText(`Lives: ${this.registry.get('lives')}`)
  }
}
