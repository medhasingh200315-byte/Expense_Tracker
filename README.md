🌟 Project Description: Expense Tracker
The Expense Tracker is a client-side web application built with pure HTML, CSS, and JavaScript, designed for personal financial management.

It offers a responsive user interface with a dark theme that allows users to quickly record expenses, categorize them, and add descriptions. Crucially, the application utilizes the browser's Local Storage to ensure all expense data is persistent and saved locally without the need for a server or external database.

The main features include robust filtering options (by date range, category, and text search) and dynamic summary statistics that provide real-time insights into spending habits. For data security and portability, the tracker supports Export of the complete dataset (as JSON) and Import functionality to load backups. This makes it a powerful, private, and portable tool for tracking daily finances.

📝 README File (How to Use)
Expense Tracker User Guide
This guide explains how to use the main features of the Expense Tracker web application. The data is saved directly in your browser using Local Storage, meaning your information persists even if you close the tab, but it will only be available on the computer and browser you used to enter the data.

1. Adding an Expense
Locate the "Add Expense" card.

Fill in the four fields:

Date: Defaults to today.

Category: Select from the predefined options (Food, Transport, etc.).

Amount: Enter a valid positive number (e.g., 50.99).

Description: Briefly describe the expense (e.g., "Lunch at cafe").

Click the "Add Expense" button. The item will appear in the table and the totals will update instantly.

2. Filtering Expenses
Use the toolbar above the main table to narrow down the displayed list:

Search Description: Type a keyword (e.g., "bus") to show only expenses whose description includes that text.

Filter Category: Select a category (e.g., "Transport") to show only items in that group.

From Date / To Date: Use the date pickers to view expenses within a specific period.

Click "Reset" to clear all filters and restore the full list.

3. Editing and Deleting
In the rightmost column (Actions), each expense row has two buttons:

Edit: Clicking this button uses browser prompt boxes to allow you to change the date, category, amount, or description of the selected item.

Delete: Clicking this will ask for confirmation before permanently removing the expense.

4. Data Management (Import/Export/Clear)
These buttons are located in the top header:

Export: Downloads your entire expense list as a expenses.json file. This is crucial for backing up your data.

Import: Allows you to load data from a previously exported .json file, replacing the current data set.

Clear All: CAUTION: This permanently deletes all saved expense data from your browser storage. It requires a confirmation step.


