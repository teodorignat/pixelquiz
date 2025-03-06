// Variables

const gameContainer = document.getElementById('game-container');
const audio1 = document.getElementById('song1'); 
const audio2 = document.getElementById('song2'); 
const audio3 = document.getElementById('song3'); 


// State
const state = {
    api_url: 'https://opentdb.com/api.php?',
    difficulty: 'Any',
    coins: 0,
    questions: [],
    qIndex: 0
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
    div.innerHTML = `<div class="status difficulty pixel-corners">
                <i class="fa-solid fa-hat-wizard"></i>
                <p>${state.difficulty}</p>
            </div>
            <div class="status coins pixel-corners">
                <i class="fa-solid fa-diamond"></i>
                <p>${state.coins}</p>
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
            state.difficulty = btn.textContent;
            updateUI();
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

    return gameContainer.appendChild(div);
}

function returnToMenu() {
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
        
        if (correctAnswer === e.target.textContent) {
            e.target.classList.add('correct')
            ++state.qIndex;       
            addCoins(state.questions[state.qIndex].difficulty);     
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

        if (state.qIndex === state.questions.length - 1) {
            setTimeout(() => {
                playGame(state.difficulty.toLowerCase())
            }, 1500)
        } else {
            setTimeout(() => {
                clearUI('menu');
                loadQuestion(state.questions, state.qIndex);
            }, 2000)
        }


    }
}

function addCoins() {
    const currentQuestion = state.questions[state.qIndex]
    if (currentQuestion.difficulty === 'hard') {
        state.coins += 125;
    } else if (currentQuestion.difficulty === 'medium') {
        state.coins += 100;
    } else {
        state.coins += 50;
    }
    updateUI();
}

async function playGame(difficulty) {
    
    if (state.questions.length) {
        clearUI('menu');
        return loadQuestion(state.questions, state.qIndex);
    } else {
        const quizData = await getQuiz(difficulty);
        clearUI('menu');
        
        console.log(quizData);
        if (quizData.response_code === 0) {
            state.questions = quizData.results
            state.qIndex = 0;
            return loadQuestion(state.questions, state.qIndex)
        }
    }
}

async function getQuiz(difficulty) {
    let endpoint = 'amount=50&';

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

function updateUI() {
    const userUI = document.querySelector('.user-ui');
    const difficulty = userUI.querySelector('.difficulty p');
    const coins = userUI.querySelector('.coins p');

    difficulty.textContent = state.difficulty;
    coins.textContent = state.coins;

}

function init() {
    document.addEventListener('DOMContentLoaded', loadStart)
}

init();