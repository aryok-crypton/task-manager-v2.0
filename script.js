const taskForm = document.getElementById('taskForm');
const taskListContainer = document.getElementById('taskList');

// Mengambil data tersimpan di memori browser (LocalStorage) agar tidak hilang saat di-refresh
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// FUNGSI 1: Menghitung skor prioritas berdasarkan sisa hari dan kesulitan
function calculatePriority(deadlineStr, difficulty) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Hitung sisa hari
    
    if (diffDays < 0) {
        return { score: 999, label: "TERLAMBAT 🚨", classBadge: "badge-tinggi", days: diffDays };
    }
    
    // Rumus skor cerdas
    const weightTime = Math.max(1, 10 - diffDays);
    const score = (difficulty * 2) + weightTime;
    
    // Menentukan label berdasarkan skor
    if (score >= 12 || diffDays <= 1) {
        return { score: score, label: "TINGGI (Mendesak) 🔥", classBadge: "badge-tinggi", days: diffDays };
    } else if (score >= 7) {
        return { score: score, label: "SEDANG (Jangan Lupa) ⚠️", classBadge: "badge-sedang", days: diffDays };
    } else {
        return { score: score, label: "RENDAH (Chill)☕", classBadge: "badge-rendah", days: diffDays };
    }
}

// FUNGSI 2: Menampilkan daftar tugas ke layar web secara otomatis
function renderTasks() {
    taskListContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        taskListContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Belum ada tugas tercatat. Kerja bagus!</p>';
        return;
    }

    // Mengurutkan tugas otomatis dari prioritas tertinggi ke terendah
    tasks.sort((a, b) => {
        let pA = calculatePriority(a.tenggat, a.kesulitan).score;
        let pB = calculatePriority(b.tenggat, b.kesulitan).score;
        return pB - pA;
    });

    // Membuat elemen HTML kartu tugas secara dinamis untuk setiap data di dalam array
    tasks.forEach((task, index) => {
        const priorityInfo = calculatePriority(task.tenggat, task.kesulitan);
        
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-info">
                <h3>📖 ${task.mapel} - ${task.tugas}</h3>
                <p>📅 Deadline: ${task.tenggat} (${priorityInfo.days} hari lagi)</p>
                <p>⚡ Kesulitan: ${task.kesulitan}/5</p>
                <span class="badge ${priorityInfo.classBadge}">Prioritas: ${priorityInfo.label}</span>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask(${index})">Hapus</button>
            </div>
        `;
        taskListContainer.appendChild(taskCard);
    });
}

// FUNGSI 3: Menangkap data saat tombol "Simpan" diklik oleh pengguna
taskForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah halaman web melakukan reload otomatis
    
    const mapel = document.getElementById('mapel').value;
    const tugas = document.getElementById('tugas').value;
    const tenggat = document.getElementById('tenggat').value;
    const kesulitan = parseInt(document.getElementById('kesulitan').value);
    
    const newTask = { mapel, tugas, tenggat, kesulitan };
    tasks.push(newTask); // Memasukkan tugas baru ke dalam daftar (array)
    
    // Menyimpan data permanen ke LocalStorage browser
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    renderTasks(); // Memperbarui tampilan layar
    taskForm.reset(); // Mengosongkan form input kembali
});

// FUNGSI 4: Menghapus tugas berdasarkan nomor urutnya
function deleteTask(index) {
    tasks.splice(index, 1); // Menghapus data dari array
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Perbarui penyimpanan browser
    renderTasks(); // Perbarui tampilan layar
}

// Menjalankan fungsi render saat pertama kali halaman dibuka
renderTasks();
