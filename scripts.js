document.getElementById('book-form').addEventListener('submit', addBook);

function addBook(event) {
    event.preventDefault();

    // Get form values
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;

    // Create a new row
    const row = document.createElement('tr');

    // Add cells to the row
    row.innerHTML = `
        <td>${title}</td>
        <td>${author}</td>
        <td>${isbn}</td>
        <td><button class="delete">Delete</button></td>
    `;

    // Append the row to the table body
    document.getElementById('book-table-body').appendChild(row);

    // Clear form fields
    document.getElementById('book-form').reset();

    // Add delete functionality
    row.querySelector('.delete').addEventListener('click', function() {
        row.remove();
    });
}
