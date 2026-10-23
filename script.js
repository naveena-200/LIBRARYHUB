
/* LibraryHub - Library Management System */

const STORAGE_KEY = "libraryhub-v1";

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const seed = {
  books: [
    {id:"BK-1001",title:"Clean Code",author:"Robert C. Martin",category:"Computer Science",total:4,available:3},
    {id:"BK-1002",title:"The Pragmatic Programmer",author:"Andrew Hunt",category:"Computer Science",total:3,available:2},
    {id:"BK-1003",title:"Atomic Habits",author:"James Clear",category:"Self Development",total:5,available:5},
    {id:"BK-1004",title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",total:4,available:4},
    {id:"BK-1005",title:"Introduction to Algorithms",author:"Thomas H. Cormen",category:"Computer Science",total:2,available:1},
    {id:"BK-1006",title:"A Brief History of Time",author:"Stephen Hawking",category:"Science",total:3,available:3}
  ],
  members: [
    {id:"MB-2001",name:"Aarav Menon",email:"aarav@example.com"},
    {id:"MB-2002",name:"Diya Thomas",email:"diya@example.com"},
    {id:"MB-2003",name:"Ishaan Nair",email:"ishaan@example.com"}
  ],
  loans: [
    {id:"LN-3001",bookId:"BK-1001",memberId:"MB-2001",issued:dateOffset(-2),due:dateOffset(12)},
    {id:"LN-3002",bookId:"BK-1002",memberId:"MB-2002",issued:dateOffset(-1),due:dateOffset(13)},
    {id:"LN-3003",bookId:"BK-1005",memberId:"MB-2003",issued:dateOffset(-5),due:dateOffset(9)}
  ],
  reservations: [],
  nextBook:1007,
  nextMember:2004,
  nextLoan:3004,
  nextReservation:4001
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(seed));
  } catch (e) {
    return JSON.parse(JSON.stringify(seed));
  }
}

let state = loadState();
let undoStack = [];
let toastTimer;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function snapshot() {
  undoStack.push(JSON.stringify(state));
  if (undoStack.length > 20) undoStack.shift();
  document.getElementById("undoBtn").disabled = false;
}

function undo() {
  if (!undoStack.length) {
    toast("Nothing to undo yet.");
    return;
  }
  state = JSON.parse(undoStack.pop());
  saveState();
  render();
  toast("Last change undone.");
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function byId(list, id) {
  return list.find(x => x.id === id);
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2)
    .map(s => s[0] || "").join("").toUpperCase();
}

function bookStatus(b) {
  return b.available > 0
    ? `<span class="status available"><i class="status-dot"></i>Available</span>`
    : `<span class="status out"><i class="status-dot"></i>On loan</span>`;
}

function coverClass(i) {
  return "cover-" + (i % 5);
}

function bookCell(b, i) {
  return `<div class="book-cell">
    <span class="book-cover ${coverClass(i)}">${escapeHTML(b.title.charAt(0).toUpperCase())}</span>
    <div>
      <strong>${escapeHTML(b.title)}</strong>
      <small>${escapeHTML(b.author)}</small>
    </div>
  </div>`;
}

function render() {
  document.getElementById("totalBooks").textContent =
    state.books.reduce((n, b) => n + b.total, 0);

  document.getElementById("availableBooks").textContent =
    state.books.reduce((n, b) => n + b.available, 0);

  document.getElementById("loanBooks").textContent = state.loans.length;
  document.getElementById("totalMembers").textContent = state.members.length;

  document.getElementById("reservationBadge").textContent =
    state.reservations.length;

  document.getElementById("loanCount").textContent =
    `${state.loans.length} active`;

  document.getElementById("queueCount").textContent =
    `${state.reservations.length} waiting`;

  renderRecent();
  renderBooks();
  renderMembers();
  renderLoans();
  renderReservations();
  renderSelects();
  renderCategories();

  document.getElementById("undoBtn").disabled = !undoStack.length;
}

function renderRecent() {
  const body = document.getElementById("recentBooks");

  body.innerHTML = state.books.slice(-5).reverse()
    .map((b, i) => `<tr>
      <td>${bookCell(b, i)}</td>
      <td>${escapeHTML(b.author)}</td>
      <td>${bookStatus(b)}</td>
    </tr>`).join("");

  if (!body.innerHTML) {
    body.innerHTML = '<tr><td colspan="3">No books yet.</td></tr>';
  }
}

function renderBooks() {
  const q = document.getElementById("bookSearch").value.toLowerCase();
  const sort = document.getElementById("sortBooks").value;
  const cat = document.getElementById("categoryFilter").value;

  let list = state.books.filter(b =>
    (`${b.id} ${b.title} ${b.author} ${b.category}`)
      .toLowerCase().includes(q) &&
    (!cat || b.category === cat)
  );

  list.sort((a, b) =>
    sort === "author" ? a.author.localeCompare(b.author) :
    sort === "availability" ? b.available - a.available :
    a.title.localeCompare(b.title)
  );

  document.getElementById("booksTable").innerHTML =
    list.map((b, i) => `<tr>
      <td>${bookCell(b, i)}</td>
      <td>${escapeHTML(b.id)}</td>
      <td>${escapeHTML(b.category)}</td>
      <td>${b.available} / ${b.total}</td>
      <td>${bookStatus(b)}</td>
      <td><button class="action-btn danger" data-remove-book="${b.id}">Remove</button></td>
    </tr>`).join("");

  document.getElementById("booksEmpty")
    .classList.toggle("hidden", list.length > 0);
}

function renderMembers() {
  const q = document.getElementById("memberSearch").value.toLowerCase();

  const list = state.members.filter(m =>
    `${m.id} ${m.name} ${m.email}`.toLowerCase().includes(q)
  );

  document.getElementById("membersTable").innerHTML =
    list.map(m => {
      const count = state.loans.filter(l => l.memberId === m.id).length;

      return `<tr>
        <td><div class="member-cell">
          <span class="member-avatar">${escapeHTML(initials(m.name))}</span>
          <div><strong>${escapeHTML(m.name)}</strong><small>Library reader</small></div>
        </div></td>
        <td>${escapeHTML(m.id)}</td>
        <td>${escapeHTML(m.email)}</td>
        <td>${count}</td>
        <td><button class="action-btn danger" data-remove-member="${m.id}">Remove</button></td>
      </tr>`;
    }).join("");

  document.getElementById("membersEmpty")
    .classList.toggle("hidden", list.length > 0);
}

function renderLoans() {
  const rows = state.loans.map(l => {
    const b = byId(state.books, l.bookId);
    const m = byId(state.members, l.memberId);
    const overdue = l.due < dateOffset(0);

    return `<tr>
      <td><strong>${escapeHTML(b?.title || "Removed book")}</strong><br><small>${escapeHTML(l.bookId)}</small></td>
      <td>${escapeHTML(m?.name || "Removed member")}</td>
      <td>${l.issued}</td>
      <td>${l.due}</td>
      <td><span class="status ${overdue ? "out" : "available"}">${overdue ? "Overdue" : "On loan"}</span></td>
      <td><button class="action-btn" data-return="${l.id}">Return book</button></td>
    </tr>`;
  }).join("");

  document.getElementById("loansTable").innerHTML = rows;
  document.getElementById("loansEmpty")
    .classList.toggle("hidden", state.loans.length > 0);
}

function renderReservations() {
  const list = document.getElementById("reservationList");

  list.innerHTML = state.reservations.map((r, i) => {
    const b = byId(state.books, r.bookId);
    const m = byId(state.members, r.memberId);

    return `<div class="reservation-item">
      <span class="queue-number">${String(i + 1).padStart(2, "0")}</span>
      <div class="reservation-info">
        <strong>${escapeHTML(b?.title || "Removed book")}</strong>
        <small>${escapeHTML(m?.name || "Removed member")} · Requested ${r.date}</small>
      </div>
      <span class="status wait">Waiting</span>
      <button class="action-btn danger" data-cancel-res="${r.id}">Cancel</button>
    </div>`;
  }).join("");

  document.getElementById("reservationsEmpty")
    .classList.toggle("hidden", state.reservations.length > 0);
}

function renderSelects() {
  const bookOptions = state.books.map(b =>
    `<option value="${b.id}">${escapeHTML(b.title)} (${b.available} available)</option>`
  ).join("");

  const memberOptions = state.members.map(m =>
    `<option value="${m.id}">${escapeHTML(m.name)}</option>`
  ).join("");

  ["issueBook", "reserveBook"].forEach(id => {
    const el = document.getElementById(id);
    const old = el.value;
    el.innerHTML = bookOptions;
    if ([...el.options].some(o => o.value === old)) el.value = old;
  });

  ["issueMember", "reserveMember"].forEach(id => {
    const el = document.getElementById(id);
    const old = el.value;
    el.innerHTML = memberOptions;
    if ([...el.options].some(o => o.value === old)) el.value = old;
  });
}

function renderCategories() {
  const el = document.getElementById("categoryFilter");
  const old = el.value;
  const cats = [...new Set(state.books.map(b => b.category))].sort();

  el.innerHTML = '<option value="">All categories</option>' +
    cats.map(c => `<option>${escapeHTML(c)}</option>`).join("");

  el.value = old;
}

function showView(name) {
  document.querySelectorAll(".view")
    .forEach(v => v.classList.remove("active"));

  document.getElementById(name + "View").classList.add("active");

  document.querySelectorAll(".nav-link")
    .forEach(b => b.classList.toggle("active", b.dataset.view === name));

  const labels = {
    dashboard:"Dashboard",
    books:"Book catalogue",
    members:"Members",
    loans:"Issue & return",
    reservations:"Reservations"
  };

  const label = labels[name];

  document.getElementById("pageName").textContent = label;
  document.getElementById("heading").innerHTML =
    name === "dashboard" ? 'Good morning, Librarian <span>✦</span>' : label;

  document.querySelector(".eyebrow").textContent =
    name === "dashboard" ? "LIBRARY OVERVIEW" : label.toUpperCase();

  window.scrollTo({top:0, behavior:"smooth"});
}

function openDialog(id) {
  document.getElementById(id).showModal();
}

document.querySelectorAll(".nav-link").forEach(b =>
  b.addEventListener("click", () => showView(b.dataset.view))
);

document.querySelectorAll("[data-goto]").forEach(b =>
  b.addEventListener("click", () => showView(b.dataset.goto))
);

document.getElementById("quickAddBtn")
  .addEventListener("click", () => openDialog("bookDialog"));

document.getElementById("addBookBtn")
  .addEventListener("click", () => openDialog("bookDialog"));

document.getElementById("addMemberBtn")
  .addEventListener("click", () => openDialog("memberDialog"));

document.querySelectorAll("[data-close]").forEach(b =>
  b.addEventListener("click", () =>
    document.getElementById(b.dataset.close).close()
  )
);

document.getElementById("undoBtn").addEventListener("click", undo);

["bookSearch", "sortBooks", "categoryFilter"].forEach(id =>
  document.getElementById(id).addEventListener("input", renderBooks)
);

document.getElementById("memberSearch")
  .addEventListener("input", renderMembers);

document.getElementById("bookForm").addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("bookTitle").value.trim();
  const author = document.getElementById("bookAuthor").value.trim();
  const category = document.getElementById("bookCategory").value.trim();
  const total = Number(document.getElementById("bookCopies").value);

  if (!title || !author || !category ||
      !Number.isInteger(total) || total < 1) {
    toast("Please enter valid book details.");
    return;
  }

  snapshot();

  state.books.push({
    id:"BK-" + state.nextBook++,
    title, author, category,
    total, available:total
  });

  saveState();
  render();
  e.target.reset();
  document.getElementById("bookCopies").value = 1;
  document.getElementById("bookDialog").close();
  showView("books");
  toast("Book added to catalogue.");
});

document.getElementById("memberForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("memberName").value.trim();
  const email = document.getElementById("memberEmail").value.trim();

  if (state.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    toast("A member with this email already exists.");
    return;
  }

  snapshot();

  state.members.push({
    id:"MB-" + state.nextMember++,
    name,
    email
  });

  saveState();
  render();
  e.target.reset();
  document.getElementById("memberDialog").close();
  showView("members");
  toast("Member registered successfully.");
});

document.getElementById("issueForm").addEventListener("submit", e => {
  e.preventDefault();

  const book = byId(state.books, document.getElementById("issueBook").value);
  const member = byId(state.members, document.getElementById("issueMember").value);

  if (!book || !member) {
    toast("Add a book and a member first.");
    return;
  }

  if (book.available < 1) {
    toast("No copies available. Add a reservation instead.");
    return;
  }

  if (state.loans.filter(l => l.memberId === member.id).length >= 3) {
    toast("This member has reached the 3-book loan limit.");
    return;
  }

  snapshot();
  book.available--;

  state.loans.push({
    id:"LN-" + state.nextLoan++,
    bookId:book.id,
    memberId:member.id,
    issued:dateOffset(0),
    due:dateOffset(14)
  });

  saveState();
  render();
  toast("Book issued. Due in 14 days.");
});

document.getElementById("reserveForm").addEventListener("submit", e => {
  e.preventDefault();

  const book = byId(state.books, document.getElementById("reserveBook").value);
  const member = byId(state.members, document.getElementById("reserveMember").value);

  if (!book || !member) {
    toast("Add a book and a member first.");
    return;
  }

  if (state.reservations.some(r =>
      r.bookId === book.id && r.memberId === member.id)) {
    toast("This member already reserved that book.");
    return;
  }

  snapshot();

  state.reservations.push({
    id:"RS-" + state.nextReservation++,
    bookId:book.id,
    memberId:member.id,
    date:dateOffset(0)
  });

  saveState();
  render();
  toast("Reservation added to the FIFO queue.");
});

document.addEventListener("click", e => {
  const removeBook = e.target.closest("[data-remove-book]")?.dataset.removeBook;
  const removeMember = e.target.closest("[data-remove-member]")?.dataset.removeMember;
  const returnId = e.target.closest("[data-return]")?.dataset.return;
  const cancelId = e.target.closest("[data-cancel-res]")?.dataset.cancelRes;

  if (removeBook) {
    const b = byId(state.books, removeBook);

    if (state.loans.some(l => l.bookId === removeBook)) {
      toast("Return this book before removing it.");
      return;
    }

    if (!confirm(`Remove "${b.title}" from the catalogue?`)) return;

    snapshot();
    state.books = state.books.filter(x => x.id !== removeBook);
    state.reservations = state.reservations.filter(r => r.bookId !== removeBook);
    saveState();
    render();
    toast("Book removed.");
  }

  if (removeMember) {
    if (state.loans.some(l => l.memberId === removeMember)) {
      toast("This member has an active loan. Process the return first.");
      return;
    }

    if (!confirm("Remove this member record?")) return;

    snapshot();
    state.members = state.members.filter(m => m.id !== removeMember);
    state.reservations = state.reservations.filter(r => r.memberId !== removeMember);
    saveState();
    render();
    toast("Member record removed.");
  }

  if (returnId) {
    const loan = byId(state.loans, returnId);
    if (!loan) return;

    snapshot();
    state.loans = state.loans.filter(l => l.id !== returnId);

    const b = byId(state.books, loan.bookId);
    if (b) b.available = Math.min(b.total, b.available + 1);

    const waitingIndex = state.reservations.findIndex(r => r.bookId === loan.bookId);

    if (waitingIndex >= 0 && b && b.available > 0) {
      const next = state.reservations.splice(waitingIndex, 1)[0];
      toast(`Book returned. ${byId(state.members, next.memberId)?.name || "Next reader"} is next in the reservation queue.`);
    } else {
      toast("Book returned successfully.");
    }

    saveState();
    render();
  }

  if (cancelId) {
    snapshot();
    state.reservations = state.reservations.filter(r => r.id !== cancelId);
    saveState();
    render();
    toast("Reservation cancelled.");
  }
});

document.getElementById("todayLabel").textContent =
  new Intl.DateTimeFormat("en-IN", {
    day:"numeric",
    month:"short",
    year:"numeric"
  }).format(new Date());

if (!localStorage.getItem(STORAGE_KEY)) saveState();

render();
