const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// ELEMEN UI
const selectDisk = document.querySelector('.control select');
const btnNewGame = document.querySelectorAll('.control button')[0];
const moveText = document.querySelectorAll('.control .col')[0];
const optimalText = document.querySelectorAll('.control .col')[1];

// STATUS GAME
let towers = [[], [], []];
let diskCount = 3;
let moves = 0;
let optimalMoves = 0;
let selectedTower = null;

// WARNA TIAP DISK
const diskColors = ["#FF3366", "#33CCFF", "#33FF66", "#FFCC00", "#CC33FF"];

// SETUP GAME DAN CANVAS
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
}

function startGame() {
    diskCount = parseInt(selectDisk.value);
    moves = 0;
    optimalMoves = Math.pow(2, diskCount) - 1; // MENGGUNAKAN RUMUS HTIUNG GERAKAN OPTIMAL: 2^n - 1
    selectedTower = null;
    
    // Kosongkan semua tower
    towers = [[], [], []];

    // Isi tower pertama (index 0) dengan piringan dari yang terbesar ke terkecil
    for (let i = diskCount; i >= 1; i--) {
        towers[0].push(i); 
    }

    updateStats();
    resizeCanvas(); // Ini akan otomatis memanggil render()
}

function updateStats() {
    moveText.innerText = `Move: ${moves}`;
    optimalText.innerText = `Optimal: ${optimalMoves}`;
}

// ==========================================
// 2. FUNGSI MENGGAMBAR (RENDER)
// ==========================================

function render() {
    // BERSIHKAN CANVAS
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DEKLARASI VARIABLE UNTUK UKURAN
    const lebarTiang = 10;
    const tinggiAlas = 20;
    const tinggiDisk = canvas.height/12;
    const jarakAntarTiang = canvas.width/3;

    // GAMBAR TOWER
    ctx.fillStyle = "#555";
    for (let i = 0; i < 3; i++) {
        const xCenter = (i * jarakAntarTiang) + (jarakAntarTiang / 2);
        
        ctx.fillRect(xCenter - 50, canvas.height - tinggiAlas, 100, tinggiAlas);
        ctx.fillRect(xCenter - (lebarTiang / 2), canvas.height - (tinggiDisk * 9), lebarTiang, tinggiDisk * 9);
    }

    // GAMBAR DISK
    towers.forEach((towerStack, towerIndex) => {
        const xCenter = (towerIndex * jarakAntarTiang) + (jarakAntarTiang / 2);

        towerStack.forEach((ukuranDisk, diskIndex) => {
            const LDisk = 40 + (ukuranDisk * 30);
            const TDisk = canvas.height - tinggiAlas - ((diskIndex + 1) * tinggiDisk);

            ctx.fillStyle = diskColors[ukuranDisk - 1];
            
            // BERI WARNA REDUP PADA DISK YANG DIPILIH
            if (selectedTower === towerIndex && diskIndex === towerStack.length - 1) {
                ctx.globalAlpha = 0.5;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.fillRect(xCenter - (LDisk / 2), TDisk, LDisk, tinggiDisk);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.strokeRect(xCenter - (LDisk / 2), TDisk, LDisk, tinggiDisk);
        });
    });
    ctx.globalAlpha = 1.0; // Kembalikan opacity ke normal
}

// LOGIKA INTERAKSI

canvas.addEventListener('click', function(event) {
    // Cari tahu pengguna klik di area tiang 0, 1, atau 2
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickedPeg = Math.floor(clickX / (canvas.width / 3));

    // KONDISI A: Belum ada piringan yang dipilih
    if (selectedTower === null) {
        // Cek apakah tiang yang diklik punya piringan
        if (towers[clickedPeg].length > 0) {
            selectedTower = clickedPeg; // Tandai tower ini
            render(); // Gambar ulang untuk memunculkan efek transparan
        }
    } 
    // KONDISI B: Sudah ada piringan yang dipilih, bersiap memindah
    else {
        // Jika klik tiang yang sama (Batal memilih)
        if (selectedTower === clickedPeg) {
            selectedTower = null;
        } 
        // Jika klik tiang yang berbeda
        else {
            const diskToMove = towers[selectedTower][towers[selectedTower].length - 1]; // Lihat piringan atas
            const targetTopDisk = towers[clickedPeg][towers[clickedPeg].length - 1]; // Lihat piringan di tiang tujuan

            // Cek Aturan Hanoi: Tujuan harus kosong ATAU piringan tujuan lebih besar
            if (!targetTopDisk || diskToMove < targetTopDisk) {
                // PINDAHKAN!
                towers[selectedTower].pop(); // Keluarkan dari asal
                towers[clickedPeg].push(diskToMove); // Masukkan ke tujuan
                moves++;
                updateStats();
            } else {
                alert("Aturan dilanggar! Tidak boleh meletakkan piringan besar di atas piringan kecil.");
            }
            // Lepaskan pilihan
            selectedTower = null;
        }
        render(); // Update layar
        checkWin();
    }
});

selectDisk.addEventListener('change', function() {
    startGame();
})

function checkWin() {
    // Jika tower C (index 2) isinya penuh sesuai jumlah disk
    if (towers[2].length === diskCount) {
        setTimeout(() => alert(`Selamat! Kamu menang dalam ${moves} langkah.`), 100);
    }
}

// ==========================================
// 4. JALANKAN PROGRAM
// ==========================================
window.addEventListener('load', startGame);
window.addEventListener('resize', resizeCanvas);
btnNewGame.addEventListener('click', startGame);