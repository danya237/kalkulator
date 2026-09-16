export default class BudgetTracker {
    constructor(querySelectorString) {
        this.root = document.querySelector(querySelectorString);

        if (!this.root) {
            throw new Error(`Element with selector "${querySelectorString}" not found.`);
        }

        this.root.innerHTML = BudgetTracker.html();

        this.root.querySelector(".new-entry").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });

        this.load();
    }

    static html() {
        return `
            <table class="budget-tracker">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="enteries"></tbody>
                <tbody>
                    <tr>
                        <td colspan="5">
                            <button type="button" class="new-entry">New Entry</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <strong>Total Income:</strong>
                            <span class="total">$0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
    }

    static entryHtml() {
        return `
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Add a description (wages, bills, etc.)">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount" placeholder="Amount">
                </td>
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td>
            </tr>
        `;
    }

    load() {
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries") || "[]");

        for (const entry of entries) {
            this.addEntry(entry);
        }

        this.UpdateSummary();
    }

    UpdateSummary() {
        const total = this.GetEntryRows().reduce((sum, row) => {
            const isExpense = row.querySelector(".input-type").value === "expense";
            const amount = parseFloat(row.querySelector(".input-amount").value) || 0;
            const modifiedAmount = isExpense ? -1 : 1;

            return sum + (amount * modifiedAmount);
        }, 0);

        const totalFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }

    save() {
        const data = this.GetEntryRows().map(row => {
            return {
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value) || 0
            };
        });

        localStorage.setItem("budget-tracker-entries", JSON.stringify(data));
        this.UpdateSummary();
    }

    addEntry(entry = {}) {
        const entriesBody = this.root.querySelector(".enteries");
        entriesBody.insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

        const row = entriesBody.querySelector("tr:last-of-type");
        row.querySelector(".input-date").value = entry.date || new Date().toISOString().slice(0, 10);
        row.querySelector(".input-description").value = entry.description || "";
        row.querySelector(".input-type").value = entry.type || "income";
        row.querySelector(".input-amount").value = entry.amount || 0;

        row.querySelector(".delete-entry").addEventListener("click", (e) => {
            this.OnDeleteEntryBtnClick(e);
        });

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change", () => {
                this.save();
            });
        });
    }

    GetEntryRows() {
        return Array.from(this.root.querySelectorAll(".enteries tr"));
    }

    onNewEntryBtnClick() {
        this.addEntry();
    }

    OnDeleteEntryBtnClick(e) {
        const row = e.currentTarget.closest("tr");
        if (row) {
            row.remove();
        }
        this.UpdateSummary();
    }
}