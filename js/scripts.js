
(function() {

    // DOM handles
    const appStartScreen = document.querySelector('#app-start');
    const appMainScreen = document.querySelector('#app-main');
    const appEndScreen = document.querySelector('#app-end');

    const scoreText = document.querySelector('#score');
    const wordText = document.querySelector('#word');
    const finalScoreText = document.querySelector('#final-score');

    const appStartButton = document.querySelector('#start-app-btn');
    const newWordBtn = document.querySelector('#new-word');
    const oldWordBtn = document.querySelector('#old-word');
    const restartBtn = document.querySelector('#restart-game');

    // Global instance access point
    let game;

    // Make choice and update UI
    const makeMove = function(choice) {

        const currentWord = wordText.textContent;
        let randomWord = game.getRandomWord();

        // Prevent Duplicate Word
        while (randomWord === currentWord) {
            randomWord = game.getRandomWord();
        }

        if (
            (choice === 'new' && game.isNewWord(currentWord)) || 
            (choice === 'old' && game.isDuplicateWord(currentWord))
        ) {
            let score = game.incrementScorebyAmount(1);
            game.updateElementTextContent(scoreText, score);
        } else {
            game.reduceLivesByAmount(1);
            game.removeLifeElement();
        }

        if (game.getLives() === 0) {
            const score = game.getScore();
            game.updateElementTextContent(finalScoreText, score);
            game.resetGame();
        }

        game.addUsedWord(currentWord);
        game.updateElementTextContent(wordText, randomWord);

    };

    // Bind event listeners to action buttons
    [oldWordBtn, newWordBtn].forEach(element => {
        element.addEventListener('click', evt => {
            evt.preventDefault();
            let choice = evt.target.dataset.choice;
            makeMove(choice);
        });
    });

    // Fade in game section and begin game
    appStartButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        animations.fadeFromThento(appStartScreen, appMainScreen, 3, 'block', function() {
            game = memoryGame();
            game.init(true);
        });
    });

    // Restart game
    restartBtn.addEventListener('click', function(evt) {
        evt.preventDefault();
        animations.fadeFromThento(appEndScreen, appStartScreen, 3, 'flex', function() {
            game = null;
        });
    }); 

    // Small visual effects
    const animations = {

        // Fadeout an element then remove it from the document flow
        // Speed should be between 1-10.
        fadeOut: function(el, speed = 10, callback) {
            const styles = window.getComputedStyle(el);
            let opacity = parseFloat(styles.getPropertyValue('opacity'));
            let counter = 1;

            if (speed < 0) speed = 1;
            if (speed > 10) speed = 10;

            while (opacity > 0) {

                opacity = Math.round((opacity - 0.01) * 100) / 100

                const timeoutHandle = setTimeout((opac) => {

                    el.style['opacity'] = opac;

                    if (opac <= 0) {
                        el.style['display'] = 'none';
                        clearTimeout(timeoutHandle);

                        // Execute a callback function if provided when fadeout is complete
                        if (callback) {
                            callback();
                        }
                    }

                }, (counter * speed), opacity);

                // Increase iteration counter used to scale fadeout speed
                counter++;
            }
        },

        // Fadein an element and set its display
        // Speed should be between 1-10.
        fadeIn: function(el, speed, display, callback) {

            let opacity = 0;
            let counter = 1;

            if (speed < 0) speed = 1;
            if (speed > 10) speed = 10;

            el.style['opacity'] = 0;
            el.style['display'] = display;

            while (opacity < 1) {

                opacity = Math.round((opacity + 0.01) * 100) / 100;

                const timeoutHandle = setTimeout((opac) => {

                    el.style['opacity'] = opac;

                    if (opac >= 1) {
                        clearTimeout(timeoutHandle);

                        // Execute a callback function if provided when fadeout is complete
                        if (callback) {
                            callback();
                        }
                    }

                }, (counter * speed), opacity);

                // Increase iteration counter used to scale fadeout speed
                counter++;
            }
        },

        // Fade an element in and out with a given display property
        // Speed 1-10
        // Execute callback if provided
        fadeFromThento: function (startingElement, endElement, speed, display, cb) {
            animations.fadeOut(startingElement, speed, function() {
                animations.fadeIn(endElement, speed, display, function() {
                    if (cb) cb();
                });
            });
        }
        
    }

    // Game Module
    function memoryGame() {

        // Shuffle from list of 110 words and pick the first 20
        const words = shuffle(wordList).splice(0, 20);
        
        let score;
        let lives;
        let usedWordCount = {};

        const init = function(newGame = false) {
            let word;
            score = 0;
            lives = 3;

            if (newGame) {
                word = getRandomWord();
            }

            // Create heart elements
            createLifeElements(3);

            updateElementTextContent(scoreText, score);
            updateElementTextContent(wordText, word);
        }

        const resetGame = function() {
            // Reinitialise game
            animations.fadeFromThento(appMainScreen, appEndScreen, 3, 'flex', init);
        }

        const addUsedWord = function(word) {
            if (usedWordCount.hasOwnProperty(word)) {
                usedWordCount[word]++;
            } else {
                usedWordCount[word] = 1;
            }
        }

        const createLifeElements = function(amount) {
            if (amount <= 0) return;
            const container = document.querySelector('.lives');
            if (container.querySelectorAll('.heart').length > 0) {
                container.innerHTML = "";
            }
            for (let i = 0; i < amount; i++) {
                const life = document.createElement('div');
                life.classList.add('heart');
                container.appendChild(life);
            }
        }
        const removeLifeElement = function() {
            let lives = document.querySelectorAll('.heart');
            if (lives.length > 0) {
                lives[lives.length-1].remove();
            }
        }

        const isDuplicateWord = function(word) {
            return usedWordCount[word];
        }

        const isNewWord = function(word) {
            return !usedWordCount[word];
        }

        const getRandomWord = function() {
            const len = words.length-1;
            const randIndex = getRandomNumberBetween(0, len);
            return words[randIndex].toLowerCase();
        }

        const getRandomNumberBetween = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        // Used for modifying an element to change its inner text content (Score or word)
        const updateElementTextContent = function(element, word) {
            element.textContent = word;
        }

        const getLives = function() {
            return lives;
        }

        const reduceLivesByAmount = function(n) {
            return lives -= n;
        }

        const getScore = function() {
            return score;
        }

        const incrementScorebyAmount = function(n) {
            return score += n;
        }

        return {
            init: init,
            resetGame: resetGame,
            getRandomWord: getRandomWord,
            createLifeElements: createLifeElements,
            removeLifeElement: removeLifeElement,
            addUsedWord: addUsedWord,
            isDuplicateWord: isDuplicateWord,
            isNewWord: isNewWord,
            updateElementTextContent: updateElementTextContent,
            getLives: getLives,
            reduceLivesByAmount: reduceLivesByAmount,
            getScore: getScore,
            incrementScorebyAmount, incrementScorebyAmount
        }

    }

    // Shuffles and returns new array
    function shuffle(arr) {
        const clone = [...arr];
        let current = arr.length;
        let random,
            temp;

        while (current !== 0) {

            random = Math.floor(Math.random() * current);
            current--;
    
            temp = clone[current];
            clone[current] = clone[random];
            clone[random] = temp;
        }

        return clone;
    }

}());