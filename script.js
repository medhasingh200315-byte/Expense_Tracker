// script.js
// Expense Tracker Core Logic (Using Local Storage for persistence)

(function() {
    // --- Configuration and State Management ---
    const storageKey = 'expense_tracker_items_v1';
    // Initial set of categories. More can be added via the Edit/Import functions.
    const categorySet = new Set(['Food','Transport','Housing','Utilities','Health','Entertainment','Other']);

    /** @type {{id:string,date:string,category:string,description:string,amount:number}[]} */
    let items = []; // Main array to hold all expense objects

    // --- DOM Element References ---
    const dateInput = document.getElementById('dateInput');
    const categoryInput = document.getElementById('categoryInput');
    const amountInput = document.getElementById('amountInput');
    const descInput = document.getElementById('descInput');
    const addBtn = document.getElementById('addBtn');
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const totalCell = document.getElementById('totalCell');
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const resetFilters = document.getElementById('resetFilters');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput'); 
    const clearAllBtn = document.getElementById('clearAllBtn');
    const summaryGrid = document.getElementById('summaryGrid');

    // --- Persistence and Utility Functions ---

    /** Loads expense data from Local Storage. */
    function load() {
        try {
            const raw = localStorage.getItem(storageKey);
            items = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to parse storage', e);
            items = [];
        }
    }

    /** Saves the current expense data to Local Storage. */
    function save() {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    /** Generates a simple, non-cryptographic unique ID. */
    function uid() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    /** Formats a number as a currency string (e.g., 1234.56). */
    function formatAmount(value) {
        return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /** Populates the category filter dropdown with unique categories from the set. */
    function ensureFilterCategories() {
        const existing = new Set();
        Array.from(filterCategory.options).forEach(o => existing.add(o.value));
        for (const cat of categorySet) {
            if (!existing.has(cat)) {
                const opt = document.createElement('option');
                opt.value = cat; opt.textContent = cat; filterCategory.appendChild(opt);
            }
        }
    }

    // --- Rendering and Filtering Logic ---

    /** Filters the items and re-renders the table and summary sections. */
    function render() {
        ensureFilterCategories();
        
        // 1. Get filter values
        const text = (searchInput.value || '').trim().toLowerCase();
        const cat = filterCategory.value || '';
        const from = fromDate.value ? new Date(fromDate.value) : null;
        const to = toDate.value ? new Date(toDate.value) : null;

        // 2. Filter and sort the items
        const filtered = items.filter(it => {
            // Description search filter
            if (text && !(it.description || '').toLowerCase().includes(text)) return false;
            // Category filter
            if (cat && it.category !== cat) return false;

            // Date range filter (checks date boundaries correctly)
            const d = new Date(it.date);
            if (from && d < new Date(from.getFullYear(), from.getMonth(), from.getDate())) return false;
            if (to && d > new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)) return false;
            
            return true;
        }).sort((a,b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

        // 3. Render Table Rows
        expenseTableBody.innerHTML = '';
        let total = 0;
        for (const it of filtered) {
            total += Number(it.amount) || 0;
            const tr = document.createElement('tr');
            
            // Create cells (Date, Category, Description, Amount, Actions)
            const dateTd = document.createElement('td'); dateTd.textContent = it.date;
            const catTd = document.createElement('td'); catTd.innerHTML = `<span class="chip">${it.category}</span>`;
            const descTd = document.createElement('td'); descTd.textContent = it.description || '';
            const amtTd = document.createElement('td'); amtTd.className = 'right'; amtTd.textContent = formatAmount(it.amount);
            
            const actionTd = document.createElement('td'); actionTd.className = 'right';
            const actionWrap = document.createElement('div'); actionWrap.className = 'row-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'ghost'; editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => editItem(it.id));
            
            const delBtn = document.createElement('button');
            delBtn.className = 'ghost'; delBtn.style.borderColor = 'transparent'; 
            delBtn.style.color = 'var(--danger)'; delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => deleteItem(it.id));
            
            actionWrap.appendChild(editBtn); actionWrap.appendChild(delBtn);
            actionTd.appendChild(actionWrap);

            tr.appendChild(dateTd); tr.appendChild(catTd); tr.appendChild(descTd); 
            tr.appendChild(amtTd); tr.appendChild(actionTd);
            expenseTableBody.appendChild(tr);
        }
        
        // Update table footer total
        totalCell.textContent = formatAmount(total);
        
        // 4. Render Summary Cards
        renderSummary(filtered);
    }

    /** Calculates and renders the summary statistics cards. */
    function renderSummary(filtered) {
        const byCategory = new Map();
        let monthTotal = 0;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate totals based on ALL items for month total and top category
        for (const it of items) {
            const value = Number(it.amount) || 0;
            byCategory.set(it.category, (byCategory.get(it.category) || 0) + value);
            
            const d = new Date(it.date);
            if (d >= monthStart) monthTotal += value;
        }

        // Calculate total for only the currently filtered items
        const filteredTotal = filtered.reduce((s, it) => s + (Number(it.amount) || 0), 0);

        // Find the top category
        let topCat = null; let topVal = 0;
        for (const [c, v] of byCategory.entries()) { if (v > topVal) { topVal = v; topCat = c; } }
        
        // Clear and add new cards to the summary grid
        summaryGrid.innerHTML = '';
        summaryGrid.appendChild(summaryCard('Filtered total', formatAmount(filteredTotal)));
        summaryGrid.appendChild(summaryCard('This month', formatAmount(monthTotal)));
        summaryGrid.appendChild(summaryCard('Top category', topCat ? `${topCat}: ${formatAmount(topVal)}` : '—'));
        summaryGrid.appendChild(summaryCard('Entries', String(items.length)));
    }

    /** Helper function to create a summary card DOM element. */
    function summaryCard(label, value) {
        const div = document.createElement('div');
        div.className = 'summary-card';
        const l = document.createElement('div'); l.className = 'label'; l.textContent = label;
        const v = document.createElement('div'); v.className = 'value'; v.textContent = value;
        div.appendChild(l); div.appendChild(v);
        return div;
    }

    // --- Action Handlers ---

    /** Handles adding a new expense item from the input form. */
    function addItem() {
        const date = dateInput.value || new Date().toISOString().slice(0,10);
        const category = categoryInput.value || 'Other';
        const amount = Number(amountInput.value);
        const description = descInput.value.trim();
        
        // Validation
        if (!Number.isFinite(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }
        
        if (!categorySet.has(category)) categorySet.add(category); 
        
        const newItem = { id: uid(), date, category, description, amount };
        items.push(newItem);
        save();
        clearForm();
        render();
    }

    /** Clears the input fields for amount and description. */
    function clearForm() {
        amountInput.value = '';
        descInput.value = '';
    }

    /** Deletes an expense item by ID after confirmation. */
    function deleteItem(id) {
        if (!confirm('Delete this expense?')) return;
        items = items.filter(it => it.id !== id);
        save();
        render();
    }

    /** Edits an expense item using browser prompt boxes. */
    function editItem(id) {
        const it = items.find(x => x.id === id);
        if (!it) return;
        
        // Use prompt for editing
        const newDate = prompt('Edit date (YYYY-MM-DD):', it.date) || it.date;
        const newCategory = prompt('Edit category:', it.category) || it.category;
        const newAmountStr = prompt('Edit amount:', String(it.amount));
        const newDesc = prompt('Edit description:', it.description || '') || '';
        const newAmount = Number(newAmountStr);
        
        if (!Number.isFinite(newAmount) || newAmount <= 0) {
            alert('Invalid amount. Edit cancelled.');
            return;
        }
        
        Object.assign(it, { date: newDate, category: newCategory, amount: newAmount, description: newDesc });
        if (!categorySet.has(newCategory)) categorySet.add(newCategory);
        
        save();
        render();
    }

    /** Exports all expense data as a JSON file. */
    function exportData() {
        const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'expenses.json'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); 
    }

    /** Imports expense data from a user-selected JSON file. */
    function importData(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(String(reader.result || '[]'));
                if (!Array.isArray(data)) throw new Error('Invalid data');
                
                // Normalize and filter imported data to ensure required fields and valid amounts
                const normalized = data.map(x => ({
                    id: x.id || uid(),
                    date: x.date || new Date().toISOString().slice(0,10),
                    category: x.category || 'Other',
                    description: x.description || '',
                    amount: Number(x.amount) || 0,
                })).filter(x => Number(x.amount) > 0);
                
                items = normalized;
                for (const it of items) if (!categorySet.has(it.category)) categorySet.add(it.category);
                
                save();
                render();
            } catch (e) {
                alert('Failed to import. Make sure the JSON file contains a valid array of expense objects.');
            }
        };
        reader.readAsText(file);
    }

    /** Clears all expense data after a strong confirmation. */
    function clearAll() {
        if (!confirm('Clear ALL expenses? This action CANNOT be undone.')) return;
        items = [];
        save();
        render();
    }

    // --- Event Listeners and Initialization ---
    
    addBtn.addEventListener('click', addItem);
    
    // Bind the render function to all filter inputs (search, category, date range)
    [searchInput, filterCategory, fromDate, toDate].forEach(el => el.addEventListener('input', render));
    
    // Reset Filters button handler
    resetFilters.addEventListener('click', () => {
        searchInput.value = '';
        filterCategory.value = '';
        fromDate.value = '';
        toDate.value = '';
        render();
    });

    // Export/Import handlers
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importInput.click()); // Proxy click for hidden file input
    importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) importData(file);
        e.target.value = ''; // Reset input value for re-importing the same file
    });
    
    clearAllBtn.addEventListener('click', clearAll);

    // Initial setup
    dateInput.value = new Date().toISOString().slice(0,10); // Set default date to today (YYYY-MM-DD)
    load();
    ensureFilterCategories();
    render();
})();