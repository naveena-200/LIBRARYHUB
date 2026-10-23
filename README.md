# LibraryHub — Smart Library Management System

A professional student project based on user friendly library management. It demonstrates common library workflows and connects Data Structures & Algorithms with a practical application.

## Project files

- `index.html` — responsive interface and page layout
- `style.css` — styling and responsive layout
- `script.js` — interactive browser app; demo records persist in browser `localStorage`
- `LibraryHub.java` — standalone Java console edition demonstrating OOP and DSA
- `README.md` — setup and project notes

## Run the interface on GitHub Pages

GitHub Pages serves static websites. It can run the HTML/CSS/JavaScript interface, but **it cannot execute Java server-side code**. The browser edition is therefore implemented in JavaScript so it works on GitHub Pages; the Java source is included separately for your Java/DSA demonstration.

1. Create a GitHub repository, for example `libraryhub`.
2. Upload `index.html`, `style.css`, `script.js`, and `LibraryHub.java` to the repository root (keep these filenames unchanged).
3. Open **Settings → Pages**.
4. Under the build/deployment section, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then Save.
6. Wait for deployment and open the URL shown on the Pages settings screen, usually `https://YOUR-USERNAME.github.io/libraryhub/`.

The website works without a build step, server, database, or API key. Changes made in the website are saved only in the current browser on that device. They are demo data, not shared between users.

## Run the Java console edition

Install a JDK (Java 17 or newer recommended), open a terminal in the folder containing `LibraryHub.java`, then run:

```bash
javac LibraryHub.java
java LibraryHub
```

You can also paste `LibraryHub.java` into an online Java compiler that supports interactive console input. GitHub itself stores the Java file but does not execute it as a live website.

## Features

- Dashboard summary: total copies, available copies, active loans and members
- Add/remove books and register/remove members
- Search by book title, author, category or ID
- Sort books by title, author or availability; filter by category
- Issue books, due dates, return processing and a three-book member limit
- FIFO reservation queue
- Undo for browser-edition changes
- Responsive layout for desktop and mobile
- Seed records so the app has meaningful output immediately

## Data Structures & Algorithms

| Concept | Use in LibraryHub |
|---|---|
| Array/list | Displaying and sorting catalogue records |
| Hash map | Fast lookup by book/member ID in Java |
| Queue (FIFO) | Reservation waiting list |
| Stack (LIFO) | Undo/action history |
| Searching | Keyword search across title, author, category and ID |
| Sorting | Title, author and availability ordering |
| OOP | `Book`, `Member`, `Loan` classes and encapsulated operations |

## Limitations / future enhancements

This is a college-project demo, not a production library platform. Browser records are local to each browser. A real multi-user deployment needs a Java backend (for example Spring Boot), a database, authentication, server-side validation and deployment on a Java-capable host. The included Java console program demonstrates core operations and data structures independently of the GitHub Pages interface.
