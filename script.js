
// ════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const movies = [
  { id:1, title:"НАЧАЛО",        genre:"sci-fi",  genreLabel:"Sci-Fi",  rating:"8.8", duration:"148 мин", year:"2010", badge:"IMAX",    poster:"./photos/Poster_Inception_film_2010.jpg",  times:["10:30","13:15","16:00","19:30","22:45"], priceBase:12 },
  { id:2, title:"ИНТЕРСТЕЛЛАР", genre:"sci-fi",  genreLabel:"Sci-Fi",  rating:"8.6", duration:"169 мин", year:"2014", badge:"4K",      poster:"./photos/Interstellar_2014.jpg",  times:["11:00","14:30","18:00","21:30"],          priceBase:12 },
  { id:3, title:"ДЖОКЕР 2",     genre:"drama",   genreLabel:"Драма",   rating:"7.1", duration:"138 мин", year:"2024", badge:"НОВИНКА", poster:"./photos/Joker_2_2024.jpg",  times:["12:00","15:30","19:00","22:00"],          priceBase:10 },
  { id:4, title:"ДЮНА: ЧАСТЬ 2",genre:"sci-fi",  genreLabel:"Sci-Fi",  rating:"8.5", duration:"166 мин", year:"2024", badge:"IMAX",    poster:"./photos/Dune_Part_Two_2024.jpg",  times:["10:00","13:00","16:30","20:00","23:00"], priceBase:14 },
  { id:5, title:"ГОЛОВОЛОМКА 2", genre:"comedy",  genreLabel:"Комедия", rating:"7.9", duration:"100 мин", year:"2024", badge:"",        poster:"./photos/Puzzle_2_2024.jpeg",  times:["11:30","14:00","17:00","20:30"],          priceBase:9  },
  { id:6, title:"ГЛАДИАТОР II", genre:"action",  genreLabel:"Экшн",   rating:"7.8", duration:"148 мин", year:"2024", badge:"НОВИНКА", poster:"./photos/Gladiator_II_2024.jpg",  times:["12:30","15:00","18:30","21:45"],          priceBase:11 },
  { id:7, title:"БЭТМЕН",       genre:"action",  genreLabel:"Экшн",   rating:"7.8", duration:"176 мин", year:"2022", badge:"4K",      poster:"./photos/Batman_2022.jpg",  times:["13:00","16:30","20:15","23:3₀"],          priceBase:10 },
  { id:8, title:"ОППЕНГЕЙМЕР",  genre:"drama",   genreLabel:"Драма",   rating:"8.3", duration:"180 мин", year:"2023", badge:"IMAX",    poster:"./photos/Oppenheimer_2023.jpg",  times:["10:45","14:00","17:30","21:00"],          priceBase:13 },
];
 
// ════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════
let currentMovie   = null;
let selectedTime   = null;
let selectedSeats  = [];
let takenSeats     = {};  // per movie random taken
 
// ════════════════════════════════════════════
//  RENDER MOVIES
// ════════════════════════════════════════════
function renderMovies(filter) {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';
  const list = filter === 'all' ? movies : movies.filter(m => m.genre === filter);
  list.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = (i * 0.07) + 's';
    card.innerHTML = `
      <div class="poster-wrap">
        <img
          class="movie-poster-img"
          loading="lazy"
          src="${m.poster}"
          alt="${m.title}"
          loading="lazy"
          onerror="this.parentElement.classList.add('img-error')"
        />
        ${m.badge ? `<div class="movie-badge">${m.badge}</div>` : ''}
        <div class="poster-overlay"></div>
      </div>
      <div class="movie-info">
        <div class="movie-genre">${m.genreLabel}</div>
        <div class="movie-title">${m.title}</div>
        <div class="movie-meta">
          <span class="rating">★ ${m.rating}</span>
          <span>${m.duration}</span>
          <span>${m.year}</span>
        </div>
        <button class="book-btn" onclick="openModal(${m.id})">Забронировать →</button>
      </div>`;
    grid.appendChild(card);
  });
}
 
function filterMovies(genre, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMovies(genre);
}
 
renderMovies('all');
 
// ════════════════════════════════════════════
//  GENERATE RANDOM TAKEN SEATS
// ════════════════════════════════════════════
function generateTaken(movieId) {
  if (takenSeats[movieId]) return takenSeats[movieId];
  const rows = 6, cols = 10;
  const taken = new Set();
  const count = Math.floor(Math.random() * 18) + 8;
  while (taken.size < count) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    taken.add(`${r}-${c}`);
  }
  takenSeats[movieId] = taken;
  return taken;
}
 
// ════════════════════════════════════════════
//  MODAL
// ════════════════════════════════════════════
function openModal(movieId) {
  currentMovie   = movies.find(m => m.id === movieId);
  selectedTime   = null;
  selectedSeats  = [];
 
  document.getElementById('modalTitle').textContent   = currentMovie.title;
  document.getElementById('modalSubtitle').textContent = currentMovie.genreLabel + ' • ' + currentMovie.duration;
  document.getElementById('bookingView').style.display = '';
  document.getElementById('successView').style.display = 'none';
 
  renderTimeGrid();
  renderSeatMap();
  updateSummary();
 
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
 
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
 
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
 
// ────────────────────────────────────────────
//  Time grid
// ────────────────────────────────────────────
function renderTimeGrid() {
  const grid = document.getElementById('timeGrid');
  grid.innerHTML = '';
  const soldOut = currentMovie.times.filter(() => Math.random() < .15);
  currentMovie.times.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'time-btn' + (soldOut.includes(t) ? ' sold-out' : '');
    btn.textContent = t;
    if (!soldOut.includes(t)) {
      btn.onclick = () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = t;
        selectedSeats = [];
        renderSeatMap();
        updateSummary();
      };
    } else {
      btn.title = 'Мест нет';
    }
    grid.appendChild(btn);
  });
}
 
// ────────────────────────────────────────────
//  Seat map
// ────────────────────────────────────────────
function renderSeatMap() {
  const map = document.getElementById('seatMap');
  map.innerHTML = '';
  const rows = 6, cols = 10;
  const rowLabels = ['A','B','C','D','E','F'];
  const vipRows = [4,5]; // last 2 rows are VIP
  const taken = generateTaken(currentMovie.id);
 
  for (let r = 0; r < rows; r++) {
    const row = document.createElement('div');
    row.className = 'seat-row';
    const lbl = document.createElement('div');
    lbl.className = 'row-label';
    lbl.textContent = rowLabels[r];
    row.appendChild(lbl);
 
    for (let c = 0; c < cols; c++) {
      if (c === 4) {
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        row.appendChild(aisle);
      }
      const key = `${r}-${c}`;
      const seat = document.createElement('div');
      const isVip = vipRows.includes(r);
      const isTaken = taken.has(key);
      const isSelected = selectedSeats.includes(key);
 
      seat.className = 'seat' +
        (isTaken    ? ' taken'    : '') +
        (isSelected ? ' selected' : '') +
        (isVip      ? ' vip'      : '');
 
      seat.title = isTaken ? 'Занято' : `${rowLabels[r]}${c+1}${isVip?' (VIP)':''}`;
 
      if (!isTaken) {
        seat.onclick = () => toggleSeat(key, seat);
      }
      row.appendChild(seat);
    }
    map.appendChild(row);
  }
}
 
function toggleSeat(key, el) {
  const idx = selectedSeats.indexOf(key);
  if (idx > -1) {
    selectedSeats.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    if (selectedSeats.length >= 8) return; // max 8 seats
    selectedSeats.push(key);
    el.classList.add('selected');
  }
  updateSummary();
}
 
// ────────────────────────────────────────────
//  Dynamic summary (JS updates)
// ────────────────────────────────────────────
const ticketPrices = { standard: 10, student: 7, vip: 18 };
 
function updateSummary() {
  const name    = document.getElementById('fName').value.trim();
  const surname = document.getElementById('fSurname').value.trim();
  const email   = document.getElementById('fEmail').value.trim();
  const type    = document.getElementById('fTicketType').value;
 
  const rowLabels = ['A','B','C','D','E','F'];
  const seatLabels = selectedSeats.map(k => {
    const [r, c] = k.split('-').map(Number);
    return `${rowLabels[r]}${c+1}`;
  }).join(', ');
 
  const price   = ticketPrices[type];
  const total   = selectedSeats.length * price;
 
  document.getElementById('sumMovie').textContent  = currentMovie ? currentMovie.title : '—';
  document.getElementById('sumTime').textContent   = selectedTime || '—';
  document.getElementById('sumSeats').textContent  = seatLabels  || '—';
  document.getElementById('sumName').textContent   = (name + ' ' + surname).trim() || '—';
  document.getElementById('sumTotal').textContent  = total + ' ₼';
 
  const valid = selectedTime && selectedSeats.length > 0 && name && email;
  document.getElementById('confirmBtn').disabled = !valid;
}
 
// ════════════════════════════════════════════
//  CONFIRM BOOKING
// ════════════════════════════════════════════
function confirmBooking() {
  const code = 'CX-' + Math.random().toString(36).substr(2,6).toUpperCase();
  const name = document.getElementById('fName').value.trim();
  const surname = document.getElementById('fSurname').value.trim();
  const rowLabels = ['A','B','C','D','E','F'];
  const seatLabels = selectedSeats.map(k => {
    const [r,c] = k.split('-').map(Number);
    return `${rowLabels[r]}${c+1}`;
  }).join(', ');
 
  document.getElementById('ticketCode').textContent = code;
  document.getElementById('ticketInfo').innerHTML =
    `<strong>${currentMovie.title}</strong> • ${selectedTime}<br>` +
    `Места: ${seatLabels}<br>` +
    `Покупатель: ${name} ${surname}`;
 
  document.getElementById('bookingView').style.display = 'none';
  document.getElementById('successView').style.display = 'block';
 
  // mark seats as taken visually
  selectedSeats.forEach(k => takenSeats[currentMovie.id].add(k));
}