export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = []

  constructor() {
    super({
      key: 'MenuScene',
    })
  }

  init(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.startKey.isDown = false
    this.initGlobalDataManager()
  }

  create(): void {
    this.add.image(0, 0, 'background').setOrigin(0, 0)

    const text1 = this.add.text(5, 5, 'ОТ МАЛЬЧИКОВ\nЛМС/ПЛАТФОРМЫ', { fontFamily: 'coralWaves' })
    text1.setFontSize(20)
    text1.setColor('#0000f8')
    const text2 = this.add.text(this.sys.canvas.width / 2, 42, 'Спасибо!', { fontFamily: 'coralWaves' })
    text2.setFontSize(28)
    text2.setColor('#f80000')
    const text3 = this.add.text(
      5,
      63,
      'В честь 8 марта\nпоздравляем всех девочек,\nкто работает над\nпроектами Деловой Среды',
      { fontFamily: 'coralWaves' },
    )
    text3.setFontSize(20)
    text3.setColor('#f04867')

    this.bitmapTexts.push(this.add.bitmapText(this.sys.canvas.width / 2 - 62, 105, 'font', 'Press S to START', 8))
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start('HUDScene')
      this.scene.start('GameScene')
      this.scene.bringToTop('HUDScene')
    }
  }

  private initGlobalDataManager(): void {
    this.registry.set('time', 400)
    this.registry.set('level', 'level_1')
    this.registry.set('timeLabel', 'TIME')
    this.registry.set('score', 0)
    this.registry.set('coins', 0)
    this.registry.set('lives', 2)
    this.registry.set('spawn', { x: 16, y: 44, dir: 'down' })
  }
}
