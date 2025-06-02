
// Book data storage
let books = [];
let borrowers = [];

// DOM elements
const bookForm = document.getElementById('book-form');
const bookTableBody = document.getElementById('book-table-body');
const emptyState = document.getElementById('empty-state');
const booksTable = document.getElementById('books-table');
const bookCount = document.getElementById('book-count');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Borrower elements
const loanForm = document.getElementById('loan-form');
const bookSelect = document.getElementById('book-select');
const borrowersTableBody = document.getElementById('borrowers-table-body');
const borrowersEmptyState = document.getElementById('borrowers-empty-state');
const borrowersTable = document.getElementById('borrowers-table');
const borrowersCount = document.getElementById('borrowers-count');

// Set default due date to 14 days from today
const dueDateInput = document.getElementById('due-date');
if (dueDateInput) {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    dueDateInput.value = formatDateForInput(twoWeeksFromNow);
}

// Show initial UI state
updateBookList();
updateBorrowersList();

// Event listener for form submission
bookForm.addEventListener('submit', addBook);
loanForm.addEventListener('submit', loanBook);

// Function to add a new book
function addBook(event) {
    event.preventDefault();

    // Get form values
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();

    // Form validation
    if (!title || !author || !isbn) {
        showToast('Please fill in all fields');
        return;
    }

    // Check if ISBN already exists
    if (books.some(book => book.isbn === isbn)) {
        showToast('A book with this ISBN already exists');
        return;
    }

    // Create a new book object with a unique ID
    const newBook = {
        id: Date.now(), // Using timestamp as a simple unique ID
        title,
        author,
        isbn,
        available: true
    };

    // Add book to array
    books.push(newBook);
    
    // Update the UI
    updateBookList();
    updateBookSelectOptions();
    
    // Clear form fields
    bookForm.reset();
    
    // Show success message
    showToast(`"${title}" has been added to your library`);
}

// Function to update book list display
function updateBookList() {
    // Clear the existing table content
    bookTableBody.innerHTML = '';
    
    // Update book count message
    if (books.length === 0) {
        bookCount.textContent = 'Your library is empty. Add some books!';
        emptyState.style.display = 'flex';
        booksTable.style.display = 'none';
    } else {
        bookCount.textContent = `You have ${books.length} book${books.length === 1 ? '' : 's'} in your library`;
        emptyState.style.display = 'none';
        booksTable.style.display = 'table';
        
        // Add each book to the table
        books.forEach(book => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td class="actions-column">
                    <button class="delete" data-id="${book.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-trash">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            `;
            
            bookTableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function() {
                deleteBook(this.getAttribute('data-id'));
            });
        });
    }
}

// Function to delete a book
function deleteBook(id) {
    // Find the book to get its title for the notification
    const bookIndex = books.findIndex(book => book.id == id);
    if (bookIndex === -1) return;
    
    const bookTitle = books[bookIndex].title;
    
    // Check if book is currently borrowed
    const isBorrowed = borrowers.some(borrower => borrower.bookId == id);
    if (isBorrowed) {
        showToast(`Cannot delete "${bookTitle}" as it is currently on loan`);
        return;
    }
    
    // Remove the book from the array
    books.splice(bookIndex, 1);
    
    // Update the UI
    updateBookList();
    updateBookSelectOptions();
    
    // Show notification
    showToast(`"${bookTitle}" has been removed`);
}

// Function to show toast notifications
function showToast(message) {
    // Set the message
    toastMessage.textContent = message;
    
    // Show the toast
    toast.classList.add('show');
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Function to update book select options in the loan form
function updateBookSelectOptions() {
    // Clear existing options except the placeholder
    while (bookSelect.options.length > 1) {
        bookSelect.remove(1);
    }
    
    // Get only available books
    const availableBooks = books.filter(book => book.available);
    
    // Add book options
    availableBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.title;
        bookSelect.appendChild(option);
    });
    
    // Disable select if no books available
    if (availableBooks.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No available books';
        bookSelect.appendChild(option);
    }
}

// Function to loan a book
function loanBook(event) {
    event.preventDefault();
    
    // Get form values
    const studentName = document.getElementById('student-name').value.trim();
    const bookId = document.getElementById('book-select').value;
    const dueDate = document.getElementById('due-date').value;
    
    // Form validation
    if (!studentName || !bookId || !dueDate) {
        showToast('Please fill in all fields');
        return;
    }
    
    // Find the book
    const book = books.find(book => book.id == bookId);
    if (!book) {
        showToast('Selected book not found');
        return;
    }
    
    // Mark book as unavailable
    book.available = false;
    
    // Create borrower record
    const borrower = {
        id: Date.now(),
        studentName,
        bookId,
        bookTitle: book.title,
        borrowDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        dueDate
    };
    
    // Add to borrowers array
    borrowers.push(borrower);
    
    // Update UI
    updateBorrowersList();
    updateBookSelectOptions();
    
    // Reset form
    loanForm.reset();
    
    // Set default due date again
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    dueDateInput.value = formatDateForInput(twoWeeksFromNow);
    
    // Show toast
    showToast(`"${book.title}" has been loaned to ${studentName}`);
}

// Function to update borrowers list
function updateBorrowersList() {
    // Clear existing content
    borrowersTableBody.innerHTML = '';
    
    // Update borrowers count
    if (borrowers.length === 0) {
        borrowersCount.textContent = 'No active borrowers';
        borrowersEmptyState.style.display = 'flex';
        borrowersTable.style.display = 'none';
    } else {
        borrowersCount.textContent = `${borrowers.length} active borrower${borrowers.length === 1 ? '' : 's'}`;
        borrowersEmptyState.style.display = 'none';
        borrowersTable.style.display = 'table';
        
        // Add each borrower to table
        borrowers.forEach(borrower => {
            const row = document.createElement('tr');
            
            // Check if book is overdue
            const today = new Date();
            const dueDate = new Date(borrower.dueDate);
            const isOverdue = today > dueDate;
            
            row.innerHTML = `
                <td>${borrower.studentName}</td>
                <td>${borrower.bookTitle}</td>
                <td>${formatDate(borrower.borrowDate)}</td>
                <td class="${isOverdue ? 'overdue' : ''}">${formatDate(borrower.dueDate)}</td>
                <td class="actions-column">
                    <button class="return" data-id="${borrower.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-book">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                    </button>
                </td>
            `;
            
            borrowersTableBody.appendChild(row);
        });
        
        // Add event listeners to return buttons
        document.querySelectorAll('.return').forEach(button => {
            button.addEventListener('click', function() {
                returnBook(this.getAttribute('data-id'));
            });
        });
    }
}

// Function to return a book
function returnBook(id) {
    // Find the borrower record
    const borrowerIndex = borrowers.findIndex(borrower => borrower.id == id);
    if (borrowerIndex === -1) return;
    
    const borrower = borrowers[borrowerIndex];
    
    // Find the book
    const book = books.find(book => book.id == borrower.bookId);
    if (book) {
        // Mark book as available
        book.available = true;
    }
    
    // Remove borrower record
    borrowers.splice(borrowerIndex, 1);
    
    // Update UI
    updateBorrowersList();
    updateBookSelectOptions();
    
    // Show toast
    showToast(`"${borrower.bookTitle}" has been returned by ${borrower.studentName}`);
}

// Helper function to format date for display (DD/MM/YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Helper function to format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// Initialize book select options
updateBookSelectOptions();
