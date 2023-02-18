import { Brick } from '../objects/brick'
import { DarkwingDuckNes } from '../objects/darkwing-duck-nes'

export class GameScene extends Phaser.Scene {
  // tilemap
  private map: Phaser.Tilemaps.Tilemap
  private tileset: Phaser.Tilemaps.Tileset
  private foregroundLayer: Phaser.Tilemaps.TilemapLayer
  private spikesLayer: Phaser.Tilemaps.TilemapLayer

  // game objects
  private bricks: Phaser.GameObjects.Group
  private player: DarkwingDuckNes

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
    // GAME OBJECTS
    // *****************************************************************
    this.bricks = this.add.group({
      /* classType: Brick */
      runChildUpdate: true,
    })

    this.loadObjectsFromTilemap()

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.collider(this.player, this.foregroundLayer)
    this.physics.add.collider(this.player, this.bricks)

    this.physics.add.overlap(this.player, this.spikesLayer, this.handlePlayerSpikesOverlap, null, this)

    // *****************************************************************
    // CAMERA
    // *****************************************************************
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
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
}
