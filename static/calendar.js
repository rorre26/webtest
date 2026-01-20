const grid = document.getElementById("calendarGrid");
const title = document.getElementById("calendarTitle");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const arrivalDate = document.getElementById("arrivalDate");
const selectedLabel = document.getElementById("selectedDateLabel");

let currentDate = new Date();
let selectedDate = new Date();

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function renderWeekdays() {
  const row = document.createElement("div");
  row.className = "calendar-row calendar-weekdays";
  weekdays.forEach((day) => {
    const cell = document.createElement("div");
    cell.textContent = day;
    row.appendChild(cell);
  });
  grid.appendChild(row);
}

function renderCalendar() {
  grid.innerHTML = "";
  renderWeekdays();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const monthName = firstDay.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  title.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  let day = 1;
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const row = document.createElement("div");
    row.className = "calendar-row";

    for (let col = 0; col < 7; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-cell";

      const cellIndex = rowIndex * 7 + col;
      if (cellIndex < startOffset || day > lastDay.getDate()) {
        cell.classList.add("calendar-cell--empty");
        cell.disabled = true;
      } else {
        const date = new Date(year, month, day);
        cell.textContent = day;
        cell.dataset.date = formatDate(date);

        if (formatDate(date) === formatDate(selectedDate)) {
          cell.classList.add("calendar-cell--selected");
        }
        if (formatDate(date) === formatDate(new Date())) {
          cell.classList.add("calendar-cell--today");
        }

        cell.addEventListener("click", () => {
          selectedDate = date;
          arrivalDate.value = formatDate(date);
          selectedLabel.textContent = date.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          renderCalendar();
        });
        day += 1;
      }
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function setInitialSelection() {
  const today = new Date();
  selectedDate = today;
  arrivalDate.value = formatDate(today);
  selectedLabel.textContent = today.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

prevBtn?.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
});

nextBtn?.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
});

if (grid) {
  setInitialSelection();
  renderCalendar();
}
