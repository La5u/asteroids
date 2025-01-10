const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')


function resizeCanvas() {
	canvas.width = innerWidth
	canvas.height = innerHeight
	midx = innerWidth/2
	midy = innerHeight/2
	
}
resizeCanvas()
addEventListener('resize', resizeCanvas)


const projectiles = []
const pspeed = 3
function shoot(event) {
	const xd = event.clientX - midx // x distance
	const yd = event.clientY - midy // y distance
	const d = Math.hypot(xd, yd) // vector distance

	const projectile = new Projectile(
		midx, midy, 5, 'white',	xd/d*pspeed, yd/d*pspeed)

	projectiles.push(projectile)

}
addEventListener('click', shoot)


const enemies = []
function createEnemy() {
	const r = 8 + Math.random()*32
	const color = `hsl(${Math.random()*360}, 100%, 50%)`
	const espeed = (40-r)/10*0.4 + 0.6

	let x, y
	if (Math.random() < 0.5) {
		x = Math.random() < 0.5 ? 0 - r : innerWidth + r
		y = Math.random() * innerHeight
	} else {
		x = Math.random() * innerWidth
		y = Math.random() < 0.5 ? 0 - r : innerHeight + r
	}
	const xd = midx - x // x distance
	const yd = midy - y // y distance
	const d = Math.hypot(xd, yd) // vector distance

	enemies.push(new Enemy(
		x, y, r, color, xd/d*espeed, yd/d*espeed))

}

let spawner
function spawnEnemies() {
	spawner = setInterval(createEnemy, 1000)

}


class Circle {
	constructor(x, y, r, color) {
		this.x = x
		this.y = y
		this.r = r //radius
		this.color = color

	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()

	}

}


class MovingCircle extends Circle {
	constructor(x, y, r, color, xv, yv) {
		super(x, y, r, color)
		this.xv = xv // x velocity
		this.yv = yv // y velocity

	}

	update() {
		this.draw()
		this.x += this.xv
		this.y += this.yv

	}

}

class Player {
	constructor(r, color, bcolor) {
		this.r = r
		this.color = color
		this.bcolor = bcolor

	}

	draw() {
		ctx.beginPath()
		ctx.arc(midx, midy, this.r, 0, Math.PI*2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.strokeStyle = this.bcolor
		ctx.stroke()

	}

}


class Projectile extends MovingCircle {

}

class Enemy extends MovingCircle {
	constructor(x, y, r, color, xv, yv, targetR) {
		super(x, y, r, color, xv, yv)
		this.targetR = r
		this.shrinkSpeed = 0.8
	}

	update() {
		super.update()
		if (this.targetR < this.r) {
			 this.r = this.r - this.shrinkSpeed < this.targetR
			 ? this.targetR : this.r - this.shrinkSpeed;
		} 

	}

}

class Particle extends MovingCircle {
	constructor(x, y, r, color, xv, yv, targetR) {
		super(x, y, r, color, xv, yv)
		this.alpha = 1
	}

	update() {
		ctx.save()
		ctx.globalAlpha = this.alpha
		super.draw()
		ctx.restore()
		this.x += this.xv
		this.y += this.yv
		this.xv *= 0.98
		this.yv *= 0.98
	}

}
const player = new Player(15, 'cyan', '')

let animationID
const scoreEl = document.querySelector('#scoreEl')

particles = []
let score = 0;
function animate() {
	animationID = requestAnimationFrame(animate)
	ctx.fillStyle = 'rgb(0, 0, 0, 0.1)'
	ctx.fillRect(0, 0, innerWidth, innerHeight)
	player.draw()

	projectiles.forEach((projectile, pindex) => {
		projectile.update()	
		if (projectile.x > innerWidth ||
			projectile.x < 0 ||
			projectile.y > innerHeight ||
			projectile.y < 0) {

			projectiles.splice(pindex, 1)

		}
	}) // remove projectiles off screen

	particles.forEach((particle, pindex) => {
		particle.update()
		particle.alpha -= 0.01
		if (particle.alpha < 0) {
			particles.splice(pindex, 1)

		}
	}) // update particles

	enemies.forEach((enemy, eindex) => {
		enemy.update()

		if (Math.hypot(enemy.x - midx, enemy.y - midy)
			< enemy.r + player.r) { // YOU LOSE
			cancelAnimationFrame(animationID)
			startBox.style.display = ''
			startButton.innerHTML = 'Try again?'
			bigScore.innerHTML = scoreEl.innerHTML
			
		}

		projectiles.forEach((projectile, pindex) => {

			if (Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
				< enemy.r + projectile.r) { // check if you hit something

				for (var i = 0; i < 20; i++) {
					particles.push(new Particle(
						projectile.x, projectile.y,
						Math.random()*3, enemy.color,
						(Math.random() - 0.5)*Math.random()*10,
						(Math.random() - 0.5)*Math.random()*10

						))
				} // create 20 particles
				
				if (enemy.r < 21) { // remove enemy if smol
					score += 100
					projectiles.splice(pindex, 1)
					enemies.splice(eindex, 1)
					
				} else { // subtract enemies size
					score += 50
					projectiles.splice(pindex, 1)
					enemy.targetR -= Math.min(14, enemy.targetR)
					if (enemy.targetR == 0) {
						enemies.splice(eindex, 1)
					}
					
				}

				scoreEl.innerHTML = score // update score

				

			} 

		}) // aimbot
	})
}

function startGame() {
	startBox.style.display = 'none'
	score = 0
	scoreEl.innerHTML = 0
	enemies.length = 0
	projectiles.length = 0
	// leave particles on screen bec cool
	animate()
	clearInterval(spawner);
	spawnEnemies()	
}

const startButton = document.querySelector('.start')
const startBox = document.querySelector('.startBox')
const bigScore = document.querySelector('.hugeScore')
const timeScore = document.querySelector('.time')
startButton.addEventListener('click', () => {
	startGame()
})


// const sleep = ms => new Promise(r => setTimeout(r, ms));
// async function slow_type(text, placeholder, time=100) {
// 	placeholder.innerHTML = ''
// 	for (var i = 0; i < text.length; i++) {
// 		await sleep(time)
// 		placeholder.innerHTML = ''.concat(placeholder.innerHTML, text[i])
// 	}
// }
