import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js';
import { UI } from './ui.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.speed = 0;
            this.maxSpeed = 3;
            this.groundMargin = 80;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = []; 
            this.maxParticles = 50;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.score = 0;
            this.debug = false;
            this.fontColour = 'black';
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }
        update(deltaTime){
            this.background.update();
            this.player.update(this.input.keys, deltaTime);
            // enemies
            if( this.enemyTimer > this.enemyInterval ){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach( enemy => {
                enemy.update(deltaTime);
                if( enemy.markedForDeletion ) this.enemies.splice(this.enemies.indexOf(enemy), 1);
            });
            // particles
            this.particles.forEach( (particle, idx) => {
                particle.update();
                if( particle.markedForDeletion ) this.particles.splice(idx, 1);
            });
            if( this.particles.length > this.maxParticles ) this.particles.length = this.maxParticles;
            // collision sprites
            this.collisions.forEach( (collision, idx) => {
                collision.update(deltaTime );
                if( collision.markedForDeletion ) this.collisions.splice(idx, 1);
            });

        }
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach( enemy => {
                enemy.draw(context);
            });
            this.UI.draw(context);
            this.particles.forEach( particle => {
                particle.draw(context);
            });
            this.collisions.forEach( collision => {
                collision.draw(context);
            });
        }
        addEnemy(){
            if( this.speed > 0 && Math.random() < 0.5 ) this.enemies.push(new GroundEnemy(this))
            else if( this.speed > 0 ) this.enemies.push(new ClimbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));
        }
    }

    const game = new Game(canvas.width, canvas.height);

    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});