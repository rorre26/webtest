const STORAGE_KEY = "warehouseBookings";

const form = document.getElementById("bookingForm");
const schedule = document.getElementById("schedule");
const exportButton = document.getElementById("exportCsv");
const clearButton = document.getElementById("clearAll");

const getBookings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Ошибка чтения данных:", error);
    return [];
  }
};

const saveBookings = (bookings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value) => value.slice(0, 5);

const renderSchedule = () => {
  const bookings = getBookings();
  schedule.innerHTML = "";

  if (bookings.length === 0) {
    schedule.innerHTML = "<p class=\"schedule-empty\">Записей пока нет. Добавьте первую поставку.</p>";
    return;
  }

  const grouped = bookings.reduce((acc, booking) => {
    acc[booking.date] = acc[booking.date] || [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  Object.keys(grouped)
    .sort()
    .forEach((dateKey) => {
      const dayWrapper = document.createElement("div");
      dayWrapper.className = "schedule-day";

      const heading = document.createElement("h3");
      heading.textContent = formatDate(dateKey);
      dayWrapper.appendChild(heading);

      grouped[dateKey]
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((booking) => {
          const entry = document.createElement("div");
          entry.className = "schedule-entry";

          entry.innerHTML = `
            <div>
              <div class="entry-label">Сотрудник</div>
              <div class="entry-value">${booking.employee}</div>
            </div>
            <div>
              <div class="entry-label">Поставщик</div>
              <div class="entry-value">${booking.supplier}</div>
            </div>
            <div>
              <div class="entry-label">Время</div>
              <div class="entry-value">${formatTime(booking.time)}</div>
            </div>
            <div>
              <div class="entry-label">Паллеты</div>
              <div class="entry-value">${booking.pallets}</div>
            </div>
            <div>
              <div class="entry-label">Телефон</div>
              <div class="entry-value">${booking.phone}</div>
            </div>
            <div>
              <div class="entry-label">Создано</div>
              <div class="entry-value">${formatDate(booking.createdAt)}</div>
            </div>
            ${booking.comment ? `<div class="entry-comment">${booking.comment}</div>` : ""}
          `;

          dayWrapper.appendChild(entry);
        });

      schedule.appendChild(dayWrapper);
    });
};

const downloadCsv = (bookings) => {
  if (bookings.length === 0) {
    alert("Нет данных для экспорта.");
    return;
  }

  const header = [
    "Дата",
    "Время",
    "Сотрудник",
    "Поставщик",
    "Паллеты",
    "Телефон",
    "Комментарий",
    "Дата создания",
  ];

  const rows = bookings.map((booking) => [
    booking.date,
    booking.time,
    booking.employee,
    booking.supplier,
    booking.pallets,
    booking.phone,
    booking.comment || "",
    booking.createdAt,
  ]);

  const csvContent = [header, ...rows]
    .map((row) =>
      row
        .map((item) => `"${String(item).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `warehouse_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const bookings = getBookings();

  const newBooking = {
    id: crypto.randomUUID(),
    employee: formData.get("employee").trim(),
    supplier: formData.get("supplier").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    pallets: Number(formData.get("pallets")),
    phone: formData.get("phone").trim(),
    comment: formData.get("comment").trim(),
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  form.reset();
  renderSchedule();
});

exportButton.addEventListener("click", () => {
  downloadCsv(getBookings());
});

clearButton.addEventListener("click", () => {
  const shouldClear = confirm("Удалить все записи из графика?");
  if (!shouldClear) {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  renderSchedule();
});

renderSchedule();
