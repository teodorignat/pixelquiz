// Variables

const gameContainer = document.getElementById('game-container');
let timeoutId;
let timerInterval;


// State
const state = {
    api_url: 'https://opentdb.com/api.php?',
    difficulty: 'Any',
    oldDifficulty: 'any',
    coins: 0,
    questions: [],
    qIndex: 0,
    rankLevel: ['Brain Sprout', 'Info Collector', 'Mind Sculptor', 'Truth Hunter', 'Wisdom Seeker', 'Knowledge Master', 'Quiz Genius','Master of Minds'],
    user: {
        rankIndex: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0
    },
    game: {
        timer: 30,
        correctA: 0,
        totalQ: 10,
        coins: 0
    }
}

function loadStart() {
    const div = document.createElement('div');
    div.classList.add('game-menu','start');
    div.innerHTML = ` <div class="game-title pixel-corners">
                <h1>Pixel Quiz</h1>
            </div>
            <div class="controls">
                <button class="btn start-btn pixel-corners ">START</button>
            </div>`;

    div.querySelector('.start-btn').addEventListener('click', () => {
        playBgSong('song1');
        playSound('effect');
        loadUI();
        loadMenu();
    })
    
    return gameContainer.appendChild(div);
}

function loadUI() {
    const div = document.createElement('div');
    div.classList.add('user-ui');
    div.innerHTML = `<div class="status-row">
                <div class="status difficulty pixel-corners">
                    <i class="fa-solid fa-hat-wizard"></i>
                    <p>${state.difficulty}</p>
                </div>
                <div class="status coins pixel-corners">
                    <i class="fa-solid fa-diamond"></i>
                    <p>${state.coins}</p>
                </div>
            </div>
            <div class="status-row">
                <div class="status level pixel-corners">
                    <i class="fa-solid fa-trophy"></i>
                    <p>${state.rankLevel[state.user.rankIndex]}</p>
                </div>
            </div>`;


    return gameContainer.appendChild(div);
}

function loadMenu() {
    const div = document.createElement('div');
    div.classList.add('game-menu','menu');
    div.innerHTML = `<div class="title-container">
                <div class="game-title pixel-corners">
                    <h1>Pixel Quiz</h1>
                </div>
            </div>
            <div class="title pixel-corners">
                <h1>Menu</h1>
            </div>
            <div class="controls">
                <button class="btn play-btn pixel-corners ">Play</button>
                <button class="btn diff-btn pixel-corners ">Difficulty</button>
                <button class="btn shop-btn pixel-corners ">Shop</button>
            </div>`;


    div.querySelector('.play-btn').addEventListener('click', () => {
        playGame(state.difficulty.toLowerCase());
        stopSound('song1');
        playBgSong('song2');
    });

    div.querySelector('.diff-btn').addEventListener('click', loadDifficulties);

    div.querySelector('.game-title').style.animation = 'float 3000ms infinite linear'


    addHoverSound(div);
    clearUI('menu');

    return gameContainer.appendChild(div);
}


function loadDifficulties() {
    const div = document.createElement('div');
    div.classList.add('game-menu', 'menu');
    div.innerHTML = `<div class="title-container">
                <div class="game-title pixel-corners">
                    <h1>Pixel Quiz</h1>
                </div>
            </div>
            <div class="title pixel-corners">
                <h1>Set Difficulty</h1>
            </div>
            <div class="controls">
                <button class="btn pixel-corners ">Any</button>
                <button class="btn pixel-corners ">Easy</button>
                <button class="btn pixel-corners ">Medium</button>
                <button class="btn pixel-corners ">Hard</button>
            </div>`;

            div.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.oldDifficulty = state.difficulty.toLowerCase();
                    state.difficulty = btn.textContent;
                    updateUI('status');
                    loadMenu();
                })
            })
            

            
    clearUI('menu');
    addHoverSound(div);

    return gameContainer.appendChild(div);
}

async function loadQuestion(results, index) {
    const div = document.createElement('div');
    let answers = [];
    answers.push(results[index].correct_answer);
    answers.push(...results[index].incorrect_answers);
    answers = shuffle(answers);
    div.classList.add('game-menu','game');
    div.innerHTML = `<div class="question-box">
    <div class="title category pixel-corners">
    <h2>${results[index].category}</h2>
    </div>
    <div class="title question pixel-corners">
    <h1>${results[index].question}</h1>
    </div>
    <div class="game-state">
    <div class="title timer pixel-corners">
    <p>${state.game.timer}s</p>
    </div>
    <div class="title currentQ pixel-corners">
    <p>${state.qIndex + 1}</p>
    </div>
    <div class="title score pixel-corners">
    <p>${state.game.correctA}/${state.game.totalQ}</p>
    </div>
    </div>

    </div>
    <div class="controls grid">
    ${answers.map(answer => {
        return `<button class="btn answer-btn pixel-corners ">${answer}</button>`
    }).join('')}
    </div>
    <button class="btn return-btn pixel-corners">Return to menu</button>`;
    
    div.querySelector('.return-btn').addEventListener('click', () => {
        stopSound('song2');
        playBgSong('song1');
        returnToMenu();
    });
    div.querySelector('.controls').addEventListener('click', checkAnswer);
    
    setTimer(state.game.timer);
    
    return gameContainer.appendChild(div);
}

function loadResults() {
    updateRank();

    const div = document.createElement('div');
    div.classList.add('game-menu','menu');
    div.innerHTML = ` <div class="results-box pixel-corners">
                <div class="title results pixel-corners">
                    <h1>Results</h1>
                </div>
                <div class="game-stats pixel-corners">
                    <div class="stats-box rank pixel-corners">
                        <h2>Rank</h2>
                        <p>${state.rankLevel[state.user.rankIndex]}</p>
                    </div>
                    <div class="stats-box">
                        <h2>CORRECT</h2>
                        <p>${state.game.correctA}</p>
                    </div>
                    <div class="stats-box">
                        <h2>TOTAL</h2>
                        <p>${state.game.totalQ}</p>
                    </div>
                    <div class="stats-box">
                        <h2>DIAMONDS</h2>
                        <p>${state.game.coins}</p>
                    </div>
                </div>
                <div class="controls">
                    <button class="btn menu-btn play-btn pixel-corners ">Play again</button>
                </div>
            </div>
            <div class="controls">
                <button class="btn return-btn pixel-corners">Return to menu</button>
            </div>
        </div>`;


    div.querySelector('.play-btn').addEventListener('click', () => {
        playGame(state.difficulty.toLowerCase());
        stopSound('song1');
        playBgSong('song2');
    });

    div.querySelector('.return-btn').addEventListener('click', () => {
        stopSound('song2');
        playBgSong('song1');
        returnToMenu();
    });

    return gameContainer.appendChild(div);
}

function setTimer(s) {
    timerInterval = setInterval(() => {
        state.game.timer--;
        const timer = gameContainer.querySelector('.timer');
        timer.querySelector('p').textContent = state.game.timer + 's';
        
        if (state.game.timer === 10) {
            timer.style.backgroundColor = 'var(--red-color)';
            playSound('ticking');
        }
        
        if (state.game.timer === 0) {
            stopSound('ticking');
            ++state.qIndex;
            state.game.timer = s;
            clearInterval(timerInterval);
            clearUI('menu');
            loadQuestion(state.questions,state.qIndex)
        }
    }, 1000)
}


function returnToMenu() {
    if (timeoutId !== undefined) {
        clearInterval(timeoutId);
    }
    ++state.qIndex;
    clearInterval(timerInterval);
    stopSound('ticking');

    return loadMenu();
}

function shuffle(array){
    //   set the index to the arrays length
      let i = array.length, j, temp;
    //   create a loop that subtracts everytime it iterates through
      while (--i > 0) {
    //  create a random number and store it in a variable
      j = Math.floor(Math.random () * (i+1));
    // create a temporary position from the item of the random number    
      temp = array[j];
    // swap the temp with the position of the last item in the array    
      array[j] = array[i];
    // swap the last item with the position of the random number 
      array[i] = temp;
      }
    // return[execute] the array when it completes::don't really need the console.log but helps to check
      return array;
    }

async function checkAnswer(e) {
    if (e.target.nodeName.toLowerCase() === 'button') {
        const correctAnswer = state.questions[state.qIndex].correct_answer
        
        e.currentTarget.removeEventListener('click', checkAnswer)
        stopSound('ticking');
        clearInterval(timerInterval);
        
        if (correctAnswer === e.target.textContent) {
            addCoins();  
            ++state.qIndex;       
            ++state.game.correctA;
            e.target.classList.add('correct')
            updateUI('game');
            playSound('correct');            
            
        } else {
            e.target.classList.add('incorrect');
            const answers = e.currentTarget.querySelectorAll('button');
            answers.forEach(button => {
                if (button.textContent === correctAnswer) {
                    button.classList.add('correct');
                }
            })
            ++state.qIndex;   
            playSound('incorrect');
        }

        if (state.qIndex > state.game.totalQ - 1) {
            setTimeout(() => {
                clearUI('menu');
                loadResults();
            }, 1500)
        } else {
            timeoutId = setTimeout(() => {
                clearUI('menu');
                state.game.timer = 30;
                loadQuestion(state.questions, state.qIndex);
            }, 2000)
        }
        
        
    }
}

function addCoins() {
    const currentQuestion = state.questions[state.qIndex]
    if (currentQuestion.difficulty === 'hard') {
        state.coins += 135;
        state.game.coins += 135;
    } else if (currentQuestion.difficulty === 'medium') {
        state.coins += 100;
        state.game.coins += 100;
    } else {
        state.coins += 50;
        state.game.coins += 50;
    }
    updateUI('status');
}

function updateRank() {
    if (state.game.correctA >= 3) {
        ++state.user.consecutiveWins;
        state.user.consecutiveLosses = 0;
        if (state.user.consecutiveWins === 3 && state.user.rankIndex < state.rankLevel.length - 1) {
            state.user.rankIndex++;
            state.user.consecutiveWins = 0;
            updateUI('status');
        }
        
    } else {
        ++state.user.consecutiveLosses;
        state.user.consecutiveWins = 0;
        if (state.user.consecutiveLosses === 3 && state.user.rankIndex > 0) {
            state.user.rankIndex--;
            state.user.consecutiveLosses = 0;
            updateUI('status');
        }
    }
}

async function playGame(difficulty) {
    if (state.questions.length && difficulty === state.oldDifficulty && state.questions[state.qIndex]) {
        clearUI('menu');
        return loadQuestion(state.questions, state.qIndex);
    } else {
        const quizData = await getQuiz(difficulty);
        clearUI('menu');
        
        console.log(quizData);
        if (quizData.response_code === 0) {
            state.questions = quizData.results
            state.qIndex = 0;
            state.game.timer = 30;
            state.game.correctA = 0;
            state.game.coins = 0;
            state.oldDifficulty = state.difficulty.toLowerCase();
            return loadQuestion(state.questions, state.qIndex)
        }
    }
}

async function getQuiz(difficulty) {
    let endpoint = 'amount=10&';

    if (difficulty !== 'any') {
        endpoint += `difficulty=${difficulty}`
    } 

    const response = await fetch(state.api_url + endpoint);
    const data = await response.json();

    // console.log(data);

    return data;
}

function playBgSong(song) {
    const audio = document.getElementById(`${song}`)
    audio.loop = true;
    audio.volume = 0.75;
    audio.play();
}

function addHoverSound(div) {
   return div.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseover', () => {
            playSound('effect');
        }); 
        btn.addEventListener('mouseout', () => {
            stopSound('effect');
        });
        btn.addEventListener('click', () => {
            playSound('effect');
        });
    })
}

function playSound(sound) {
    const audio = document.getElementById(`${sound}`)
    audio.play();
}

function stopSound(sound) {
    const audio = document.getElementById(`${sound}`)
    audio.pause()
    audio.currentTime = 0;
}

function clearUI(type) {
    if (type === 'menu') {
        gameContainer.querySelector('.game-menu').remove();
    }
}

function updateUI(type) {
    if (type === 'status') {
        const userUI = document.querySelector('.user-ui');
        const difficulty = userUI.querySelector('.difficulty p');
        const coins = userUI.querySelector('.coins p');
        const rank = userUI.querySelector('.status.level p');
    
        difficulty.textContent = state.difficulty;
        coins.textContent = state.coins;
        rank.textContent = state.rankLevel[state.user.rankIndex];
    } else {
        const score = gameContainer.querySelector('.score p');
        
        score.textContent = `${state.game.correctA}/${state.game.totalQ}`
    }

}

function init() {
    document.addEventListener('DOMContentLoaded', loadStart);
}

init();