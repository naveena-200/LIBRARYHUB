import java.time.LocalDate;
import java.util.*;

/**
 * LibraryHub - Java console edition demonstrating OOP and data structures.
 * Compile: javac LibraryHub.java
 * Run:     java LibraryHub
 *
 * The GitHub Pages interface uses HTML/CSS/JavaScript. This Java file is
 * a separate runnable Java implementation for the DSA/Java college project.
 */
public class LibraryHub {
    static class Book {
        String id, title, author, category;
        int total, available;
        Book(String id, String title, String author, String category, int copies) {
            this.id=id; this.title=title; this.author=author; this.category=category;
            this.total=copies; this.available=copies;
        }
        public String toString() {
            return String.format("%-9s | %-28s | %-20s | %-5s | %d/%d",
                id, title, author, category, available, total);
        }
    }
    static class Member {
        String id, name, email;
        Member(String id, String name, String email) { this.id=id; this.name=name; this.email=email; }
        public String toString() { return id+" | "+name+" | "+email; }
    }
    static class Loan {
        String id, bookId, memberId;
        LocalDate issued, due;
        Loan(String id,String bookId,String memberId) {
            this.id=id;this.bookId=bookId;this.memberId=memberId;
            issued=LocalDate.now();due=issued.plusDays(14);
        }
    }

    // HashMap: average O(1) lookup by ID. ArrayList: catalogue iteration/sorting.
    private final Map<String,Book> books = new HashMap<>();
    private final Map<String,Member> members = new HashMap<>();
    private final List<Loan> loans = new ArrayList<>();
    // Queue: FIFO reservations. Stack: undo history snapshots.
    private final Queue<String> reservations = new LinkedList<>();
    private final Deque<String> undoStack = new ArrayDeque<>();
    private int bookSeq=1001, memberSeq=2001, loanSeq=3001;

    private void remember(String action) { undoStack.push(action); }
    public void addBook(String title,String author,String category,int copies) {
        if(copies<1) { System.out.println("Copies must be at least 1."); return; }
        String id="BK-"+bookSeq++;
        books.put(id,new Book(id,title,author,category,copies));
        remember("ADD_BOOK:"+id);
        System.out.println("Book added successfully. ID: "+id);
    }
    public void addMember(String name,String email) {
        String id="MB-"+memberSeq++;
        members.put(id,new Member(id,name,email));
        remember("ADD_MEMBER:"+id);
        System.out.println("Member registered successfully. ID: "+id);
    }
    public void listBooks() {
        if(books.isEmpty()) { System.out.println("No books in catalogue."); return; }
        List<Book> list=new ArrayList<>(books.values());
        list.sort(Comparator.comparing(b->b.title.toLowerCase(Locale.ROOT)));
        System.out.println("\nID        | TITLE                        | AUTHOR               | CATEGORY | AVAILABLE/TOTAL");
        for(Book b:list) System.out.println(b);
    }
    public void searchBook(String keyword) {
        String q=keyword.toLowerCase(Locale.ROOT); boolean found=false;
        for(Book b:books.values()) {
            if(b.title.toLowerCase(Locale.ROOT).contains(q) ||
               b.author.toLowerCase(Locale.ROOT).contains(q) ||
               b.category.toLowerCase(Locale.ROOT).contains(q)) {
                System.out.println(b); found=true;
            }
        }
        if(!found) System.out.println("No matching books found.");
    }
    public void issueBook(String bookId,String memberId) {
        Book b=books.get(bookId); Member m=members.get(memberId);
        if(b==null) { System.out.println("Book ID not found."); return; }
        if(m==null) { System.out.println("Member ID not found."); return; }
        long memberLoans=loans.stream().filter(l->l.memberId.equals(memberId)).count();
        if(b.available==0) { System.out.println("No copies available. Add a reservation."); return; }
        if(memberLoans>=3) { System.out.println("Member has reached the 3-book limit."); return; }
        b.available--; Loan loan=new Loan("LN-"+loanSeq++,bookId,memberId); loans.add(loan);
        remember("ISSUE:"+loan.id);
        System.out.println("Book issued. Loan ID: "+loan.id+" | Due: "+loan.due);
    }
    public void returnBook(String loanId) {
        for(int i=0;i<loans.size();i++) {
            Loan l=loans.get(i);
            if(l.id.equalsIgnoreCase(loanId)) {
                loans.remove(i); Book b=books.get(l.bookId); if(b!=null)b.available++;
                remember("RETURN:"+l.id+":"+l.bookId+":"+l.memberId);
                System.out.println("Book returned successfully.");
                if(!reservations.isEmpty()) System.out.println("Next reservation in FIFO queue: "+reservations.peek());
                return;
            }
        }
        System.out.println("Active loan ID not found.");
    }
    public void reserveBook(String bookId,String memberId) {
        if(!books.containsKey(bookId)||!members.containsKey(memberId)) {
            System.out.println("Check the book ID and member ID."); return;
        }
        reservations.offer(bookId+" reserved by "+memberId);
        remember("RESERVE");
        System.out.println("Reservation added to queue. Waiting: "+reservations.size());
    }
    public void showLoans() {
        if(loans.isEmpty()) { System.out.println("No active loans."); return; }
        for(Loan l:loans) System.out.println(l.id+" | "+books.get(l.bookId).title+
            " | "+members.get(l.memberId).name+" | Issued "+l.issued+" | Due "+l.due);
    }
    public void showReservations() {
        if(reservations.isEmpty()) { System.out.println("No reservations."); return; }
        int position=1; for(String r:reservations) System.out.println((position++)+". "+r);
    }
    public void undoLastAction() {
        if(undoStack.isEmpty()) { System.out.println("Nothing to undo (console demo keeps action history)."); return; }
        System.out.println("Last recorded action: "+undoStack.pop());
        System.out.println("Undo history demonstrated. For full rollback, use the browser edition's Undo button.");
    }
    private static String read(Scanner sc,String prompt) {
        System.out.print(prompt); return sc.nextLine().trim();
    }
    public void run() {
        // Demo seed data so the program has useful output on first run.
        addBook("Clean Code","Robert C. Martin","Computer Science",4);
        addBook("Atomic Habits","James Clear","Self Development",3);
        addMember("Aarav Menon","aarav@example.com");
        addMember("Diya Thomas","diya@example.com");
        Scanner sc=new Scanner(System.in);
        while(true) {
            System.out.println("\n========== LIBRARYHUB ==========");
            System.out.println("1. Add book       2. List books");
            System.out.println("3. Search books   4. Register member");
            System.out.println("5. Issue book     6. Return book");
            System.out.println("7. Show loans     8. Reserve book");
            System.out.println("9. Show queue    10. Undo history");
            System.out.println("0. Exit");
            String choice=read(sc,"Choose option: ");
            try {
                switch(choice) {
                    case "1": addBook(read(sc,"Title: "),read(sc,"Author: "),
                        read(sc,"Category: "),Integer.parseInt(read(sc,"Copies: "))); break;
                    case "2": listBooks(); break;
                    case "3": searchBook(read(sc,"Search title/author/category: ")); break;
                    case "4": addMember(read(sc,"Full name: "),read(sc,"Email: ")); break;
                    case "5": issueBook(read(sc,"Book ID: "),read(sc,"Member ID: ")); break;
                    case "6": returnBook(read(sc,"Loan ID: ")); break;
                    case "7": showLoans(); break;
                    case "8": reserveBook(read(sc,"Book ID: "),read(sc,"Member ID: ")); break;
                    case "9": showReservations(); break;
                    case "10": undoLastAction(); break;
                    case "0": System.out.println("Thank you for using LibraryHub!"); return;
                    default: System.out.println("Invalid option. Try again.");
                }
            } catch(NumberFormatException ex) { System.out.println("Please enter a valid number."); }
        }
    }
    public static void main(String[] args) { new LibraryHub().run(); }
}