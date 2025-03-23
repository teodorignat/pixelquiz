// Variables

const gameContainer = document.getElementById('game-container');
const root = document.querySelector(':root');


let timeoutId;
let timerInterval;


// State

let state = {
    api_url: 'https://the-trivia-api.com/v2/questions?',
    difficulty: ['easy', 'medium', 'hard'],
    coins: 0,
    questions: [],
    qIndex: 0,
    selectAll: true,
    categories: [
        {name:"music", checked: true}, 
        {name: "sport_and_leisure", checked: true},
        {name: "film_and_tv", checked: true},
        {name: "arts_and_literature", checked: true},
        {name: "history", checked: true},
        {name: "society_and_culture", checked: true},
        {name: "science", checked: true},
        {name: "geography", checked: true},
        {name: "food_and_drink", checked: true},
        {name: "general_knowledge", checked: true}
    ],
    rankLevel: [
        {name: 'Brain Sprout', bgPath: 'img/pixelbg.png'},
        {name: 'Info Collector', bgPath: 'img/pixelbg2.jpg'},
        {name: 'Mind Sculptor', bgPath: 'img/pixelbg3.jpg'},
        {name: 'Knowledge Seeker', bgPath: 'img/pixelbg4.jpg'},
        {name: 'Truth Hunter', bgPath: 'img/pixelbg5.jpg'},
        {name: 'Quiz Master', bgPath: 'img/pixelbg6.jpg'},
        {name: 'Wisdom Seeker', bgPath: 'img/pixelbg7.jpg'},
        {name: 'Quiz Genius', bgPath: 'img/pixelbg8.jpg'},
        {name: 'Knowledge Master', bgPath: 'img/pixelbg9.jpg'},
        {name: 'Master of Minds', bgPath: 'img/pixelbg10.jpg'},
    ],
    user: {
        rankIndex: 5,
        rankUp: false,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        gameHistory: []
    },
    game: {
        timer: 30,
        correctA: 0,
        totalQ: 10,
        coins: 0
    }
}

 // Functions

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
        playBgSong('bgsong');
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
                <div class="status coins pixel-corners">
                    <i class="fa-solid fa-diamond"></i>
                    <p>${state.coins}</p>
                </div>
            </div>
            <div class="status-row">
                <div class="status level pixel-corners">
                    <i class="fa-solid fa-trophy"></i>
                    <p class="index">${state.user.rankIndex + 1}</p>
                    <p class="rank-level">${state.rankLevel[state.user.rankIndex].name}</p>
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
                ${state.questions.length && state.qIndex <= state.game.totalQ - 1 ? '<button class="btn continue-btn pixel-corners ">Continue Game</button>' : ''}
                <button class="btn play-btn pixel-corners ">New Game</button>
                <button class="btn diff-btn pixel-corners ">Difficulty</button>
                <button class="btn cat-btn pixel-corners ">Subjects</button>
            </div>`;


    div.querySelector('.play-btn').addEventListener('click', () => {
        newGame();
        stopSound('bgsong');
        playBgSong('gamesong');
    });

    div.querySelector('.diff-btn').addEventListener('click', loadDifficulties);
    div.querySelector('.cat-btn').addEventListener('click', loadCategories);

    if (state.questions.length && state.qIndex <= state.game.totalQ -1) {
        div.querySelector('.continue-btn').addEventListener('click', () => {
            continueGame(state.questions, state.qIndex);
            stopSound('bgsong');
            playBgSong('gamesong');
        });
    }


    addHoverSound(div);
    clearUI('menu');

    return gameContainer.appendChild(div);
}

function loadDifficulties() {
    const div = document.createElement('div');
    div.classList.add('game-menu', 'menu');
    div.innerHTML = ` <div class="title pixel-corners">
                <h1>Set Difficulty</h1>
            </div>
            <div class="controls">
                <button class="btn radio-btn pixel-corners ">
                    <p>Easy</p>
                    <div class="radio pixel-corners"></div>
                </button>
                <button class="btn radio-btn pixel-corners ">
                    <p>Medium</p>
                    <div class="radio pixel-corners"></div>
                </button>
                <button class="btn radio-btn pixel-corners ">
                    <p>Hard</p>
                    <div class="radio pixel-corners"></div>
                </button>
                <button class="btn return-btn pixel-corners">Return to Menu</button>
            </div>`;

            div.querySelectorAll('.radio-btn').forEach(btn => {
                const difficulty = btn.querySelector('p').textContent.toLowerCase();
                btn.addEventListener('click', (e) => {
                    toggleDifficulty(difficulty, e)
                })
            })
            div.querySelector('.return-btn').addEventListener('click', () => {
                returnToMenu('menu');
            });
            
    checkDifficulties(div);
    clearUI('menu');
    addHoverSound(div);

    return gameContainer.appendChild(div);
}

function checkDifficulties(div) {
    const radioBtns = div.querySelectorAll('.radio-btn');

    if (!state.difficulty.length) {
        state.difficulty = ['easy', 'medium', 'hard'];
        updateStateStorage();
    }

    radioBtns.forEach(btn => {
        const difficulty = btn.querySelector('p').textContent.toLowerCase();
        const radio = btn.querySelector('.radio');
        if (state.difficulty.includes(difficulty)) {
            btn.querySelector('.radio').classList.add('checked');
            radio.appendChild(createCheckIcon());
        }
    })

}

function toggleDifficulty (difficulty, e) {
    const radio = e.currentTarget.querySelector('.radio');
    
    if (state.difficulty.includes(difficulty)) {
        state.difficulty = state.difficulty.filter(diff => diff !== difficulty);
        radio.classList.remove('checked');
        radio.querySelector('i').remove();
    } else {
        state.difficulty.push(difficulty);
        radio.classList.add('checked');
        radio.appendChild(createCheckIcon());
    }

    updateStateStorage();
}

function createCheckIcon() {
    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-check');
    return icon;
}

function loadCategories() {
    const div = document.createElement('div');
    div.classList.add('game-menu', 'menu');
    div.innerHTML = `<div class="title-container">
                <div class="title pixel-corners">
                    <h1>Set Subjects</h1>
                </div>
                <button class="btn select-btn pixel-corners ">Select All</button>
            </div>
            <div class="controls scroll">
                ${state.categories.map(category => {
                    return `<button class="btn radio-btn pixel-corners ">
                    <p>${category.name.replaceAll('_',' ').toUpperCase()}</p>
                    <div class="radio ${category.checked ? 'checked' : ''} pixel-corners">${category.checked ? "<i class='fa-solid fa-check'></i>" : ''}</div>`
                }).join('')}
                <button class="btn return-btn pixel-corners">Return to Menu</button>
            </div>`;

    div.querySelectorAll('.radio-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {toggleCategory(e)})
    });

    div.querySelector('.return-btn').addEventListener('click', () => {
        returnToMenu('menu');
    });

    div.querySelector('.select-btn').addEventListener('click', toggleSelectAll);

    clearUI('menu');
    addHoverSound(div);
    
    return gameContainer.appendChild(div);
}

function toggleCategory(e) {
    const category = e.currentTarget.querySelector('p').textContent.toLowerCase().replaceAll(' ','_');
    const radio = e.currentTarget.querySelector('.radio');
    
    if (state.categories.find(cat => cat.name === category).checked) {
        state.categories.find(cat => cat.name === category).checked = false;
        radio.classList.remove('checked');
        radio.querySelector('i').remove();
    } else {
        state.categories.find(cat => cat.name === category).checked = true;
        radio.classList.add('checked');
        radio.appendChild(createCheckIcon());
    }

    updateStateStorage();
}

function toggleSelectAll() {
    const radioBtns = document.querySelectorAll('.radio');

    if (state.selectAll) {
        state.categories.forEach(cat => cat.checked = false);
        radioBtns.forEach(radio => {
            if (radio.classList.contains('checked')) {
                radio.querySelector('i').remove();   
                radio.classList.remove('checked');
            }
        })
    } else {
        state.categories.forEach(cat => cat.checked = true);
        radioBtns.forEach(radio => {
            if (!radio.classList.contains('checked')) {
                radio.classList.add('checked');
                radio.appendChild(createCheckIcon());   
            }
        })
    }

    state.selectAll = !state.selectAll;
    updateStateStorage();

}

async function loadQuestion(results, index) {
    const div = document.createElement('div');
    let answers = [];
    answers.push(results[index].correctAnswer);
    answers.push(...results[index].incorrectAnswers);
    answers = shuffle(answers);
    div.classList.add('game-menu','game');
    div.innerHTML = `<div class="question-box">
    <div class="title category pixel-corners">
    <h2>${results[index].category.replaceAll('_',' ').toUpperCase()}</h2>
    </div>
    <div class="title question pixel-corners">
    <h1>${results[index].question.text}</h1>
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
        stopSound('gamesong');
        playBgSong('bgsong');
        returnToMenu('game');
    });
    div.querySelector('.controls').addEventListener('click', checkAnswer);
    
    setTimer(state.game.timer);
    clearUI('menu');

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
                    <div class="stats-box rank ${state.user.rankUp? 'rank-up' : ''} pixel-corners">
                        <h2>${state.user.rankUp ? 'Rank UP' : 'Rank' }</h2>
                        <p>${state.rankLevel[state.user.rankIndex].name}</p>
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
                    <div class="stats-box history pixel-corners">
                        <h2>PREVIOUS QUIZZES</h2>
                        <div class="prev-quiz">
                            ${state.user.gameHistory.map(result => {
                                if (result === 'W') {
                                    return `<p class="win">W</p>`
                                } else {
                                    return `<p class="lose">L</p>`
                                }
                            }).join('')}
                        </div>
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
        newGame();
        stopSound('bgsong');
        playBgSong('gamesong');
    });

    div.querySelector('.return-btn').addEventListener('click', () => {
        stopSound('gamesong');
        playBgSong('bgsong');
        returnToMenu('menu');
    });

    if (state.user.rankUp) {
        state.user.rankUp = false;
        updateStateStorage();
    }

    clearUI('menu');

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

            if (state.qIndex > state.game.totalQ - 1) {
                loadResults();
            } else {
                if (timeoutId !== undefined) {
                    clearInterval(timeoutId);
                }
                loadQuestion(state.questions,state.qIndex)
            }
        }
    }, 1000)

    updateStateStorage();
}


function returnToMenu(type) {
    if (type === 'game') {
        if (timeoutId !== undefined) {
            clearInterval(timeoutId);
        }
        ++state.qIndex;
        clearInterval(timerInterval);
        stopSound('ticking');
        updateStateStorage();
    }

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
        const correctAnswer = state.questions[state.qIndex].correctAnswer
        
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
        
        updateStateStorage();

        if (state.qIndex > state.game.totalQ - 1) {
            setTimeout(() => {
                loadResults();
            }, 1500)
        } else {
            timeoutId = setTimeout(() => {
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

    updateStateStorage();
    updateUI('status');
}

function updateRank() {
    if (state.game.correctA >= 7) {
        ++state.user.consecutiveWins;
        state.user.consecutiveLosses = 0;
        state.user.gameHistory.push('W');

        if (state.user.gameHistory.length > 3) {
            state.user.gameHistory.shift();
        }    
        
        if (state.user.consecutiveWins === 3 && state.user.rankIndex < state.rankLevel.length - 1) {
            state.user.rankIndex++;
            state.user.consecutiveWins = 0;
            state.user.rankUp = true;
            setBackGround(state.rankLevel[state.user.rankIndex].bgPath);
            updateUI('status');
        }
        
    } else {
        ++state.user.consecutiveLosses;
        state.user.consecutiveWins = 0;
        state.user.gameHistory.push('L');
        
        if (state.user.gameHistory.length > 3) {
            state.user.gameHistory.shift();
        }
        
        if (state.user.consecutiveLosses === 3 && state.user.rankIndex > 0) {
            state.user.rankIndex--;
            state.user.consecutiveLosses = 0;
            setBackGround(state.rankLevel[state.user.rankIndex].bgPath);
            updateUI('status');
        }
    }

    updateStateStorage();
}

function setBackGround(path) {
    const gameContainer = document.getElementById('game-container');

    return gameContainer.style.backgroundImage = `url(${path})`;
}

function continueGame(questions, index) {
    state.game.timer = 30;
    return loadQuestion(questions, index);
}


async function newGame() {
        const quizData = await getQuiz();
        
        console.log(quizData);
        state.questions = quizData;
        state.qIndex = 0;
        state.game.timer = 30;
        state.game.correctA = 0;
        state.game.coins = 0;
        return loadQuestion(state.questions, state.qIndex)
}

async function getQuiz() {
    let difficulties = `difficulties=${state.difficulty.length ? state.difficulty.join(',') : 'easy,medium,hard'}`;
    let categories = `&categories=${
        state.categories
            .filter(cat => cat.checked)
            .map(cat => cat.name)
            .join(',')
    }`

    if (categories.length === 12) {
        categories = '';
    }

    const response = await fetch(state.api_url + difficulties + categories);
    const data = await response.json();

    return data;
}

function getStateFromStorage() {
    let stateFromStorage;

    if (localStorage.getItem('state') === null) {
        stateFromStorage = {...state};
    } else { 
        stateFromStorage = JSON.parse(localStorage.getItem('state'));
    }

    return stateFromStorage;
}

function updateStateStorage() {
    let stateFromStorage = getStateFromStorage();

    stateFromStorage = state;
    
    return localStorage.setItem('state', JSON.stringify(stateFromStorage));
}

function playBgSong(song) {
    const audio = document.getElementById(`${song}`)
    audio.loop = true;
    audio.volume = 0.55;
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
        const coins = userUI.querySelector('.coins p');
        const rank = userUI.querySelector('.status.level .rank-level');
        const rankIndex = userUI.querySelector('.status.level .index');
    
        coins.textContent = state.coins;
        rank.textContent = state.rankLevel[state.user.rankIndex].name;
        rankIndex.textContent = state.user.rankIndex + 1;
    } else {
        const score = gameContainer.querySelector('.score p');
        
        score.textContent = `${state.game.correctA}/${state.game.totalQ}`
    }

}

function init() {
    state = {...getStateFromStorage()};
    setBackGround(state.rankLevel[state.user.rankIndex].bgPath);

    document.addEventListener('DOMContentLoaded', loadStart);
}

init();