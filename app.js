// API URL and key
const baseURL = "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json";
const apiKey = "QTd4H7HDVpLKhqIqtV42NmAthrt8ub4b";

// DOM elements
const fetchButton = document.getElementById("fetchButton");
const bookList = document.getElementById("bookList");
const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageSpan = document.getElementById("currentPage");

// Application state
let books = [];
let currentPage = 1;
const booksPerPage = 10;

// Event listeners
fetchButton.addEventListener("click", handleFetchAndSearch);
sortSelect.addEventListener("change", filterAndDisplayBooks);
prevPageButton.addEventListener("click", () => changePage(-1));
nextPageButton.addEventListener("click", () => changePage(1));

// Handle fetch and search when the Fetch Books button is clicked
async function handleFetchAndSearch() {
    if (books.length === 0) {
        // If books haven't been fetched yet, fetch them first
        await fetchBooks();
    } else {
        // If books are already fetched, just filter and display
        filterAndDisplayBooks();
    }
}

// Fetch books from the API
async function fetchBooks() {
    showLoading(true);
    showError("");

    try {
        const response = await fetch(`${baseURL}?api-key=${apiKey}`);
        if (!response.ok) {
            throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        books = data.results.books;
        filterAndDisplayBooks();
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Filter, sort, and display books
function filterAndDisplayBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    let filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );

    filteredBooks.sort((a, b) => {
        if (sortBy === "title") {
            return a.title.localeCompare(b.title);
        } else if (sortBy === "author") {
            return a.author.localeCompare(b.author);
        }
    });

    displayBooks(filteredBooks);
    updatePagination(filteredBooks.length);
}

// Display books on the page
function displayBooks(booksToDisplay) {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksOnPage = booksToDisplay.slice(startIndex, endIndex);

    bookList.innerHTML = "";

    booksOnPage.forEach(book => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.innerHTML = `
            <img src="${book.book_image}" alt="${book.title}" class="book-image">
            <h2 class="book-title">${book.title}</h2>
            <p class="book-author">by ${book.author}</p>
            <p class="book-description">${book.description}</p>
        `;
        bookList.appendChild(bookElement);
    });
}

// Update pagination controls
function updatePagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

// Change the current page
function changePage(delta) {
    currentPage += delta;
    filterAndDisplayBooks();
}

// Show/hide loading message
function showLoading(isLoading) {
    loadingMessage.style.display = isLoading ? "block" : "none";
}

// Show/hide error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = message ? "block" : "none";
}

// Initial fetch on page load
fetchBooks();