// DOM ELEMENTS
const ticketsSection = document.querySelector('#tickets');
const numbersSection = document.querySelector('#numbers');

const addTicketBtn = document.querySelector('#add-ticket-btn');
const startDrawBtn = document.querySelector('#start-draw-btn');
const playAgainBtn = document.querySelector('#play-again-btn');

const numbersDrawnHeadlineText = document.querySelector('#numbers-drawn-headline');
const ticketsHeadlineText = document.querySelector('#tickets-headline');

// DEFAULT SETTINGS
const numbersFrom = 1;
const numbersTo = 30;
const numbersToDrawCount = 12;
const maxNumbersPerTicket = 5;
const requiredNumberOfTickets = 5;
const newNumberDrawDelayMiliSecs = 2000;

const numbers = [];
const allTickets = [];
let ticket = [];

displayGameElements();

let numberElements = numbersSection.querySelectorAll('span');

numberElements.forEach(elem => {
    elem.addEventListener('click', e => {
        let selected = e.target;
        selected.classList.add('js-selected');

        let numericValue = Number(selected.textContent);
        ticket.push(numericValue);
        
        limitReachedChecker();
    });
});

function displayGameElements() {
    for (let i = numbersFrom; i <= numbersTo; i++) {
        numbersSection.innerHTML += `
            <span>${i}</span>
        `;
        numbers.push(i);
    }
    ticketsHeadlineText.style.display = 'none';
}

function limitReachedChecker() {
    if (ticket.length === maxNumbersPerTicket) {
        numbersSection.style.pointerEvents = 'none';
    }

    if (allTickets.length === requiredNumberOfTickets) {
        numbersSection.style.pointerEvents = 'none';
        startDrawBtn.style.display = 'block';
        addTicketBtn.style.display = 'none';
    }
}

addTicketBtn.addEventListener('click', addTicket);

function addTicket() {
    if (ticket.length === 0) {
        return;
    }

    let ticketElem = document.createElement('div');
    const betAmountElem = document.querySelector('#bet-amount');

    ticketElem.classList.add('ticket', 'numbs');
    ticketElem.setAttribute('data-bet-amount', betAmountElem.value);

    // SET BET ODDS
    if (ticket.length === 1) {
        ticketElem.setAttribute('data-bet-odds', 2);
    }
    if (ticket.length === 2) {
        ticketElem.setAttribute('data-bet-odds', 5);
    }
    if (ticket.length === 3) {
        ticketElem.setAttribute('data-bet-odds', 10);
    }
    if (ticket.length === 4) {
        ticketElem.setAttribute('data-bet-odds', 50);
    }
    if (ticket.length === 5) {
        ticketElem.setAttribute('data-bet-odds', 100);
    }

    if (betAmountElem.value < 10 || betAmountElem.value > 100) {
        betAmountElem.style.borderColor = 'crimson';
        return;
    }

    betAmountElem.style.borderColor = 'var(--theme-color)';

    ticket.forEach(num => {
        ticketElem.innerHTML += `
            <span>${num}</span>
        `; 
    });

    ticketsSection.appendChild(ticketElem);
    allTickets.push(ticket);
    ticket = [];

    ticketsHeadlineText.style.display = 'block';

    numberElements.forEach(elem => {
        elem.classList.remove('js-selected');
    }); 

    numbersSection.style.pointerEvents = 'auto';

    limitReachedChecker();

    totalCreditsUpdate(betAmountElem.value);
}

startDrawBtn.addEventListener('click', startDraw);

const drawnNumbers = [];

function startDraw() {
    const numbersDrawnSection = document.querySelector('#numbers-drawn');

    drawRandomNumbers(numbersToDrawCount);

    displayDrawnNumbersDelay([0, numbersToDrawCount], newNumberDrawDelayMiliSecs, (i) => {
        numbersDrawnSection.innerHTML += `
            <span>${drawnNumbers[i]}</span>
        `;
    });

    setTimeout(() => {
        numbersDrawnHeadlineText.textContent = 'Numbers Drawn:';
        checkStatus();

    }, newNumberDrawDelayMiliSecs * numbersToDrawCount);
}

function displayDrawnNumbersDelay(range, delay, callback){
    numbersDrawnHeadlineText.textContent = 'Draw in progress...';

    let i = range[0];                
    callback(i);
    Loop();
    function Loop(){
        setTimeout(() => {
            i++;
            if (i < range[1]){
                callback(i);
                Loop();
            }
        }, delay);
    }
    
    startDrawBtn.style.display = 'none';
}

function drawRandomNumbers(n) {
    if (n <= 0) {
        return;
    }

    let randomIndex = Math.floor(Math.random() * numbers.length);
    let newDrawnNumb = numbers.splice(randomIndex, 1);    

    drawnNumbers.push(newDrawnNumb[0]);

    drawRandomNumbers(n - 1);
}

let winLostStatus = [];

function checkStatus() {
    allTickets.forEach(ticket => {
        for (let i = 0; i < ticket.length; i++) {
            if (drawnNumbers.indexOf(ticket[i]) === -1) {
                winLostStatus.push('lost');
                return;
            }
        }
        winLostStatus.push('won');
        return;
    });

    styleWinLostTickets();
    displayBettingResults();

    startDrawBtn.style.display = 'none';
    playAgainBtn.style.display = 'block';
}

function styleWinLostTickets() {
    const ticketsPlayed = ticketsSection.querySelectorAll('.ticket');

    for (let i = 0; i < ticketsPlayed.length; i++) {
        if (winLostStatus[i] === 'won') {
            ticketsPlayed[i].classList.add('js-won');
        }
        else {
            ticketsPlayed[i].classList.add('js-lost');
        }
    }
}

function displayBettingResults() {
    let betInfo = [];
    const bettingResultText = document.querySelector('#betting-results');

    ticketsSection.querySelectorAll('.ticket').forEach(ticket => {
        if (ticket.classList.contains('js-won')) {
            betInfo.push([ticket.dataset.betOdds, ticket.dataset.betAmount]);
        }
    });

    betInfo.forEach(bet => {
        bettingResultText.innerHTML += `
            <h3>You won ${bet[0]} &times; ${bet[1]} &equals; ${bet[0] * bet[1]} credits!</h3>
        `;
    });
}

function totalCreditsUpdate(bettingAmount) {
    const currentCreditsText = document.querySelector('#current-credits');
    let currentTotalCredits = Number(currentCreditsText.textContent);

    currentCreditsText.innerHTML = `
        ${currentTotalCredits - bettingAmount}
    `;
}

playAgainBtn.addEventListener('click', () => {
    location.reload();
});