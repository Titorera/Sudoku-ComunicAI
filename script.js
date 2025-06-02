document.addEventListener('DOMContentLoaded', () => {
    // Elementos de las pantallas
    const playerInfoScreen = document.getElementById('player-info-screen');
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const gameScreen = document.getElementById('game-screen');
    const statsScreen = document.getElementById('stats-screen');

    // Elementos de Información del Jugador
    const playerNameInput = document.getElementById('playerName');
    const playerAgeInput = document.getElementById('playerAge');
    const continueToLevelSelectionBtn = document.getElementById('continueToLevelSelectionBtn');

    // Elementos de Selección de Nivel
    const animalLevelGrid = document.getElementById('animal-level-grid');

    // Elementos de la Pantalla de Juego
    const displayPlayerName = document.getElementById('displayPlayerName');
    const displayPlayerAge = document.getElementById('displayPlayerAge');
    const displayLevelName = document.getElementById('displayLevelName');
    const animalImageOnGameScreen = document.getElementById('animalImage');
    const boardElement = document.getElementById('sudoku-board');
    const validateBtn = document.getElementById('validateBtn');
    const solveBtn = document.getElementById('solveBtn');
    const backToLevelsBtn = document.getElementById('backToLevelsBtn');
    const messageArea = document.getElementById('messageArea');
    const displayVidasElement = document.getElementById('displayVidas');

    // Elementos de Animación
    const winLevelOverlay = document.getElementById('win-level-animation-overlay');
    const gameOverOverlay = document.getElementById('game-over-animation-overlay');

    // Elementos de Estadísticas
    const statsTriggerArea = document.getElementById('stats-trigger-area');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const statsPlayerInfoDiv = document.getElementById('stats-player-info');
    const statsSummaryDiv = document.getElementById('stats-summary');
    const statsAnalysisP = document.getElementById('stats-analysis');
    const restartGameFromStatsBtn = document.getElementById('restartGameFromStatsBtn');
    const backToMenuFromStatsBtn = document.getElementById('backToMenuFromStatsBtn');

    // Elementos de Audio
    const errorSound = document.getElementById('errorSound');
    const aciertoSound = document.getElementById('aciertoSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const victoriaSound = document.getElementById('victoriaSound');

    let currentPlayerName = '';
    let currentPlayerAge = '';
    let currentDifficultyKey = '';
    let currentPuzzle = [];
    let currentSolution = [];
    
    const MAX_VIDAS = 3;
    let vidasRestantes;
    let tableroDeshabilitado = false;

    let sessionStats; 
    let currentLevelStartTime;
    let currentLevelMistakes;

    const N = 9;
    const SRN = Math.sqrt(N);

    const animalThemes = {
        conejo:     { name: "Conejo",     image: "imagenes/conejo.png",     clues: 45, levelNum: 1 },
        ardilla:    { name: "Ardilla",    image: "imagenes/ardilla.png",    clues: 42, levelNum: 2 },
        perezoso:   { name: "Perezoso",   image: "imagenes/perezoso.png",   clues: 39, levelNum: 3 },
        perro:      { name: "Perro",      image: "imagenes/perro.png",      clues: 36, levelNum: 4 },
        mono:       { name: "Mono",       image: "imagenes/mono.png",       clues: 34, levelNum: 5 },
        lobo:       { name: "Lobo",       image: "imagenes/lobo.png",       clues: 32, levelNum: 6 },
        serpiente:  { name: "Serpiente",  image: "imagenes/serpiente.png",  clues: 30, levelNum: 7 },
        tigre:      { name: "Tigre",      image: "imagenes/tigre.png",      clues: 28, levelNum: 8 },
        hipopotamo: { name: "Hipopótamo", image: "imagenes/hipopotamo.png", clues: 26, levelNum: 9 },
        rinoceronte:{ name: "Rinoceronte",image: "imagenes/rinoceronte.png",clues: 24, levelNum: 10 },
        elefante:   { name: "Elefante",   image: "imagenes/elefante.png",   clues: 22, levelNum: 11 },
        leon:       { name: "León",       image: "imagenes/leon.png",       clues: 20, levelNum: 12 }
    };
    const levelKeys = Object.keys(animalThemes);

    // ----- VERIFICACIÓN INICIAL DE ELEMENTOS -----
    if (!playerInfoScreen) console.error("ERROR CRÍTICO: playerInfoScreen no encontrado.");
    if (!levelSelectionScreen) console.error("ERROR CRÍTICO: levelSelectionScreen no encontrado.");
    if (!gameScreen) console.error("ERROR CRÍTICO: gameScreen no encontrado.");
    if (!statsScreen) console.error("ERROR CRÍTICO: statsScreen no encontrado.");
    if (!playerNameInput) console.error("ERROR CRÍTICO: playerNameInput no encontrado.");
    if (!playerAgeInput) console.error("ERROR CRÍTICO: playerAgeInput no encontrado.");
    if (!animalLevelGrid) console.error("ERROR CRÍTICO: animalLevelGrid no encontrado.");


    function inicializarEstadisticasSesion() {
        sessionStats = {
            playerName: currentPlayerName,
            playerAge: currentPlayerAge,
            levelsPlayedData: [],
            totalTimeOverall: 0,
            totalMistakesOverall: 0,
            highestLevelCompletedNum: 0,
            sessionCompletedAllLevels: false
        };
        console.log("DEBUG: Estadísticas de sesión inicializadas/reiniciadas para:", currentPlayerName);
    }

    function iniciarEstadisticasNivel() {
        currentLevelStartTime = Date.now();
        currentLevelMistakes = 0;
        console.log(`DEBUG: Iniciando estadísticas para el nivel: ${currentDifficultyKey}`);
    }

    function finalizarEstadisticasNivel(levelKey, completed) {
        if (!sessionStats) {
            console.warn("DEBUG: Intentando finalizar stats sin sessionStats. Inicializando ahora.");
            inicializarEstadisticasSesion();
        }
        if (!currentLevelStartTime || !levelKey) {
            console.warn("DEBUG: finalizarEstadisticasNivel llamado sin startTime o levelKey.", {levelKey, currentLevelStartTime});
            return; 
        }
        const endTime = Date.now();
        const timeTakenMs = (endTime - currentLevelStartTime);
        const timeTakenSec = Math.round(timeTakenMs / 1000);
        const theme = animalThemes[levelKey];
        if (!theme) { console.error("DEBUG: Tema no encontrado para stats:", levelKey); return; }

        sessionStats.levelsPlayedData.push({
            levelNum: theme.levelNum, levelName: theme.name, completed: completed,
            timeTakenSeconds: timeTakenSec, mistakesMade: currentLevelMistakes
        });
        sessionStats.totalTimeOverall += timeTakenSec;
        sessionStats.totalMistakesOverall += currentLevelMistakes;
        if (completed && theme.levelNum > sessionStats.highestLevelCompletedNum) {
            sessionStats.highestLevelCompletedNum = theme.levelNum;
        }
        console.log(`DEBUG: Stats finalizadas para nivel ${levelKey}: Completado=${completed}, Tiempo=${timeTakenSec}s, Errores=${currentLevelMistakes}`);
        currentLevelStartTime = null;
    }

    function playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(error => console.warn("Advertencia al reproducir sonido:", error));
        }
    }

    function mostrarAnimacion(overlayElement, animationClass, duracionMs = 2000) {
        return new Promise(resolve => {
            const contentElement = overlayElement.querySelector('.animation-content');
            overlayElement.classList.remove('hidden');
            overlayElement.classList.add('visible');
            if (contentElement) contentElement.classList.add(animationClass);
            
            setTimeout(() => {
                overlayElement.classList.remove('visible');
                overlayElement.classList.add('hidden');
                if (contentElement) contentElement.classList.remove(animationClass);
                resolve();
            }, duracionMs);
        });
    }

    function showScreen(screenElement) {
        console.log("DEBUG: Intentando mostrar pantalla:", screenElement ? screenElement.id : "ELEMENTO NULO");
        if(playerInfoScreen) playerInfoScreen.classList.add('hidden');
        if(levelSelectionScreen) levelSelectionScreen.classList.add('hidden');
        if(gameScreen) gameScreen.classList.add('hidden');
        if(statsScreen) statsScreen.classList.add('hidden');
        if(statsTriggerArea) statsTriggerArea.classList.add('hidden');
        
        if (screenElement) {
            screenElement.classList.remove('hidden');
            console.log("DEBUG: Pantalla", screenElement.id, "debería estar visible.");
        } else {
            console.error("DEBUG: showScreen fue llamado con un elemento nulo. Mostrando playerInfoScreen por defecto.");
            if(playerInfoScreen) playerInfoScreen.classList.remove('hidden');
        }
    }

    // ----- LÓGICA DEL BOTÓN "CONTINUAR" (Simplificada para depuración) -----
    if (continueToLevelSelectionBtn) {
        continueToLevelSelectionBtn.addEventListener('click', () => {
            console.log("DEBUG: Botón 'Continuar' FUE PRESIONADO.");

            // 1. Obtener nombre y edad (sin validación por ahora para simplificar)
            currentPlayerName = playerNameInput.value.trim() || "Jugador X";
            currentPlayerAge = playerAgeInput.value.trim() || "N/A";
            console.log("DEBUG: Nombre:", currentPlayerName, "Edad:", currentPlayerAge);

            // VALIDACIONES BÁSICAS (importante mantenerlas)
            if (!playerNameInput.value.trim()) { 
                alert("Por favor, escribe tu nombre.");
                console.log("DEBUG: Validación Nombre falló.");
                return; 
            }
            if (!playerAgeInput.value.trim() || isNaN(parseInt(playerAgeInput.value.trim()))) { 
                alert("Por favor, escribe una edad válida.");
                console.log("DEBUG: Validación Edad falló.");
                return; 
            }
             console.log("DEBUG: Validación de inputs pasó.");

            // 2. Inicializar estadísticas (es importante)
            inicializarEstadisticasSesion();
            console.log("DEBUG: Estadísticas inicializadas.");

            // 3. Establecer nivel por defecto
            currentDifficultyKey = levelKeys[0];
            console.log("DEBUG: Dificultad inicial:", currentDifficultyKey);

            // 4. Popular la selección de niveles (esta función también debe funcionar)
            try {
                populateLevelSelection();
                console.log("DEBUG: populateLevelSelection() ejecutado.");
            } catch (e) {
                console.error("DEBUG: ERROR en populateLevelSelection():", e);
                alert("Error al preparar los niveles. Revisa la consola.");
                return;
            }
            
            // 5. Intentar mostrar la pantalla de selección de nivel
            if (!levelSelectionScreen) {
                console.error("DEBUG: levelSelectionScreen es NULO antes de llamar a showScreen!");
                alert("Error crítico: No se puede encontrar la pantalla de selección de niveles.");
                return;
            }
            console.log("DEBUG: Llamando a showScreen para levelSelectionScreen...");
            showScreen(levelSelectionScreen);
            console.log("DEBUG: showScreen(levelSelectionScreen) TERMINÓ de ejecutarse.");
        });
    } else {
        console.error("ERROR CRÍTICO: Botón 'continueToLevelSelectionBtn' no encontrado en el DOM.");
    }
    
    // (El resto de las funciones: populateLevelSelection, actualizarDisplayVidas, manejarGameOver, etc.,
    //  son las mismas que en la respuesta anterior completa que te di cuando el juego SÍ avanzaba
    //  y tenía las estadísticas. Es crucial que el resto del script sea esa versión.)

    // Para asegurar, aquí va el resto del script.js:
    function populateLevelSelection() {
        if (!animalLevelGrid) { console.error("DEBUG: animalLevelGrid es NULO en populateLevelSelection"); return; }
        animalLevelGrid.innerHTML = '';
        levelKeys.forEach(key => {
            const theme = animalThemes[key];
            if(!theme) { console.error("DEBUG: Tema no encontrado para la clave:", key); return; }
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('level-item-container');
            const card = document.createElement('div');
            card.classList.add('level-card');
            card.dataset.difficulty = key;
            const img = document.createElement('img');
            img.src = theme.image;
            img.alt = `Nivel ${theme.levelNum}: ${theme.name}`;
            card.appendChild(img);
            const levelLabel = document.createElement('p');
            levelLabel.classList.add('level-item-label');
            levelLabel.textContent = `Nivel ${theme.levelNum}`;
            itemContainer.appendChild(card);
            itemContainer.appendChild(levelLabel);
            card.addEventListener('click', () => {
                currentDifficultyKey = card.dataset.difficulty;
                startGame();
            });
            animalLevelGrid.appendChild(itemContainer);
        });
    }
    
    function actualizarDisplayVidas() {
        if(displayVidasElement) {
            let vidasHtml = '';
            for(let i = 0; i < MAX_VIDAS; i++) {
                vidasHtml += (i < vidasRestantes) ? '<span class="vida-llena">❤️</span>' : '<span class="vida-vacia">🖤</span>';
            }
            displayVidasElement.innerHTML = vidasHtml;
        }
    }

    async function manejarGameOver() {
        if (currentDifficultyKey) finalizarEstadisticasNivel(currentDifficultyKey, false);
        tableroDeshabilitado = true;
        playSound(gameOverSound);
        
        await mostrarAnimacion(gameOverOverlay, 'animate-lose', 2500);
        
        messageArea.textContent = "¡Juego Terminado! Te quedaste sin vidas.";
        messageArea.className = 'error';
        if(solveBtn && !solveBtn.disabled) solveBtn.click(); 
        if(validateBtn) validateBtn.disabled = true;
        if(solveBtn) solveBtn.disabled = true;
        if(backToLevelsBtn) backToLevelsBtn.textContent = "Jugar de Nuevo";
        if(statsTriggerArea) statsTriggerArea.classList.remove('hidden');
    }

    async function manejarVictoriaNivel() {
        if (currentDifficultyKey) finalizarEstadisticasNivel(currentDifficultyKey, true);
        tableroDeshabilitado = true;
        playSound(victoriaSound);
        if(validateBtn) validateBtn.disabled = true;
        if(solveBtn) solveBtn.disabled = true;

        await mostrarAnimacion(winLevelOverlay, 'animate-win', 2500);

        const currentLevelIndex = levelKeys.indexOf(currentDifficultyKey);
        if (currentLevelIndex < levelKeys.length - 1) {
            const nextLevelKey = levelKeys[currentLevelIndex + 1];
            messageArea.textContent = `¡Nivel Superado! Preparando Nivel ${animalThemes[nextLevelKey].levelNum}...`;
            messageArea.className = 'success';
            
            setTimeout(() => {
                currentDifficultyKey = nextLevelKey;
                startGame();
            }, 2000);
        } else {
            if(sessionStats) sessionStats.sessionCompletedAllLevels = true;
            messageArea.textContent = "¡FELICIDADES! ¡Has completado todos los niveles!";
            messageArea.className = 'success';
            if(backToLevelsBtn) backToLevelsBtn.textContent = "Volver al Inicio";
            if(statsTriggerArea) statsTriggerArea.classList.remove('hidden');
        }
    }

    function startGame() {
        if (!currentDifficultyKey || !animalThemes[currentDifficultyKey]) {
            console.log("DEBUG: startGame - currentDifficultyKey no válida, usando el primer nivel.");
            currentDifficultyKey = levelKeys[0]; 
        }
        
        const theme = animalThemes[currentDifficultyKey];
        if(!theme) {
            console.error("DEBUG: startGame - Tema no encontrado para currentDifficultyKey:", currentDifficultyKey);
            showScreen(levelSelectionScreen); // Volver a selección si hay un error grave
            return;
        }

        if (displayPlayerName) displayPlayerName.textContent = currentPlayerName;
        if (displayPlayerAge) displayPlayerAge.textContent = currentPlayerAge;
        if (displayLevelName) displayLevelName.textContent = `Nivel ${theme.levelNum}: ${theme.name}`; 
        if (animalImageOnGameScreen) { animalImageOnGameScreen.src = theme.image; animalImageOnGameScreen.alt = theme.name; }
        
        iniciarEstadisticasNivel();
        vidasRestantes = MAX_VIDAS;
        actualizarDisplayVidas();
        tableroDeshabilitado = false;
        if(validateBtn) validateBtn.disabled = false;
        if(solveBtn) solveBtn.disabled = false;
        if(statsTriggerArea) statsTriggerArea.classList.add('hidden');
        
        if (backToLevelsBtn) {
            // La lógica del texto del botón se simplifica, se ajustará al final del nivel/juego
            backToLevelsBtn.textContent = "Cambiar Nivel";
        }

        messageArea.textContent = '';
        messageArea.className = '';

        let cellsToLeave = theme.clues;
        let cellsToRemove = (N * N) - cellsToLeave;
        if (cellsToRemove < (N*N - 60)) cellsToRemove = (N*N - 60);
        if (cellsToRemove > (N*N - 17)) cellsToRemove = (N*N - 17);
        const generator = new SudokuGenerator(N, cellsToRemove);
        generator.fillValues();
        currentPuzzle = generator.getPuzzle();
        currentSolution = generator.getSolution();
        createBoard(currentPuzzle);
        showScreen(gameScreen);
    }
    
    if (backToLevelsBtn) {
        backToLevelsBtn.addEventListener('click', () => {
            const buttonText = backToLevelsBtn.textContent;
            
            if (!tableroDeshabilitado && currentDifficultyKey) {
                finalizarEstadisticasNivel(currentDifficultyKey, false);
            }

            if (buttonText === "Volver al Inicio") {
                if(statsTriggerArea && statsScreen.classList.contains('hidden') && sessionStats && sessionStats.sessionCompletedAllLevels) {
                     statsTriggerArea.classList.remove('hidden');
                }
                inicializarEstadisticasSesion(); 
                currentDifficultyKey = levelKeys[0]; 
                showScreen(playerInfoScreen);
            } else if (buttonText === "Jugar de Nuevo") {
                // Si es "Jugar de Nuevo" (post game-over), currentDifficultyKey ya está en el nivel que se perdió.
                // Para que sea una *nueva* sesión de stats, inicializar aquí.
                // Si se quiere continuar la sesión de stats para mejorarla, no inicializar.
                // Decisión: "Jugar de Nuevo" inicia una nueva sesión de stats para ese nivel.
                // Esto requiere que el jugador haya visto sus stats o haya terminado el juego.
                // La lógica actual en startGame es que ya se inicializaron stats antes de llegar a esta opción.
                // Para simplificar, si se presiona "Jugar de nuevo", las stats de sesión *no* se resetean aquí,
                // sino que el nuevo intento se añade a la sesión actual.
                // Si se quiere una sesión totalmente nueva, el flujo es Volver al Inicio -> Nuevo Jugador.
                startGame(); 
            } else { // "Cambiar Nivel"
                if (confirm("¿Seguro que quieres volver al menú de niveles? Perderás el progreso actual de este nivel.")) {
                     showScreen(levelSelectionScreen);
                }
            }
        });
    }

    class SudokuGenerator {
        constructor(N_val, K_val) {this.N = N_val;this.SRN = Math.floor(Math.sqrt(N_val));this.K = K_val;this.mat = Array.from({ length: this.N }, () => Array(this.N).fill(0));this.solutionMat = Array.from({ length: this.N }, () => Array(this.N).fill(0));}
        fillValues(){this.fillDiagonal();this.fillRemaining(0,this.SRN);for(let i=0;i<this.N;i++){for(let j=0;j<this.N;j++){this.solutionMat[i][j]=this.mat[i][j];}}this.removeKDigits();}
        fillDiagonal(){for(let i=0;i<this.N;i=i+this.SRN){this.fillBox(i,i);}}
        unUsedInBox(rS,cS,n){for(let i=0;i<this.SRN;i++){for(let j=0;j<this.SRN;j++){if(this.mat[rS+i][cS+j]===n)return false;}}return true;}
        fillBox(r,c){let num;for(let i=0;i<this.SRN;i++){for(let j=0;j<this.SRN;j++){do{num=this.randomGenerator(this.N);}while(!this.unUsedInBox(r,c,num));this.mat[r+i][c+j]=num;}}}
        randomGenerator(num){return Math.floor(Math.random()*num+1);}
        checkIfSafe(i,j,num){return(this.unUsedInRow(i,num)&&this.unUsedInCol(j,num)&&this.unUsedInBox(i-(i%this.SRN),j-(j%this.SRN),num));}
        unUsedInRow(i,num){for(let k=0;k<this.N;k++){if(this.mat[i][k]===num)return false;}return true;}
        unUsedInCol(j,num){for(let k=0;k<this.N;k++){if(this.mat[k][j]===num)return false;}return true;}
        fillRemaining(i,j){if(j>=this.N&&i<this.N-1){i=i+1;j=0;}if(i>=this.N&&j>=this.N)return true;if(i<this.SRN){if(j<this.SRN)j=this.SRN;}else if(i<this.N-this.SRN){if(j===Math.floor(i/this.SRN)*this.SRN)j=j+this.SRN;}else{if(j===this.N-this.SRN){i=i+1;j=0;if(i>=this.N)return true;}}for(let num=1;num<=this.N;num++){if(this.checkIfSafe(i,j,num)){this.mat[i][j]=num;if(this.fillRemaining(i,j+1))return true;this.mat[i][j]=0;}}return false;}
        removeKDigits(){let c=this.K;while(c!==0){let ci=this.randomGenerator(this.N*this.N)-1;let i=Math.floor(ci/this.N);let j=ci%this.N;if(this.mat[i][j]!==0){c--;this.mat[i][j]=0;}}}
        getPuzzle(){return this.mat;}
        getSolution(){return this.solutionMat;}
    }

    function createBoard(puzzle){
        boardElement.innerHTML='';
        messageArea.textContent='';
        messageArea.className='';
        for(let r=0;r<N;r++){
            for(let c=0;c<N;c++){
                const cell=document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row=r;
                cell.dataset.col=c;
                if((r+1)%SRN===0&&r<N-1){cell.classList.add('border-bottom-strong');}
                if((c+1)%SRN===0&&c<N-1){cell.classList.add('border-right-strong');}
                
                if(puzzle[r][c]!==0){
                    cell.textContent=puzzle[r][c];
                    cell.classList.add('prefilled');
                }else{
                    const input=document.createElement('input');
                    input.type='text';
                    input.inputMode='numeric';
                    input.pattern="[1-9]";
                    input.maxLength=1;
                    input.addEventListener('input',(e)=>handleCellInputFilter(e.target));
                    input.addEventListener('blur',(e)=>handleCellValidation(e.target,r,c));
                    cell.appendChild(input);
                }
                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellInputFilter(inputElement){
        let value=inputElement.value;
        inputElement.classList.remove('error-input');
        if(value==='')return;
        if(!/^[1-9]$/.test(value)){ inputElement.value=''; return; }
        if(value.length>1){ inputElement.value=value.charAt(0); if(!/^[1-9]$/.test(inputElement.value)){inputElement.value='';} }
    }

    function handleCellValidation(inputElement, r, c) {
        if (tableroDeshabilitado || inputElement.readOnly) return;

        const valueStr = inputElement.value;
        messageArea.textContent = '';

        if (valueStr === "") {
            inputElement.classList.remove('error-input', 'correct-user-input');
            return;
        }
        const valueNum = parseInt(valueStr);

        if (valueNum === currentSolution[r][c]) {
            playSound(aciertoSound);
            inputElement.classList.remove('error-input');
            inputElement.classList.add('correct-user-input');
            inputElement.readOnly = true;
            if (checkIfGameWon()) {
                manejarVictoriaNivel();
            }
        } else {
            playSound(errorSound);
            inputElement.classList.add('error-input');
            currentLevelMistakes++;
            vidasRestantes--;
            actualizarDisplayVidas();
            
            setTimeout(() => {
                if (inputElement.classList.contains('error-input') && !inputElement.readOnly) {
                     inputElement.value = '';
                     inputElement.classList.remove('error-input');
                }
            }, 800);

            if (vidasRestantes <= 0) {
                manejarGameOver();
            }
        }
    }
    
    function checkIfGameWon() {
        const userBoard = getCurrentBoardState();
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (userBoard[r][c] === 0 || userBoard[r][c] !== currentSolution[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }

    function getCurrentBoardState(){const board=Array.from({length:N},()=>Array(N).fill(0));const cells=boardElement.querySelectorAll('.sudoku-cell');cells.forEach(cell=>{const r=parseInt(cell.dataset.row);const c=parseInt(cell.dataset.col);if(cell.classList.contains('prefilled')){board[r][c]=parseInt(cell.textContent);}else{const input=cell.querySelector('input');if(input&&input.value&&/^[1-9]$/.test(input.value)){board[r][c]=parseInt(input.value);}else{board[r][c]=0;}}});return board;}
        
    function checkSolution(){
        if (tableroDeshabilitado) {
            const allLevelsCompleted = sessionStats && sessionStats.sessionCompletedAllLevels;
            if (vidasRestantes > 0 && allLevelsCompleted) { messageArea.textContent = "¡FELICIDADES! ¡Has completado todos los niveles!"; }
            else if (vidasRestantes <= 0) { messageArea.textContent = "Juego Terminado. Intenta un nuevo juego."; }
            else if (vidasRestantes > 0) { messageArea.textContent = "¡Nivel Superado! El siguiente nivel se cargará pronto."; }
            messageArea.className = (vidasRestantes > 0 && allLevelsCompleted) || (vidasRestantes > 0 && !allLevelsCompleted) ? 'success' : 'error';
            return;
        }

        const userBoard=getCurrentBoardState();
        let allFilled=true;
        let hasVisibleErrors = false;

        for(let r=0;r<N;r++){
            for(let c=0;c<N;c++){
                const cellNode = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                const input = cellNode ? cellNode.querySelector('input') : null;
                if (input && !input.readOnly) {
                    if (input.value === '') { allFilled = false; }
                    else if (parseInt(input.value) !== currentSolution[r][c]) { hasVisibleErrors = true; input.classList.add('error-input'); }
                } else if (!cellNode.classList.contains('prefilled') && (!input || !input.readOnly) && userBoard[r][c] === 0) {
                    allFilled = false;
                }
            }
        }

        if(!allFilled){ messageArea.textContent='¡Aún faltan números por rellenar!'; messageArea.className='error'; return; }
        if (checkIfGameWon()) { manejarVictoriaNivel(); } 
        else if (hasVisibleErrors) { messageArea.textContent='Parece que aún hay errores en el tablero.'; messageArea.className='error';}
        else { messageArea.textContent='Todas las casillas llenas, pero algo no es correcto.'; messageArea.className='error'; }
    }

    function showSolution(){
        boardElement.innerHTML='';
        messageArea.textContent='Mostrando la solución.';
        messageArea.className='';
        tableroDeshabilitado = true;
        if(validateBtn) validateBtn.disabled = true;
        if(solveBtn) solveBtn.disabled = true;
        for(let r=0;r<N;r++){for(let c=0;c<N;c++){const cell=document.createElement('div');cell.classList.add('sudoku-cell');if((r+1)%SRN===0&&r<N-1)cell.classList.add('border-bottom-strong');if((c+1)%SRN===0&&c<N-1)cell.classList.add('border-right-strong');cell.textContent=currentSolution[r][c];if(currentPuzzle[r][c]!==0){cell.classList.add('prefilled');}else{cell.style.color='#007bff';}boardElement.appendChild(cell);}}}

    function generarAnalisisHabilidades(stats) {
        let analisis = [];
        const nivelesCompletados = stats.levelsPlayedData.filter(l => l.completed).length;
        const totalNivelesJugados = stats.levelsPlayedData.length;

        if (stats.sessionCompletedAllLevels) {
            analisis.push("¡Increíble! Has demostrado una gran maestría y paciencia al completar todos los niveles.");
        } else if (nivelesCompletados > 0 && nivelesCompletados >= totalNivelesJugados / 2 ) {
            analisis.push("¡Muy bien! Has superado varios desafíos, mostrando buena lógica y concentración.");
        } else if (nivelesCompletados > 0) {
            analisis.push("¡Buen comienzo! Cada nivel completado es un gran paso adelante.");
        } else if (totalNivelesJugados > 0) {
            analisis.push("Los Sudokus pueden ser un reto. ¡La práctica y la paciencia son clave para mejorar!");
        } else {
            analisis.push("¡Anímate a jugar una partida para ver tus habilidades en acción!");
        }

        if (nivelesCompletados > 0) {
            const promedioErrores = stats.totalMistakesOverall / nivelesCompletados;
            if (stats.totalMistakesOverall === 0 && nivelesCompletados > 0) {
                analisis.push("¡Tu atención al detalle es impecable, ni un solo error en los niveles completados!");
            } else if (promedioErrores < 2) {
                analisis.push("Muestras una excelente concentración cometiendo muy pocos errores.");
            } else {
                analisis.push("Recuerda revisar bien cada número. ¡Con un poco más de atención, los errores disminuirán!");
            }
        } else if (totalNivelesJugados > 0 && stats.totalMistakesOverall > 0) {
             analisis.push("Cada intento es aprendizaje. Presta atención a los números y poco a poco cometerás menos errores.");
        }
        
        if (stats.highestLevelCompletedNum >= 8) {
            analisis.push("Has llegado a niveles avanzados, lo que demuestra una gran capacidad de resolución de problemas.");
        } else if (stats.highestLevelCompletedNum >= 4) {
            analisis.push("Estás progresando muy bien en los niveles de dificultad media. ¡Sigue así!");
        }

        if (analisis.length === 0) return "¡Sigue jugando para desarrollar tus habilidades! Cada juego es una nueva oportunidad para aprender.";
        return analisis.join(" ");
    }

    function displayStatistics() {
        if (!sessionStats || !sessionStats.levelsPlayedData) {
            if (statsPlayerInfoDiv) statsPlayerInfoDiv.innerHTML = "<p>No hay datos de juego para mostrar.</p>";
            if (statsSummaryDiv) statsSummaryDiv.innerHTML = "";
            if (statsAnalysisP) statsAnalysisP.textContent = "";
            showScreen(statsScreen);
            return;
        }
        if(statsPlayerInfoDiv) statsPlayerInfoDiv.innerHTML = `
            <div class="stat-item"><strong>Jugador:</strong> ${sessionStats.playerName || 'N/A'}</div>
            <div class="stat-item"><strong>Edad:</strong> ${sessionStats.playerAge || 'N/A'}</div>
        `;
        let summaryHtml = `<h3>Resumen General</h3>`;
        summaryHtml += `<div class="stat-item"><strong>Nivel más alto completado:</strong> ${sessionStats.highestLevelCompletedNum > 0 ? `Nivel ${sessionStats.highestLevelCompletedNum}` : 'Ninguno'}</div>`;
        summaryHtml += `<div class="stat-item"><strong>Total de niveles jugados:</strong> ${sessionStats.levelsPlayedData.length}</div>`;
        summaryHtml += `<div class="stat-item"><strong>Total de niveles completados:</strong> ${sessionStats.levelsPlayedData.filter(l => l.completed).length}</div>`;
        summaryHtml += `<div class="stat-item"><strong>Tiempo total de juego:</strong> ${Math.floor(sessionStats.totalTimeOverall / 60)}m ${sessionStats.totalTimeOverall % 60}s</div>`;
        summaryHtml += `<div class="stat-item"><strong>Total de errores:</strong> ${sessionStats.totalMistakesOverall}</div>`;
        
        if (sessionStats.levelsPlayedData.length > 0) {
            summaryHtml += "<h3>Detalle por Nivel Jugado:</h3><ul>";
            sessionStats.levelsPlayedData.forEach(level => {
                summaryHtml += `<li>Nivel ${level.levelNum} (${level.levelName}): ${level.completed ? 'Completado ✔' : 'No Completado ✖'} <br><span>Tiempo: ${level.timeTakenSeconds}s - Errores: ${level.mistakesMade}</span></li>`;
            });
            summaryHtml += "</ul>";
        }
        if(statsSummaryDiv) statsSummaryDiv.innerHTML = summaryHtml;
        if(statsAnalysisP) statsAnalysisP.textContent = generarAnalisisHabilidades(sessionStats);
        showScreen(statsScreen);
    }

    if (validateBtn) validateBtn.addEventListener('click', checkSolution);
    if (solveBtn) solveBtn.addEventListener('click', showSolution);
    if (showStatsBtn) showStatsBtn.addEventListener('click', displayStatistics);
    if (restartGameFromStatsBtn) {
        restartGameFromStatsBtn.addEventListener('click', () => {
            inicializarEstadisticasSesion(); 
            currentDifficultyKey = levelKeys[0];
            startGame();
        });
    }
    if (backToMenuFromStatsBtn) {
        backToMenuFromStatsBtn.addEventListener('click', () => {
            inicializarEstadisticasSesion();
            currentDifficultyKey = levelKeys[0];
            showScreen(playerInfoScreen); 
        });
    }

    currentDifficultyKey = levelKeys[0];
    inicializarEstadisticasSesion();
    showScreen(playerInfoScreen);
});