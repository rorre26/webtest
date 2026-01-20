from datetime import datetime
import os
import sqlite3

from flask import Flask, g, redirect, render_template, request, session, url_for


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(BASE_DIR, "deliveries.db")

USERS = {
    "office_user": {"password": "office123", "role": "office"},
    "warehouse_user": {"password": "warehouse123", "role": "warehouse"},
}

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret-key"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


def init_db():
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            car_number TEXT NOT NULL,
            cargo_type TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_by TEXT NOT NULL,
            accepted_by TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    db.commit()


@app.before_request
def ensure_db():
    init_db()


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


@app.route("/", methods=["GET"])
def home():
    return render_template("home.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        user = USERS.get(username)
        if user and user["password"] == password:
            session["user"] = username
            session["role"] = user["role"]
            return redirect(url_for("schedule"))
        error = "Неверный логин или пароль"
    return render_template("login.html", error=error, users=USERS)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/schedule", methods=["GET", "POST"])
def schedule():
    if "user" not in session:
        return redirect(url_for("login"))

    if request.method == "POST" and session.get("role") == "office":
        car_number = request.form.get("car_number", "").strip()
        cargo_type = request.form.get("cargo_type", "").strip()
        arrival_date = request.form.get("arrival_date", "").strip()
        arrival_time = request.form.get("arrival_time", "").strip()
        if car_number and cargo_type and arrival_date and arrival_time:
            arrival_at = f"{arrival_date} {arrival_time}"
            db = get_db()
            db.execute(
                """
                INSERT INTO deliveries (car_number, cargo_type, arrival_time, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    car_number,
                    cargo_type,
                    arrival_at,
                    session["user"],
                    datetime.utcnow().isoformat(timespec="seconds"),
                ),
            )
            db.commit()
        return redirect(url_for("schedule"))

    db = get_db()
    deliveries = db.execute(
        """
        SELECT id, car_number, cargo_type, arrival_time, status, created_by, accepted_by
        FROM deliveries
        ORDER BY arrival_time ASC
        """
    ).fetchall()
    return render_template(
        "schedule.html",
        deliveries=deliveries,
        role=session.get("role"),
        user=session.get("user"),
    )


@app.route("/accept/<int:delivery_id>", methods=["POST"])
def accept(delivery_id):
    if "user" not in session or session.get("role") != "warehouse":
        return redirect(url_for("login"))
    db = get_db()
    db.execute(
        """
        UPDATE deliveries
        SET status = 'accepted', accepted_by = ?
        WHERE id = ?
        """,
        (session["user"], delivery_id),
    )
    db.commit()
    return redirect(url_for("schedule"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
