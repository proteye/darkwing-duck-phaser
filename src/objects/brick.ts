import { IBrickConstructor } from '../interfaces/brick.interface'

export class Brick extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body

  // variables
  private currentScene: Phaser.Scene
  protected destroyingValue: number

  constructor(params: IBrickConstructor) {
    super(params.scene, params.x, params.y, params.texture, params.frame)

    // variables
    this.currentScene = params.scene
    this.destroyingValue = params.value
    this.initSprite()
    this.currentScene.add.existing(this)
  }

  private initSprite() {
    // sprite
    this.setOrigin(0, -0.5)
    this.setFrame(8)

    // physics
    this.currentScene.physics.world.enable(this)
    this.body.setSize(8, 8)
    this.body.setAllowGravity(false)
    this.body.setImmovable(true)
  }

  update(): void {
    if (this.body.touching.down) {
      // something touches the downside of the brick
      for (let i = -2; i < 2; i++) {
        // create smaller bricks
        let brick = this.currentScene.add
          .sprite(this.x, this.y, 'tilemapPackedSprites', 8)
          .setOrigin(0, 0)
          .setDisplaySize(10, 6)

        this.currentScene.physics.world.enable(brick)
      }

      // destroy brick
      this.destroy()

      // add some score for killing the brick
      this.currentScene.registry.values.score += this.destroyingValue
      this.currentScene.events.emit('scoreChanged')
    }
  }
}
