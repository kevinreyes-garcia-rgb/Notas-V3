const timeline = document.getElementById('timeline');
const songList = document.getElementById('songList');
let selectedInstrument = 'guitar';

// 1. Generar los espacios para poner notas
function generateSlots() {
    for (let i = 0; i < 40; i++) {
        const slot = document.createElement('div');
        slot.className = 'note-slot';
        slot.onclick = (e) => {
            // Si el clic fue en una nota existente, la borramos
            if (e.target.classList.contains('note')) {
                e.target.remove();
            } else {
                addNote(slot, e.offsetY);
            }
        };
        timeline.appendChild(slot);
    }
}

// 2. Cambiar de instrumento
document.querySelectorAll('.instrument-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedInstrument = btn.dataset.instrument;
    };
});

// 3. Agregar nota visualmente
function addNote(slot, yPos) {
    const note = document.createElement('div');
    note.className = `note ${selectedInstrument}`;
    
    // Ajustar la nota a la línea del pentagrama más cercana
    const lines = [40, 70, 100, 130, 160];
    const closest = lines.reduce((prev, curr) => 
        Math.abs(curr - yPos) < Math.abs(prev - yPos) ? curr : prev
    );
    
    note.style.top = `${closest - 10}px`;
    slot.appendChild(note);
    
    // Sonido simple de feedback
    playTone(440 - (closest * 1.5));
}

// 4. Sonido básico con Web Audio API
function playTone(freq) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// 5. Funciones de la interfaz
function clearSheet() {
    document.querySelectorAll('.note').forEach(n => n.remove());
}

function showSaveModal() { document.getElementById('saveModal').classList.add('active'); }
function closeModal() { document.getElementById('saveModal').classList.remove('active'); }

function saveSong() {
    const name = document.getElementById('songName').value || "Mi Melodía";
    const songs = JSON.parse(localStorage.getItem('nots_songs') || '[]');
    songs.push({ name, date: new Date().toLocaleDateString() });
    localStorage.setItem('nots_songs', JSON.stringify(songs));
    renderSongs();
    closeModal();
}

function renderSongs() {
    const songs = JSON.parse(localStorage.getItem('nots_songs') || '[]');
    songList.innerHTML = songs.map(s => `
        <div style="background:rgba(255,255,255,0.1); padding:10px; margin:5px; border-radius:5px;">
            ${s.name} - <small>${s.date}</small>
        </div>
    `).join('');
}

function playComposition() {
    const indicator = document.getElementById('playbackIndicator');
    const bpm = document.getElementById('tempo').value || 120;
    const duration = (60 / bpm) * 16; // Duración total basada en tempo

    indicator.classList.remove('active');
    void indicator.offsetWidth; // Truco para reiniciar animación
    indicator.style.animationDuration = `${duration}s`;
    indicator.classList.add('active');
}

// Inicializar
generateSlots();
renderSongs();
