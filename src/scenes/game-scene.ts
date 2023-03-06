import { Brick } from '../objects/brick'
import { DarkwingDuckNes } from '../objects/darkwing-duck-nes'

const girlNames = [
  'Анастасия\nМаматова',
  'Ольга\nШуравина',
  'Алина\nСиничкина',
  'Ирина\nШрамчук',
  'Татьяна\nТурбал',
  'Елена\nНуриджанова',
  'Светлана\nНаумова',
]

export class GameScene extends Phaser.Scene {
  // tilemap
  private map: Phaser.Tilemaps.Tilemap
  private tileset: Phaser.Tilemaps.Tileset
  private foregroundLayer: Phaser.Tilemaps.TilemapLayer
  private spikesLayer: Phaser.Tilemaps.TilemapLayer

  // game objects
  private bricks: Phaser.GameObjects.Group
  private names: Phaser.GameObjects.Text[]
  private namesCollisions: Phaser.GameObjects.Group
  private player: DarkwingDuckNes

  // sounds
  private sfxCoin: Phaser.Sound.BaseSound

  constructor() {
    super({
      key: 'GameScene',
    })
  }

  init(): void {}

  create(): void {
    // *****************************************************************
    // SETUP TILEMAP
    // *****************************************************************
    // add background
    this.add.tileSprite(315, 84, 630, 168, 'background')

    // create our tilemap from Tiled JSON
    this.map = this.make.tilemap({ key: this.registry.get('level') })
    // add our tileset and layers to our tilemap
    this.tileset = this.map.addTilesetImage('tilemap_packed')

    this.foregroundLayer = this.map.createLayer('foregroundLayer', this.tileset, 0, 0)
    this.foregroundLayer.setName('foregroundLayer')

    this.spikesLayer = this.map.createLayer('spikesLayer', this.tileset, 0, 0)
    this.spikesLayer.setName('spikesLayer')

    // set collision for tiles with the property collide set to true
    this.foregroundLayer.setCollisionByProperty({ collides: true })
    this.spikesLayer.setCollisionByProperty({ collides: true })

    // *****************************************************************
    // TEXT
    // *****************************************************************
    const text = this.add.text(10, 35, 'Поздравляем с 8 марта!', { fontFamily: 'coralWaves' })
    text.setFontSize(40)
    text.setColor('#f80000')

    // *****************************************************************
    // GAME OBJECTS
    // *****************************************************************
    this.bricks = this.add.group({
      /* classType: Brick */
      runChildUpdate: true,
    })
    this.names = []
    // this.names = this.add.group({
    //   runChildUpdate: true,
    // })

    this.namesCollisions = this.add.group({
      runChildUpdate: true,
    })

    this.loadObjectsFromTilemap()

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.collider(this.player, this.foregroundLayer)
    this.physics.add.collider(this.player, this.bricks)
    // this.physics.add.collider(this.player, this.namesCollisions)

    this.physics.add.overlap(this.player, this.spikesLayer, this.handlePlayerSpikesOverlap, null, this)
    this.physics.add.overlap(this.player, this.namesCollisions, this.handlePlayerTextOverlap, null, this)

    // *****************************************************************
    // CAMERA
    // *****************************************************************
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    // Sounds
    this.sfxCoin = this.sound.add('sfxCoin', { loop: false })
  }

  update(): void {
    this.player.update()
  }

  private loadObjectsFromTilemap(): void {
    // get the object layer in the tilemap named 'objects'
    const objects = this.map.getObjectLayer('objects').objects as any[]

    objects.forEach((object) => {
      if (object.type === 'player') {
        this.player = new DarkwingDuckNes({
          scene: this,
          x: this.registry.get('spawn').x,
          y: this.registry.get('spawn').y,
          texture: 'darkwingDuckNes',
        })
      }

      if (object.type === 'brick') {
        this.bricks.add(
          new Brick({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'tilemapPackedSprites',
            value: 50,
          }),
        )
      }
    })

    // girl names
    let nameX = 40
    const nameY = 20
    girlNames.forEach((name, index) => {
      if (index === 4) {
        nameX += 50
      }
      const text = this.add.text(nameX, nameY, name, { fontFamily: 'coralWaves' })
      text.setName(name)
      text.setOrigin(0.5, 0.5)
      text.setFontSize(18)
      text.setColor('#FF548E')
      this.names.push(text)
      nameX += 85

      let collision = this.add.rectangle(text.x, text.y, text.width, text.height)
      this.physics.add.existing(collision, true)
      collision.setName(name)
      this.namesCollisions.add(collision)
    })
  }

  /**
   * Player <-> Spike Overlap
   * @param _player [DarkwingDuckNes]
   * @param _spike [Phaser.Tilemaps.Tile]
   */
  private handlePlayerSpikesOverlap(_player: DarkwingDuckNes, _spike: any): void {
    // player got hit from the side or on the head
    if (_spike.canCollide && _player.getVulnerable()) {
      _player.gotHit()
    }
  }

  private handlePlayerTextOverlap(_player: DarkwingDuckNes, _text: any): void {
    const name = this.names.find((item) => item.name === _text.name)
    this.physics.world.enable(name)
    this.sfxCoin.play()
    _text.destroy()
  }
}
