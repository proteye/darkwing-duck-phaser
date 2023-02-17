import { ISpriteConstructor } from '../interfaces/sprite.interface'

const FRAMES = {
  standing: 0,
  sitting: 15,
  turning: 6,
  shooting: 13,
  shootingDown: 16,
  dying: 20,
  jumpingUp: 24,
  jumpingDown: 25,
  shootingJumpUp: 30,
  shootingJumpDown: 31,
  hooking: 32,
  shootingHook: 34,
}

export class DarkwingDuckNes extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body

  // variables
  private currentScene: Phaser.Scene
  private acceleration: number
  private isJumping: boolean
  private isFalling: boolean
  private isDefending: boolean
  private isDefendingPlay: boolean
  private isSitting: boolean
  private isSittingPlay: boolean
  private isShooting: boolean
  private isShootingPlay: boolean
  private isDying: boolean
  private isVulnerable: boolean
  private isWalking: boolean
  private isWalkingStarted: boolean
  private vulnerableCounter: number

  // input
  private keys: Map<string, Phaser.Input.Keyboard.Key>

  public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys
  }

  public getVulnerable(): boolean {
    return this.isVulnerable
  }

  public getDefending(): boolean {
    return this.isDefending
  }

  constructor(params: ISpriteConstructor) {
    super(params.scene, params.x, params.y, params.texture, params.frame)

    this.currentScene = params.scene
    this.initSprite()
    this.currentScene.add.existing(this)
  }

  private initSprite() {
    // variables
    this.acceleration = 500
    this.isJumping = false
    this.isFalling = false
    this.isDefending = false
    this.isDefendingPlay = false
    this.isSitting = false
    this.isSittingPlay = false
    this.isShooting = false
    this.isShootingPlay = false
    this.isDying = false
    this.isVulnerable = true
    this.isWalking = false
    this.isWalkingStarted = false
    this.vulnerableCounter = 100

    // sprite
    this.setOrigin(0.5, 0.5)
    this.setFlipX(false)

    // input
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['UP', this.addKey('UP')],
      ['DOWN', this.addKey('DOWN')],
      ['JUMP', this.addKey('X')],
      ['SHOOT', this.addKey('Z')],
    ])

    // physics
    this.currentScene.physics.world.enable(this)
    this.adjustPhysicBody()
    this.body.maxVelocity.x = 50
    this.body.maxVelocity.y = 300

    // animation
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      switch (this.anims.currentAnim.key) {
        case 'darkwingDuckNesWalkingStart':
          this.isWalking = true
          break
        case 'darkwingDuckNesShooting':
          this.isShootingPlay = false
          this.setFrame(FRAMES.standing)
          break
        default:
          break
      }
    })
  }

  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key)
  }

  update(): void {
    if (!this.isDying) {
      this.handleInput()
      this.handleAnimations()
    } else {
      this.setFrame(FRAMES.dying)
      if (this.y > this.currentScene.sys.canvas.height) {
        this.currentScene.scene.stop('GameScene')
        this.currentScene.scene.stop('HUDScene')
        this.currentScene.scene.start('MenuScene')
      }
    }

    if (!this.isVulnerable) {
      if (this.vulnerableCounter > 0) {
        this.vulnerableCounter -= 1
      } else {
        this.vulnerableCounter = 100
        this.isVulnerable = true
      }
    }
  }

  private handleInput() {
    if (this.y > this.currentScene.sys.canvas.height) {
      // darkwing-duck fell into a hole
      this.isDying = true
    }

    // evaluate if player is on the floor or on object
    // if neither of that, set the player to be jumping
    if (this.body.onFloor() || this.body.touching.down || this.body.blocked.down) {
      if (this.isFalling) {
        this.isWalking = false
        this.isWalkingStarted = false
        this.isShooting = false
      }
      this.isFalling = false
      this.isJumping = false
    }

    // handle movements to left and right
    if (this.keys.get('RIGHT').isDown) {
      this.body.setAccelerationX(this.acceleration)
      this.setFlipX(false)
    } else if (this.keys.get('LEFT').isDown) {
      this.body.setAccelerationX(-this.acceleration)
      this.setFlipX(true)
    } else {
      this.body.setVelocityX(0)
      this.body.setAccelerationX(0)
    }

    // handle defend
    if (this.keys.get('UP').isDown) {
      this.isDefending = true
    } else {
      this.isDefending = false
      this.isDefendingPlay = false
    }

    // handle sit down
    if (this.keys.get('DOWN').isDown) {
      this.isSitting = true
    } else {
      this.isSitting = false
      this.isSittingPlay = false
    }

    // handle jumping
    if (this.keys.get('JUMP').isDown && !this.isJumping) {
      this.body.setVelocityY(-180)
      this.isJumping = true
      this.isDefendingPlay = false
      this.isShootingPlay = false
      this.isSittingPlay = false
    }

    // handle shoot
    if (this.keys.get('SHOOT').isDown && !this.isShooting) {
      this.isShooting = true
      this.isShootingPlay = false
    } else if (this.keys.get('SHOOT').isUp) {
      this.isShooting = false
    }
  }

  private handleAnimations(): void {
    if (this.body.velocity.y !== 0) {
      // darkwing-duck is jumping or falling
      this.isFalling = true
      this.anims.stop()

      if (this.body.velocity.y > 0) {
        this.setFrame(this.isShooting ? FRAMES.shootingJumpDown : FRAMES.jumpingDown)
      } else {
        this.setFrame(this.isShooting ? FRAMES.shootingJumpUp : FRAMES.jumpingUp)
      }
    } else if (this.body.velocity.x !== 0) {
      // darkwing-duck is moving horizontal
      // check if darkwing-duck is making a quick direction change
      if (
        (this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
        (this.body.velocity.x > 0 && this.body.acceleration.x < 0)
      ) {
        this.setFrame(FRAMES.turning)
      }
      // darkwing-duck is walking
      if (!this.isWalking && !this.isWalkingStarted) {
        this.isWalkingStarted = true
        this.anims.play('darkwingDuckNesWalkingStart')
      }

      if (this.isWalking) {
        this.anims.play('darkwingDuckNesWalking', true)
      }
    } else {
      // darkwing-duck is standing still
      this.isWalking = false
      this.isWalkingStarted = false

      if (this.isDefending && !this.isDefendingPlay) {
        this.isDefendingPlay = true
        this.anims.play('darkwingDuckNesDefending')
      } else if (this.isSitting && !this.isSittingPlay) {
        this.isSittingPlay = true
        this.anims.play('darkwingDuckNesDown')
      } else if (this.isShooting) {
        if (!this.isSitting && !this.isShootingPlay) {
          this.isShootingPlay = true
          this.anims.play('darkwingDuckNesShooting')
        } else if (this.isSitting) {
          this.setFrame(FRAMES.shootingDown)
        }
      } else if (!this.isDefending && !this.isSitting && !this.isShootingPlay) {
        this.stand()
      } else if (this.isSitting && this.isSittingPlay && !this.isShooting) {
        this.setFrame(FRAMES.sitting)
      }
    }
  }

  private adjustPhysicBody(): void {
    this.body.setSize(26, 26)
    this.body.setOffset(0, 14)
  }

  public bounceUpAfterHitEnemyOnHead(): void {
    this.currentScene.add.tween({
      targets: this,
      props: { y: this.y - 5 },
      duration: 200,
      ease: 'Power1',
      yoyo: true,
    })
  }

  public gotHit(): void {
    this.isVulnerable = false
    // darkwing-duck is dying
    this.isDying = true

    // sets acceleration, velocity and speed to zero
    // stop all animations
    this.body.stop()
    this.anims.stop()

    // make last dead jump and turn off collision check
    this.body.setVelocityY(-180)

    // this.body.checkCollision.none did not work for me
    this.body.checkCollision.up = false
    this.body.checkCollision.down = false
    this.body.checkCollision.left = false
    this.body.checkCollision.right = false
  }

  private stand() {
    this.anims.stop()
    this.setFrame(FRAMES.standing)
  }
}
