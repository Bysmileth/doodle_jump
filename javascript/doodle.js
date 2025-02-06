class Model {
    static GRAVITY = 20;
    static JUMP_FORCE = 750;
    static SPEED = 200;

    constructor(canvasWidth, canvasHeight) {
        this._direction = 0;
        this._gravitySpeed = 0;
        this._position = { x: 225, y: 350 };

        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;

        this._speed_x = 0;
        this._lastTuile = 0;
        this._falling = false;

        this._score = 0;

        this._scrollSpeed = 0;

        this._plateformes = [];

        let i = 1;
        let coord;
        this._plateformes[0] = {"pos_x_min":193, "pos_x_max":250, "pos_y_min":580, "pos_y_max":600, "type":0};
        this._plateformes[1] = {"pos_x_min":0, "pos_x_max":0, "pos_y_min":0, "pos_y_max":0, "type":0};
        while(this._plateformes[i-1].pos_y_max > -500){
            this._plateformes[i] = {"pos_x_min":193, "pos_x_max":250, "pos_y_min":580, "pos_y_max":600, "type":0};

            coord = Math.floor(Math.random() * 397) + 10;
            this._plateformes[i].pos_x_min = coord;
            coord = Math.floor(Math.random() * 470) + 87;
            this._plateformes[i].pos_x_max = this._plateformes[i].pos_x_min + 57;

            coord = Math.floor(Math.random() * 80) + 20;
            this._plateformes[i].pos_y_min = this._plateformes[i-1].pos_y_min - coord;
            this._plateformes[i].pos_y_max = (this._plateformes[i-1].pos_y_min - coord) + 20;
            i++;
       }
    }

    GeneratePlat(tuile) {
        let i = this._plateformes.length;
        let coord;

        let ecart_gen = this._plateformes[tuile].pos_y_max - this._plateformes[this._lastTuile].pos_y_max;
        
        let pos_y_gen =  this._plateformes[this._plateformes.length - 1].pos_y_max + ecart_gen;
        
        while(this._plateformes[i-1].pos_y_max > pos_y_gen){
    
            let difficultyFactor = Math.min(1, this._score / 10000); // Facteur max à 1
            let probGreen = 0.6 - (difficultyFactor * 0.4);  // Moins de vert
            let probBlue = 0.3 + (difficultyFactor * 0.4);   // Plus de bleu
            let probWhite = 0.1 + (difficultyFactor * 0.2);  // Plus de blanc
        
            let randomChoice = Math.random();
        
            let tileType;
            if (randomChoice < probGreen) {
                tileType = 1; // verte
            } else if (randomChoice < probGreen + probBlue) {
                tileType = 19; // bleue
            } else {
                tileType = 55; // blanche
            }
        
            // augmentation de l'espacement entre les plateformes
            let minSpacing = 80 + (difficultyFactor * 120);
            let maxSpacing = 120 + (difficultyFactor * 150);
            let espacement = Math.floor(Math.random() * (maxSpacing - minSpacing) + minSpacing);
            
            this._plateformes[i] = {
                "pos_x_min": 0,
                "pos_x_max": 0, 
                "pos_y_min": 0,
                "pos_y_max": 0, 
                "type": tileType,
                "speed_x": tileType === 19 ? 2 : 0,
                "isFalling": false
            };

            //look for plateform for which type is 19 and set speed_x to 2
            for (let j = 0; j < this._plateformes.length; j++){
                if(this._plateformes[j].type === 19){
                    this._speed_x = 2;
                }
            }

            coord = Math.floor(Math.random() * 397) + 10;
            this._plateformes[i].pos_x_min = coord;
            coord = Math.floor(Math.random() * 470) + 87;
            this._plateformes[i].pos_x_max = this._plateformes[i].pos_x_min + 57;
            
            this._plateformes[i].pos_y_min = this._plateformes[i-1].pos_y_min - espacement;
            this._plateformes[i].pos_y_max = (this._plateformes[i-1].pos_y_min - espacement) + 20;

            i++;
        }

    }  

    get position() {
        return this._position;
    }

    get direction() {
        return this._direction;
    }

    set direction(value) {
        this._direction = value;
    }

    BindDisplay(callback) {
        this.b_Display = callback;
    }

    UpdatePlat(tuile) {
        
        if(!tuile){
            
            if (this._scrollSpeed > 0) {
                for (let i = 0; i < this._plateformes.length; i++) {
                    this._plateformes[i].pos_y_min += this._scrollSpeed;
                    this._plateformes[i].pos_y_max += this._scrollSpeed;
                }

                this._scrollSpeed *= 0.95; // Ralentissement progressif pour fluidité

                if (this._scrollSpeed < 0.1) {
                    this._scrollSpeed = 0; // Stopper le défilement une fois assez bas
                }
            }
        }else{

            if (this._plateformes[tuile].type === 55) {
                this._plateformes[tuile].isFalling = true;
            }
            
            let distance = 600 - this._plateformes[tuile].pos_y_max;
            if (distance > 5) {
                this.GeneratePlat(tuile);
                this._lastTuile = tuile;
                this._scrollSpeed = distance / 20;
            }
        }

    }

    Move(fps) {
        this._gravitySpeed += Model.GRAVITY;
        this._position.y += this._gravitySpeed / fps;
        this._position.x += this._direction * Model.SPEED / fps;

        for (let i = 0; i < this._plateformes.length; i++){

        // Si la plateforme est de type 19, la déplacer horizontalement
            if (this._plateformes[i].type === 19) {
                this._plateformes[i].pos_x_min += this._plateformes[i].speed_x;
                this._plateformes[i].pos_x_max += this._plateformes[i].speed_x;            

            // Vérifier si la plateforme touche les bords du canvas
                if (this._plateformes[i].pos_x_min <= 0 || this._plateformes[i].pos_x_max >= this._canvasWidth) {
                    this._plateformes[i].speed_x *= -1;  // Inverser la direction
                }
            }

            if (this._plateformes[i].isFalling == true) {
                this._plateformes[i].pos_y_min += 5;  // Ajuste la vitesse de chute ici
                this._plateformes[i].pos_y_max += 5;
            }

            if (this._gravitySpeed > 0 &&
                this._position.x + 50 > this._plateformes[i].pos_x_min &&
                this._position.x < this._plateformes[i].pos_x_max &&
                this._position.y + 50 > this._plateformes[i].pos_y_min &&
                this._position.y + 50 < this._plateformes[i].pos_y_max) {
                this._Jump();
                this.UpdatePlat(i);
            }
        }
        if(this._gravitySpeed < -750){
            this._gravitySpeed = -750;
        }

        //Pour plus de "fluidité", coordonnées - quelque chose pour faire genre
        if (this._position.y > this._canvasHeight - 40) {
            this._position.y = this._canvasHeight ;
            location.reload();
        } else if (this._position.x > this._canvasWidth - 20) {
            this._position.x = -20;
        } else if (this.position.x < -30) {
            this.position.x = 460;
        }

        this.UpdatePlat(null);
        
        // this.DeletePlat();

        this.b_Display(this._position, this._plateformes);
    }

    _Jump() {
        if(this._position.y < 530){
            let delta = 600 - (this._position.y+50);
            this._score += delta;
            document.getElementById('score').innerHTML = "Score : " + parseInt(this._score);
        }
        let dist = (this._position.y + 50) - 230;
        this._gravitySpeed = -(Model.JUMP_FORCE * dist)/350;
    }

    DeletePlat(){
        // for (let i = 0; i < this._plateformes.length; i++){
        //     if(this._plateformes[i].pos_y_max > 2000){
        //         this._plateformes.splice(i, 1);
        //     }
        // }
    }
}

class View {
    constructor() {
        this._canvas = document.getElementById('my_canvas');
        this.ctx = this._canvas.getContext('2d');
        this.backgroundImage = null;
        this.doodleImage = null;
        this.image_left = null;
        this.image_right = null;

        this._hold_right = false;
        this._hold_left = false;

        this._widthCell   = 57; // Largeur d'une cellule en pixel.
        this._heightCell  = 17; // Hauteur d'une cellule en pixel.

        this.Events();
    }

    BindSetDirection(callback) {
        this.b_SetDirection = callback;
    }

    SetBackgroundImage(image) {
        this.backgroundImage = image;
    }

    SetLeftImage(image) {
        this.image_left = image;
    }

    SetRightImage(image) {
        this.image_right = image;
    }

    SetDoodleDirection(direction) {
        this.currentDoodleImage = direction === "left" ? this.image_left : this.image_right;
    }

    SetTilesImage(image) {
        this.tilesImage = image;
    }



    Events() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key == 'ArrowLeft' || evt.key == 'ArrowRight') {
                switch (evt.key) {
                    case 'ArrowLeft':
                        this._hold_left = true;
                        this.b_SetDirection(-1);
                        this.SetDoodleDirection("left");
                        break;
                    case 'ArrowRight':
                        this._hold_right = true;
                        this.b_SetDirection(1);
                        this.SetDoodleDirection("right");
                        break;
                }
            }
        });

        document.addEventListener('keyup', (evt) => {
            switch (evt.key) {
                case 'ArrowLeft':
                    if (!this._hold_right) {
                        this.b_SetDirection(0);
                    }
                    this._hold_left = false;
                    break;
                case 'ArrowRight':
                    if (!this._hold_left) {
                        this.b_SetDirection(0);
                    }
                    this._hold_right = false;
                    break;
            }
        });
    }

    DisplayTiles(plateformes) {
        for (let i = 0; i < plateformes.length; i++){
            this.ctx.drawImage(this.tilesImage, 1, plateformes[i].type, this._widthCell, this._heightCell, plateformes[i].pos_x_min, plateformes[i].pos_y_min, this._widthCell, this._heightCell); //cellule verte
        }

    }
    
    Display(position, plateformes) {
        const x = position.x;
        const y = position.y;

        this.ctx.drawImage(this.backgroundImage, 0, 0, this._canvas.width, this._canvas.height);
        this.ctx.drawImage(this.currentDoodleImage, x, y, 50, 50);

        this.DisplayTiles(plateformes);
    }

    _loadImage(src) {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = src;
            image.onload = () => resolve(image);
        });
    }
}

class Controller {
    constructor(model, view, backgroundSrc, tilesSrc, doodleSrcLeft, doodleSrcRight) {
        this._model = model;
        this._view = view;

        this._startTime = Date.now();
        this._lag = 0;
        this._fps = 60; // Frame rate.
        this._frameDuration = 1000 / this._fps; // Durée d'une frame en millisecondes.

        this._model.BindDisplay(this.Display.bind(this));
        this._view.BindSetDirection(this.SetDirection.bind(this));
        
        //Charger les images en parallèle
        Promise.all([
            this._view._loadImage(backgroundSrc).then((image) => {
                this._view.SetBackgroundImage(image);
            }),
            this._view._loadImage(doodleSrcLeft).then((image) => {
                this._view.SetLeftImage(image);
            }),
            this._view._loadImage(tilesSrc).then((image) => {
                this._view.SetTilesImage(image);
            }),
            this._view._loadImage(doodleSrcRight).then((image) => {
                this._view.SetRightImage(image);
            })
        ]).then(() => {
            this._view.SetDoodleDirection("right");
            this.Update();
        });
    }

    Display(position, plateformes) {
        this._view.Display(position, plateformes);
    }

    SetDirection(newDirection) {
        this._model.direction = newDirection;
    }

    Update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this._startTime;

        this._lag += deltaTime;
        this._startTime = currentTime;

        while (this._lag >= this._frameDuration) {
            this._model.Move(this._fps);
            this._lag -= this._frameDuration;
        }

        requestAnimationFrame(this.Update.bind(this));
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvasWidth = 500;
    const canvasHeight = 700;
    const tilesSrc = './tiles/game-tiles.png';
    const backgroundSrc = './tiles/bck@2x.png'; // Image de fond
    const doodleSrc_right = './tiles/lik-right@2x.png'; // Image du joueur
    const doodleSrc_left = './tiles/lik-left@2x.png';
    new Controller(new Model(canvasWidth, canvasHeight), new View(), backgroundSrc, tilesSrc, doodleSrc_left, doodleSrc_right);
});